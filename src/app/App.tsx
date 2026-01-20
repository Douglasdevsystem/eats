import { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HomePage } from '@/app/components/HomePage';
import { RestaurantList } from '@/app/components/RestaurantList';
import { RestaurantMenu } from '@/app/components/RestaurantMenu';
import type { Restaurant } from '@/app/components/RestaurantCard';

type Screen = 'home' | 'restaurants' | 'menu';

// IMPORTANTE: Substitua pelo seu Google OAuth Client ID
// Obtenha em: https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = "858446397424-5gvfg5tuq921vr874dvphkvgqp6b68mv.apps.googleusercontent.com";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const handleStart = () => {
    setCurrentScreen('restaurants');
  };

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setCurrentScreen('menu');
  };

  const handleBackToRestaurants = () => {
    setSelectedRestaurant(null);
    setCurrentScreen('restaurants');
  };

  const handleBackToHome = () => {
    setSelectedRestaurant(null);
    setCurrentScreen('home');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {currentScreen === 'home' && <HomePage onStart={handleStart} />}
      
      {currentScreen === 'restaurants' && (
        <RestaurantList
          onSelectRestaurant={handleSelectRestaurant}
          onBack={handleBackToHome}
        />
      )}
      
      {currentScreen === 'menu' && selectedRestaurant && (
        <RestaurantMenu
          restaurant={selectedRestaurant}
          onBack={handleBackToRestaurants}
        />
      )}
    </GoogleOAuthProvider>
  );
}