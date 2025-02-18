import { useState, useEffect } from 'react'
import { Joke } from '../types'
import { jokeService } from '../services/jokeService'
import { supabase } from '../lib/supabaseClient'
import JokeCard from '../components/JokeCard'
import DashboardJokeCard from '../components/DashboardJokeCard'

const Dashboard = () => {
  const [content, setContent] = useState('')
  const [type, setType] = useState<'normal' | 'dark'>('normal')
  const [imageUrl, setImageUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [jokes, setJokes] = useState<Joke[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'add' | 'normal' | 'dark'>('add')

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Tabs de navegación */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  )
}

export default Dashboard 