# GaranTech

Sistema de gestión de garantías para tiendas de tecnología, electrónica, electrodomésticos y videojuegos.

## Stack

- **Next.js 16** (App Router)
- **Tailwind CSS 4**
- **Supabase** (Auth + PostgreSQL)

## Configuración

### 1. Supabase (local — recomendado para desarrollo)

```bash
supabase start
```

Esto levanta Postgres, Auth y Studio en Docker y aplica las migraciones de `supabase/migrations/`.

Credenciales locales (ya configuradas en `.env.local` si usaste `supabase status -o env`):

| Servicio | URL |
|----------|-----|
| API | http://127.0.0.1:54321 |
| Studio | http://127.0.0.1:54323 |
| Mailpit (emails) | http://127.0.0.1:54324 |

Comandos útiles:

```bash
supabase stop          # detener contenedores
supabase db reset      # recrear DB y re-aplicar migraciones
supabase status        # ver URLs y keys
```

### 1b. Supabase (remoto)

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/migrations/001_initial_schema.sql`
3. En **Authentication → Providers**, habilita Email
4. Copia la URL y la anon key del proyecto

### 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` es solo para el servidor (Vercel); no uses el prefijo `NEXT_PUBLIC_`.

### 3. Ejecutar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/login` | Inicio de sesión |
| `/registro` | Registro de tienda (onboarding) |
| `/dashboard` | Panel con resumen y garantías recientes |
| `/clientes` | Gestión de clientes |
| `/productos` | Catálogo de productos |
| `/garantias` | Listado y registro de garantías |
| `/buscar` | Búsqueda global |

## Multitenancy

Cada tienda tiene su propia cuenta vía Supabase Auth. Row Level Security (RLS) aísla los datos por `store_id`.

## Precio

Plan anual: **$799.000 COP**
