import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, UtensilsCrossed, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { MenuItem, type MenuItemType } from './MenuItem';
import { Cart } from './Cart';
import { Badge } from '@/app/components/ui/badge';
import type { Restaurant } from './RestaurantCard';
import { verificarRestauranteAberto, type Horarios } from '@/lib/horarios';

interface RestaurantMenuProps {
  restaurant: Restaurant;
  onBack: () => void;
}

export function RestaurantMenu({ restaurant, onBack }: RestaurantMenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; order: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});  // ✅ Mudado de number para string
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [horarios, setHorarios] = useState<Horarios | null>(null);
  const [statusRestaurante, setStatusRestaurante] = useState<{ 
    aberto: boolean; 
    mensagem: string; 
    horarioFechamento: string;
    horarioAbertura: string;
  }>({ 
    aberto: false, 
    mensagem: 'Carregando...', 
    horarioFechamento: '',
    horarioAbertura: '',
  });

  useEffect(() => {
    fetchMenuData();
  }, [restaurant.id]);

  useEffect(() => {
    // Atualizar status do restaurante quando horários mudarem
    if (horarios) {
      const status = verificarRestauranteAberto(horarios);
      setStatusRestaurante(status);
    }
  }, [horarios]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      
      // Buscar categorias
      const categoriesResponse = await fetch(
        `https://appfood-e25bb-default-rtdb.firebaseio.com/dados/${restaurant.id}/estoque/categorias.json`
      );
      
      // Buscar itens do estoque
      const itemsResponse = await fetch(
        `https://appfood-e25bb-default-rtdb.firebaseio.com/dados/${restaurant.id}/estoque/itens.json`
      );

      // Buscar horários de funcionamento
      const horariosResponse = await fetch(
        `https://appfood-e25bb-default-rtdb.firebaseio.com/dados/${restaurant.id}/configuracoes/horarioFuncionamento.json`
      );
      
      const categoriesData = await categoriesResponse.json();
      const itemsData = await itemsResponse.json();
      const horariosData = await horariosResponse.json();

      console.log('=== DEBUG FIREBASE ===');
      console.log('Restaurant ID:', restaurant.id);
      console.log('URL Horários:', `https://appfood-e25bb-default-rtdb.firebaseio.com/dados/${restaurant.id}/configuracoes/horarioFuncionamento.json`);
      console.log('Response Status:', horariosResponse.status);
      console.log('Horários recebidos:', horariosData);
      console.log('Tipo dos horários:', typeof horariosData);
      console.log('Horários é null?', horariosData === null);

      // Processar horários
      if (horariosData) {
        console.log('Horários carregados do Firebase:', horariosData);
        setHorarios(horariosData);
      } else {
        console.log('Nenhum horário encontrado no Firebase');
        setHorarios(null);
      }

      // Processar categorias
      const categoryMap: Record<string, string> = {};
      const categoriesArray: Array<{ id: string; name: string; order: number }> = [];
      
      if (categoriesData) {
        Object.entries(categoriesData).forEach(([key, cat]: [string, any]) => {
          if (cat.ativa !== false) {
            const categoryId = cat.id || key;
            const categoryName = cat.nome || cat.name || 'Outros';
            categoryMap[categoryId] = categoryName;
            categoriesArray.push({
              id: categoryId,
              name: categoryName,
              order: cat.ordem || cat.order || 999,
            });
          }
        });
        
        // Ordenar categorias por ordem
        categoriesArray.sort((a, b) => a.order - b.order);
        setCategories(categoriesArray);
      }
      
      if (itemsData) {
        const itemsArray: MenuItemType[] = Object.entries(itemsData).map(([key, item]: [string, any], index) => {
          const categoryId = item.categoria || item.category || 'outros';
          const categoryName = categoryMap[categoryId] || categoryId;
          
          return {
            id: key,  // ✅ Usar a chave original do Firebase (ex: "ia_1", "ia_14")
            name: item.nome || item.name || 'Sem nome',
            description: item.descricao || item.description || '',
            price: parseFloat(item.precoVenda || item.preco || item.price) || 0,
            category: categoryName.toLowerCase(),
            image: item.imagem || item.image || '',
            popular: item.popular || false,
            quantidade: item.quantidade || undefined,  // ✅ Adicionar quantidade
          };
        });
        setMenuItems(itemsArray);
      } else {
        setMenuItems([]);
      }
    } catch (err) {
      console.error('Erro ao buscar cardápio:', err);
      setError('Não foi possível carregar o cardápio. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (itemId: string) => {
    // ❌ BLOQUEAR se restaurante estiver FECHADO
    if (!statusRestaurante.aberto) {
      alert(`Restaurante fechado! ${statusRestaurante.mensagem}`);
      return;
    }

    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    // Verificar se há estoque disponível
    const currentQuantity = cart[itemId] || 0;
    if (item.quantidade !== undefined && currentQuantity >= item.quantidade) {
      alert(`Desculpe, temos apenas ${item.quantidade} unidade(s) disponível(is).`);
      return;
    }

    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const removeItemFromCart = (itemId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[itemId];
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const cartItems = Object.entries(cart).map(([id, quantity]) => ({
    item: menuItems.find((item) => item.id === id)!,
    quantity,
  }));

  const categoryTabs = ['todos', ...categories.map(cat => cat.name.toLowerCase())];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Cardápio</h2>
            </div>
          </div>

          {/* Informações do Restaurante */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 mb-4">
            <div className="flex flex-col items-center text-center gap-3">
              {/* Ícone do Restaurante */}
              <div className="w-20 h-20 bg-white rounded-xl shadow-md flex items-center justify-center shrink-0">
                {restaurant.image ? (
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <UtensilsCrossed className="size-10 text-orange-600" />
                )}
              </div>

              {/* Informações */}
              <div className="w-full">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {restaurant.name}
                </h1>

                {/* Status de funcionamento */}
                <div className="flex flex-col items-center justify-center gap-2 mb-3">
                  {statusRestaurante.aberto ? (
                    <>
                      <Badge className="bg-green-500 hover:bg-green-600 text-white">
                        <Clock className="size-3 mr-1" />
                        Aberto
                      </Badge>
                      <p className="text-sm text-gray-700 font-medium">
                        {statusRestaurante.mensagem}
                      </p>
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200">
                        <Clock className="size-3 mr-1" />
                        Fechado
                      </Badge>
                      {statusRestaurante.mensagem && (
                        <p className="text-sm text-gray-700 font-medium">
                          {statusRestaurante.mensagem}
                        </p>
                      )}
                    </>
                  )}
                </div>
                
                {restaurant.phone && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                    <Phone className="size-4 shrink-0" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}

                {restaurant.address && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <MapPin className="size-4 shrink-0" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="size-12 animate-spin text-orange-500 mx-auto" />
              <p className="text-muted-foreground">Carregando cardápio...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchMenuData} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : (
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="w-full justify-start mb-6 flex-wrap h-auto">
              {categoryTabs.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-0">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum item encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <MenuItem
                      key={item.id}
                      item={item}
                      quantity={cart[item.id] || 0}
                      onAdd={() => addToCart(item.id)}
                      onRemove={() => removeFromCart(item.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Cart
        items={cartItems} 
        onRemoveItem={removeItemFromCart} 
        onClearCart={clearCart}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        isRestaurantOpen={statusRestaurante.aberto}
        restaurantStatusMessage={statusRestaurante.mensagem}
      />
    </div>
  );
}