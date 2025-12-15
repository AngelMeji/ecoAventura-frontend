import React from 'react';
import Header from './Header';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-eco-bg">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
                {children}
            </main>
        </div>
    );
};

export default AuthLayout;
