import { Plus, Minus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { useState } from 'react';
import { MenuItemDialog } from './MenuItemDialog';

export interface MenuItemType {
  id: string | number;  // ✅ Aceita string ou number
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
}

interface MenuItemProps {
  item: MenuItemType;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function MenuItem({ item, quantity, onAdd, onRemove }: MenuItemProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card 
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setDialogOpen(true)}
      >
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-red-50">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">🍽️</span>
            </div>
          )}
          {item.popular && (
            <Badge className="absolute top-3 right-3 bg-orange-500 hover:bg-orange-600">
              Popular
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-orange-600">
              R$ {item.price.toFixed(2)}
            </span>
            
            {quantity > 0 ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onRemove}
                  className="size-8"
                >
                  <Minus className="size-4" />
                </Button>
                <span className="font-semibold w-6 text-center">{quantity}</span>
                <Button
                  variant="default"
                  size="icon"
                  onClick={onAdd}
                  className="size-8 bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="size-4 mr-1" />
                Adicionar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <MenuItemDialog
        item={item}
        quantity={quantity}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={onAdd}
        onRemove={onRemove}
      />
    </>
  );
}