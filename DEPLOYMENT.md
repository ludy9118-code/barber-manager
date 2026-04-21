# 📤 Guía de Deploy en Netlify

## El Problema
Netlify no actualiza porque:
1. ❌ No hay conexión a un repositorio Git
2. ❌ Falta la configuración de build (`netlify.toml`)

## Solución: 3 Pasos

### Paso 1: Crear repositorio en GitHub (o GitLab/Bitbucket)

1. Ve a https://github.com/new
2. Llena los datos:
   - **Repository name:** `barber-manager`
   - **Description:** "Sistema de gestión para barberías"
   - **Public o Private:** Tu preferencia
   - Haz clic en **Create repository**

### Paso 2: Conectar tu carpeta local a GitHub

Ejecuta en PowerShell desde la carpeta del proyecto:

```powershell
cd "c:\Users\pc\OneDrive\Documentos\barberia"

# Reemplaza con TU URL de GitHub
git remote add origin https://github.com/TU_USUARIO/barber-manager.git

# Subir cambios
git branch -M main
git push -u origin main
```

### Paso 3: Conectar Netlify a GitHub

1. Ve a https://netlify.com
2. Haz clic en **Add new site** → **Import an existing project**
3. Selecciona **GitHub**
4. Autoriza Netlify en GitHub
5. Selecciona el repositorio `barber-manager`
6. **Build settings** (debería detectar automáticamente):
   - Build command: `npm run build`
   - Publish directory: `.next` ← **IMPORTANTE**
7. Haz clic en **Deploy site**

## ¡Listo! Ahora:

✅ Cada vez que hagas `git push`, Netlify hará deploy automáticamente  
✅ Los cambios se verán en el sitio en 1-2 minutos  
✅ Tendrás un URL tipo `tu-proyecto.netlify.app`

## Flujo de trabajo normal:

```powershell
# Hacer cambios locales
# Luego en PowerShell:
git add .
git commit -m "Descripción del cambio"
git push
# ¡Netlify hace deploy automáticamente!
```

## Troubleshooting

**Si sigue sin actualizar:**
- Verifica que el `git push` funcionó (sin errores)
- En Netlify, ve a **Deploys** y mira los logs
- Busca errores en el build (usualmente Node/npm issues)

**Si el sitio muestra error 404:**
- En Netlify ve a **Site settings** → **Build & deploy**
- Asegúrate que **Publish directory** es `.next`

**Si no se ve el sitio:**
- Espera 2-3 minutos
- Recarga con Ctrl+Shift+R (cache hard refresh)
