# Tutorial de Instalación y Demostración - Cocoa Reader

## 📋 Guía Completa para la Presentación del Tribunal

Este documento contiene las instrucciones paso a paso para instalar y ejecutar Cocoa Reader durante la defensa del proyecto.

---

## ⚙️ Requisitos Previos

### **Software necesario:**
- **Node.js** versión 18 o superior
- **npm** o **pnpm** (gestor de paquetes)
- **Git** (para clonar el repositorio)
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)

### **Verificar instalación:**
```bash
node --version    # Debe mostrar v18.x.x o superior
npm --version     # Debe mostrar 9.x.x o superior
git --version     # Cualquier versión reciente
```

---

## 📥 Paso 1: Clonar o Descomprimir el Proyecto

### **Opción A: Desde GitHub**
```bash
git clone https://github.com/Peridoto/cocoa-reader.git
cd cocoa-reader
```

### **Opción B: Desde carpeta entregable**
```bash
# Si tienes el ZIP del entregable
unzip cocoa-reader-entregable.zip
cd cocoa-reader
```

---

## 🔧 Paso 2: Instalar Dependencias

```bash
npm install
# O si usas pnpm:
pnpm install
```

**⏱️ Tiempo estimado:** 1-2 minutos

**Qué hace este comando:**
- Descarga todas las librerías necesarias (Next.js, React, Prisma, etc.)
- Instala dependencias de desarrollo (TypeScript, Tailwind CSS)
- Ejecuta automáticamente `prisma generate` (configurado en `postinstall`)

---

## 🗄️ Paso 3: Configurar la Base de Datos

### **Opción 1: SQLite (Local - Recomendado para demo)**

1. Crear archivo `.env` en la raíz del proyecto:
```bash
touch .env
```

2. Añadir la siguiente línea al `.env`:
```bash
DATABASE_URL="file:./data/readlater.db"
```

3. Crear el directorio para la base de datos:
```bash
mkdir -p data
```

4. Aplicar el schema a la base de datos:
```bash
npm run db:push
```

**✅ Listo!** La base de datos SQLite está creada en `data/readlater.db`

---

### **Opción 2: PostgreSQL (Producción/Vercel)**

Si quieres mostrar la versión con base de datos en la nube:

1. Crear archivo `.env`:
```bash
DATABASE_URL="postgresql://usuario:password@host:5432/database?sslmode=require"
```

2. Aplicar migraciones:
```bash
npm run db:push
```

---

## 🚀 Paso 4: Ejecutar el Proyecto

### **Modo Desarrollo (Recomendado para demo):**
```bash
npm run dev
```

**La aplicación estará disponible en:**
```
http://localhost:3000
```

**✅ Abre el navegador y accede a esa URL**

---

### **Modo Producción (Opcional):**
```bash
# 1. Compilar
npm run build

# 2. Iniciar servidor
npm run start
```

---

## 🎯 Paso 5: Demostración de Funcionalidades

### **1. Añadir un Artículo (2 minutos)**

**En el navegador:**
1. Pega una URL de ejemplo: `https://developer.mozilla.org/en-US/docs/Web/JavaScript`
2. Click en "Add Article" o presiona Enter
3. Espera 5-10 segundos mientras scrapea el contenido

**Qué mostrar:**
- ✅ El scraping funciona usando proxies CORS
- ✅ Se extrae el título, contenido y dominio
- ✅ El artículo aparece en la lista principal

---

### **2. Leer un Artículo (1 minuto)**

**Click en cualquier artículo de la lista:**
1. Se abre la vista de lectura limpia
2. Muestra el indicador de progreso circular
3. Scroll hacia abajo → el progreso aumenta
4. Al llegar al 100% → se marca como "leído" automáticamente

**Qué mostrar:**
- ✅ Vista de lectura limpia (sin distracciones)
- ✅ Tracking de progreso en tiempo real
- ✅ Auto-marcado como leído

---

### **3. Procesamiento de IA (30 segundos)**

**En la vista de lectura:**
1. Click en el botón "Process with AI" (icono de cerebro)
2. Espera 1-2 segundos
3. Se muestra el resumen generado

**Qué mostrar:**
- ✅ Resumen extractivo (3-5 oraciones clave)
- ✅ Puntos clave extraídos
- ✅ Análisis de sentimiento (positivo/negativo/neutral)
- ✅ Procesamiento instantáneo (técnicas ligeras, no modelos pesados)

---

### **4. Búsqueda y Filtros (1 minuto)**

**En la página principal:**
1. Escribe en el buscador: "javascript"
2. Los artículos se filtran en tiempo real (debounced)
3. Usa los filtros: "All" / "Read" / "Unread" / "Favorites"

**Qué mostrar:**
- ✅ Búsqueda rápida con debounce (300ms)
- ✅ Filtros funcionan combinados con búsqueda
- ✅ Búsqueda en título, contenido, dominio y resumen

---

### **5. Favoritos (30 segundos)**

**Click en la estrella de cualquier artículo:**
- Se marca/desmarca como favorito
- El estado se guarda instantáneamente en IndexedDB
- Filtrar por "Favorites" para ver solo favoritos

**Qué mostrar:**
- ✅ Persistencia inmediata
- ✅ Feedback visual instantáneo

---

### **6. Modo Oscuro (15 segundos)**

**Click en el botón de tema (sol/luna):**
- Alterna entre modo claro y oscuro
- Se guarda en localStorage
- Sin "flash" al recargar

**Qué mostrar:**
- ✅ Transición suave
- ✅ Todos los componentes adaptan colores
- ✅ Persistencia entre sesiones

---

### **7. Funcionalidad Offline (2 minutos)**

**Simulación de offline:**
1. Abre DevTools (F12)
2. Ve a **Application** → **Service Workers**
3. Marca "Offline"
4. Recarga la página (Ctrl+R / Cmd+R)

**Qué mostrar:**
- ✅ La aplicación sigue funcionando
- ✅ Los artículos guardados son accesibles
- ✅ Puedes leer, marcar favoritos, cambiar tema
- ✅ Service Worker cachea assets estáticos

**Añadir artículo offline:**
1. Con "Offline" activado, intenta añadir URL
2. Se creará artículo fallback con enlace
3. Desactiva "Offline"
4. Puedes intentar scrapear de nuevo

---

### **8. PWA - Instalación (1 minuto)**

**En navegadores compatibles (Chrome, Edge):**
1. Click en el icono de instalación en la barra de direcciones
2. O menú → "Instalar Cocoa Reader"
3. La app se instala como aplicación nativa

**Qué mostrar:**
- ✅ Icono en el escritorio/dock
- ✅ Se abre en ventana independiente
- ✅ Funciona como app nativa
- ✅ Icono personalizado (512x512)

---

### **9. Export/Import de Datos (1 minuto)**

**Exportar artículos:**
1. Click en "Settings" (icono de engranaje)
2. Click en "Export Data"
3. Se descarga archivo JSON con todos los artículos

**Importar artículos:**
1. Click en "Import Data"
2. Selecciona el archivo JSON exportado
3. Los artículos se importan a IndexedDB

**Qué mostrar:**
- ✅ Backup local de datos
- ✅ Portabilidad entre dispositivos
- ✅ Formato JSON legible

---

### **10. Estadísticas (30 segundos)**

**En Settings:**
- Total de artículos guardados
- Artículos leídos vs no leídos
- Tiempo total de lectura estimado
- Progreso visual con gráficos

---

## 🛠️ Comandos Útiles Durante la Demo

### **Ver base de datos (Prisma Studio):**
```bash
npx prisma studio
```
- Abre interfaz visual en `http://localhost:5555`
- Muestra todos los artículos en la BD
- Útil para debugging en vivo

---

### **Ver logs del servidor:**
El terminal donde ejecutaste `npm run dev` muestra:
- Peticiones HTTP
- Errores de scraping
- Logs de console.log del código

---

### **Limpiar caché del Service Worker:**
Si algo no funciona con el SW:
1. DevTools → Application → Service Workers
2. Click en "Unregister"
3. Recarga la página

---

## 🐛 Solución de Problemas Comunes

### **❌ Error: "Cannot find module '@prisma/client'"**
**Solución:**
```bash
npx prisma generate
```

---

### **❌ Error: "DATABASE_URL is not defined"**
**Solución:**
```bash
# Verificar que existe .env en la raíz
cat .env

# Si no existe, crearlo:
echo 'DATABASE_URL="file:./data/readlater.db"' > .env
```

---

### **❌ Error: "Port 3000 is already in use"**
**Solución:**
```bash
# Opción 1: Usar otro puerto
PORT=3001 npm run dev

# Opción 2: Matar proceso en 3000
lsof -ti:3000 | xargs kill -9
```

---

### **❌ La aplicación no scrapea ningún artículo**
**Posibles causas:**
- Sin conexión a internet
- Los 7 proxies CORS están caídos (raro)
- URL no válida

**Solución:**
- Probar con URL conocida: `https://example.com`
- Verificar conexión a internet
- Ver logs en la consola del navegador (F12)

---

### **❌ Service Worker no se actualiza**
**Solución:**
```
DevTools → Application → Service Workers → Unregister
Recargar página (Ctrl+Shift+R / Cmd+Shift+R)
```

---

## 📱 URLs de Prueba Recomendadas

### **URLs que funcionan bien:**
```
https://developer.mozilla.org/en-US/docs/Web/JavaScript
https://github.com/facebook/react
https://www.theguardian.com/technology
https://medium.com/@username/article
https://dev.to/username/article
```

### **URLs para demostrar fallback (pueden fallar):**
```
https://example.com (muy simple, fallback básico)
https://twitter.com/status/... (requiere login)
```

---

## 🎓 Guión de Demostración (5 minutos)

### **Minuto 1: Instalación**
```bash
cd cocoa-reader
npm install
npm run db:push
npm run dev
```
"Como ven, la instalación es sencilla: instalamos dependencias, configuramos la base de datos SQLite local, y ejecutamos el servidor de desarrollo."

---

### **Minuto 2: Añadir y Leer**
1. Abrir http://localhost:3000
2. Añadir URL: `https://developer.mozilla.org/en-US/docs/Web/JavaScript`
3. Click en el artículo para leerlo

"La aplicación scrapea el contenido usando un sistema de cascada con 7 proxies CORS. Si uno falla, prueba el siguiente. Una vez scrapeado, el artículo se guarda en IndexedDB y puedo leerlo en una vista limpia sin distracciones."

---

### **Minuto 3: IA y Búsqueda**
1. Click en "Process with AI"
2. Mostrar resumen generado
3. Buscar: "javascript"

"El procesamiento de IA usa técnicas extractivas simples: análisis de frecuencia de palabras, scoring de oraciones, y detección de sentimiento. No descarga modelos pesados externos, todo funciona offline. La búsqueda es en tiempo real con debounce."

---

### **Minuto 4: Offline y PWA**
1. Activar modo offline en DevTools
2. Recargar página → sigue funcionando
3. Instalar como PWA

"Como es una PWA, funciona completamente offline gracias al Service Worker. Los datos están en IndexedDB, así que no necesita servidor. Puedo instalarla como app nativa."

---

### **Minuto 5: Tecnologías**
"El stack técnico es:
- **Next.js 14** con App Router para SSR y routing
- **React 18** con hooks para el frontend
- **TypeScript** para type safety
- **Tailwind CSS** para estilos responsivos
- **IndexedDB** para almacenamiento local offline
- **Prisma + SQLite** (opcional) para backend
- **Service Worker** para PWA y caché
- **@mozilla/readability** para extracción de contenido

Todo el código está en GitHub y es open source."

---

## ✅ Checklist Pre-Presentación

**15 minutos antes del tribunal:**

- [ ] Ordenador cargado (100% batería)
- [ ] Conexión a internet verificada
- [ ] Proyecto clonado en carpeta limpia
- [ ] `npm install` completado sin errores
- [ ] `npm run dev` funcionando
- [ ] Navegador abierto en `http://localhost:3000`
- [ ] DevTools abierto en pestaña Application (para demostrar SW)
- [ ] 2-3 artículos ya añadidos (por si falla scraping en vivo)
- [ ] Archivo JSON de export preparado (para demo de import)
- [ ] Terminal visible con logs

---

## 🎤 Frases para Usar Durante la Demo

### **Al instalar:**
"Como ven, el proceso de instalación es estándar para cualquier proyecto Node.js moderno. Primero instalamos las dependencias, luego configuramos la base de datos con Prisma, y finalmente ejecutamos el servidor de desarrollo."

### **Al añadir artículo:**
"Aquí estoy usando el sistema de scraping que implementé. Primero intenta fetch directo, y si falla por CORS, prueba con 7 proxies públicos en cascada. Si todos fallan, crea un artículo fallback inteligente extrayendo información de la URL."

### **Al mostrar IA:**
"El procesamiento de IA usa técnicas de extracción de texto: scoring de oraciones por frecuencia de palabras clave, análisis de sentimiento básico, y categorización. Inicialmente quería usar Transformers.js con modelos de Hugging Face, pero pesaban más de 300MB y crasheaba en móviles. Esta solución es más ligera y funciona completamente offline."

### **Al demostrar offline:**
"La aplicación es offline-first. Todos los artículos se guardan en IndexedDB del navegador, y el Service Worker cachea los assets estáticos. Esto significa que funciona completamente sin conexión, como una aplicación nativa."

### **Si algo falla:**
"Este es uno de los retos del scraping web: algunos sitios tienen protecciones anti-bot o requieren JavaScript. Por eso implementé el sistema de fallback que crea un artículo con el enlace para que el usuario pueda abrirlo manualmente."

---

## 📊 Métricas para Mencionar

- **~3,500 líneas de código** (TypeScript/TSX)
- **15+ componentes React** reutilizables
- **8 API routes** (Next.js)
- **623 líneas** en client-scraper.ts (sistema de scraping)
- **247 líneas** en web-ethics.ts (verificación ética)
- **100% offline** funcional con IndexedDB
- **Lighthouse Score: 95+** en todas las métricas
- **PWA completa** con Web App Manifest + Service Worker

---

## 🎯 Conclusión

Con este tutorial, deberías poder:
- ✅ Instalar el proyecto en cualquier ordenador
- ✅ Ejecutar la aplicación sin errores
- ✅ Demostrar todas las funcionalidades clave
- ✅ Explicar decisiones técnicas
- ✅ Resolver problemas comunes en vivo
- ✅ Responder preguntas con confianza

**¡Mucha suerte en la presentación! 🚀**
