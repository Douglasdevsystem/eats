import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Minus, Plus, X } from 'lucide-react';
import type { MenuItemType } from './MenuItem';

interface MenuItemDialogProps {
  item: MenuItemType;
  quantity: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
  onRemove: () => void;
}

export function MenuItemDialog({
  item,
  quantity,
  open,
  onOpenChange,
  onAdd,
  onRemove,
}: MenuItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 hover:bg-white shadow-md"
        >
          <X className="size-4" />
        </Button>

        {/* Imagem */}
        <div className="relative w-full h-72 bg-gradient-to-br from-orange-100 via-orange-50 to-red-50 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">🍽️</span>
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {item.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detalhes do item {item.name}
            </DialogDescription>
          </DialogHeader>

          {item.description && (
            <p className="text-gray-600 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Preço */}
          <div className="pt-2">
            <p className="text-3xl font-bold text-orange-600">
              R$ {item.price.toFixed(2)}
            </p>
          </div>

          {/* Controles de quantidade e adicionar */}
          <div className="flex items-center gap-3 pt-4">
            {quantity > 0 ? (
              <>
                <div className="flex items-center gap-2 border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className="rounded-l-lg h-12 w-12"
                  >
                    <Minus className="size-5" />
                  </Button>
                  <span className="font-bold text-lg w-10 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onAdd}
                    className="rounded-r-lg h-12 w-12"
                  >
                    <Plus className="size-5" />
                  </Button>
                </div>
                <Button
                  size="lg"
                  className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 font-semibold"
                  onClick={() => onOpenChange(false)}
                >
                  Adicionar • R$ {(item.price * quantity).toFixed(2)}
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 font-semibold"
                onClick={onAdd}
              >
                <Plus className="size-5 mr-2" />
                Adicionar ao Carrinho
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}