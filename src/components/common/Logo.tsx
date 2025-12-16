import React from 'react';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <span className="text-2xl font-display font-bold text-eco-primary-700 tracking-tight">Eco</span>
            <span className="text-2xl font-display font-bold tracking-tight">
                <span className="text-[#FCD116]">Aven</span>
                <span className="text-[#003893]">tu</span>
                <span className="text-[#CE1126]">ra</span>
            </span>
        </div>
    );
};

export default Logo;
