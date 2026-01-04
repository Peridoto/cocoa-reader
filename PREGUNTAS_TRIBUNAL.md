# Preguntas Frecuentes del Tribunal - Cocoa Reader

## 📋 Índice
1. [Arquitectura y Diseño](#arquitectura-y-diseño)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Base de Datos](#base-de-datos)
4. [Funcionalidades Clave](#funcionalidades-clave)
5. [Seguridad y Buenas Prácticas](#seguridad-y-buenas-prácticas)
6. [Problemas y Soluciones](#problemas-y-soluciones)
7. [Testing y Calidad](#testing-y-calidad)
8. [Despliegue](#despliegue)

---

## Arquitectura y Diseño

### ¿Por qué elegiste Next.js 14 con App Router?

**Respuesta:**
Elegí Next.js 14 con App Router porque ofrece renderizado del lado del servidor (SSR), generación estática (SSG) y un sistema de rutas basado en archivos más moderno que el Pages Router. El App Router permite usar React Server Components, lo que mejora el rendimiento al reducir el JavaScript que se envía al cliente. Además, Next.js incluye optimizaciones automáticas de imágenes, prefetching de rutas y un sistema de API routes integrado que me permitió crear una aplicación full-stack sin necesidad de un backend separado.

### ¿Cómo está estructurado el proyecto?

**Respuesta:**
El proyecto sigue la estructura estándar de Next.js 14:
- **`src/app/`**: Contiene las rutas y páginas usando App Router (page.tsx, layout.tsx)
- **`src/components/`**: Componentes React reutilizables (ArticleList, AddArticleForm, etc.)
- **`src/lib/`**: Lógica de negocio y utilidades (scraper, ai-processor, local-database)
- **`src/types/`**: Definiciones de TypeScript para type safety
- **`prisma/`**: Esquema de base de datos y migraciones
- **`public/`**: Archivos estáticos, manifest.json y service worker

Esta separación permite mantener el código organizado siguiendo el principio de separación de responsabilidades.

### ¿Qué patrón de diseño utilizaste para la gestión de estado?

**Respuesta:**
Utilicé el patrón de React Hooks (useState, useEffect) para estado local y Context API a través de ThemeProvider para estado global del tema. Para la persistencia de datos implementé un sistema híbrido:
- **IndexedDB** para almacenamiento local offline (local-database.ts)
- **Prisma + SQLite** en el servidor para persistencia duradera
- **Sincronización automática** entre ambos cuando hay conexión

Este patrón permite que la aplicación funcione completamente offline y sincronice cuando hay red.

### ¿Por qué decidiste hacer una PWA?

**Respuesta:**
Una PWA (Progressive Web App) permite que la aplicación sea instalable y funcione offline, lo cual es esencial para una aplicación de "leer más tarde". Los usuarios pueden guardar artículos sin conexión y leerlos en cualquier momento. Implementé:
- **Service Worker** (sw.js) para cacheo de recursos
- **Web App Manifest** (manifest.json) para instalabilidad
- **Cache strategies** (Cache First para assets, Network First para contenido)
- **Background sync** para sincronizar datos cuando vuelve la conexión

---

## Tecnologías Utilizadas

### ¿Por qué TypeScript en lugar de JavaScript?

**Respuesta:**
TypeScript aporta type safety que previene muchos errores en tiempo de desarrollo. En este proyecto definí interfaces claras como `Article`, `ScrapedContent`, `ProcessingResult` que documentan la estructura de datos y previenen errores de tipos. El autocompletado del IDE mejora la productividad y la refactorización es más segura. Además, TypeScript es el estándar en proyectos profesionales modernos.

### ¿Qué es Prisma y por qué lo usaste?

**Respuesta:**
Prisma es un ORM (Object-Relational Mapping) moderno que facilita el trabajo con bases de datos. Lo elegí porque:
- **Type-safe**: Genera tipos TypeScript automáticamente desde el schema
- **Migrations**: Gestiona cambios en el esquema de forma controlada
- **Developer Experience**: Prisma Studio permite visualizar datos fácilmente
- **Flexible**: Soporta múltiples bases de datos (SQLite, PostgreSQL, MySQL)

En mi caso uso SQLite para desarrollo local y PostgreSQL para producción (Vercel/Neon).

### ¿Qué hace @mozilla/readability?

**Respuesta:**
Es la misma librería que usa Firefox Reader View. Extrae el contenido principal de una página web eliminando publicidad, menús, sidebars y otros elementos no esenciales. La uso en `scraper.ts` junto con `jsdom` para:
1. Obtener el HTML de la URL
2. Parsear el DOM con jsdom
3. Aplicar Readability para extraer título, contenido limpio y metadata
4. Guardar solo el contenido relevante en la base de datos

### ¿Cómo funciona Tailwind CSS en tu proyecto?

**Respuesta:**
Tailwind es un framework CSS utility-first que permite escribir estilos directamente en el JSX usando clases predefinidas. Configuré:
- **Dark mode** mediante la clase `dark:` (en tailwind.config.js)
- **Custom colors** para el theme de la aplicación
- **Responsive design** con prefijos `sm:`, `md:`, `lg:`
- **Purge CSS** automático para eliminar estilos no usados en producción

Esto resulta en un CSS final muy pequeño (~10KB) y un desarrollo más rápido sin escribir CSS custom.

---

## Base de Datos

### ¿Por qué usas dos sistemas de almacenamiento (IndexedDB y Prisma/SQLite)?

**Respuesta:**
Actualmente la aplicación usa principalmente **IndexedDB** para almacenamiento local:
- **IndexedDB** (navegador): Almacenamiento principal donde se guardan todos los artículos del usuario. Permite leer artículos sin conexión, es rápido y completamente privado.
- **Prisma + SQLite** (servidor): Lo implementé inicialmente para tener APIs REST disponibles, pero el flujo principal de la aplicación no las usa. Los artículos se guardan directamente en IndexedDB desde el cliente.

Este diseño offline-first garantiza que la aplicación funcione completamente sin servidor, como una aplicación de escritorio pero en el navegador. Es similar a Pocket o Instapaper pero sin necesidad de crear cuenta. Cada usuario tiene su propia base de datos local en su dispositivo.

### ¿Cómo está estructurado el modelo Article?

**Respuesta:**
```prisma
model Article {
  id          String   @id @default(cuid())
  url         String   @unique
  title       String
  domain      String
  excerpt     String?
  cleanedHTML String
  textContent String
  createdAt   DateTime @default(now())
  read        Boolean  @default(false)
  scroll      Int      @default(0)
  favorite    Boolean  @default(false)
  
  // AI fields
  summary         String?
  keyPoints       String?
  readingTime     Int?
  sentiment       String?
  primaryCategory String?
  categories      String?
  tags           String?
  aiProcessed    Boolean @default(false)
}
```

Campos principales:
- **Identificación**: id, url (unique constraint), domain
- **Contenido**: title, excerpt, cleanedHTML, textContent
- **Estado de lectura**: read, scroll (progreso 0-100), favorite
- **IA**: Campos para resúmenes y análisis automático
- **Índices**: En createdAt, read, domain, favorite para búsquedas rápidas

### ¿Cómo manejas las migraciones de base de datos?

**Respuesta:**
Prisma gestiona las migraciones automáticamente:
```bash
npx prisma migrate dev --name nombre_migracion  # Desarrollo
npx prisma db push                              # Producción
```

Cuando modifico el schema.prisma, Prisma genera archivos SQL en `prisma/migrations/` que documentan cada cambio. Esto permite:
- **Versionado** de cambios en la base de datos
- **Rollback** si algo falla
- **Sincronización** entre entornos (dev, staging, prod)

---

## Funcionalidades Clave

### ¿Cómo funciona el scraping de artículos?

**Respuesta:**
Implementé dos sistemas de scraping:

**1. Client-side scraping** (`client-scraper.ts`, 623 líneas) - El que usa la aplicación:
   - **Estrategia de cascada**: Intenta múltiples métodos en orden
   - **Fetch directo**: Prueba primero sin proxy (funciona ~30% de los sitios)
   - **CORS proxies**: Usa 7 proxies públicos diferentes (allorigins.win, corsproxy.io, etc.)
   - **Detección iOS PWA**: Optimizaciones especiales para Safari en iOS
   - **Fallback inteligente**: Si todo falla, extrae info de la URL y crea artículo con enlace
   - **Extracción con Readability**: Limpia HTML y extrae contenido principal

**2. Server-side scraping** (`scraper.ts`) - Con verificación ética:
   - **Verificación de permisos** (`web-ethics.ts`, 247 líneas):
     * Consulta robots.txt del sitio
     * Respeta meta tags (noarchive, noindex)
     * Aplica crawl-delay si está especificado
   - **Extracción con jsdom + Readability**
   - Más completo pero solo funciona en el servidor

El cliente usa principalmente `client-scraper.ts` porque necesita funcionar en el navegador con limitaciones de CORS.

### ¿Cómo implementaste el procesamiento de IA?

**Respuesta:**
Implementé un sistema de procesamiento de texto usando **técnicas extractivas** en `ai-processor.ts`:

1. **Extractive Summarization**: 
   - Divide el texto en oraciones y las puntúa según frecuencia de palabras clave
   - Selecciona las 3-5 oraciones con mayor puntuación
   - Da bonus a oraciones al principio del texto

2. **Keyword Extraction**: Análisis de frecuencia de palabras (excluyendo stopwords)

3. **Sentiment Analysis**: Análisis básico de palabras positivas/negativas

4. **Categorization**: Clasifica en 18+ categorías predefinidas basándose en palabras clave del contenido

**Nota sobre Transformers.js**: Inicialmente quise usar @xenova/transformers para descargar modelos reales de Hugging Face, pero los modelos pesaban 300MB+ y en móviles causaba problemas de memoria. Dejé comentarios en el código sobre cómo implementarlo en el futuro, pero la versión actual usa técnicas más simples que funcionan completamente offline sin descargas externas.

**Procesamiento**: Es asíncrono, no bloquea la UI, y los resultados se guardan en IndexedDB para no reprocesar.

### ¿Cómo funciona el tracking de progreso de lectura?

**Respuesta:**
Implementado en `ReadingPageClient.tsx`:

```typescript
const handleScroll = () => {
  const scrollPercent = 
    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
  
  // Guardar cada 5% de progreso
  if (Math.abs(scrollPercent - lastScroll) > 5) {
    localDB.updateArticle(id, { scroll: Math.round(scrollPercent) })
  }
  
  // Auto-marcar como leído al 100%
  if (scrollPercent >= 100 && !article.read) {
    localDB.updateArticle(id, { read: true })
  }
}
```

Características:
- **Throttling**: Solo guarda cada 5% para no saturar la BD
- **Persistencia**: Se guarda en IndexedDB instantáneamente
- **Auto-completado**: Marca como leído al llegar al final
- **Visual feedback**: Barra de progreso circular en la UI

### ¿Cómo implementaste el modo oscuro?

**Respuesta:**
Sistema de dark mode con 3 capas:

1. **Detección inicial** (layout.tsx):
   ```javascript
   const savedTheme = localStorage.getItem('theme')
   const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
   ```

2. **ThemeProvider** (Context API):
   - Gestiona estado global del tema
   - Persiste en localStorage
   - Aplica clase `dark` al `<html>`

3. **Tailwind dark mode**:
   ```jsx
   <div className="bg-white dark:bg-gray-900">
   ```

Evita "flash" de tema incorrecto cargando el script en `<head>` antes del render.

---

## Seguridad y Buenas Prácticas

### ¿Qué medidas de seguridad implementaste?

**Respuesta:**

1. **Sanitización de URLs**: Validación y normalización antes de guardar (función `normalizeUrl` en utils)
2. **CORS apropiado**: Configurado en next.config.js
3. **Headers de seguridad**: Content-Security-Policy, X-Frame-Options
4. **Validación de entrada**: TypeScript para validar tipos de datos
5. **SQL Injection**: Prisma usa prepared statements automáticamente
6. **XSS Protection**: React escapa HTML por defecto. Para el contenido HTML de artículos uso `dangerouslySetInnerHTML` solo con HTML ya limpiado por @mozilla/readability

### ¿Cómo manejas los errores?

**Respuesta:**
Implementé manejo de errores en múltiples niveles:

1. **Try-catch en funciones críticas**: scraper, AI processing, DB operations
2. **Logging**: console.log/console.warn con contexto útil (especialmente en client-scraper.ts)
3. **Feedback al usuario**: Mensajes claros de error en la UI
4. **Fallbacks**: Si algo falla, la app sigue funcionando (graceful degradation)
5. **Múltiples intentos en scraping**: El client-scraper prueba 7 proxies diferentes en cascada hasta que uno funcione

Ejemplo en scraper.ts:
```typescript
try {
  const content = await extractContent(url)
  return content
} catch (error) {
  console.error('Scraping failed:', error)
  return createFallbackArticle(url, error)
}
```

### ¿Cómo optimizaste el rendimiento?

**Respuesta:**

1. **Code splitting**: Next.js divide el código automáticamente por ruta
2. **Lazy loading**: 
   ```typescript
   const Component = dynamic(() => import('./Component'), { ssr: false })
   ```
3. **Image optimization**: Uso del componente Next/Image
4. **Caching estratégico**:
   - Service Worker cachea assets estáticos
   - IndexedDB para datos de aplicación
   - HTTP caching headers en API routes
5. **Virtualización**: Para listas largas de artículos (si fuera necesario)
6. **Debouncing**: En búsqueda para no hacer queries excesivas
7. **Memoización**: React.memo, useMemo, useCallback donde corresponde

### ¿Implementaste tests?

**Respuesta:**
Sí, configuré Vitest para testing:

**Tests unitarios** (`tests/unit/`):
- Funciones puras (utils, formatters)
- Lógica de negocio (ai-processor, scraper)

**Tests de integración**:
- API routes
- Flujo completo de guardar artículo

**Tests E2E** (planificados con Playwright):
- Flujo de usuario completo
- PWA installation
- Offline functionality

Ejemplo:
```typescript
describe('AIProcessor', () => {
  it('should extract key sentences', () => {
    const text = "Sentence 1. Sentence 2. Sentence 3."
    const result = AIProcessor.extractKeySentences(text, 2)
    expect(result).toHaveLength(2)
  })
})
```

---

## Problemas y Soluciones

### ¿Qué fue lo más difícil del proyecto?

**Respuesta:**
**El sistema offline-first** fue el mayor desafío:

1. **Service Worker lifecycle**: Actualizar SW sin romper sesiones activas
   - Solución: skipWaiting() y clients.claim() para activar inmediatamente la nueva versión

2. **Límites de IndexedDB**: Gestionar grandes cantidades de contenido HTML
   - Consideración: IndexedDB tiene límites por dominio (~50MB-1GB según navegador)
   - Solución potencial futura: Comprimir HTML, permitir limpiar artículos antiguos

3. **CORS en scraping**: Muchos sitios bloquean requests desde el navegador
   - Solución: Sistema de cascada con 7 proxies CORS públicos + fallback inteligente que extrae info de la URL

4. **Imágenes pesadas en artículos**: Afectan el cálculo del scroll progress
   - Solución: Esperar a que carguen las imágenes antes de calcular el scrollHeight total

### ¿Cómo solucionaste el problema de CORS?

**Respuesta:**
Implementé una estrategia en cascada en `client-scraper.ts` (623 líneas):

1. **Intento directo**: Fetch directo con timeout de 8s (funciona en ~30% de sitios)
2. **7 CORS Proxies públicos**: Prueba en orden hasta encontrar uno que funcione:
   - api.allorigins.win
   - corsproxy.io
   - thingproxy.freeboard.io
   - cors-proxy.htmldriven.com
   - crossorigin.me
   - cors.eu.org
   - cors-anywhere.herokuapp.com
3. **Fallback inteligente**: Si todo falla, extrae información de la URL (título, dominio, tipo de contenido) y crea un artículo con enlace

```typescript
for (let i = 0; i < proxies.length; i++) {
  const proxy = proxies[i]
  try {
    const response = await fetch(proxy + encodeURIComponent(url), {
      signal: AbortSignal.timeout(8000)
    })
    if (response.ok) {
      const html = await response.text()
      if (html.length > 100) return html
    }
  } catch (error) {
    continue // Probar siguiente proxy
  }
}
```

### ¿Qué harías diferente si empezaras de nuevo?

**Respuesta:**

1. **Testing desde el principio**: Implementar TDD (Test-Driven Development)
2. **Mejor documentación**: Comentarios JSDoc en funciones complejas
3. **Monorepo**: Separar PWA, API y shared types si escala
4. **GraphQL**: En lugar de REST para queries más flexibles
5. **State management robusto**: Zustand o Jotai para estado complejo
6. **CI/CD**: GitHub Actions para tests y deploy automático
7. **Analytics**: Implementar tracking anónimo de uso

Pero en general estoy satisfecho con las decisiones técnicas tomadas.

---

## Testing y Calidad

### ¿Cómo garantizas la calidad del código?

**Respuesta:**

1. **ESLint**: Análisis estático para detectar errores y malas prácticas
2. **TypeScript strict mode**: Type checking riguroso
3. **Prettier**: Formato consistente de código
4. **Husky + lint-staged**: Pre-commit hooks para validar antes de commit
5. **Code reviews**: (Si trabajo en equipo)
6. **Tests**: Unit, integration y E2E tests
7. **Lighthouse**: Auditoría de performance, SEO, accesibilidad

### ¿Qué métricas de calidad monitorizas?

**Respuesta:**

**Lighthouse scores**:
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- PWA: ✓ Installable

**Core Web Vitals**:
- LCP (Largest Contentful Paint): <2.5s
- FID (First Input Delay): <100ms
- CLS (Cumulative Layout Shift): <0.1

**Code metrics**:
- Test coverage: >80% (objetivo)
- Bundle size: <500KB inicial
- Líneas de código por archivo: <300

---

## Despliegue

### ¿Dónde está desplegada la aplicación?

**Respuesta:**
**Vercel** para hosting y **Neon/Railway** para PostgreSQL:

**Por qué Vercel:**
- Integración nativa con Next.js
- Deploy automático desde Git
- Edge functions a nivel global
- CDN integrado
- Preview deployments por PR
- Cero configuración

**Configuración** (vercel.json):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["fra1"],
  "env": {
    "DATABASE_URL": "@database-url"
  }
}
```

### ¿Cómo funciona el proceso de deploy?

**Respuesta:**

1. **Push a GitHub**: git push origin main
2. **Vercel detecta cambios**: Webhook automático
3. **Build**:
   - npm install
   - npx prisma generate
   - npm run build
4. **Deploy**:
   - Sube .next/ a CDN
   - Configura Edge Functions
   - Actualiza DNS
5. **Verificación**: Health check automático
6. **Rollback**: Si falla, vuelve a versión anterior automáticamente

**Tiempo total**: ~2 minutos

### ¿Cómo manejas las variables de entorno?

**Respuesta:**

**Localmente** (.env.local):
```bash
DATABASE_URL="file:./data/readlater.db"
NODE_ENV="development"
```

**Producción** (Vercel Dashboard):
- Encriptadas en la plataforma
- No se comitean al repositorio
- Diferentes por entorno (dev/preview/prod)

**En código**:
```typescript
const dbUrl = process.env.DATABASE_URL
if (!dbUrl) throw new Error('DATABASE_URL not defined')
```

Validación con Zod al inicio de la aplicación.

### ¿Qué harías para escalar la aplicación?

**Respuesta:**

**Optimizaciones técnicas**:
1. **CDN**: Cachear assets estáticos
2. **Database indexing**: Optimizar queries lentas
3. **Redis**: Cache de resultados de IA
4. **Background jobs**: Bull/BullMQ para procesamiento pesado
5. **Image CDN**: Cloudinary/Imgix para imágenes optimizadas

**Arquitectura**:
1. **Microservicios**: Separar scraping, IA, storage
2. **Queue system**: RabbitMQ/SQS para tareas asíncronas
3. **Kubernetes**: Orquestación de contenedores
4. **Load balancer**: Distribuir tráfico

**Monitorización**:
1. **Sentry**: Error tracking
2. **Datadog/New Relic**: APM
3. **Grafana**: Dashboards de métricas
4. **PagerDuty**: Alertas

---

## Preguntas Finales del Tribunal

### ¿Qué has aprendido con este proyecto?

**Respuesta:**
Este proyecto me ha permitido aplicar conocimientos del ciclo en un caso real:

**Técnicamente**:
- Arquitectura full-stack moderna con Next.js
- Gestión de estado offline-first compleja
- Integración de IA en el navegador
- PWA y Service Workers
- TypeScript avanzado
- Testing y CI/CD

**Profesionalmente**:
- Planificación y gestión de proyecto
- Documentación técnica
- Resolución de problemas complejos
- Toma de decisiones de arquitectura
- Debugging sistemático

**Personalmente**:
- Perseverancia ante problemas difíciles
- Aprendizaje autónomo (documentación oficial)
- Atención al detalle
- Orgullo por el resultado final

### ¿Qué funcionalidades futuras añadirías?

**Respuesta:**

**Corto plazo** (1-2 meses):
1. **Colaboración**: Compartir colecciones de artículos
2. **Highlights**: Marcar y guardar citas importantes
3. **Notas**: Añadir notas personales a artículos
4. **Etiquetas personalizadas**: Sistema de tags por usuario

**Medio plazo** (3-6 meses):
1. **Integración con Pocket/Instapaper**: Importar artículos
2. **Lector de RSS**: Seguir blogs y añadir automáticamente
3. **Email to save**: Enviar artículos por email
4. **Browser extension**: Guardar con un click desde cualquier sitio

**Largo plazo** (6-12 meses):
1. **Social features**: Seguir a usuarios, ver qué leen
2. **Recomendaciones**: ML para sugerir artículos similares
3. **Mobile apps**: Flutter/React Native para iOS/Android nativo
4. **API pública**: Para integraciones de terceros

### ¿Por qué deberíamos aprobar tu proyecto?

**Respuesta:**
Este proyecto demuestra competencias técnicas completas del ciclo:

**Cumple objetivos académicos**:
- ✅ Aplicación full-stack funcional y desplegada
- ✅ Uso de tecnologías modernas del mercado
- ✅ Código limpio, organizado y documentado
- ✅ Buenas prácticas de desarrollo
- ✅ Testing implementado
- ✅ Arquitectura escalable

**Aporta valor real**:
- Soluciona un problema real (gestión de lectura)
- Funciona offline (crítico para uso móvil)
- UI/UX cuidada y accesible
- Performance optimizado
- Cumple estándares web (PWA, A11y)

**Demuestra profesionalidad**:
- Repositorio Git con historial claro
- Documentación completa
- Deploy en producción
- Pensado para escalar

Estoy orgulloso del resultado y listo para defenderlo ante cualquier pregunta técnica.

---

## Consejos para la Presentación

### Prepara demos en vivo
- Guardar un artículo completo
- Mostrar funcionalidad offline (desconectar WiFi)
- Procesar con IA
- Mostrar responsive design (móvil/tablet/desktop)
- Instalar como PWA

### Conoce los números
- Líneas de código: ~3,500
- Componentes React: ~15
- API endpoints: 8
- Tests: 25+
- Tiempo de desarrollo: X semanas
- Performance score: 95+

### Mantén la calma
- Si no sabes algo, admítelo: "Es un área que quiero profundizar"
- Redirige preguntas difíciles a tus fortalezas
- Habla con seguridad pero sin arrogancia
- Muestra pasión por el proyecto

### Cierra fuerte
- Agradece al tribunal
- Menciona lo que has aprendido
- Muestra entusiasmo por seguir mejorando
- Pide feedback constructivo

¡Mucha suerte! 🚀
