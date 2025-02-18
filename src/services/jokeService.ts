import { supabase } from '../lib/supabaseClient'
import { Joke } from '../types'

const BUCKET_NAME = 'jokes-images'

// Función auxiliar para obtener URL pública
const getPublicUrl = (path: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)
  return publicUrl
}

export const jokeService = {
  async getJokes(type: 'normal' | 'dark'): Promise<Joke[]> {
    const { data, error } = await supabase
      .from('jokes')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    return (data || []).map(joke => ({
      id: joke.id,
      content: joke.content,
      type: joke.type,
      imageUrl: joke.image_url ? getPublicUrl(joke.image_url) : null,
      createdAt: new Date(joke.created_at),
      reactions: joke.reactions || { laugh: 0, sad: 0, puke: 0 }
    }))
  },

  async addJoke(joke: Omit<Joke, 'id'>): Promise<Joke> {
    // Si hay una URL de imagen, extraer solo el nombre del archivo
    const image_url = joke.imageUrl ? 
      joke.imageUrl.split(`${BUCKET_NAME}/`).pop() : null

    const jokeData = {
      content: joke.content,
      type: joke.type,
      image_url,
      created_at: new Date().toISOString(),
      reactions: { laugh: 0, sad: 0, puke: 0 }
    }
    
    const { data, error } = await supabase
      .from('jokes')
      .insert([jokeData])
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear el chiste: ${error.message}`)
    }

    return {
      id: data.id,
      content: data.content,
      type: data.type,
      imageUrl: data.image_url ? getPublicUrl(data.image_url) : null,
      createdAt: new Date(data.created_at),
      reactions: data.reactions
    }
  },

  async updateJoke(jokeId: string, jokeData: Partial<Omit<Joke, 'id'>>): Promise<Joke> {
    // Si hay una URL de imagen, extraer solo el nombre del archivo
    const image_url = jokeData.imageUrl ? 
      jokeData.imageUrl.split(`${BUCKET_NAME}/`).pop() : null

    const { data, error } = await supabase
      .from('jokes')
      .update({
        content: jokeData.content,
        type: jokeData.type,
        image_url
      })
      .eq('id', jokeId)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar el chiste: ${error.message}`)
    }

    return {
      id: data.id,
      content: data.content,
      type: data.type,
      imageUrl: data.image_url ? getPublicUrl(data.image_url) : null,
      createdAt: new Date(data.created_at),
      reactions: data.reactions
    }
  },

  async updateReactions(jokeId: string, reactions: Joke['reactions']): Promise<void> {
    const { error } = await supabase
      .from('jokes')
      .update({ reactions })
      .eq('id', jokeId)

    if (error) {
      throw new Error(`Error al actualizar reacciones: ${error.message}`)
    }
  },

  async deleteJoke(jokeId: string): Promise<void> {
    const { error } = await supabase
      .from('jokes')
      .delete()
      .eq('id', jokeId)

    if (error) {
      throw new Error(`Error al eliminar el chiste: ${error.message}`)
    }
  }
} 