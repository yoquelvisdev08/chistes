import { useState } from 'react'
import { Joke } from '../types'
import { jokeService } from '../services/jokeService'

interface DashboardJokeCardProps {
  joke: Joke
  onDelete: (id: string) => void
  onUpdate: (joke: Joke) => void
}

const DashboardJokeCard = ({ joke, onDelete, onUpdate }: DashboardJokeCardProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(joke.content)
  const [type, setType] = useState(joke.type)

  const handleUpdate = async () => {
    try {
      const updatedJoke = await jokeService.updateJoke(joke.id, {
        content,
        type,
        imageUrl: joke.imageUrl
      })
      onUpdate(updatedJoke)
      setIsEditing(false)
    } catch (error) {
      console.error('Error al actualizar:', error)
      alert('Error al actualizar el chiste')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Imagen del chiste */}
      {joke.imageUrl && (
        <div className="relative h-48 group">
          <img
            src={joke.imageUrl}
            alt="Imagen del chiste"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300" />
        </div>
      )}

      {/* Contenido */}
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={4}
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'normal' | 'dark')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="normal">Normal</option>
              <option value="dark">Humor Negro</option>
            </select>
          </div>
        ) : (
          <p className="text-gray-800 dark:text-gray-200 text-lg mb-4">{joke.content}</p>
        )}

        {/* Estadísticas */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex space-x-4">
            <span>😂 {joke.reactions.laugh}</span>
            <span>😢 {joke.reactions.sad}</span>
            <span>🤮 {joke.reactions.puke}</span>
          </div>
          <span className="text-xs">{new Date(joke.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t dark:border-gray-700">
          {isEditing ? (
            <>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setContent(joke.content)
                  setType(joke.type)
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(joke.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardJokeCard 