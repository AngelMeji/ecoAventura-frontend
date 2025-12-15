import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../components/layout/AuthLayout';

// Views - Auth
import Login from '../views/auth/Login.view';
import Register from '../views/auth/Register.view';

// Views - Home
import Home from '../views/home/Home.view';

// Views - Places
import PlaceDetail from '../views/places/PlaceDetail.view';
import PlaceForm from '../views/places/PlaceForm.view';

// Views - User
import Dashboard from '../views/user/Dashboard.view';
import Profile from '../views/user/Profile.view';

/**
 * Configuración de rutas de la aplicación
 */
export const appRoutes: RouteObject[] = [
    {
        path: '/',
        element: <Navigate to="/home" replace />
    },
    {
        path: '/home',
        element: <Home />
    },
    {
        path: '/dashboard',
        element: <Dashboard />
    },
    {
        path: '/profile',
        element: <Profile />
    },
    {
        path: '/place/:id',
        element: <PlaceDetail />
    },
    {
        path: '/places/create',
        element: <PlaceForm />
    },
    {
        path: '/places/edit/:id',
        element: <PlaceForm />
    },
    {
        path: '/login',
        element: (
            <AuthLayout>
                <Login />
            </AuthLayout>
        )
    },
    {
        path: '/register',
        element: (
            <AuthLayout>
                <Register />
            </AuthLayout>
        )
    }
];

