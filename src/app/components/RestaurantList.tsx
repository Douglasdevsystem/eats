import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Loader2, Store, MapPin } from 'lucide-react';
import { RestaurantCard, type Restaurant } from './RestaurantCard';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

export function RestaurantList() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('todas');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://appfood-e25bb-default-rtdb.firebaseio.com/restaurantes.json');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar restaurantes');
      }
      
      const data = await response.json();
      
      if (data) {
        const restaurantArray: Restaurant[] = Object.entries(data).map(([id, restaurant]: [string, any]) => {
          console.log('Dados do restaurante:', restaurant); // Debug
          return {
            id,
            name: restaurant.nome || restaurant.name || 'Restaurante sem nome',
            description: restaurant.descricao || restaurant.description || restaurant.categoria || '',
            category: restaurant.categoria || restaurant.category || '',
            image: restaurant.imagem || restaurant.image || '',
            rating: restaurant.avaliacao || restaurant.rating || 0,
            deliveryTime: restaurant.tempoEntrega || restaurant.deliveryTime || '',
            address: restaurant.endereco || restaurant.address || '',
            city: restaurant.cidade || restaurant.city || '',
            phone: restaurant.telefone || restaurant.phone || '',
            horarios: restaurant.horarios || restaurant.openingHours || undefined, // ✅ Horários do servidor
          };
        });
        console.log('Restaurantes processados:', restaurantArray); // Debug
        setRestaurants(restaurantArray);
      } else {
        setRestaurants([]);
      }
    } catch (err) {
      console.error('Erro ao buscar restaurantes:', err);
      setError('Não foi possível carregar os restaurantes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Extrair cidades únicas dos restaurantes
  const cities = ['todas', ...Array.from(new Set(restaurants.map(r => r.city).filter(Boolean)))];

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (restaurant.category?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCity = selectedCity === 'todas' || restaurant.city === selectedCity;
    
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          {/* Logo e branding centralizado */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-md">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-orange-600">
                EatsFood
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                Sabor que chega até você! 🍽️
              </p>
            </div>
          </div>

          {/* Navegação e título da seção */}
          <div className="flex items-start gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="shrink-0 mt-1"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Restaurantes</h2>
              <p className="text-sm text-gray-500">
                Escolha seu restaurante favorito
              </p>
            </div>
          </div>

          {/* Campo de busca */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar restaurantes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-gray-100 border-gray-200 rounded-lg"
            />
          </div>

          {/* Filtro de cidade */}
          {cities.length > 1 && (
            <div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full h-12 bg-gray-100 border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="size-4 text-gray-500" />
                    <SelectValue placeholder="Todas as cidades" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city} className="capitalize">
                      {city === 'todas' ? 'Todas as cidades' : city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="size-12 animate-spin text-orange-500 mx-auto" />
              <p className="text-gray-500">Carregando restaurantes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchRestaurants} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">
              {searchQuery || selectedCity !== 'todas' ? 'Nenhum restaurante encontrado' : 'Nenhum restaurante disponível'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}