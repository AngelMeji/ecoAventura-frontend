# EcoAventura - Frontend (React + Vite)

¡Bienvenido a **EcoAventura**, la plataforma líder para descubrir y gestionar el ecoturismo en el corazón de Risaralda! Este repositorio contiene el código fuente del Frontend, desarrollado con tecnologías modernas para ofrecer una experiencia rápida, accesible y visualmente atractiva.

---

## 🛠️ Stack Tecnológico

El proyecto está construido sobre un stack moderno que prioriza el rendimiento y la experiencia del desarrollador:

- **Core**: [React 19](https://react.dev/) (Última versión con soporte para Concurrent Rendering).
- **Framework de Build**: [Vite 7](https://vitejs.dev/) (Bundler ultra-rápido).
- **Lenguaje**: [TypeScript 5.9](https://www.typescriptlang.org/) (Tipado estático para mayor seguridad).
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/) (Framework de CSS utility-first).
- **Enrutamiento**: [React Router 7](https://reactrouter.com/) (Gestión de navegación integrada).
- **Mapas**: [Leaflet 1.9](https://leafletjs.com/) + [React Leaflet 5](https://react-leaflet.js.org/).
- **Peticiones HTTP**: [Axios](https://axios-http.com/).
- **Pruebas**: [Vitest 4](https://vitest.dev/) + [React Testing Library 16](https://testing-library.com/).

---

## 🔑 Variables de Entorno

Para que el frontend pueda comunicarse correctamente con el backend, es necesario configurar las siguientes variables en un archivo `.env` en la raíz del proyecto:

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| **`VITE_API_URL`** | URL base de la API Backend (debe terminar en `/api`). | `https://api.tu-proyecto.com/api` |

---

## 📖 Descripción del Proyecto

EcoAventura es una solución integral que conecta a amantes de la naturaleza con los tesoros ecológicos de Risaralda. La plataforma permite a los usuarios:
*   **Explorar**: Mediante un mapa interactivo y listados dinámicos.
*   **Interactuar**: Con un sistema de reseñas, calificaciones y gestión de favoritos.
*   **Asistencia con IA**: Un chatbot inteligente basado en Google Gemini para resolver dudas sobre los destinos.
*   **Gestión**: Paneles especializados para Exploradores, Socios Turísticos y Administradores.

---

## 📂 Mapa del Proyecto (Estructura de Carpetas)

El proyecto sigue una arquitectura modular basada en componentes y servicios para facilitar el mantenimiento y la escalabilidad:

| Carpeta | Función |
| :--- | :--- |
| **`src/`** | Directorio raíz del código fuente. |
| **`src/assets/`** | Recursos estáticos como imágenes y estilos globales (Tailwind CSS). |
| **`src/components/`** | Componentes reutilizables organizados por módulos (auth, dashboard, destination, layout, map, places). |
| **`src/context/`** | Proveedores de Contexto de React para estados globales (Idiomas, Accesibilidad). |
| **`src/controllers/`** | Lógica de controlador para manejar la interacción entre vistas y servicios. |
| **`src/models/`** | Definiciones de tipos e interfaces de TypeScript (User, Place, Review). |
| **`src/services/`** | Capa de comunicación con la API Backend utilizando Axios. |
| **`src/translations/`** | Archivos de localización para soporte multi-idioma (Español / Inglés). |
| **`src/utils/`** | Funciones de utilidad, formateadores y ayudantes generales. |
| **`src/views/`** | Componentes de página de alto nivel que representan las rutas de la aplicación. |
| **`public/`** | Archivos que se sirven tal cual, como el `favicon` y activos estáticos de raíz. |

---

## 🚀 Guía de Despliegue - EcoAventura (Dockploy)

Este proyecto está configurado para un despliegue automático y eficiente utilizando **Dockploy**.

### 🔄 Flujo de CI/CD (Despliegue Automático)

1. **Push a Git**: Cada vez que se realiza un `git push` a la rama `main`, Dockploy detecta el cambio.
2. **Build Automático**: El servidor inicia automáticamente un proceso que incluye:
   - Instalación de dependencias (`npm install`).
   - Generación de archivos estáticos (`npm run build`).
3. **Despliegue**: La nueva versión se publica sin intervención manual una vez terminada la construcción.

### ⚙️ Configuración para Nuevas Organizaciones

#### 🌐 Frontend (ecoAventura-frontend)
Es fundamental configurar la siguiente variable de entorno en el panel de Dockploy:
- `VITE_API_URL`: Debe apuntar a la URL pública del backend terminada en `/api` (ej: `https://api.tu-organizacion.com/api`).

---

## 🛠️ Desarrollo y Mantenimiento

Para trabajar en este proyecto localmente:

1. **Instalar dependencias**:
   ```bash
   npm install
   ```
2. **Correr en modo desarrollo**:
   ```bash
   npm run dev
   ```
3. **Ejecutar Pruebas Automatizadas**:
   El proyecto cuenta con más de 100 casos de prueba para asegurar la integridad de los componentes.
   ```bash
   npm run test
   ```
4. **Subir Cambios**:
   ```bash
   git add .
   git commit -m "Descripción clara del cambio"
   git push origin main
   ```

---

## 📝 Notas Adicionales
- **Accesibilidad**: La plataforma incluye un módulo de accesibilidad para ajustar contraste, escala de grises y tamaño de fuente.
- **Idiomas**: El sistema detecta el idioma preferido del usuario, pero permite el cambio manual desde la cabecera.
- **Seguridad**: Todas las rutas de administración y socio están protegidas por `Guards` que verifican la sesión y el rol del usuario.
