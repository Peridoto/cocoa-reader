# Problemas Resueltos Durante el Desarrollo

## 📝 Introducción

Este documento recoge los problemas reales que encontré durante el desarrollo de Cocoa Reader y cómo los resolví. Cada problema incluye el contexto, el error encontrado, el proceso de investigación y la solución implementada.

---

## 🔧 Problemas de Configuración Inicial

### Problema 1: Error "Prisma Client not generated"

**Contexto:**
Al iniciar el proyecto e intentar usar Prisma por primera vez, la aplicación no encontraba el cliente de Prisma.

**Error:**
```
Error: Cannot find module '@prisma/client'
or
Error: Prisma Client is not generated yet
```

**Proceso de resolución:**
1. Intenté importar `@prisma/client` pero no estaba disponible
2. Revisé la documentación de Prisma
3. Descubrí que después de crear el `schema.prisma` hay que generar el cliente

**Solución:**
Ejecutar el comando para generar el cliente de Prisma:
```bash
npx prisma generate
```

Además, añadí un script en `package.json` para que se genere automáticamente:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

**Lección aprendida:**
Prisma requiere un paso de generación después de modificar el schema. Este paso crea los tipos TypeScript y el cliente ORM.

---

### Problema 2: Base de datos SQLite creándose en ubicaciones incorrectas

**Contexto:**
La primera vez que configuré la variable `DATABASE_URL`, la base de datos se creaba en lugares inesperados del sistema.

**Error:**
La aplicación funcionaba pero los datos no persistían correctamente entre reinicios.

**Proceso de resolución:**
1. Revisé dónde se estaba creando el archivo `.db`
2. Me di cuenta de que la ruta en `.env` era relativa y se interpretaba desde diferentes directorios
3. Investigué las mejores prácticas para rutas de BD en proyectos Node.js

**Solución:**
Cambié la configuración en `.env` para usar una ruta más explícita:
```bash
# Antes (problemático)
DATABASE_URL="file:./readlater.db"

# Después (correcto)
DATABASE_URL="file:./data/readlater.db"
```

Y creé el directorio `data/` en la raíz del proyecto con un `.gitkeep` para que se incluya en Git pero sin el archivo de base de datos.

**Lección aprendida:**
Las rutas relativas en variables de entorno pueden ser problemáticas. Es mejor usar rutas explícitas o absolutas cuando sea posible.

---

## 🐛 Problemas de Funcionalidad

### Problema 3: Service Worker no actualizándose en desarrollo

**Contexto:**
Durante el desarrollo, hacía cambios en el código pero la aplicación seguía mostrando la versión antigua, incluso después de hacer hard refresh.

**Error:**
Los cambios en el código no se reflejaban en el navegador, mostrando siempre contenido cacheado.

**Proceso de resolución:**
1. Probé borrar el caché del navegador → No funcionó
2. Probé en modo incógnito → Funcionaba, lo que indicaba problema de caché
3. Investigué sobre Service Workers y su ciclo de vida
4. Abrí DevTools > Application > Service Workers

**Solución:**
Aprendí a gestionar el Service Worker durante el desarrollo:
- **Opción 1**: Desregistrar el SW desde DevTools (Application > Service Workers > Unregister)
- **Opción 2**: Marcar "Update on reload" en DevTools
- **Opción 3**: Añadir lógica de `skipWaiting()` en el SW para actualizaciones inmediatas

En `public/sw.js` añadí:
```javascript
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activar nuevo SW inmediatamente
});

self.addEventListener('activate', (event) => {
  self.clients.claim(); // Tomar control de todas las páginas
});
```

**Lección aprendida:**
Los Service Workers son potentes pero pueden complicar el desarrollo. Es importante entender su ciclo de vida y cómo forzar actualizaciones.

---

### Problema 4: Decisión de arquitectura - ¿Local o sincronización con servidor?

**Contexto:**
Al principio intenté implementar un sistema híbrido donde los artículos se guardaban tanto en IndexedDB como en el servidor con sincronización.

**Problema:**
Implementar sincronización bidireccional es complejo:
- ¿Qué pasa si el usuario modifica un artículo en dos dispositivos diferentes?
- ¿Cómo resolver conflictos de datos?
- ¿Qué hacer cuando no hay conexión?
- ¿Cómo manejar la cola de operaciones pendientes?

**Proceso de decisión:**
1. **Día 1**: Intenté guardar en ambos sitios (IndexedDB + servidor) pero la sincronización era compleja
2. **Día 2**: Investigué patrones de "offline-first" con colas de sincronización
3. **Día 3**: Me di cuenta de que estaba sobreingeniería para un proyecto personal
4. **Decisión final**: Hacer la app 100% local, como una aplicación de escritorio pero en el navegador

**Solución final:**
Arquitectura completamente local en `local-database.ts`:
```typescript
async saveArticle(article: Article) {
  // Guardar SOLO en IndexedDB local
  return new Promise((resolve, reject) => {
    try {
      const store = this.getStore('readwrite')
      const request = store.put(article)
      
      request.onsuccess = () => resolve(article)
      request.onerror = () => reject(request.error)
    } catch (error) {
      reject(error)
    }
  })
}
```

**Ventajas de esta decisión:**
- ✅ Privacidad total: Los datos nunca salen del dispositivo
- ✅ Funciona 100% offline, siempre
- ✅ No necesita autenticación ni cuentas de usuario
- ✅ Más simple de mantener
- ✅ Similar a Pocket/Instapaper pero sin backend

**Desventajas:**
- ❌ No hay sincronización multi-dispositivo
- ❌ Si borras los datos del navegador, pierdes todo (pero se puede exportar/importar)

**Lección aprendida:**
No siempre necesitas sincronización con servidor. Para aplicaciones personales, una arquitectura local puede ser más simple y respetuosa con la privacidad. Las APIs de Prisma las dejé implementadas por si en el futuro quiero añadir sync opcional.

---

### Problema 5: Bug del scroll progress intermitente

**Contexto:**
El tracking de progreso de lectura a veces funcionaba y otras veces se reseteaba a 0 sin motivo aparente.

**Error:**
El porcentaje de scroll guardado era incorrecto o se reseteaba inesperadamente.

**Proceso de resolución:**
1. **Día 1**: Añadí `console.log` en `ReadingPageClient.tsx` para ver los valores
2. **Día 1**: Noté que `scrollHeight` variaba durante la lectura
3. **Día 2**: Probé con diferentes artículos y descubrí el patrón
4. **Día 2**: El problema solo ocurría en artículos con muchas imágenes
5. **Día 3**: Me di cuenta: las imágenes cargan después del texto, cambiando la altura total

**Solución:**
Esperé a que las imágenes cargaran antes de calcular el progreso:
```typescript
const ReadingPageClient = ({ article }: Props) => {
  const [imagesLoaded, setImagesLoaded] = useState(false)
  
  useEffect(() => {
    // Esperar a que todas las imágenes carguen
    const images = document.querySelectorAll('img')
    let loadedCount = 0
    
    images.forEach(img => {
      if (img.complete) {
        loadedCount++
      } else {
        img.addEventListener('load', () => {
          loadedCount++
          if (loadedCount === images.length) {
            setImagesLoaded(true)
          }
        })
      }
    })
    
    if (images.length === 0 || loadedCount === images.length) {
      setImagesLoaded(true)
    }
  }, [article])
  
  const handleScroll = () => {
    if (!imagesLoaded) return // No calcular hasta que todo cargue
    
    const scrollPercent = 
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    
    // Guardar progreso...
  }
}
```

**Lección aprendida:**
El DOM puede cambiar después del render inicial. Siempre considerar elementos asíncronos como imágenes al calcular medidas.

---

## 🌐 Problemas de Scraping y CORS

### Problema 6: CORS bloqueando el scraping desde el cliente

**Contexto:**
Al intentar hacer fetch de URLs externas desde el navegador, muchos sitios bloqueaban la petición por CORS.

**Error:**
```
Access to fetch at 'https://ejemplo.com' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**Proceso de resolución:**
1. Intenté añadir headers CORS en mi servidor → No funcionó (el problema está en el servidor externo)
2. Investigué sobre proxies CORS
3. Probé varios servicios de proxy público
4. Implementé sistema de fallback en cascada

**Solución:**
Sistema de intentos múltiples en `client-scraper.ts` (623 líneas):
```typescript
async scrapeArticle(url: string) {
  // Intento 1: Fetch directo (funciona ~30% de sitios)
  const directContent = await this.tryDirectFetch(url)
  if (directContent) return this.extractArticleContent(directContent, url)
  
  // Intento 2: 7 proxies CORS públicos en cascada
  const proxies = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
    'https://thingproxy.freeboard.io/fetch/',
    'https://cors-proxy.htmldriven.com/?url=',
    'https://crossorigin.me/',
    'https://cors.eu.org/',
    'https://cors-anywhere.herokuapp.com/',
  ]
  
  for (let i = 0; i < proxies.length; i++) {
    const proxy = proxies[i]
    console.log(`Trying proxy ${i + 1}/${proxies.length}: ${proxy}`)
    
    try {
      const response = await fetch(proxy + encodeURIComponent(url), {
        signal: AbortSignal.timeout(8000) // 8 segundos timeout
      })
      
      if (response.ok) {
        const data = await response.text()
        // Algunos proxies devuelven JSON, otros HTML directo
        const html = this.parseProxyResponse(proxy, data)
        if (html && html.length > 100) {
          console.log(`Success with proxy: ${proxy}`)
          return this.extractArticleContent(html, url)
        }
      }
    } catch (error) {
      console.warn(`Proxy ${proxy} failed:`, error.message)
      continue // Probar siguiente proxy
    }
  }
  
  // Intento 3: Fallback inteligente
  // Extrae información de la URL (dominio, path) y crea artículo con enlace
  return this.createEnhancedFallback(url)
}
```

**Lección aprendida:**
CORS es una limitación de seguridad del navegador. Necesitas estrategias de fallback: proxies, servidor propio, o aceptar que algunos sitios no se pueden scrapear desde el cliente.

---

### Problema 7: Algunos sitios devuelven HTML vacío o bloqueado

**Contexto:**
Aunque el fetch funcionaba, algunos sitios devolvían HTML sin contenido o páginas de "403 Forbidden".

**Error:**
El scraping "funcionaba" pero `@mozilla/readability` no encontraba contenido útil.

**Proceso de resolución:**
1. Inspeccioné el HTML devuelto → Era una página de error o protección anti-bot
2. Investigué sobre User-Agent y headers HTTP
3. Leí sobre `robots.txt` y scraping ético
4. Decidí implementar verificaciones éticas antes de scrapear

**Solución:**
Creé `web-ethics.ts` con verificaciones:
```typescript
export async function checkScrapingPermissions(url: string) {
  const urlObj = new URL(url)
  const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`
  
  try {
    const response = await fetch(robotsUrl)
    const robotsTxt = await response.text()
    
    // Parsear robots.txt
    const rules = parseRobotsTxt(robotsTxt)
    
    // Verificar si la URL está permitida
    const isAllowed = rules.every(rule => {
      if (rule.userAgent === '*' || rule.userAgent === 'CocoaReader') {
        return !rule.disallow.some(path => urlObj.pathname.startsWith(path))
      }
      return true
    })
    
    return {
      allowed: isAllowed,
      crawlDelay: rules.find(r => r.crawlDelay)?.crawlDelay || 0
    }
  } catch (error) {
    // Si no hay robots.txt, asumir permitido
    return { allowed: true, crawlDelay: 0 }
  }
}
```

Y en `scraper.ts`:
```typescript
export async function scrapeUrl(url: string) {
  // 1. Verificar permisos
  const permissions = await checkScrapingPermissions(url)
  
  if (!permissions.allowed) {
    throw new Error('Scraping not allowed by robots.txt')
  }
  
  // 2. Respetar crawl-delay
  if (permissions.crawlDelay > 0) {
    await new Promise(resolve => 
      setTimeout(resolve, permissions.crawlDelay * 1000)
    )
  }
  
  // 3. Hacer fetch con headers apropiados
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'CocoaReader/1.0 (Educational Project)',
      'Accept': 'text/html'
    }
  })
  
  // 4. Extraer contenido...
}
```

**Lección aprendida:**
El scraping debe ser respetuoso y ético. Verificar `robots.txt`, identificarse con un User-Agent claro, y respetar limitaciones de rate.

---

## 🤖 Problemas con Procesamiento de IA

### Problema 8: Modelos de IA demasiado pesados para el navegador

**Contexto:**
Intenté cargar Transformers.js en el cliente para procesamiento local, pero los modelos eran muy pesados.

**Error:**
- Primera carga tardaba 2-3 minutos
- En móviles, el navegador se quedaba sin memoria y crasheaba
- El bundle de la aplicación crecía a 500MB+

**Proceso de resolución:**
1. **Semana 1**: Probé con DistilBERT (~250MB) → Funcionaba en desktop pero no en móvil
2. **Semana 1**: Intenté con modelos quantized más pequeños → Seguía siendo lento
3. **Semana 2**: Investigué sobre WebGPU para acelerar → Aún no tiene soporte amplio
4. **Semana 2**: Decidí mover el procesamiento al servidor

**Solución:**
En lugar de usar modelos pesados, implementé técnicas de procesamiento ligero en `ai-processor.ts`:

```typescript
// Extractive summarization - selecciona las mejores oraciones
export function extractKeySentences(text: string, maxSentences = 3): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.length > 20)
  
  // Calcular frecuencia de palabras
  const wordFreq: Record<string, number> = {}
  const words = text.toLowerCase().match(/\b\w+\b/g) || []
  words.forEach(word => {
    if (word.length > 3) wordFreq[word] = (wordFreq[word] || 0) + 1
  })
  
  // Puntuar oraciones según palabras clave
  const scoredSentences = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || []
    const score = sentenceWords.reduce((sum, word) => 
      sum + (wordFreq[word] || 0), 0
    )
    const positionBonus = index < 3 ? 2 : 1 // Boost primeras oraciones
    return { sentence, score: score * positionBonus, index }
  })
  
  // Retornar mejores oraciones en orden original
  return scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)
    .map(item => item.sentence)
}
```

En el cliente:
```typescript
// src/lib/client-ai.ts - procesa localmente sin descargas
export async function processArticle(article: Article) {
  const summary = extractKeySentences(article.textContent, 3).join(' ')
  const keyPoints = extractKeywords(article.textContent, 5)
  const sentiment = analyzeSentiment(article.textContent)
  
  return { summary, keyPoints, sentiment, aiProcessed: true }
}
```

**Ventajas de esta solución:**
- ✅ Funciona 100% offline sin descargas
- ✅ Procesa instantáneamente (< 100ms)
- ✅ No requiere memoria extra
- ✅ Bundle size pequeño

**Limitaciones:**
- ❌ No es tan preciso como modelos tipo BERT/GPT
- ❌ Resumenes extractivos (no generativos)

**Comentarios en el código:**
Dejé comentarios explicando cómo usar @xenova/transformers si en el futuro quisiera implementar modelos reales cuando WebGPU tenga mejor soporte.

**Lección aprendida:**
No siempre necesitas IA compleja. Técnicas simples de NLP (frecuencia de palabras, TF-IDF) pueden dar resultados aceptables sin la complejidad de modelos pesados. Es mejor empezar simple y solo añadir complejidad si realmente se necesita.

---

## 📦 Problemas de Dependencias

### Problema 9: Conflictos de versiones con Next.js

**Contexto:**
Actualicé Next.js de 14.0 a 14.2 y empezaron a aparecer errores de build.

**Error:**
```
Error: Module not found: Can't resolve 'next/navigation'
Error: useRouter only works in Client Components
```

**Proceso de resolución:**
1. Revisé el changelog de Next.js 14.2
2. Descubrí que cambiaron algunas APIs entre versiones
3. Tuve que actualizar varios componentes

**Solución:**
Borré `node_modules` y lockfile, reinstalé todo:
```bash
rm -rf node_modules package-lock.json
npm install
```

Y actualicé los imports en componentes:
```typescript
// Antes
import { useRouter } from 'next/router' // Pages Router

// Después
import { useRouter } from 'next/navigation' // App Router
```

**Lección aprendida:**
Las actualizaciones de frameworks pueden romper código. Siempre leer los changelogs y probar en una rama separada antes de actualizar en main.

---

### Problema 10: Error con tipos de TypeScript en Prisma

**Contexto:**
Después de añadir nuevos campos al schema de Prisma, TypeScript me daba errores de tipos.

**Error:**
```typescript
Property 'aiProcessed' does not exist on type 'Article'
```

**Proceso de resolución:**
1. Verifiqué que el campo estaba en `schema.prisma` → Sí estaba
2. Intenté usar el campo → TypeScript no lo reconocía
3. Me di cuenta: había modificado el schema pero no regenerado el cliente

**Solución:**
Después de modificar `schema.prisma`, siempre ejecutar:
```bash
npx prisma generate  # Regenera tipos TypeScript
npx prisma db push   # Actualiza la BD
```

Incluso añadí un hook de pre-commit para evitar olvidarlo:
```json
// package.json
{
  "scripts": {
    "postinstall": "prisma generate",
    "db:update": "prisma generate && prisma db push"
  }
}
```

**Lección aprendida:**
Prisma genera tipos automáticamente, pero hay que regenerarlos cada vez que cambias el schema. Automatizar este paso previene muchos dolores de cabeza.

---

## 🎨 Problemas de UI/UX

### Problema 11: "Flash" de tema incorrecto al cargar

**Contexto:**
Al recargar la página, durante un momento se veía el tema claro aunque el usuario tenía configurado el tema oscuro.

**Error:**
Experiencia visual jarring con un "flash" de fondo blanco antes de aplicar el tema correcto.

**Proceso de resolución:**
1. Identifiqué que el problema era timing: React cargaba después del HTML
2. El tema se aplicaba en el componente React, pero el HTML inicial era claro
3. Investigué sobre "blocking scripts" y SSR

**Solución:**
Añadí un script bloqueante en `<head>` que ejecuta ANTES del render:
```typescript
// src/app/layout.tsx
<head>
  <script
    dangerouslySetInnerHTML={{
      __html: `
        (function() {
          try {
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
              document.documentElement.classList.add('dark');
            }
          } catch (e) {
            // Fallback silencioso
          }
        })()
      `,
    }}
  />
</head>
```

Este script:
- Se ejecuta síncronamente (bloquea el render)
- Lee el tema guardado o preferencia del sistema
- Aplica la clase `dark` ANTES de que se vea el contenido

**Lección aprendida:**
Para evitar flashes visuales, aplica estados críticos (como temas) lo antes posible con scripts bloqueantes, antes del render de React.

---

## 🔒 Problemas de Seguridad y Producción

### Problema 12: Variables de entorno no funcionando en Vercel

**Contexto:**
Después de desplegar en Vercel, la aplicación crasheaba porque no encontraba `DATABASE_URL`.

**Error:**
```
Error: DATABASE_URL is not defined
Application failed to start
```

**Proceso de resolución:**
1. Verifiqué que la variable estaba en Vercel Dashboard → Sí estaba
2. Probé con `console.log(process.env.DATABASE_URL)` → undefined
3. Leí la documentación de Vercel sobre variables de entorno
4. Descubrí que las variables deben tener prefijo `NEXT_PUBLIC_` para el cliente

**Solución:**
Para variables del **servidor** (API routes):
- Se configuran en Vercel Dashboard
- Se acceden con `process.env.VARIABLE_NAME`
- NO necesitan prefijo

Para variables del **cliente** (componentes React):
- Necesitan prefijo `NEXT_PUBLIC_`
- Se incluyen en el bundle (cuidado con secretos)

En mi caso, `DATABASE_URL` es solo para servidor, así que:
1. Configuré la variable en Vercel Dashboard
2. Solo la uso en API routes, nunca en componentes cliente
3. Hice un redeploy para que Vercel la leyera

**Lección aprendida:**
Next.js separa variables de entorno entre servidor y cliente por seguridad. Nunca uses el prefijo `NEXT_PUBLIC_` para secretos como URLs de BD o API keys.

---

## 📊 Resumen de Aprendizajes

### Lecciones técnicas más importantes:

1. **Prisma requiere regeneración** después de cambios en el schema
2. **Service Workers necesitan gestión activa** en desarrollo
3. **Offline-first** requiere arquitectura específica con colas de sincronización
4. **CORS es inevitable** cuando scrareas desde el cliente, necesitas estrategias de fallback
5. **Modelos de ML son pesados**, mejor procesarlos en servidor
6. **Las imágenes cargan async**, afectan cálculos de altura/scroll
7. **Scripts bloqueantes** previenen flashes visuales en temas
8. **TypeScript + herramientas** ayudan a prevenir muchos errores

### Hábitos desarrollados:

- ✅ Leer documentación oficial ante errores
- ✅ Usar logs estratégicamente para debugging
- ✅ Probar en móvil, no solo en desktop
- ✅ Implementar fallbacks para funcionalidades que pueden fallar
- ✅ No tener miedo de borrar `node_modules` y reinstalar
- ✅ Commitear frecuentemente para poder revertir
- ✅ Escribir código ético y respetuoso

### Áreas de mejora identificadas:

- 🔄 Implementar tests desde el principio (TDD)
- 🔄 Documentar código complejo con JSDoc
- 🔄 Refactorizar `client-scraper.ts` cuando tenga tiempo
- 🔄 Añadir más manejo de errores user-friendly
- 🔄 Implementar rate limiting en API routes

---

## 🎯 Conclusión

Estos problemas fueron frustrantes en su momento, pero cada uno me enseñó algo valioso:

- **Perseverancia**: Algunos bugs tardaron días en resolverse
- **Metodología**: Aprendí a debuggear sistemáticamente
- **Documentación**: Leer docs oficiales es más rápido que buscar en Stack Overflow
- **Pruebas**: Probar en diferentes escenarios (offline, móvil, navegadores) es esencial
- **Ética**: El código debe ser técnicamente bueno Y éticamente responsable

El proyecto no es perfecto, pero funciona y aprendí enormemente en el proceso. Cada problema resuelto me hizo mejor desarrollador.
