import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HomePage } from '@/app/components/HomePage';
import { RestaurantList } from '@/app/components/RestaurantList';
import { RestaurantPage } from '@/app/components/RestaurantPage';

// IMPORTANTE: Substitua pelo seu Google OAuth Client ID
// Obtenha em: https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = "858446397424-5gvfg5tuq921vr874dvphkvgqp6b68mv.apps.googleusercontent.com";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurantes" element={<RestaurantList />} />
          <Route path="/restaurante/:slug" element={<RestaurantPage />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}