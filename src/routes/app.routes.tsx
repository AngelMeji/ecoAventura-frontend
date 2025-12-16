import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../components/layout/AuthLayout';

// Views
import Home from '../views/Home.view';
import Login from '../views/Login.view';
import Register from '../views/Register.view';
import Dashboard from '../views/Dashboard.view';
import Profile from '../views/Profile.view';
import PlaceForm from '../views/places/PlaceForm.view';
import PlaceDetail from '../views/places/PlaceDetail.view';
import ForgotPassword from '../views/auth/ForgotPassword.view';
import ResetPassword from '../views/auth/ResetPassword.view';

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
    },
    {
        path: '/forgot-password',
        element: (
            <AuthLayout>
                <ForgotPassword />
            </AuthLayout>
        )
    },
    {
        path: '/reset-password',
        element: (
            <AuthLayout>
                <ResetPassword />
            </AuthLayout>
        )
    }
];
