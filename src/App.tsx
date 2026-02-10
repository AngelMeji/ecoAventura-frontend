import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { appRoutes } from './routes/app.routes';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {appRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
