const STORAGE_URL = 'http://localhost:8000/storage';

const getOptimizedImageUrl = (path) => {
    if (!path) return '/assets/images/placeholder.jpg';

    let url = path;

    if (path.startsWith('http')) {
        url = path;
    } else if (path.startsWith('assets/') || path.startsWith('/assets/')) {
        url = path.startsWith('/') ? path : `/${path}`;
    } else {
        url = `${STORAGE_URL}/${path}`;
    }

    url = url.replace(/\.(jpg|jpeg|png)$/i, '.webp');

    if (url.startsWith('http://') && !url.includes('localhost')) {
        url = url.replace('http://', 'https://');
    }

    return url;
};

console.log(getOptimizedImageUrl('places/test.jpg'));
console.log(getOptimizedImageUrl('http://api.joseangelmejia.engineer/storage/places/test.jpg'));
