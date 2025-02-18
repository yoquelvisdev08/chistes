import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

interface JokeResponse {
  error: boolean;
  category: string;
  type: string;
  joke?: string;
  setup?: string;
  delivery?: string;
  flags: {
    nsfw: boolean;
    religious: boolean;
    political: boolean;
    racist: boolean;
    sexist: boolean;
  };
  id: number;
  safe: boolean;
  lang: string;
}

class JokeApiService {
  private async getRandomJoke(isDark: boolean = false): Promise<string> {
    try {
      const category = isDark ? 'Dark' : 'Any';
      const url = `https://v2.jokeapi.dev/joke/${category}`;
      
      const response = await axios.get<JokeResponse>(url, {
        params: {
          format: 'json',
          blacklistFlags: isDark ? '' : 'nsfw,religious,racist,sexist',
          type: 'single,twopart'
        }
      });

      if (response.data.error) {
        throw new Error('Error en la API de chistes');
      }

      // Si es un chiste de dos partes, combinarlos
      if (response.data.type === 'twopart' && response.data.setup && response.data.delivery) {
        return `${response.data.setup}\n${response.data.delivery}`;
      }

      // Si es un chiste simple
      if (response.data.joke) {
        return response.data.joke;
      }

      throw new Error('Formato de chiste no válido');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error de Axios:', error.message);
        throw new Error(`Error al obtener chiste: ${error.message}`);
      }
      throw error;
    }
  }

  async generateJoke(type: 'normal' | 'dark'): Promise<{
    id: string;
    content: string;
    type: string;
    createdAt: string;
    reactions: {
      laugh: number;
      sad: number;
      puke: number;
    };
  }> {
    try {
      const jokeContent = await this.getRandomJoke(type === 'dark');
      
      // Primero, crear el chiste en la tabla jokes
      const { data: jokeData, error: jokeError } = await supabase
        .from('jokes')
        .insert([{
          content: jokeContent,
          type: type,
          created_at: new Date().toISOString(),
          reactions: {
            laugh: 0,
            sad: 0,
            puke: 0
          }
        }])
        .select()
        .single();

      if (jokeError) {
        throw new Error(`Error al crear el chiste: ${jokeError.message}`);
      }

      if (!jokeData) {
        throw new Error('No se recibieron datos del chiste creado');
      }

      // Luego, crear el registro en generated_jokes
      const { error: genError } = await supabase
        .from('generated_jokes')
        .insert([{
          joke_id: jokeData.id,
          source: 'api',
          api_source: type === 'dark' ? 'dark' : 'normal'
        }]);

      if (genError) {
        throw new Error(`Error al registrar chiste generado: ${genError.message}`);
      }

      return {
        id: jokeData.id,
        content: jokeData.content,
        type: jokeData.type,
        createdAt: jokeData.created_at,
        reactions: jokeData.reactions
      };
    } catch (error) {
      console.error('Error en generateJoke:', error);
      throw error;
    }
  }

  async getGeneratedJokes() {
    const { data, error } = await supabase
      .from('jokes')
      .select(`
        *,
        generated_jokes!inner (
          id,
          source,
          api_source,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(joke => ({
      id: joke.id,
      content: joke.content,
      type: joke.type,
      createdAt: joke.created_at,
      reactions: joke.reactions
    }));
  }
}

export const jokeApiService = new JokeApiService(); 