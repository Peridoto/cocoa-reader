# Tutorial de Deploy Automático - GitHub → Vercel

## 🚀 Cómo Funciona el Deploy Automático

Este documento explica paso a paso cómo se despliega automáticamente Cocoa Reader en Vercel cada vez que haces push a GitHub.

---

## 📋 Conceptos Clave

### **¿Qué es Vercel?**
- Plataforma de hosting especializada en aplicaciones Next.js
- Deploy automático desde Git (GitHub, GitLab, Bitbucket)
- CDN global automático
- HTTPS gratuito con certificado SSL
- Serverless functions para APIs
- Preview deployments por cada Pull Request

### **¿Qué es CI/CD?**
- **CI** (Continuous Integration): Integrar cambios frecuentemente
- **CD** (Continuous Deployment): Desplegar automáticamente
- En este proyecto: Cada `git push` → Deploy automático

---

## 🔧 Configuración Inicial (Solo una vez)

### **Paso 1: Conectar GitHub con Vercel**

1. **Ir a Vercel**: https://vercel.com
2. **Sign up con GitHub**: Click en "Continue with GitHub"
3. **Autorizar Vercel**: GitHub pedirá permisos para acceder a tus repos
4. **Seleccionar repositorio**: 
   - Click en "Import Project"
   - Buscar `cocoa-reader`
   - Click en "Import"

---

### **Paso 2: Configuración del Proyecto en Vercel**

**Framework Preset:**
```
Framework: Next.js
Build Command: npm run build (detectado automáticamente)
Output Directory: .next (detectado automáticamente)
Install Command: npm install
```

**Root Directory:**
```
./ (raíz del proyecto)
```

**Node.js Version:**
```
18.x (o la que uses localmente)
```

---

### **Paso 3: Variables de Entorno**

En **Vercel Dashboard** → **Settings** → **Environment Variables**:

```bash
# Base de datos (ejemplo con Neon PostgreSQL)
DATABASE_URL=postgresql://usuario:password@host.neon.tech/cocoa_reader?sslmode=require

# O SQLite para desarrollo (no recomendado en producción)
DATABASE_URL=file:./data/readlater.db
```

**Importante:**
- Las variables se configuran en Vercel Dashboard, NO en el código
- Nunca commitear `.env` al repositorio (está en `.gitignore`)
- Puedes tener diferentes valores por entorno (Production, Preview, Development)

---

### **Paso 4: Deploy Inicial**

Click en **"Deploy"** en Vercel Dashboard.

**Proceso que ejecuta Vercel:**
```bash
1. Clona tu repositorio desde GitHub
2. Detecta que es un proyecto Next.js
3. Instala dependencias: npm install
4. Genera Prisma Client: npx prisma generate (gracias a postinstall)
5. Compila el proyecto: npm run build
6. Despliega a CDN global
7. Asigna URL: https://cocoa-reader-xxx.vercel.app
```

**⏱️ Tiempo:** 2-3 minutos

---

## 🔄 Deploy Automático en Cada Push

### **Flujo Completo:**

```mermaid
graph LR
    A[Editas código local] --> B[git add .]
    B --> C[git commit -m 'mensaje']
    C --> D[git push origin main]
    D --> E[GitHub recibe push]
    E --> F[Webhook a Vercel]
    F --> G[Vercel clona repo]
    G --> H[npm install]
    H --> I[prisma generate]
    I --> J[npm run build]
    J --> K[Deploy a producción]
    K --> L[URL actualizada]
```

---

### **Paso a Paso del Deploy Automático:**

#### **1. Haces cambios en tu código local**
```bash
# Ejemplo: Modificas un componente
vim src/components/ArticleList.tsx
```

#### **2. Commiteas los cambios**
```bash
git add .
git commit -m "feat: mejorar diseño de ArticleList"
```

#### **3. Push a GitHub**
```bash
git push origin main
```

#### **4. GitHub notifica a Vercel (Webhook)**
- GitHub envía automáticamente una notificación HTTP a Vercel
- Esta integración se configuró cuando conectaste el repo

#### **5. Vercel inicia el build**
En Vercel Dashboard verás:
```
⏳ Building...
📦 Cloning repository from GitHub
📥 Installing dependencies (npm install)
🔨 Building project (npm run build)
```

#### **6. Vercel ejecuta el build**
```bash
# Lo que Vercel ejecuta en sus servidores:
npm install
npx prisma generate  # Desde postinstall en package.json
npm run build        # next build
```

#### **7. Vercel despliega**
```
✅ Build completed in 2m 34s
🌐 Deploying to production
🎉 Deployment ready at https://cocoa-reader.vercel.app
```

#### **8. La URL se actualiza automáticamente**
- Tu aplicación ya está live con los nuevos cambios
- El deploy anterior se mantiene como histórico (puedes hacer rollback)

---

## 📊 Logs del Build

### **Ver logs en tiempo real:**

1. Ve a **Vercel Dashboard**
2. Click en tu proyecto **"cocoa-reader"**
3. Pestaña **"Deployments"**
4. Click en el deployment más reciente
5. Verás logs completos:

```bash
[14:23:45.123] Cloning github.com/Peridoto/cocoa-reader (Branch: main, Commit: abc1234)
[14:23:47.456] Running "install" command: `npm install`...
[14:24:12.789] Running "build" command: `npm run build`...
[14:24:15.012] > prisma generate
[14:24:18.345] Prisma schema loaded from prisma/schema.prisma
[14:24:20.678] ✓ Generated Prisma Client
[14:24:25.901] > next build
[14:24:28.234] Compiled successfully
[14:24:30.567] Collecting page data...
[14:24:35.890] Generating static pages (0/5)...
[14:24:40.123] ✓ Generating static pages (5/5)
[14:24:42.456] Build completed in 2m 34s
[14:24:45.789] Deploying...
[14:24:50.012] ✅ Deployment ready
```

---

## 🔍 Archivos Importantes para Deploy

### **1. `package.json` - Scripts de build**
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && next build"
  }
}
```

**Explicación:**
- `postinstall`: Se ejecuta automáticamente después de `npm install`
- `build`: Script principal de compilación
- `vercel-build`: Script específico que Vercel busca (opcional)

---

### **2. `prisma/schema.prisma` - Configuración de BD**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // O "sqlite"
  url      = env("DATABASE_URL")
}
```

**Importante:**
- `env("DATABASE_URL")` lee de las variables de entorno de Vercel
- El cliente se genera en cada build con `prisma generate`

---

### **3. `next.config.js` - Configuración de Next.js**
```javascript
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@mozilla/readability', 'jsdom']
  },
  // Configuración para que funcione en Vercel
}
```

---

### **4. `.gitignore` - Archivos que NO se suben**
```
node_modules/
.next/
.env
.env.local
*.db
*.db-journal
```

**Importante:**
- `.env` NO debe estar en GitHub (secretos)
- Las variables se configuran en Vercel Dashboard

---

### **5. `vercel.json` (Opcional) - Configuración avanzada**
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url"
  }
}
```

---

## 🌐 Preview Deployments (Ramas y PRs)

### **Deploy automático por rama:**

**Ejemplo con rama `feature/new-ui`:**
```bash
git checkout -b feature/new-ui
# ... hacer cambios ...
git push origin feature/new-ui
```

**Vercel crea automáticamente:**
```
Preview URL: https://cocoa-reader-git-feature-new-ui-peridoto.vercel.app
```

**Ventajas:**
- ✅ Cada rama tiene su propia URL de preview
- ✅ Puedes probar antes de hacer merge a `main`
- ✅ Los clientes/revisores pueden ver cambios sin afectar producción
- ✅ Se borra automáticamente cuando borras la rama

---

### **Pull Request Previews:**

1. Creas PR en GitHub: `feature/new-ui` → `main`
2. Vercel comenta automáticamente en el PR con URL de preview
3. Puedes revisar cambios en vivo antes de aprobar
4. Al hacer merge → Deploy automático a producción

---

## 🔄 Rollback (Volver a Versión Anterior)

### **Si algo sale mal después de un deploy:**

1. Ve a **Vercel Dashboard** → **Deployments**
2. Encuentra el deployment anterior que funcionaba
3. Click en **"⋮"** (menú)
4. Click en **"Promote to Production"**
5. En 30 segundos, la app vuelve a la versión anterior

**Alternativa con Git:**
```bash
git revert HEAD
git push origin main
# Vercel desplegará automáticamente el revert
```

---

## 📱 Dominios Personalizados

### **Añadir dominio propio:**

1. **Vercel Dashboard** → **Settings** → **Domains**
2. Añadir dominio: `cocoa-reader.com`
3. Configurar DNS en tu proveedor:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. Vercel genera certificado SSL automáticamente
5. En 5-10 minutos: `https://cocoa-reader.com` funciona

---

## 🐛 Problemas Comunes y Soluciones

### **❌ Error: "Build failed - Command 'npm run build' exited with 1"**

**Ver logs detallados:**
- Vercel Dashboard → Deployment fallido → Ver logs completos

**Posibles causas:**
1. Error de TypeScript → Arreglar en local y probar `npm run build`
2. Error de Prisma → Verificar `DATABASE_URL` en Vercel
3. Dependencias faltantes → Verificar `package.json`

**Solución:**
```bash
# En local, probar el build antes de push:
npm run build

# Si falla, arreglar errores
# Si pasa, hacer push
git push origin main
```

---

### **❌ Error: "DATABASE_URL is not defined"**

**Causa:** Variable de entorno no configurada en Vercel

**Solución:**
1. Vercel Dashboard → Settings → Environment Variables
2. Añadir `DATABASE_URL` con valor correcto
3. **Importante:** Marcar para "Production", "Preview" y "Development"
4. Redeploy: Deployments → Latest → Redeploy

---

### **❌ Error: "Prisma Client could not be generated"**

**Causa:** `prisma generate` no se ejecutó correctamente

**Solución:**
Verificar en `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

---

### **❌ La app funciona en local pero no en Vercel**

**Posibles causas:**
1. Variables de entorno diferentes
2. Rutas con mayúsculas/minúsculas (Vercel es case-sensitive)
3. Imports dinámicos sin `ssr: false`
4. Dependencias en `devDependencies` en lugar de `dependencies`

**Debug:**
1. Revisar logs completos en Vercel
2. Probar `npm run build` en local
3. Verificar que `.env` local y Vercel tengan mismas variables
4. Probar en modo producción local:
   ```bash
   npm run build
   npm run start
   ```

---

## 📈 Monitorización y Analytics

### **Ver métricas en Vercel:**

1. **Deployments**: Historial completo de todos los deploys
2. **Analytics**: Visitas, países, dispositivos (plan Pro)
3. **Logs**: Runtime logs de tus API routes
4. **Speed Insights**: Core Web Vitals en tiempo real

---

### **Configurar notificaciones:**

**Vercel Dashboard** → **Settings** → **Notifications**:
- ✅ Email cuando deploy falla
- ✅ Slack/Discord webhook
- ✅ GitHub status checks en PRs

---

## 🎯 Demo para el Tribunal

### **Script de demostración (3 minutos):**

**1. Mostrar GitHub repo (30 seg):**
```
"Este es el repositorio en GitHub. Como ven, el código está versionado 
con Git, y tengo el historial completo de commits."
```

**2. Hacer cambio en vivo (1 min):**
```bash
# Cambiar algo visual, ej: título de la página
vim src/app/page.tsx

# Commitear
git add .
git commit -m "demo: cambiar título para demostración"
git push origin main
```

**3. Mostrar Vercel Dashboard (1 min):**
```
"Ahora vamos a Vercel. Como ven, automáticamente detectó el push a GitHub
y está compilando la aplicación. Esto tarda unos 2 minutos."

[Abrir pestaña Deployments]
[Mostrar logs en tiempo real]

"Aquí vemos que está instalando dependencias, generando Prisma Client,
compilando Next.js, y desplegando a su CDN global."
```

**4. Verificar cambio en producción (30 seg):**
```
"Y ahora, si recargamos la URL de producción... el cambio ya está visible.
Todo esto sin intervención manual, completamente automático."
```

---

## ✅ Ventajas del Deploy Automático

### **Para el desarrollo:**
- ✅ **Rápido**: De commit a producción en 2-3 minutos
- ✅ **Seguro**: Cada deploy es independiente, rollback fácil
- ✅ **Trazable**: Historial completo de todos los deploys
- ✅ **Preview**: Probar cambios antes de mergear

### **Para el proyecto:**
- ✅ **Profesional**: CI/CD es estándar en la industria
- ✅ **Escalable**: Vercel escala automáticamente con tráfico
- ✅ **Global**: CDN en múltiples regiones
- ✅ **Gratis**: Plan gratuito suficiente para proyectos personales

---

## 📚 Comparación con Deploy Manual

### **Deploy Manual (anticuado):**
```bash
1. Conectar por SSH al servidor
2. git pull origin main
3. npm install
4. npm run build
5. pm2 restart app
6. Verificar que funciona
7. Si falla, git revert y repetir
```
⏱️ **Tiempo:** 15-30 minutos

### **Deploy Automático con Vercel:**
```bash
git push origin main
```
⏱️ **Tiempo:** 2-3 minutos (sin intervención)

---

## 🎓 Explicación Técnica para el Tribunal

### **"¿Cómo funciona técnicamente?"**

**Respuesta completa:**

"Vercel usa **webhooks de GitHub**. Cuando configuras la integración, GitHub registra un webhook en tu repositorio. Cada vez que hago `git push`, GitHub envía una petición HTTP POST al endpoint de Vercel con información del commit.

Vercel recibe esa notificación, clona el repositorio en una máquina virtual aislada, ejecuta los comandos de build (`npm install`, `prisma generate`, `next build`), y si todo pasa sin errores, despliega los archivos estáticos y serverless functions a su CDN global distribuido en múltiples regiones.

El proceso completo está automatizado con **CI/CD** (Continuous Integration/Continuous Deployment), que es el estándar en desarrollo moderno. Cada deploy es inmutable y versionado, lo que permite rollback instantáneo si algo falla.

Además, Vercel optimiza automáticamente:
- **Code splitting**: Divide el JavaScript por rutas
- **Image optimization**: Optimiza imágenes on-demand
- **Edge caching**: Cachea contenido cerca del usuario
- **Serverless functions**: Escala automáticamente las APIs"

---

### **"¿Por qué elegiste Vercel en lugar de Heroku/AWS/etc?"**

**Respuesta:**

"Elegí Vercel porque:

1. **Integración nativa con Next.js**: Vercel es la empresa que creó Next.js, por lo que la integración es perfecta y sin configuración.

2. **Deploy automático desde GitHub**: Sin configurar CI/CD manualmente (GitHub Actions, etc.).

3. **Plan gratuito generoso**: 100GB bandwidth/mes, HTTPS gratis, dominio gratis.

4. **Edge Network global**: CDN en 70+ ciudades, latencia ultra baja.

5. **Developer Experience**: Preview deployments, rollback fácil, logs en tiempo real.

Comparado con alternativas:
- **Heroku**: Más caro, dyno gratis duerme después de 30min
- **AWS**: Requiere configuración compleja (EC2, S3, CloudFront, etc.)
- **Netlify**: Similar a Vercel, pero menos optimizado para Next.js
- **Railway/Render**: Buenas opciones, pero menos maduras"

---

## 🔗 URLs Útiles

- **Dashboard de Vercel**: https://vercel.com/dashboard
- **Documentación oficial**: https://vercel.com/docs
- **Integración con GitHub**: https://vercel.com/docs/git/vercel-for-github
- **Variables de entorno**: https://vercel.com/docs/environment-variables
- **Troubleshooting**: https://vercel.com/docs/troubleshooting

---

## ✅ Checklist de Deploy

**Antes de la presentación, verificar:**

- [ ] Proyecto conectado a Vercel desde GitHub
- [ ] Variables de entorno configuradas (`DATABASE_URL`)
- [ ] Último deploy exitoso (verde en Vercel Dashboard)
- [ ] URL de producción funciona: https://cocoa-reader.vercel.app
- [ ] Tener repo de GitHub abierto en navegador
- [ ] Tener Vercel Dashboard abierto en otra pestaña
- [ ] Poder hacer un cambio en vivo y mostrar deploy automático

---

## 🎯 Conclusión

El deploy automático con **GitHub + Vercel** es:
- ✅ **Simple**: Un solo `git push`
- ✅ **Rápido**: 2-3 minutos
- ✅ **Profesional**: CI/CD estándar de la industria
- ✅ **Seguro**: Rollback fácil, deploys inmutables
- ✅ **Gratuito**: Plan free suficiente para proyectos académicos

Este flujo demuestra conocimiento de **DevOps moderno** y **mejores prácticas** de desarrollo web profesional.

**¡Listo para impresionar al tribunal! 🚀**
