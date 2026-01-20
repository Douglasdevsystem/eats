import { ShoppingCart, X, Trash2, ChefHat } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/app/components/ui/sheet';
import { Separator } from '@/app/components/ui/separator';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
import { useState } from 'react';
import { CheckoutDialog, type OrderData } from './CheckoutDialog';
import type { MenuItemType } from './MenuItem';

interface CartProps {
  items: Array<{ item: MenuItemType; quantity: number }>;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  restaurantId?: string;
  restaurantName?: string;
  isRestaurantOpen?: boolean;        // ✅ Novo
  restaurantStatusMessage?: string;  // ✅ Novo
}

export function Cart({ 
  items, 
  onRemoveItem, 
  onClearCart, 
  restaurantId = '', 
  restaurantName = '',
  isRestaurantOpen = true,           // ✅ Padrão: aberto
  restaurantStatusMessage = ''       // ✅ Novo
}: CartProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [instrucoesPreparo, setInstrucoesPreparo] = useState('');  // ✅ Novo estado
  const totalItems = items.reduce((sum, { quantity }) => sum + quantity, 0);
  const totalPrice = items.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);

  const handleConfirmOrder = (orderData: OrderData) => {
    console.log('Pedido confirmado:', orderData);
    // Limpar o carrinho após confirmar
    setTimeout(() => {
      onClearCart();
      setInstrucoesPreparo('');  // ✅ Limpar instruções
      setCheckoutOpen(false);
    }, 2000);
  };

  const handleCheckout = () => {
    // ❌ BLOQUEAR se restaurante estiver FECHADO
    if (!isRestaurantOpen) {
      alert(`Restaurante fechado! ${restaurantStatusMessage || 'Não é possível fazer pedidos no momento.'}`);
      return;
    }

    setCheckoutOpen(true);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="lg" className="fixed bottom-6 right-6 z-50 shadow-2xl gap-2 px-6 h-14 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
          <ShoppingCart className="size-5" />
          <span className="font-semibold">Carrinho</span>
          {totalItems > 0 && (
            <Badge variant="secondary" className="ml-1 px-2 bg-white text-orange-600">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-gray-50">
        <SheetHeader className="px-6 pt-6 pb-4 bg-white border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold text-gray-900">
              Seu Pedido
            </SheetTitle>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearCart}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1"
              >
                <Trash2 className="size-4" />
                Limpar
              </Button>
            )}
          </div>
          <SheetDescription className="text-left text-gray-600">
            {items.length === 0 
              ? 'Seu carrinho está vazio' 
              : `${totalItems} ${totalItems === 1 ? 'item' : 'itens'} no carrinho`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-white">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="size-12 text-gray-400" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Carrinho vazio</h3>
            <p className="text-sm text-gray-500">
              Adicione itens do cardápio para começar seu pedido
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4 px-6 space-y-4 bg-white">
              {items.map(({ item, quantity }) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0 group">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl">🍽️</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-base leading-tight">
                        {item.name}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveItem(item.id)}
                        className="size-8 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-2 hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {quantity}x R$ {item.price.toFixed(2)}
                    </p>
                    <p className="font-bold text-gray-900">
                      R$ {(item.price * quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border-t p-6 space-y-4">
              {/* ✅ Campo de instruções de preparo */}
              <div>
                <label htmlFor="instrucoes-preparo" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                  <ChefHat className="size-4" />
                  Instruções de preparo (opcional)
                </label>
                <Textarea
                  id="instrucoes-preparo"
                  placeholder="Ex: Sem cebola, bem passado, etc..."
                  className="min-h-16 text-sm resize-none"
                  value={instrucoesPreparo}
                  onChange={(e) => setInstrucoesPreparo(e.target.value)}
                />
              </div>

              <Separator className="bg-gray-200" />

              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Taxa de entrega</span>
                  <span className="font-medium">R$ 5,00</span>
                </div>
                <Separator className="bg-gray-200" />
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-600">R$ {(totalPrice + 5).toFixed(2)}</span>
                </div>
              </div>

              {/* ⚠️ Aviso se restaurante estiver fechado */}
              {!isRestaurantOpen && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-red-700 font-medium">
                    🔴 Restaurante fechado
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {restaurantStatusMessage}
                  </p>
                </div>
              )}

              <Button 
                size="lg" 
                className={`w-full h-14 text-base font-semibold shadow-lg ${
                  isRestaurantOpen 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                    : 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'
                }`}
                onClick={handleCheckout}
                disabled={!isRestaurantOpen}
              >
                {isRestaurantOpen ? 'Finalizar Pedido' : 'Restaurante Fechado'}
              </Button>
            </div>
          </>
        )}

        <CheckoutDialog
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          totalPrice={totalPrice}
          onConfirmOrder={handleConfirmOrder}
          cartItems={items}
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          instrucoesPreparo={instrucoesPreparo}
          setInstrucoesPreparo={setInstrucoesPreparo}
        />
      </SheetContent>
    </Sheet>
  );
}