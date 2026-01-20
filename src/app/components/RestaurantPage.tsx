import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { RestaurantMenu } from './RestaurantMenu';
import type { Restaurant } from './RestaurantCard';

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

export function RestaurantPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurant();
  }, [slug]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('https://appfood-e25bb-default-rtdb.firebaseio.com/restaurantes.json');

      if (!response.ok) {
        throw new Error('Erro ao carregar restaurantes');
      }

      const data = await response.json();

      if (data) {
        // Procurar o restaurante pelo nome normalizado (slug)
        const restaurantEntry = Object.entries(data).find(([id, restaurant]: [string, any]) => {
          const nameSlug = createSlug(restaurant.nome || restaurant.name || '');
          return nameSlug === slug;
        });

        if (restaurantEntry) {
          const [id, restaurantData] = restaurantEntry as [string, any];
          const restaurante: Restaurant = {
            id,
            name: restaurantData.nome || restaurantData.name || 'Restaurante sem nome',
            description: restaurantData.descricao || restaurantData.description || restaurantData.categoria || '',
            category: restaurantData.categoria || restaurantData.category || '',
            image: restaurantData.imagem || restaurantData.image || '',
            rating: restaurantData.avaliacao || restaurantData.rating || 0,
            deliveryTime: restaurantData.tempoEntrega || restaurantData.deliveryTime || '',
            address: restaurantData.endereco || restaurantData.address || '',
            city: restaurantData.cidade || restaurantData.city || '',
            phone: restaurantData.telefone || restaurantData.phone || '',
            horarios: restaurantData.horarios || restaurantData.openingHours || undefined,
          };
          setRestaurant(restaurante);
        } else {
          setError('Restaurante não encontrado');
        }
      } else {
        setError('Nenhum restaurante disponível');
      }
    } catch (err) {
      console.error('Erro ao buscar restaurante:', err);
      setError('Não foi possível carregar o restaurante. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Restaurante não encontrado'}
          </h1>
          <Button
            onClick={() => navigate('/')}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Voltar para início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Voltar</h1>
        </div>
      </header>

      <RestaurantMenu restaurant={restaurant} onBack={() => navigate('/')} />
    </div>
  );
}
