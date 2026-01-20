import { MapPin, Star, Clock, UtensilsCrossed, Phone } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { useRestaurantStatus } from '@/app/hooks/useRestaurantStatus';

export interface OpeningHours {
  [key: string]: {
    abertura: string;  // Ex: "11:00"
    fechamento: string; // Ex: "23:00"
    fechado?: boolean;  // true se fechado neste dia
  };
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  category?: string;
  image?: string;
  rating?: number;
  deliveryTime?: string;
  address?: string;
  city?: string;
  phone?: string;
  horarios?: OpeningHours; // ✅ Novo campo
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  const status = useRestaurantStatus(restaurant.horarios);

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group bg-white border-gray-200"
      onClick={onClick}
    >
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-red-50">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="size-16 text-gray-800 stroke-[1.5]" />
          </div>
        )}
        {restaurant.category && (
          <Badge className="absolute top-3 right-3 bg-white/90 text-gray-700 hover:bg-white shadow-sm">
            {restaurant.category}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-5 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
            {restaurant.name}
          </h3>
        </div>

        {/* Status do restaurante (Aberto/Fechado) */}
        {restaurant.horarios && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-sm font-medium ${
              status.isOpen ? 'text-green-600' : 'text-red-600'
            }`}>
              <Clock className="size-4" />
              <span>{status.isOpen ? 'Aberto' : 'Fechado'}</span>
            </div>
            <span className="text-sm text-gray-600">• {status.statusText}</span>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-600">
          {restaurant.rating !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{restaurant.rating}</span>
            </div>
          )}
          {restaurant.deliveryTime && (
            <div className="flex items-center gap-1">
              <Clock className="size-4" />
              <span>{restaurant.deliveryTime}</span>
            </div>
          )}
        </div>

        {restaurant.address && (
          <div className="flex items-start gap-2 text-sm text-gray-500">
            <MapPin className="size-4 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{restaurant.address}</span>
          </div>
        )}
        
        {restaurant.phone && (
          <div className="flex items-start gap-2 text-sm text-gray-500">
            <Phone className="size-4 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{restaurant.phone}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}