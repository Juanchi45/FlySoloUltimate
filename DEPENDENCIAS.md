# 📦 DEPENDENCIAS — FlySolo
**Proyecto:** Plataforma de Transporte Espacial Multi-Facción  
**Versión doc:** 1.0  
**Stack:** Node.js · TypeScript · Express · MikroORM · SQLite · React · Vite  
**Gestor de paquetes:** pnpm (workspaces monorepo)

---

## 🗂️ Estructura del monorepo

```
flysolo/
├── pnpm-workspace.yaml   ← define los paquetes del workspace
├── package.json          ← raíz: solo scripts globales
├── backend/              ← API REST (Node.js + Express)
└── frontend/             ← SPA (React + Vite)
```

---

## 🌐 Globales (instaladas una sola vez en el sistema)

| Paquete | Versión | Comando de instalación | Descripción |
|---------|---------|------------------------|-------------|
| `pnpm` | latest | `npm install -g pnpm` | Gestor de paquetes alternativo a npm. Más rápido y eficiente en disco gracias a un store compartido de dependencias. Soporta workspaces nativos para monorepos. |

---

## 🖥️ Backend — `/backend`

### Dependencias de producción

| Paquete | Descripción |
|---------|-------------|
| `express` | Framework minimalista para crear el servidor HTTP y la API REST. Maneja rutas, middlewares y el ciclo request/response. |
| `@mikro-orm/core` | Núcleo del ORM. Provee el sistema de entidades, decoradores, `EntityManager`, repositorios y el ciclo de vida de los objetos de dominio. |
| `@mikro-orm/sqlite` | Driver oficial de MikroORM para SQLite. Incluye el adaptador de base de datos y la función `defineConfig` tipada para la configuración. |
| `@mikro-orm/migrations` | Módulo de migraciones de MikroORM. Permite generar, aplicar y revertir cambios en el esquema de la base de datos de forma controlada. |
| `bcryptjs` | Librería para hashear contraseñas usando el algoritmo bcrypt. Se usa en registro y login para nunca almacenar contraseñas en texto plano. |
| `jsonwebtoken` | Implementación de JWT (JSON Web Token). Se usa para generar y verificar tokens de autenticación stateless entre frontend y backend. |
| `crypto` *(built-in)* | Módulo nativo de Node.js. Se usa `randomUUID()` para generar UUIDs v4 como primary key en todas las entidades. No requiere instalación. |
| `dotenv` | Carga variables de entorno desde un archivo `.env` al objeto `process.env`. Permite separar configuración sensible del código fuente. |
| `cors` | Middleware de Express que habilita CORS (Cross-Origin Resource Sharing), permitiendo que el frontend en `localhost:5173` consuma la API en `localhost:3000`. |
| `helmet` | Middleware de seguridad que configura headers HTTP protectores (CSP, XSS protection, etc.) en todas las respuestas del servidor. |

### Dependencias de desarrollo

| Paquete | Descripción |
|---------|-------------|
| `typescript` | Superset tipado de JavaScript. Permite definir tipos, interfaces y usar decoradores, necesarios para las entidades de MikroORM. |
| `ts-node-dev` | Ejecuta TypeScript directamente en Node.js durante el desarrollo, con recarga automática al detectar cambios en los archivos (equivalente a nodemon para TS). |
| `@types/express` | Definiciones de tipos TypeScript para Express. Necesario para tipar `Request`, `Response`, `NextFunction`, etc. |
| `@types/bcryptjs` | Definiciones de tipos TypeScript para bcryptjs. |
| `@types/jsonwebtoken` | Definiciones de tipos TypeScript para jsonwebtoken. |
| `@types/cors` | Definiciones de tipos TypeScript para el middleware cors. |

### `tsconfig.json` — opciones clave del backend

| Opción | Valor | Por qué es necesaria |
|--------|-------|----------------------|
| `experimentalDecorators` | `true` | Habilita los decoradores de TypeScript (`@Entity`, `@Property`, etc.) requeridos por MikroORM. |
| `emitDecoratorMetadata` | `true` | Emite metadata de tipos en tiempo de ejecución. MikroORM la usa para inferir los tipos de las propiedades de las entidades. |
| `target` | `ES2020` | Nivel de JavaScript de salida. ES2020 soporta todas las features modernas que usamos. |
| `module` | `commonjs` | Sistema de módulos de Node.js. Necesario para compatibilidad con el ecosistema de paquetes del backend. |
| `strict` | `true` | Activa todas las comprobaciones estrictas de TypeScript. Previene errores en tiempo de ejecución. |

---

## 🎨 Frontend — `/frontend`

### Scaffolding

| Comando | Descripción |
|---------|-------------|
| `pnpm create vite frontend --template react-ts` | Genera la estructura base del proyecto con React 18 + TypeScript + Vite preconfigurados. Incluye `tsconfig.json`, `vite.config.ts` y `index.html`. |

### Dependencias de producción

| Paquete | Descripción |
|---------|-------------|
| `react` | Librería principal para construir interfaces de usuario mediante componentes declarativos y el Virtual DOM. |
| `react-dom` | Paquete que conecta React con el DOM del navegador. Punto de entrada de la SPA (`ReactDOM.createRoot`). |
| `react-router-dom` | Sistema de enrutamiento del lado del cliente para React. Permite la navegación entre páginas sin recargar el browser (SPA routing). Provee `BrowserRouter`, `Routes`, `Route`, `Navigate`, `useNavigate`. |
| `axios` | Cliente HTTP basado en Promises para hacer requests al backend. Se prefiere sobre `fetch` nativo por su soporte de interceptores (manejo global de errores y tokens JWT). |

### Dependencias de desarrollo

| Paquete | Descripción |
|---------|-------------|
| `vite` | Bundler y servidor de desarrollo ultrarrápido. Usa ES Modules nativos en desarrollo (sin bundling) y Rollup para producción. |
| `@vitejs/plugin-react` | Plugin oficial de Vite para React. Habilita Fast Refresh (HMR) y transforma JSX/TSX. |
| `typescript` | Tipado estático para el frontend. Mismo lenguaje que el backend, lo que permite compartir tipos en el futuro. |
| `tailwindcss` | Framework de CSS utilitario. Permite construir la UI escribiendo clases directamente en el JSX sin salir del componente. |
| `@types/node` | Tipos de Node.js para el frontend. Necesario para que TypeScript entienda variables de entorno con `import.meta.env` en Vite. |

---

## 📜 Scripts disponibles

### Raíz (desde `/`)

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `pnpm dev` | Levanta backend y frontend en paralelo usando `concurrently`. |
| `backend` | `pnpm backend` | Levanta solo el backend. |
| `frontend` | `pnpm frontend` | Levanta solo el frontend. |

### Backend (desde `/backend`)

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `pnpm dev` | Inicia el servidor con `ts-node-dev` y hot reload. |
| `build` | `pnpm build` | Compila TypeScript a JavaScript en `/dist`. |
| `start` | `pnpm start` | Ejecuta el build compilado (producción). |

### Frontend (desde `/frontend`)

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `pnpm dev` | Inicia el servidor de desarrollo Vite en `localhost:5173`. |
| `build` | `pnpm build` | Genera el bundle optimizado de producción en `/dist`. |
| `preview` | `pnpm preview` | Sirve el build de producción localmente para verificarlo. |

---

## 🔧 Variables de entorno

### `backend/.env`

```env
PORT=3000
JWT_SECRET=flysolo_super_secret_cambiar_en_produccion
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api
```

> ⚠️ Ningún archivo `.env` debe commitearse al repositorio. Verificar que `.gitignore` los incluya.

---

## 📋 Historial de versiones

| Fecha | Autor | Versión | Descripción |
|-------|-------|---------|-------------|
| 02/05/2026 | Equipo FlySolo | 1.0 | Documentación inicial de dependencias del monorepo. |
| 02/05/2026 | Equipo FlySolo | 1.1 | Se reemplaza paquete `uuid` por `crypto.randomUUID()` nativo de Node.js. |

