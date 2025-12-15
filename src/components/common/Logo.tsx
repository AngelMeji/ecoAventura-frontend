import React from 'react';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <span className="text-2xl font-display font-bold text-eco-primary-700 tracking-tight">Eco</span>
            <span className="text-2xl font-display font-bold text-eco-accent-red tracking-tight">Aventura</span>
        </div>
    );
};

export default Logo;
