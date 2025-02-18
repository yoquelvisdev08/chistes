import { useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { Joke } from '../types'
import { jokeService } from '../services/jokeService'

interface JokeCardProps {
  joke: Joke;
  onReactionUpdate?: (jokeId: string, newReactions: Joke['reactions']) => void;
  onDelete?: (id: string) => void;
  isGenerated?: boolean;
}

const JokeCard = ({ joke, onReactionUpdate, onDelete, isGenerated = false }: JokeCardProps) => {
  // Estado para las reacciones totales
  const [totalReactions, setTotalReactions] = useState(joke.reactions)
  
  // Añadir logs para ver los valores iniciales
  console.log('Valor inicial de totalReactions:', totalReactions)
  console.log('Valor inicial de joke.reactions:', joke.reactions)
  
  // Estado para las reacciones del usuario actual
  const [userReactions, setUserReactions] = useState(() => {
    const saved = localStorage.getItem(`joke-${joke.id}-reactions`)
    console.log('Reacciones guardadas del usuario:', saved)
    return saved ? JSON.parse(saved) : {
      laugh: false,
      sad: false,
      puke: false
    }
  })
  
  const [isReacting, setIsReacting] = useState(false)

  // Función para formatear la fecha
  const formatDate = (date: Date | string) => {
    try {
      const dateObj = new Date(date)
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(dateObj)
    } catch (error) {
      return 'Fecha no disponible'
    }
  }

  const handleReaction = async (type: 'laugh' | 'sad' | 'puke') => {
    console.log('Intentando reaccionar con:', type)
    console.log('Estado actual isReacting:', isReacting)
    console.log('Estado actual userReactions:', userReactions)
    
    if (isReacting || userReactions[type]) {
      console.log('Reacción bloqueada porque:', {
        isReacting,
        userAlreadyReacted: userReactions[type]
      })
      return
    }
    
    setIsReacting(true)
    console.log('Iniciando reacción...')
    
    const newTotalReactions = {
      ...totalReactions,
      [type]: (totalReactions[type] || 0) + 1
    }
    console.log('Nuevas reacciones totales:', newTotalReactions)
    
    const newUserReactions = {
      ...userReactions,
      [type]: true
    }
    console.log('Nuevas reacciones del usuario:', newUserReactions)
    
    try {
      // Actualizar UI inmediatamente
      setTotalReactions(newTotalReactions)
      setUserReactions(newUserReactions)
      
      // Guardar reacción del usuario
      localStorage.setItem(`joke-${joke.id}-reactions`, JSON.stringify(newUserReactions))
      console.log('Guardado en localStorage')
      
      // Actualizar en la base de datos
      console.log('Intentando actualizar en la base de datos...')
      await jokeService.updateReactions(joke.id, newTotalReactions)
      console.log('Actualización en base de datos exitosa')
      
      if (onReactionUpdate) {
        onReactionUpdate(joke.id, newTotalReactions)
        console.log('Callback de actualización ejecutado')
      }
    } catch (error) {
      console.error('Error al actualizar reacción:', error)
      setTotalReactions(totalReactions)
      setUserReactions(userReactions)
    } finally {
      setIsReacting(false)
      console.log('Reacción completada, isReacting establecido a false')
    }
  }

  const saveAsImage = async () => {
    const card = document.getElementById(`joke-${joke.id}`)
    if (card) {
      try {
        // Ocultar temporalmente los botones para la captura
        const buttons = card.querySelectorAll('button')
        buttons.forEach(btn => btn.style.display = 'none')
        
        const canvas = await html2canvas(card, {
          backgroundColor: joke.type === 'dark' ? '#1a1a1a' : 'white',
          scale: 2
        })
        
        // Restaurar los botones
        buttons.forEach(btn => btn.style.display = 'flex')
        
        const image = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = image
        link.download = `chiste-${joke.id}.png`
        link.click()
      } catch (error) {
        console.error('Error al guardar la imagen:', error)
      }
    }
  }

  // Añadir log en el render para ver qué valores se están mostrando
  console.log('Renderizando JokeCard con:', {
    totalReactions,
    userReactions,
    isReacting
  })

  return (
    <div id={`joke-${joke.id}`} className="joke-card group">
      {joke.imageUrl && (
        <div className="joke-image-container mb-4">
          <img
            src={joke.imageUrl}
            alt="Imagen del chiste"
            className="w-full h-48 object-cover rounded-xl"
          />
        </div>
      )}

      <div className="joke-content">
        <p className="text-lg font-medium leading-relaxed">{joke.content}</p>
      </div>

      {!isGenerated && (
        <div className="joke-reactions flex justify-center gap-4">
          <button
            onClick={() => handleReaction('laugh')}
            className={`reaction-button laugh ${userReactions.laugh ? 'active' : ''}`}
            disabled={isReacting || userReactions.laugh}
          >
            <span className="text-2xl">😂</span>
            <span className="font-semibold">{totalReactions.laugh || 0}</span>
          </button>

          <button
            onClick={() => handleReaction('sad')}
            className={`reaction-button sad ${userReactions.sad ? 'active' : ''}`}
            disabled={isReacting || userReactions.sad}
          >
            <span className="text-2xl">😢</span>
            <span className="font-semibold">{totalReactions.sad || 0}</span>
          </button>

          <button
            onClick={() => handleReaction('puke')}
            className={`reaction-button puke ${userReactions.puke ? 'active' : ''}`}
            disabled={isReacting || userReactions.puke}
          >
            <span className="text-2xl">🤮</span>
            <span className="font-semibold">{totalReactions.puke || 0}</span>
          </button>
        </div>
      )}

      <div className="mt-4 text-right">
        <span className="text-sm text-gray-500 dark:text-gray-400 italic">
          {formatDate(joke.createdAt)}
        </span>
      </div>

      <div className="joke-actions">
        <button
          onClick={saveAsImage}
          className="save-button"
          title="Guardar como imagen"
        >
          💾
        </button>
        {onDelete && !isGenerated && (
          <button
            onClick={() => onDelete(joke.id)}
            className="save-button"
            title="Eliminar chiste"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  )
}

export default JokeCard 