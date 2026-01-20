import { useState, useEffect } from 'react';
import { getRestaurantStatus, type RestaurantStatus } from '@/app/utils/restaurantStatus';
import type { OpeningHours } from '@/app/components/RestaurantCard';

/**
 * Hook que atualiza automaticamente o status do restaurante
 * Verifica a cada minuto se o status mudou
 */
export function useRestaurantStatus(horarios?: OpeningHours): RestaurantStatus {
  const [status, setStatus] = useState<RestaurantStatus>(() => 
    getRestaurantStatus(horarios)
  );

  useEffect(() => {
    // Atualizar status imediatamente
    setStatus(getRestaurantStatus(horarios));

    // Atualizar a cada 1 minuto
    const interval = setInterval(() => {
      setStatus(getRestaurantStatus(horarios));
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, [horarios]);

  return status;
}
