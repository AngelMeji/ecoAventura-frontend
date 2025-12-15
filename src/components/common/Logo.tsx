import React from 'react';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="w-10 h-10 bg-eco-teal-500 rounded-full flex items-center justify-center">
                <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                </svg>
            </div>
            <span className="text-xl font-semibold text-gray-800">EcoTurismo</span>
        </div>
    );
};

export default Logo;
