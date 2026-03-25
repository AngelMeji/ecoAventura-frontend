const STORAGE_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '/storage') || 'http://localhost:8000/storage';

export const getOptimizedImageUrl = (path: string | undefined | null): string => {
    if (!path) return '/assets/images/placeholder.jpg';

    let url = path;

    if (path.startsWith('http')) {
        url = path;
    } else if (path.startsWith('assets/') || path.startsWith('/assets/')) {
        url = path.startsWith('/') ? path : `/${path}`;
        // Only convert to .webp for local assets if they are likely to have a webp version
        url = url.trim().replace(/\.(jpg|jpeg|png)([\?#].*)?$/i, '.webp$2');
    } else {
        // For storage paths, we trust the backend provided extension
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        url = `${STORAGE_URL}/${cleanPath}`;
    }

    // Force HTTPS if it's an absolute URL and not localhost
    if (url.startsWith('http://') && !url.includes('localhost')) {
        url = url.replace('http://', 'https://');
    }

    return url;
};
