import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { appRoutes } from './routes/app.routes';

function App() {
  return (
    <Router>
      <Routes>
        {appRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Router>
  );
}

export default App;
