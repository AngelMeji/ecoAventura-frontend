import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ 
    src, 
    fallbackSrc = '/assets/images/placeholder.jpg', 
    alt, 
    ...props 
}) => {
    const [currentSrc, setCurrentSrc] = useState(src);
    const [attempts, setAttempts] = useState(0);

    useEffect(() => {
        setCurrentSrc(src);
        setAttempts(0);
    }, [src]);

    const handleError = () => {
        if (!currentSrc || typeof currentSrc !== 'string') {
            setCurrentSrc(fallbackSrc);
            return;
        }

        // Strategy to cycle through common image extensions if one fails
        if (attempts === 0 && currentSrc.match(/\.webp$/i)) {
            setCurrentSrc(currentSrc.replace(/\.webp$/i, '.jpg'));
            setAttempts(1);
        } else if (attempts === 1 && currentSrc.match(/\.jpg$/i)) {
            setCurrentSrc(currentSrc.replace(/\.jpg$/i, '.png'));
            setAttempts(2);
        } else if (attempts === 2 && currentSrc.match(/\.png$/i)) {
            setCurrentSrc(currentSrc.replace(/\.png$/i, '.jpeg'));
            setAttempts(3);
        } else {
            // If all attempts failed or none matched, revert to fallback
            setCurrentSrc(fallbackSrc);
        }
    };

    return (
        <img
            src={currentSrc}
            alt={alt || ''}
            onError={handleError}
            {...props}
        />
    );
};

export default SafeImage;
