# EcoAventura - Guía Rápida de Desarrollo

## 🚀 Servidor de Desarrollo

```bash
npm run dev
```

El servidor corre en: **http://localhost:5173** (o el puerto disponible)

---

## 🔐 Credenciales de Prueba (Backend Laravel)

| Rol     | Email                     | Contraseña |
|---------|---------------------------|------------|
| Admin   | admin@ecoaventura.com     | password   |
| Partner | partner@ecoaventura.com   | password   |
| User    | user@ecoaventura.com      | password   |

---

## 🌐 Configuración de API

### Variables de Entorno (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

### Servicios Disponibles

#### authService (src/services/authService.ts)
- `login(credentials)` - Iniciar sesión
- `register(data)` - Registrar usuario
- `logout()` - Cerrar sesión
- `getProfile()` - Obtener perfil actual
- `updateProfile(data)` - Actualizar perfil (soporta FormData para avatar)
- `updatePassword(data)` - Cambiar contraseña
- `isAuthenticated()` - Verificar si está autenticado
- `getCurrentUser()` - Obtener usuario desde localStorage

#### placesService (src/services/placesService.ts)
- `getAll(filters)` - Listar lugares públicos (paginado)
- `getOne(idOrSlug)` - Detalle de lugar
- `create(formData)` - Crear lugar (Partner/Admin)
- `update(id, formData)` - Editar lugar
- `delete(id)` - Eliminar lugar
- `createReview(placeId, review)` - Agregar reseña
- `getFavorites()` - Obtener favoritos del usuario
- `addFavorite(placeId)` - Agregar a favoritos
- `removeFavorite(placeId)` - Quitar de favoritos
- `getCategories()` - Listar categorías

**Administración (Admin):**
- `getAdminDashboard()` - Stats del admin
- `getPendingPlaces()` - Lugares pendientes
- `getAdminAllPlaces()` - Todos los lugares
- `approve(id)` - Aprobar lugar
- `reject(id)` - Rechazar lugar
- `needsFix(id)` - Solicitar correcciones
- `getAllUsers()` - Listar usuarios
- `createUser(data)` - Crear usuario
- `updateUser(id, data)` - Editar usuario
- `deleteUser(id)` - Eliminar usuario

**Partner:**
- `getPartnerDashboard()` - Stats del socio

---

## � Rutas Principales

| Ruta               | Descripción                    | Acceso   |
|--------------------|--------------------------------|----------|
| `/`                | Redirige a /home o /login      | Público  |
| `/home`            | Página principal con mapa      | Público  |
| `/login`           | Inicio de sesión               | Público  |
| `/register`        | Registro de usuario            | Público  |
| `/dashboard`       | Panel según rol                | Auth     |
| `/profile`         | Editar perfil                  | Auth     |
| `/place/:slug`     | Detalle de lugar               | Público  |
| `/places/create`   | Crear nuevo lugar              | Partner+ |
| `/places/edit/:id` | Editar lugar                   | Partner+ |

---

## 📦 Estructura de Carpetas

```
src/
├── components/
│   ├── dashboard/      # AdminUsersTable, etc.
│   ├── destination/    # DestinationCard, DestinationModal
│   ├── home/           # CategorySection, FeaturedSection, FilterBar
│   ├── layout/         # Header
│   └── map/            # MapComponent
├── controllers/        # DestinationController (lógica de negocio)
├── models/             # Place.model.ts, User.model.ts
├── routes/             # app.routes.tsx
├── services/           # authService.ts, placesService.ts
└── views/
    ├── auth/           # Login.view, Register.view
    ├── home/           # Home.view
    ├── places/         # PlaceDetail.view, PlaceForm.view
    └── user/           # Dashboard.view, Profile.view
```

---

## 🖼️ Manejo de Imágenes

### Subida de Imágenes (PlaceForm)
- Formatos aceptados: JPEG, PNG, JPG, WEBP
- Tamaño máximo: 5MB por imagen
- Máximo: 10 imágenes por lugar
- Se puede marcar una imagen como **principal**

### URLs de Imágenes
El backend devuelve:
- `place.primary_image_url` - URL completa de la imagen principal
- `place.images[]` - Array con todas las imágenes

El frontend prioriza `primary_image_url` si existe.

---

## 🎨 Sistema de Diseño

### Colores (definidos en @theme)
- `eco-primary-*` - Principales (verdes)
- `eco-accent-*` - Acentos (naranjas/dorados)
- `eco-sand-*` - Neutros cálidos
- `eco-bg` - Fondo claro (#f8fafc)
- `eco-text` - Texto principal (#1a1a2e)

### Tipografía
- `font-display` - Playfair Display (títulos)
- `font-sans` - Inter (cuerpo)

### Clases Globales
- `.auth-input` - Inputs de formulario
- `.auth-button` - Botones principales
- `.auth-card` - Cards con glassmorphism
- `.glass` / `.glass-dark` - Efectos de vidrio

---

## ⚠️ Notas Importantes

1. **CORS**: El backend está configurado para localhost:3000 y localhost:5173
2. **Token**: Se guarda en `localStorage.auth_token`
3. **Interceptores**: 
   - 401 → Logout automático
   - 403 → Log de warning
4. **Lugares de Partners**: Quedan en estado "pending" hasta aprobación del admin

---

## 💡 Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview

# Linter
npm run lint
```
