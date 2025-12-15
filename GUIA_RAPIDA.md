# EcoTurismo - Guía Rápida de Inicio

## 🚀 Servidor de Desarrollo

El servidor está corriendo en: **http://localhost:5175**

## 🔐 Credenciales de Prueba

### Admin
- Email: `admin@ecoturismo.com`
- Contraseña: `admin123`

### Socio
- Email: `socio@ecoturismo.com`
- Contraseña: `socio123`

## 📍 Rutas Disponibles

- `/` - Redirige a `/login`
- `/login` - Página de inicio de sesión
- `/register` - Página de registro

## 🎨 Componentes Creados

- **Login** - Formulario de inicio de sesión con credenciales de prueba
- **Register** - Formulario de registro con validación
- **AuthLayout** - Layout compartido con header y navegación
- **Logo** - Componente del logo de EcoTurismo

## 🔧 Servicios

- **authService** - Servicio de autenticación (actualmente con datos mock)
  - `login(credentials)` - Iniciar sesión
  - `register(data)` - Registrar usuario
  - `logout()` - Cerrar sesión
  - `isAuthenticated()` - Verificar si está autenticado
  - `getCurrentUser()` - Obtener usuario actual

## 📝 Próximos Pasos

1. **Conectar Laravel Backend**
   - Crear archivo `.env` con `VITE_API_URL=http://localhost:8000/api`
   - Descomentar las llamadas reales a la API en `authService.ts`
   - Configurar CORS en Laravel

2. **Crear Dashboard**
   - Página principal después del login
   - Rutas protegidas
   - Control de acceso por roles

## 🎯 Archivos Importantes

- `src/components/auth/Login.tsx` - Componente de login
- `src/components/auth/Register.tsx` - Componente de registro
- `src/services/authService.ts` - Servicio de autenticación
- `tailwind.config.js` - Configuración de Tailwind con colores personalizados
- `src/index.css` - Estilos globales y clases de componentes

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
