import { supabase } from '../lib/supabaseClient';

// APIs disponibles
const APIS = {
  normal: [
    {
      name: 'jokeapi-mixed',
      url: 'https://v2.jokeapi.dev/joke/Programming,Miscellaneous,Pun,Spooky,Christmas?type=single',
      parser: (data: any) => ({
        content: data.joke,
        type: 'normal',
        image_url: null
      })
    }
  ],
  dark: [
    {
      name: 'jokeapi-dark',
      url: 'https://v2.jokeapi.dev/joke/Dark?type=single',
      parser: (data: any) => ({
        content: data.joke,
        type: 'dark',
        image_url: null
      })
    }
  ]
};

// Chistes de respaldo locales
const LOCAL_JOKES = {
  normal: [
    "¿Qué hace un programador zombi? Programar en códigos muertos.",
    "¿Por qué los programadores prefieren el frío? Porque tienen muchos ventiladores.",
    "¿Cuál es el colmo de un programador? No poder programar su vida.",
    "¿Qué le dice un programador a otro? ¡Nos vemos en el código!",
    "¿Por qué los programadores odian la naturaleza? Porque tiene demasiados bugs."
  ],
  dark: [
    "¿Qué le dice un bit a otro? Nos vemos en el bus.",
    "¿Por qué el código no funciona? Porque está muerto por dentro.",
    "¿Qué le dice un programador a su código? No funcionas y no sé por qué.",
    "¿Qué es un programador sin café? Un zombie en modo debug.",
    "Mi código es como la muerte: nadie entiende cómo funciona."
  ]
};

export const jokeApiService = {
  async getRandomJoke(type: 'normal' | 'dark') {
    try {
      const api = APIS[type][0];
      const response = await fetch(api.url);
      
      if (!response.ok) {
        throw new Error('API Error');
      }

      const data = await response.json();
      const parsedJoke = api.parser(data);

      // Insertar el chiste SOLO en la tabla de chistes generados
      const { data: joke, error: jokeError } = await supabase
        .from('generated_jokes_only') // Nueva tabla solo para generados
        .insert([{
          content: parsedJoke.content,
          type: parsedJoke.type,
          image_url: parsedJoke.image_url,
          reactions: { laugh: 0, sad: 0, puke: 0 },
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (jokeError) throw jokeError;

      return {
        id: joke.id,
        content: joke.content,
        type: joke.type,
        imageUrl: joke.image_url,
        reactions: joke.reactions,
        createdAt: joke.created_at,
        isGenerated: true
      };
    } catch (error) {
      console.error('Error fetching joke:', error);
      throw error;
    }
  },

  // Obtener todos los chistes generados con su información
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
      .order('created_at', { foreignTable: 'generated_jokes', ascending: false });

    if (error) throw error;

    return data.map(joke => ({
      id: joke.id,
      content: joke.content,
      type: joke.type,
      imageUrl: joke.image_url,
      reactions: joke.reactions,
      likes: joke.likes,
      createdAt: joke.created_at,
      generatedInfo: joke.generated_jokes
    }));
  }
}; 