# 🌿 EcoAventura - Frontend

Plataforma premium de gestión y promoción ecoturística. Una aplicación web moderna, responsiva y de alto rendimiento diseñada para conectar viajeros con destinos naturales únicos en Risaralda, Colombia.

![EcoAventura Dashboard Preview](https://via.placeholder.com/800x400?text=EcoAventura+Premium+UI)

## 🚀 Tecnologías y Stack

El proyecto utiliza un stack de vanguardia para garantizar escalabilidad, mantenibilidad y una experiencia de usuario superior:

*   **Core:** React 18 + TypeScript (Tipado estricto)
*   **Build System:** Vite (High performance dev server)
*   **Estilos:** Tailwind CSS v4 (Compilación JIT, Configuración via `@theme`)
*   **Mapas:** React-Leaflet + OpenStreetMap
*   **Estado & API:** Axios (Interceptores, Manejo de errores global)
*   **Enrutamiento:** React Router DOM v6 (Rutas protegidas, Layouts, Lazy loading)
*   **Diseño:** Glassmorphism, Micro-interacciones, Tipografía Premium (`Playfair Display` + `Inter`)

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una arquitectura modular escalable, separando claramente vistas, lógica de negocio y presentación:

```
src/
├── components/          # Componentes reutilizables (UI Kit)
│   ├── dashboard/       # Tablas, Stats, Widgets de administración
│   ├── destination/     # Cards, Modales, Carruseles de lugares
│   ├── home/            # Secciones Landing (Hero, Filtros, Destacados)
│   ├── layout/          # Estructura (Header Responsivo, Footer)
│   └── map/             # Componentes de mapa interactivo
├── services/            # Capa de Comunicación con Backend (API)
│   ├── authService.ts   # Autenticación (Login, Register, JWT, Interceptores)
│   └── placesService.ts # Gestión de Datos (Lugares, Reseñas, Usuarios)
├── controllers/         # Lógica de transformación de datos (Business Logic)
├── models/              # Interfaces TypeScript estrictas (Place, User, Review)
├── routes/              # Configuración de Rutas y Navegación
└── views/               # Páginas Completas (Pages)
    ├── auth/            # Login, Registro
    ├── home/            # Landing Page
    ├── places/          # Detalles de Lugar, Formulario (Crear/Editar)
    └── user/            # Dashboard por Roles, Perfil de Usuario
```

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
*   **Sistema de Roles:** Acceso diferenciado para `Admin`, `Partner` (Socio) y `User` (Turista).
*   **JWT Handling:** Gestión automática de tokens con almacenamiento seguro en `localStorage`.
*   **Interceptores Axios:** 
    *   Inyección automática de `Bearer Token`.
    *   Manejo global de errores 401 (Auto-logout) y 403 (Forbidden).
*   **Protección de Rutas:** Guards para vistas privadas.

### 🗺️ Experiencia de Usuario (User)
*   **Mapa Interactivo:** Exploración visual de destinos con popups informativos.
*   **Búsqueda Avanzada:** Filtros por categoría, texto y destacados.
*   **Destinos Premium:** Visualización detallada con carrusel de imágenes, reseñas, clima y dificultad.
*   **Favoritos:** Sistema para guardar y gestionar destinos preferidos.
*   **Reseñas:** Posibilidad de calificar y comentar lugares visitados.

### 💼 Panel de Gestión (Partner & Admin)
*   **Dashboard Inteligente:** Estadísticas en tiempo real (visitas, valoraciones, estado de publicaciones).
*   **Gestión de Lugares (CRUD):** 
    *   Creación y edición con soporte para múltiples imágenes.
    *   Validación de formularios y subida de archivos segura.
    *   Selección de imagen principal (Cover).
*   **Moderación (Solo Admin):** Flujo de aprobación para nuevos lugares creados por socios.
*   **Gestión de Usuarios (Solo Admin):** Tabla administrativa con búsqueda y edición de roles.

## 🎨 Sistema de Diseño "Eco-Premium"

Hemos implementado un Design System propio basado en tokens de diseño dentro de CSS nativo (Tailwind v4):

*   **Paleta de Colores:** Verdes profundos (`eco-primary`), tierras cálidos (`eco-sand`) y acentos dorados (`eco-accent`).
*   **Tipografía:** `Playfair Display` para encabezados elegantes y `Inter` para legibilidad.
*   **Efectos:** Uso extensivo de `backdrop-blur` (Glassmorphism), sombras suaves (`shadow-xl`) y transiciones fluidas.
*   **Iconografía:** Iconos SVG limpios y consistentes (adiós a los emojis antiguos).

## 🛠️ Instalación y Configuración

### Prerrequisitos
*   Node.js (v16 o superior)
*   Backend Laravel corriendo en `http://localhost:8000` (Requerido para funcionalidad completa)

### 1. Clonar e Instalar
```bash
git clone <tu-repositorio>
cd ecoAventura-frontend
npm install
```

### 2. Configurar Entorno
Crear un archivo `.env` en la raíz basado en el ejemplo:
```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Ejecutar
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

## 🧪 Credenciales de Prueba (Entorno Desarrollo)

Para probar los diferentes roles y funcionalidades:

| Rol     | Email                     | Contraseña | Acceso |
|---------|---------------------------|------------|--------|
| **Admin**   | `admin@ecoaventura.com`     | `password`   | Panel total, Moderación, Usuarios |
| **Partner** | `partner@ecoaventura.com`   | `password`   | Dashboard, Publicar Destinos |
| **User**    | `user@ecoaventura.com`      | `password`   | Home, Favoritos, Explorar |

---

## 📄 Notas de Versión

### Última Actualización: **Premium UI & Backend Integration**
*   Migración completa a Tailwind CSS v4 con `@theme`.
*   Integración total con API REST Laravel (Servicios `authService` y `placesService`).
*   Implementación de subida de imágenes múltiple con preview y selección de portada.
*   Rediseño completo de Dashboard y Perfil de Usuario.
*   Eliminación de dependencias legacy y limpieza de código.

---
Desarrollado con 💚 por el equipo de EcoAventura.
