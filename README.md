# 💈 Barber Manager

Sistema integral de gestión para barberías y salones de belleza.

## Características

✨ **Gestión de Citas**: Agenda profesional con horarios y clientes  
💰 **Facturación**: Sistema de facturas con detalles de productos y servicios  
📦 **Inventario**: Control de stock con alertas de compra sugeridas  
🔐 **Punto de Venta**: Escaneo de códigos de barras, checkout rápido  
📊 **Reportes**: Análisis de ganancias diarias y tendencias semanales  
📱 **Responsive**: Funciona en desktop, tablet y móvil  

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Producción

```bash
npm run build
npm start
```

## Importar Catálogo

Para importar productos desde un PDF:

```bash
npm run import:catalog -- "ruta/a/tu/catalogo.pdf"
```

## Estructura

- `src/app/` - Páginas y rutas de API
- `src/app/pro/` - Panel profesional (citas, caja, inventario, reportes)
- `src/data/` - Almacenamiento JSON
- `scripts/` - Utilidades (importador de catálogo)
- `prisma/` - Configuración de base de datos

## Variables de Entorno

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Despliegue

Compatible con Vercel, Netlify o cualquier host que soporte Next.js.
