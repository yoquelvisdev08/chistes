import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jokeService } from '../services/jokeService';
import JokeCard from '../components/JokeCard';
import LoadingSpinner from '../components/LoadingSpinner';

const JokeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [joke, setJoke] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJoke = async () => {
      try {
        if (!id) {
          throw new Error('ID no proporcionado');
        }
        const jokeData = await jokeService.getJokeById(id);
        if (!jokeData) {
          throw new Error('Chiste no encontrado');
        }
        setJoke(jokeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el chiste');
        console.error('Error al cargar el chiste:', err);
      } finally {
        setLoading(false);
      }
    };

    loadJoke();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="error-container">
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Volver al inicio</button>
      </div>
    );
  }

  return (
    <div className="joke-detail-page">
      <div className="max-w-2xl mx-auto p-4">
        {joke && <JokeCard joke={joke} />}
        <button 
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default JokeDetailPage; 