# 🛒 E-Commerce Enterprise Template - Architecture & Requirements

## 🎯 Objetivo del Proyecto
Crear una plantilla de tienda en línea altamente escalable, segura y modular (marca blanca). El diseño debe permitir cambiar fácilmente la capa de presentación (UI/CSS/Animaciones) manteniendo intacto un núcleo robusto de negocio y seguridad.

## 🛠 Stack Tecnológico
- **Gestor de Paquetes:** pnpm (Estrictamente obligatorio. Prohibido usar npm o yarn).
- **Frontend:** React + TypeScript + Vite + Zustand (Estado global) + CSS Modules (Estilos modulares y aislados) + GSAP (Animaciones).
- **Backend:** Node.js + Express + TypeScript.
- **Base de Datos:** PostgreSQL.
- **ORM:** Prisma (Tipado estricto, migraciones y transacciones seguras).
- **Pagos:** Stripe (con manejo de Webhooks).
- **Generación de Documentos:** pdfkit (Backend) o jspdf (Frontend) para PDFs de facturas, y csv-writer para exportar datos (AEAT).
- **Emails:** Integración con Resend o Nodemailer para notificaciones transaccionales y promociones.
- **Testing:** Jest + Supertest (Backend) y React Testing Library (Frontend).

## 🏗 Arquitectura Requerida (Clean Architecture & SOLID)
El backend DEBE dividirse por módulos de dominio. Prohibido el patrón MVC plano.
El código debe cumplir estrictamente los principios SOLID (especialmente Single Responsibility en los Casos de Uso y Dependency Inversion usando inyección de dependencias/interfaces).

Esta es la ESTRUCTURA DE DIRECTORIOS OBLIGATORIA que la IA debe respetar y construir:

/
├── backend/
│   ├── prisma/            # Schema de base de datos y migraciones
│   ├── src/
│   │   ├── config/        # Variables de entorno (.env) y configuración de DB
│   │   ├── modules/       # Lógica por dominio (Auth, Products, Orders, Invoices)
│   │   │   └── [modulo]/  # Cada módulo DEBE tener: domain/, application/, infrastructure/
│   │   ├── shared/        # Middlewares (Auth, RBAC), utilidades, constantes
│   │   └── main.ts        # Punto de entrada (Express)
│   └── tests/             # Pruebas unitarias y de integración (Jest/Supertest)
├── frontend/
│   ├── src/
│   │   ├── components/    # UI reusable y agnóstica (Botones, Modales, Inputs)
│   │   ├── features/      # Lógica por funcionalidad aislada
│   │   │   ├── admin/     # Rutas y vistas del Dashboard privado (RBAC)
│   │   │   └── shop/      # Rutas y vistas de la Tienda pública (Catálogo, Carrito)
│   │   ├── hooks/         # Custom hooks de React
│   │   ├── services/      # Llamadas a la API del backend (Axios/Fetch)
│   │   ├── store/         # Gestión de estado global (Zustand)
│   │   └── types/         # Interfaces y Tipos de TypeScript compartidos
├── docs/
│   ├── ARCHITECTURE.md    # Este documento (Fuente de la Verdad)
│   └── verifactu-openapi.json # Documentación oficial de la API AEAT
├── docker-compose.yml     # Para levantar PostgreSQL localmente
└── .gitignore             # Ignorar node_modules, .env, dist, etc.


## 🛡 Seguridad Estricta (OWASP Top 10)
1. **Autenticación:** OAuth 2.0 y JWT. Los tokens JWT **deben** almacenarse exclusivamente en `HttpOnly Cookies`. NUNCA en localStorage.
2. **Protección de API:** Uso obligatorio de `Helmet` (cabeceras), `CORS` estricto y `express-rate-limit` (prevención de fuerza bruta).
3. **Criptografía:** Hashear contraseñas con `bcrypt` o `argon2`.
4. **Validación:** Sanitización estricta usando `Zod` en las capas de aplicación.
5. **5. Control de Acceso (RBAC):** Implementar roles de usuario (ADMIN, CUSTOMER). Las rutas del backend /api/admin/* y las rutas del frontend /dashboard/* DEBEN estar protegidas por un middleware/guardia que verifique que el JWT contiene el rol ADMIN.

## ⚙️ Reglas Críticas de Negocio
- - **Gestión de Paquetes:** Todo comando de instalación o ejecución de scripts debe hacerse EXCLUSIVAMENTE con `pnpm` (ej. `pnpm add`, `pnpm run dev`).

- **Modelo User:** Debe incluir role (Enum: ADMIN, CUSTOMER), nif_cif (obligatorio para la facturación española) y detalles de dirección de facturación (Calle, CP, Ciudad, Provincia, País).

- **Modelo Product:** Debe implementar Soft Delete (isActive: Boolean en lugar de borrar el registro, para no romper el historial de facturas). Debe incluir stock (Int) y taxRate (Decimal, para guardar el porcentaje de IVA a aplicar: 21, 10, 4 o 0).

- **Modelo Order / Invoice:** La factura generada no puede borrarse (inmutabilidad). Debe referenciar los datos exactos del NIF y la dirección del cliente en el momento de la compra, por si el usuario cambia su perfil en el futuro.

- **Transacciones ACID:** Las compras deben agrupar la reducción de inventario y la creación de la orden en una única transacción (`$transaction` de Prisma). Rollback obligatorio si falla el webhook de Stripe.
- **Carrito Persistente:** Usuarios anónimos usan UUID en `localStorage`/`cookie`. Al hacer login, este carrito anónimo se fusiona con el carrito de la base de datos.
- **Facturación Inalterable (Veri*Factu):** Está estrictamente prohibido permitir la edición o borrado físico de una factura una vez emitida. Cualquier devolución o error tras el pago en Stripe requiere la generación automática de una factura rectificativa o el uso del endpoint de anulación (POST /api/anulacion-registro-facturacion)

- **Integración AEAT asíncrona:** La comunicación con Hacienda no es en tiempo real. Al confirmarse el webhook de Stripe, el sistema debe registrar la factura en la base de datos local y enviarla a la API de Verifactu (POST /create o equivalente)

- **Almacenamiento de Estado:** La base de datos (Prisma) debe incluir en la entidad Invoice los campos obligatorios devueltos por la API: uuid (para seguimiento), huella (hash criptográfico), url de validación AEAT, qr (en base64) y estado (Pendiente, Correcto, Aceptado con errores, etc.)

- **Representación Gráfica:** El frontend/generador de PDFs de la factura debe incluir obligatoriamente el Código QR devuelto por la API y la frase identificativa requerida por Hacienda

- **SEO/GEO (Generative Engine Optimization):** Frontend con JSON-LD (Structured Data) para productos. Lazy Loading obligatorio.
- **Google Maps Caché:** Las reseñas se consultan vía API mediante un Cron Job en el backend, se guardan en BD (solo >4 estrellas) y se sirven al frontend desde la BD para no agotar cuota.

---

## 🤖 INSTRUCCIONES ESTRICTAS PARA EL ORQUESTADOR SDD (OpenCode)

**Rol del Orquestador:** Eres el `sdd-orchestrator`. Debes leer este documento como la "Fuente de la Verdad" absoluta. NUNCA escribas todo el proyecto de golpe. NUNCA te saltes el proceso de verificación.

**Flujo de Trabajo Obligatorio (Ciclo SDD):**
Para cada Fase indicada abajo, el usuario te pedirá iniciarla. Por cada petición, DEBES seguir este flujo delegando en tus subagentes:
1. Usa `/sdd-explore` para analizar cómo encaja la tarea en el código actual.
2. Delega el diseño y las tareas (`sdd-spec`, `sdd-tasks`).
3. Delega la implementación a `sdd-apply`.
4. **CRÍTICO:** Ejecuta `/sdd-verify` obligatoriamente para crear y correr los tests unitarios (Jest/RTL) y asegurar que el código funciona.
5. Usa `/sdd-archive` para guardar el estado en `engram`.

### 📋 Fases de Desarrollo (Ejecutar SOLO una a una cuando el usuario lo pida):
- **Fase 1 (Setup & BD):** Setup inicial de Node/Vite usando pnpm. Configurar en el package.json un script "preinstall": "npx only-allow pnpm" para forzar su uso. Crear el Docker Compose (PostgreSQL), inicialización de Prisma y creación de Seeders de prueba.
- **Fase 2 (Auth & Seguridad):** Entidad Usuario, Login/Registro, JWT en HttpOnly Cookies, Middlewares (Helmet, Rate Limit).
- **Fase 3 (Catálogo):** Módulo de Productos (CRUD, Filtros, Búsqueda). Testing unitario de los filtros.
- **Fase 4 (Órdenes & Inventario):** Módulo de Órdenes y Transacciones Seguras (`$transaction`). Testing del control de stock.
- **Fase 5 (Pagos & Carrito):** Lógica del Carrito Persistente (fusión local/BD) e integración de Stripe (Checkout y Webhooks locales vía CLI).
- **Fase 5.5 (Facturación Legal AEAT - Veri-Factu):** Creación del modelo Invoice en Prisma (relacionado con Order), asegurando inmutabilidad. Implementación del servicio de facturación en Node.js que consuma la API REST de Veri*Factu. CRÍTICO: Para construir las peticiones HTTP (Headers con Bearer Token, payload de /create y /status), el subagente DEBE leer y basarse estrictamente en el archivo docs/verifactu-openapi.json. Almacenamiento del código QR (base64) y UUID devueltos por la API. Creación de un endpoint/webhook para consultar o actualizar el estado asíncrono de la factura ("Pendiente" a "Correcto"). Generación del PDF de la factura incluyendo el QR de la AEAT.
- **Fase 6 (Frontend UI):** Setup Zustand, CSS Modules, componentes base e integración de animaciones simples con GSAP.
- **Fase 7 (Frontend Avanzado):** SEO/GEO (JSON-LD), integración de la caché de Google Maps y pulido responsive.
- **Fase 8 (Panel de Administración / Dashboard):** Creación de rutas privadas protegidas por rol ADMIN.

- **Módulo de Gestión:** CRUD completo de productos (con carga de imágenes), promociones/descuentos y gestión de estados de pedidos.

- **Módulo de Analítica y Exportación:** Gráficos de ventas (filtrables por fecha) y endpoints para descargar facturas en PDF y listados en CSV (formato apto para declaración trimestral en España).

- **Módulo de Comunicaciones:** Envío de emails transaccionales (cambios de estado de pedido) y promocionales.