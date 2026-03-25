const STORAGE_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '/storage') || 'http://localhost:8000/storage';

export const getOptimizedImageUrl = (path: string | undefined | null): string => {
    if (!path) return '/assets/logo_Ecoaventura_fondo.jpeg'; // Fallback to existing logo

    // Si ya es una URL absoluta, retornar tal cual
    if (path.startsWith('http')) {
        return path;
    }

    // Si es un asset local (ruta relativa que empieza por /assets o assets/)
    if (path.startsWith('assets/') || path.startsWith('/assets/')) {
        return path.startsWith('/') ? path : `/${path}`;
    }

    // Para rutas de almacenamiento, asegurar que no haya doble prefijo 'storage'
    // El backend suele devolver 'avatars/xxx.png' o 'places/xxx.webp'
    let cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Forzar extensión .webp para lugares ya que el servidor siempre los optimiza así
    if (cleanPath.startsWith('places/') || cleanPath.startsWith('storage/places/')) {
        cleanPath = cleanPath.replace(/\.(jpe?g|png|gif)$/i, '.webp');
    }
    
    // Si la ruta ya incluye 'storage/', no la duplicamos
    if (cleanPath.startsWith('storage/')) {
        const pathWithoutStorage = cleanPath.replace(/^storage\//, '');
        return `${STORAGE_URL}/${pathWithoutStorage}`;
    }

    return `${STORAGE_URL}/${cleanPath}`;
};
