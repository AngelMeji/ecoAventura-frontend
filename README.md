# 🌿 EcoTurismo Risaralda - Proyecto Formativo

Plataforma web interactiva dedicada a la promoción y gestión de destinos ecoturísticos en el departamento de Risaralda, Colombia. Este proyecto busca conectar a los turistas con la riqueza natural de la región a través de una experiencia de usuario moderna y fluida.

## 🚀 Tecnologías Utilizadas

El proyecto está construido con un stack moderno enfocado en rendimiento y mantenibilidad:

*   **Core:** React 18 + TypeScript
*   **Build Tool:** Vite
*   **Estilos:** Tailwind CSS
*   **Mapas:** Leaflet + React-Leaflet
*   **Enrutamiento:** React Router DOM v6
*   **Iconos:** Heroicons / Emojis nativos

## 🏗️ Arquitectura del Proyecto (MVC)

Hemos reestructurado la aplicación siguiendo un patrón **Modelo-Vista-Controlador (MVC)** adaptado al desarrollo frontend para mejorar la escalabilidad y separación de responsabilidades:

### 1. Models (`src/models/`)
Define la estructura de los datos y contiene la información estática (Mock Data).
*   `Destination.model.ts`: Interfaces para Destinos, Reseñas, Coordenadas.
*   `User.model.ts`: Interfaces para Usuarios y Autenticación.
*   `destinations.data.ts`: Datos de prueba con lugares reales de Risaralda (Termales, Otún Quimbaya, etc.).

### 2. Views (`src/views/`)
Componentes de alto nivel que representan las páginas completas. Se encargan de la estructura visual y conectan los controladores con los componentes de UI.
*   `Home.view.tsx`: Página principal con mapa, filtros y listados.
*   `Login.view.tsx`: Vista de inicio de sesión.
*   `Register.view.tsx`: Vista de registro de usuarios.

### 3. Controllers (`src/controllers/`)
Contienen la lógica de negocio pura, separada de la interfaz gráfica.
*   `Destination.controller.ts`: Lógica para filtrar, buscar y obtener estadísticas de destinos.
*   `Auth.controller.ts`: Gestión de sesión (simulada), login y registro.

### 4. Components (`src/components/`)
Elementos de UI reutilizables y "tontos" (presentacionales).
*   `map/`: Componentes relacionados con Leaflet (`InteractiveMap`).
*   `destination/`: Tarjetas (`DestinationCard`) y Modales (`DestinationModal`).
*   `home/`: Secciones específicas del home (`CategorySection`, `FeaturedSection`, `FilterBar`).
*   `layout/`: Elementos estructurales (`Header`, `AuthLayout`).

## ✨ Funcionalidades Implementadas

### 🗺️ Mapa Interactivo
*   Visualización de destinos geolocalizados en Risaralda.
*   Marcadores personalizados interactivos.
*   Popups con información rápida.
*   Sincronización entre mapa y tarjetas (scroll automático al hacer clic en un marcador).

### 🏠 Página de Inicio (Home)
*   **Búsqueda Inteligente:** Barra de búsqueda en tiempo real.
*   **Exploración por Categorías:** Sección visual con estadísticas (cantidad de lugares y calificación promedio) por categoría (Cascadas, Senderismo, Fauna, etc.).
*   **Secciones Destacadas:**
    *   🌟 *Recomendados Especialmente*: Destinos marcados como destacados.
    *   ⚡ *Mejor Valorados*: Top destinos ordenados por popularidad/vistas.

### 📱 Detalle de Destino (Modal)
Ventana modal completa que se abre al seleccionar un destino:
*   **Galería de Imágenes:** Carrusel interactivo de fotos.
*   **Información Completa:** Descripción, ubicación, dificultad, duración, mejor época.
*   **Recomendaciones:** Tips para el viajero.
*   **Sistema de Reseñas:**
    *   Visualización de calificación (estrellas).
    *   Listado de comentarios de usuarios.
    *   Formulario para agregar nuevas reseñas.

### 🔐 Autenticación
*   Interfaz de Login y Registro responsive.
*   Validación de formularios.
*   Simulación de autenticación mediante `AuthController`.

## 📂 Estructura de Directorios

```
src/
├── components/      # Componentes UI reutilizables
│   ├── auth/
│   ├── destination/
│   ├── home/
│   ├── layout/
│   └── map/
├── controllers/     # Lógica de negocio
├── models/          # Tipos de datos y mock data
├── routes/          # Configuración de rutas
├── views/           # Páginas principales
├── App.tsx          # Componente raíz
└── main.tsx         # Punto de entrada
```

## 🛠️ Instalación y Ejecución

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repo>
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar servidor de desarrollo:**
    ```bash
    npm run dev
    ```

4.  **Construir para producción:**
    ```bash
    npm run build
    ```

---
Desarrollado para el Proyecto Formativo EcoTurismo 🌿
