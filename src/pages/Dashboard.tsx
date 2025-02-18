import { useState, useEffect } from 'react'
import { Joke } from '../types'
import { jokeService } from '../services/jokeService'
import { supabase } from '../lib/supabaseClient'
import JokeCard from '../components/JokeCard'
import DashboardJokeCard from '../components/DashboardJokeCard'
import { jokeApiService } from '../services/jokeApiService'
import LoadingSpinner from '../components/LoadingSpinner'

// Añadir un tipo para el estado del generador
type GeneratorState = {
  status: 'idle' | 'generating' | 'success' | 'error';
  message?: string;
};

const Dashboard = () => {
  const [content, setContent] = useState('')
  const [type, setType] = useState<'normal' | 'dark'>('normal')
  const [imageUrl, setImageUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [jokes, setJokes] = useState<Joke[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'add' | 'normal' | 'dark' | 'generated'>('add')
  const [generatedJoke, setGeneratedJoke] = useState<Joke | null>(null)
  const [generating, setGenerating] = useState(false)
  const [lastGeneratedJokes, setLastGeneratedJokes] = useState<Joke[]>([])
  const [loadingGenerated, setLoadingGenerated] = useState(false)
  const [generatorState, setGeneratorState] = useState<GeneratorState>({ status: 'idle' });
  const [showHistory, setShowHistory] = useState(true);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('La imagen no debe superar los 2MB')
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('jokes-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Obtener la URL pública usando el path del archivo subido
      const { data: { publicUrl } } = supabase.storage
        .from('jokes-images')
        .getPublicUrl(data.path)

      setImageUrl(publicUrl)
    } catch (error) {
      console.error('Error al subir imagen:', error)
      alert(error instanceof Error ? error.message : 'Error al subir la imagen')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const jokeData = {
        content,
        type,
        imageUrl,
        createdAt: new Date(),
        reactions: { laugh: 0, sad: 0, puke: 0 }
      }

      await jokeService.addJoke(jokeData)
      
      // Limpiar el formulario
      setContent('')
      setType('normal')
      setImageUrl('')
      
      // Recargar los chistes
      loadJokes()
      
      alert('Chiste añadido correctamente')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al añadir el chiste'
      console.error('Error detallado:', error)
      alert(errorMessage)
    }
  }

  useEffect(() => {
    loadJokes()
    loadLastGeneratedJokes()
  }, [])

  const loadJokes = async () => {
    try {
      const normalJokes = await jokeService.getJokes('normal')
      const darkJokes = await jokeService.getJokes('dark')
      setJokes([...normalJokes, ...darkJokes])
    } catch (error) {
      console.error('Error al cargar chistes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (jokeId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este chiste?')) {
      try {
        await jokeService.deleteJoke(jokeId)
        setJokes(jokes.filter(joke => joke.id !== jokeId))
        alert('Chiste eliminado correctamente')
      } catch (error) {
        console.error('Error al eliminar:', error)
        alert('Error al eliminar el chiste')
      }
    }
  }

  const handleUpdate = (updatedJoke: Joke) => {
    setJokes(jokes.map(joke => 
      joke.id === updatedJoke.id ? updatedJoke : joke
    ))
  }

  const normalJokes = jokes.filter(joke => joke.type === 'normal')
  const darkJokes = jokes.filter(joke => joke.type === 'dark')

  const loadLastGeneratedJokes = async () => {
    try {
      const { data, error } = await supabase
        .from('jokes')
        .select(`
          *,
          generated_jokes (
            id,
            source,
            api_source,
            created_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(6) // Mostrar los últimos 6 chistes generados

      if (error) throw error;

      const generatedJokes = data
        .filter(joke => joke.generated_jokes && joke.generated_jokes.length > 0)
        .map(joke => ({
          id: joke.id,
          content: joke.content,
          type: joke.type,
          imageUrl: joke.image_url,
          reactions: joke.reactions,
          createdAt: joke.created_at,
          generatedInfo: joke.generated_jokes[0]
        }));

      setLastGeneratedJokes(generatedJokes);
    } catch (error) {
      console.error('Error cargando últimos chistes generados:', error);
    }
  };

  // Función mejorada para generar chistes
  const generateJoke = async (type: 'normal' | 'dark') => {
    try {
      setGeneratorState({ status: 'generating' });
      
      // Sistema de throttling mejorado
      const lastGeneration = localStorage.getItem('lastJokeGeneration');
      const now = Date.now();
      
      if (lastGeneration && now - parseInt(lastGeneration) < 2000) {
        throw new Error('Por favor, espera un momento entre generaciones');
      }
      
      localStorage.setItem('lastJokeGeneration', now.toString());

      const joke = await jokeApiService.getRandomJoke(type);
      
      // Verificar si el chiste ya existe en los últimos generados
      if (lastGeneratedJokes.some(j => j.content === joke.content)) {
        throw new Error('Este chiste ya fue generado recientemente. Intentando de nuevo...');
      }

      // Registrar en la tabla de chistes generados
      const { error: genError } = await supabase
        .from('generated_jokes')
        .insert([{
          joke_id: joke.id,
          source: 'dashboard',
          api_source: type === 'normal' ? 'jokeapi-mixed' : 'jokeapi-dark'
        }]);

      if (genError) throw genError;

      setGeneratedJoke(joke);
      await loadLastGeneratedJokes();
      setGeneratorState({ status: 'success' });
      
    } catch (error) {
      console.error('Error generating joke:', error);
      setGeneratorState({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Error al generar el chiste'
      });
      
      // Auto-reset del estado de error después de 3 segundos
      setTimeout(() => {
        setGeneratorState({ status: 'idle' });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Tabs de navegación actualizadas */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'add'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Añadir Chiste
          </button>
          <button
            onClick={() => setActiveTab('generated')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'generated'
                ? 'bg-accent text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Generados ({jokes.filter(j => j.isGenerated).length})
          </button>
          <button
            onClick={() => setActiveTab('normal')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'normal'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Chistes Normales ({normalJokes.length})
          </button>
          <button
            onClick={() => setActiveTab('dark')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'dark'
                ? 'bg-dark-secondary text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Humor Negro ({darkJokes.length})
          </button>
        </div>

        {/* Contenido según la tab activa */}
        {activeTab === 'add' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Añadir Nuevo Chiste
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Imagen (opcional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer text-gray-600 dark:text-gray-400"
                  >
                    📸 Arrastra una imagen o haz clic para seleccionar
                  </label>
                  {imageUrl && (
                    <div className="mt-4 relative inline-block">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="max-h-40 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ✖
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contenido del chiste
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de chiste
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'normal' | 'dark')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
                >
                  <option value="normal">Normal</option>
                  <option value="dark">Humor Negro</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Subiendo imagen...' : 'Añadir Chiste'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'normal' && (
          <div className="jokes-container">
            {normalJokes.map(joke => (
              <DashboardJokeCard
                key={joke.id}
                joke={joke}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}

        {activeTab === 'dark' && (
          <div className="jokes-container">
            {darkJokes.map(joke => (
              <DashboardJokeCard
                key={joke.id}
                joke={joke}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}

        {/* Nueva sección para chistes generados */}
        {activeTab === 'generated' && (
          <div className="generator-page">
            {/* Sección del generador mejorada */}
            <div className="generator-section bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Generador de Chistes</h2>
                <div className="generator-stats text-sm text-gray-500">
                  <span>Generados hoy: {lastGeneratedJokes.filter(j => 
                    new Date(j.createdAt).toDateString() === new Date().toDateString()
                  ).length}</span>
                </div>
              </div>

              <div className="generator-controls flex flex-col gap-4">
                <div className="buttons-container flex gap-4 justify-center">
                  <button
                    onClick={() => generateJoke('normal')}
                    disabled={generatorState.status === 'generating'}
                    className="generate-button normal flex items-center gap-2 px-6 py-3"
                  >
                    {generatorState.status === 'generating' ? (
                      <LoadingSpinner size="small" />
                    ) : '😄'}
                    Generar Chiste Normal
                  </button>
                  <button
                    onClick={() => generateJoke('dark')}
                    disabled={generatorState.status === 'generating'}
                    className="generate-button dark flex items-center gap-2 px-6 py-3"
                  >
                    {generatorState.status === 'generating' ? (
                      <LoadingSpinner size="small" />
                    ) : '💀'}
                    Generar Humor Negro
                  </button>
                </div>

                {/* Estado del generador */}
                {generatorState.status === 'error' && (
                  <div className="error-message text-red-500 text-center p-3 bg-red-50 rounded-lg">
                    {generatorState.message}
                  </div>
                )}

                {/* Chiste generado */}
                {generatedJoke && generatorState.status === 'success' && (
                  <div className="generated-joke-preview mt-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="text-2xl">🎲</span>
                      Chiste Generado
                    </h3>
                    <JokeCard joke={generatedJoke} />
                  </div>
                )}
              </div>
            </div>

            {/* Historial de chistes generados */}
            <div className="history-section">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Últimos Chistes Generados</h2>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showHistory ? '🔽 Ocultar' : '🔼 Mostrar'}
                </button>
              </div>

              {showHistory && (
                <div className="jokes-container">
                  {lastGeneratedJokes.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No hay chistes generados aún. ¡Genera tu primer chiste!
                    </div>
                  ) : (
                    lastGeneratedJokes.map(joke => (
                      <div key={joke.id} className="generated-joke-card">
                        <div className="joke-content">
                          <p>{joke.content}</p>
                          <div className="joke-meta">
                            <span className="joke-type">
                              {joke.type === 'normal' ? 'Normal' : 'Humor Negro'}
                            </span>
                            <span className="joke-date">
                              Generado: {new Date(joke.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="joke-actions">
                          <button
                            onClick={() => handleDelete(joke.id)}
                            className="action-button delete"
                          >
                            🗑️ Eliminar
                          </button>
                          <button
                            onClick={() => {
                              setContent(joke.content);
                              setType(joke.type);
                              setActiveTab('add');
                            }}
                            className="action-button edit"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await jokeService.addJoke({
                                  ...joke,
                                  isGenerated: false
                                });
                                await jokeService.deleteJoke(joke.id);
                                loadJokes();
                                loadLastGeneratedJokes();
                                alert('Chiste añadido a la colección principal');
                              } catch (error) {
                                console.error('Error:', error);
                                alert('Error al añadir el chiste');
                              }
                            }}
                            className="action-button add"
                          >
                            ➕ Añadir a Colección
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard 