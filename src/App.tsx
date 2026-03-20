import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { appRoutes } from './routes/app.routes';
import { LanguageProvider } from './context/LanguageContext';
import BackToTop from './components/common/BackToTop';
import { GoogleOAuthProvider } from '@react-oauth/google';

const AppRoutes = () => {
  const element = useRoutes(appRoutes);
  return element;
};

// Utilizar la variable de entorno para el Client ID (o el valor estático si falla)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '680864524250-5p236gmp87f3d8nhbki47etfj5312asc.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LanguageProvider>
        <Router>
          <AppRoutes />
          <BackToTop />
        </Router>
      </LanguageProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
