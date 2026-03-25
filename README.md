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

## 🚀 Guía de Despliegue - EcoAventura (Dokploy)

Este proyecto está diseñado para ser desplegado de manera automatizada utilizando **Dokploy** (un PaaS autohospedado similar a Vercel/Heroku) sobre infraestructura de **DigitalOcean**.

### 🏗️ Infraestructura y Dominios
- **Dominio**: Gestionado en **Namecheap**.
- **Hosting**: Servidor (VPS) en **DigitalOcean**.
- **Orquestación**: **Dokploy** para la gestión de contenedores y CI/CD.

---

### 🛠️ Guía Paso a Paso para la Configuración

Si desea implementar esta plataforma para una nueva organización, siga estos pasos detallados:

#### 1. Preparación del Servidor (DigitalOcean)
1. **Crear un Droplet**: Inicie un Droplet en DigitalOcean con las siguientes especificaciones mínimas:
   - **SO**: Ubuntu 22.04 LTS o superior.
   - **Plan**: Mínimo 8GB de RAM y 2 CPU (30GB+ de disco).
2. **Configurar Firewall**: En el panel de DigitalOcean, asegúrese de que los siguientes puertos estén **Abiertos**:
   - `80` (HTTP) y `443` (HTTPS) para el tráfico web.
   - `3000` (Temporalmente) para acceder al panel inicial de Dokploy.
   - `22` (SSH) para administración.

#### 2. Instalación de Dokploy
1. Conéctese a su servidor vía SSH:
   ```bash
   ssh root@tu-ip-servidor
   ```
2. Ejecute el comando de instalación oficial de Dokploy:
   ```bash
   curl -sSL https://dokploy.com/install.sh | sh
   ```
3. Una vez finalizado, acceda a la interfaz web en `http://tu-ip-servidor:3000` y cree su cuenta de administrador.

#### 3. Configuración del Dominio (Namecheap)
1. Inicie sesión en **Namecheap** y vaya a la sección **Advanced DNS**.
2. Cree un **A Record**:
   - **Host**: `@` (o el subdominio deseado, ej: `app`).
   - **Value**: La dirección IP de su Droplet de DigitalOcean.
   - **TTL**: Automatic.
3. (Opcional) Cree un registro similar para el backend (ej: `api`).

#### 4. Vinculación de Aplicaciones en Dokploy
1. **Crear Proyecto**: En el panel de Dokploy, cree un nuevo proyecto llamado "EcoAventura".
2. **Despliegue de Aplicaciones**:
   - Conecte su cuenta de GitHub/GitLab.
   - Seleccione el repositorio `ecoAventura-frontend` (y el de backend).
   - **Variables de Entorno**: Configure las variables mencionadas en la sección [Variables de Entorno](#-variables-de-entorno).
3. **Configurar Dominio**: En la pestaña "Domains" de su aplicación en Dokploy, ingrese su dominio (ej: `tu-organizacion.com`) y active **HTTPS (Let's Encrypt)**. Dokploy gestionará automáticamente los certificados SSL.

---

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
