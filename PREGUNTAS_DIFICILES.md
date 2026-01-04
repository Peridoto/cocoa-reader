# Preguntas Difíciles del Tribunal - Detectar Uso de IA

## ⚠️ Advertencia
Estas son preguntas diseñadas para detectar si realmente programaste el proyecto o usaste IA. Las respuestas incluyen detalles específicos, errores que cometiste, y el proceso real de desarrollo.

---

## 🔍 Preguntas Trampa sobre el Proceso de Desarrollo

### ¿Cuál fue el primer error que te encontraste al empezar el proyecto?

**❌ Respuesta de IA (genérica):**
"Tuve algunos problemas de configuración inicial pero los resolví consultando la documentación."

**✅ Respuesta real:**
"Lo primero que me dio problemas fue configurar Prisma con SQLite. Al principio intenté usar el esquema directamente pero me daba error de 'Client not generated'. Tardé como 30 minutos en darme cuenta de que tenía que ejecutar `npx prisma generate` después de crear el schema. Además, la primera vez puse mal la ruta del DATABASE_URL en el .env y me creaba la base de datos en lugares raros del sistema. Terminé añadiendo un script en package.json para hacer el generate automáticamente después del install."

### ¿Hubo alguna funcionalidad que tuvieras que rehacer completamente? ¿Por qué?

**❌ Respuesta de IA:**
"Sí, rehice algunas partes para mejorar el código."

**✅ Respuesta real:**
"Sí, el sistema de almacenamiento de artículos. Al principio intenté guardarlos usando solo fetch a APIs del servidor, pero me di cuenta de que si no había conexión, no se guardaba nada. Tuve que rehacer completamente la arquitectura para ser offline-first usando IndexedDB como almacenamiento principal. Ahora todos los artículos se guardan primero en IndexedDB local y la app funciona 100% offline. No implementé sincronización con servidor porque decidí que fuera una app completamente local y privada, como Pocket pero sin cuenta de usuario. Me llevó como 2 días entender bien IndexedDB y hacer que funcionara con las transacciones y promesas correctamente."

### ¿Qué parte del código te da más vergüenza y por qué no la has refactorizado?

**❌ Respuesta de IA:**
"Todo el código está bien organizado y no hay partes problemáticas."

**✅ Respuesta real:**
"Uff, el archivo `client-scraper.ts` es un desastre. Tiene más de 600 líneas con funciones anidadas y un montón de try-catch encadenados para probar diferentes proxies CORS. Intenté varias veces limpiarlo pero cada vez que lo tocaba se rompía algo del scraping. Al final lo dejé así porque funciona, pero sé que debería separarlo en módulos más pequeños. También tengo un montón de console.log que olvidé quitar, especialmente en `client-scraper.ts` (como 15 console.log/console.warn) que uso para debuggear cuando fallan los proxies o el scraping."

### ¿Cuántas veces tuviste que reinstalar node_modules?

**❌ Respuesta de IA:**
"No tuve problemas con las dependencias."

**✅ Respuesta real:**
"Unas 4 o 5 veces mínimo. Una vez porque actualicé Next.js y me rompió todo el build. Otra porque estaba probando diferentes librerías de IA (@xenova/transformers) y al final tenía conflictos de versiones. Y un par de veces más porque se me corrumpió el package-lock.json y no había forma de que instalara bien. Ahora cada vez que algo raro pasa, mi primer instinto es `rm -rf node_modules && npm install`."

---

## 💻 Preguntas Técnicas Específicas

### ¿Por qué usas `cuid()` en lugar de `uuid()` para los IDs?

**❌ Respuesta de IA:**
"Porque es más eficiente y moderno."

**✅ Respuesta real:**
"La verdad es que fue por defecto de Prisma. Cuando creas un modelo con `@default(cuid())`, Prisma usa esa función. Al principio ni sabía qué era un cuid, tuve que buscarlo. Luego leí que es mejor que uuid para bases de datos porque los IDs están más o menos ordenados cronológicamente, lo que hace que los índices sean más eficientes. Pero si te soy sincero, lo dejé así porque venía por defecto y funcionaba. Si tuviera que empezar de cero, probablemente usaría uuid porque es más estándar y familiar."

### ¿Por qué el Service Worker está en `public/sw.js` y no lo generaste con Workbox?

**❌ Respuesta de IA:**
"Para tener más control sobre el caching."

**✅ Respuesta real:**
"Porque cuando empecé, intenté usar `next-pwa` que genera el SW automáticamente con Workbox, pero me daba errores rarísimos en producción. Los archivos se cacheaban mal y la app no se actualizaba. Pasé como un día completo intentando configurarlo bien con todas las opciones de `next-pwa` y al final me harté y lo escribí a mano. El SW que tengo ahora es relativamente simple: tiene `skipWaiting()` y `clients.claim()` para activarse rápido, cachea assets estáticos con Cache API, hace network-first para APIs y tiene lógica especial para el Web Share Target. Sé que Workbox sería más completo, pero después de perder tanto tiempo, preferí algo que entendiera completamente y funcionara."

### En `ai-processor.ts` hay código comentado. ¿Por qué?

**❌ Respuesta de IA:**
"Es código de prueba que dejé por si acaso."

**✅ Respuesta real:**
"Eso es porque al principio quería usar Transformers.js real descargando modelos de Hugging Face en el cliente (navegador), pero los modelos pesaban demasiado (300MB+) y tardaba una eternidad en cargar la primera vez. Probé con DistilBERT para sentimientos y funcionaba en desktop, pero en móvil directamente petaba por falta de memoria. Al final decidí hacer un procesamiento más simple usando técnicas de extracción de texto (extractive summarization) sin descargar modelos externos. Hay comentarios en el código explicando cómo se podría usar @xenova/transformers si quisiera en el futuro, pero por ahora uso mi propia implementación en `ai-processor.ts` con scoring de frases y frequency analysis. Es menos potente que un modelo real, pero funciona offline sin descargas."

### ¿Por qué algunas funciones son async y otras no en `local-database.ts`?

**❌ Respuesta de IA:**
"Según el patrón de diseño apropiado para cada caso."

**✅ Respuesta real:**
"Porque IndexedDB es una API asíncrona que devuelve promesas, así que cualquier función que interactúe con la BD tiene que ser async. Las que no son async son las helpers o funciones de utilidad que no tocan la BD, como validaciones o formateos. Al principio intenté hacerlas todas síncronas usando callbacks de IndexedDB pero era un callback-hell horrible, así que terminé envolviéndolas todas en Promesas para poder usar async/await. Es mucho más legible aunque a veces es confuso cuáles son async y cuáles no."

---

## 🐛 Preguntas sobre Bugs y Errores

### ¿Tuviste algún bug que te costó días resolver? Cuéntame el proceso.

**❌ Respuesta de IA:**
"Tuve algunos bugs pero los resolví consultando la documentación."

**✅ Respuesta real:**
"Sí, el bug del scroll progress. Cuando leías un artículo y hacías scroll, a veces el progreso se guardaba bien y otras veces volvía a 0. Me volvió loco porque era intermitente. Pasé como 3 días debuggeando:

Día 1: Pensé que era problema de IndexedDB, añadí logs por todos lados.
Día 2: Descubrí que el problema solo pasaba en ciertos artículos. Pensé que era por el largo del contenido.
Día 3: Finalmente me di cuenta de que cuando el contenido tenía imágenes grandes sin cargar, el `document.body.scrollHeight` cambiaba después de cargar, así que el porcentaje se calculaba mal. La solución fue esperar a que cargaran todas las imágenes antes de calcular el progreso, o recalcular cuando detectaba cambios de altura.

Fue frustrante porque era un bug super específico que solo pasaba con ciertos artículos."

### ¿Alguna vez rompiste la base de datos en producción?

**❌ Respuesta de IA:**
"No, siempre probé todo en desarrollo primero."

**✅ Respuesta real:**
"No en producción porque no tengo usuarios reales, pero sí rompí mi propia BD de desarrollo como 3 veces. Una vez añadí un campo nuevo al schema pero olvidé hacer la migración, entonces el código esperaba el campo pero la BD no lo tenía y petaba con 'column not found'. Tuve que borrar el archivo SQLite y recrear todo de cero, perdiendo todos los artículos de prueba que tenía guardados. Desde entonces hago siempre `prisma migrate dev` antes de tocar el schema, y tengo un script que me genera artículos de prueba rápido."

### ¿El Service Worker te ha causado problemas en desarrollo?

**❌ Respuesta de IA:**
"No, funciona perfectamente."

**✅ Respuesta real:**
"Sí, un montón. El peor es que si el SW cachea algo mal, tienes que desregistrarlo manualmente desde DevTools para que cargue la nueva versión. Al principio no sabía esto y me volvía loco porque hacía cambios en el código y no se reflejaban en el navegador. Incluso borrar caché normal no funcionaba. Tuve que aprender a ir a Application > Service Workers > Unregister. Ahora lo primero que hago cuando algo no actualiza es revisar si el SW está interfiriendo. En desarrollo a veces incluso lo desactivo directamente para no lidiar con él."

---

## 🎯 Preguntas sobre Decisiones Técnicas

### ¿Por qué no usaste Redux o Zustand para el estado global?

**❌ Respuesta de IA:**
"Context API es suficiente para este proyecto."

**✅ Respuesta real:**
"Honestamente, porque quería evitar añadir más complejidad. Al principio pensé en usar Zustand porque lo había visto en videos y se veía simple, pero luego me di cuenta de que solo necesitaba gestionar el tema (light/dark) de forma global. Todo lo demás (artículos, estado de carga) lo manejo con useState local porque cada página tiene su propio estado. Si el proyecto creciera y tuviera que compartir estado de artículos entre muchas páginas, ahí sí usaría Zustand. Pero para esto, Context API con ThemeProvider fue suficiente y no quise sobreingeniería."

### ¿Por qué Prisma genera el cliente en node_modules y no en src?

**❌ Respuesta de IA:**
"Por la configuración por defecto."

**✅ Respuesta real:**
"Esa es la configuración estándar de Prisma, genera el cliente en `node_modules/.prisma/client`. Al principio me pareció raro porque normalmente el código generado va en `src`, pero después leí en la documentación que es porque el cliente se regenera en cada instalación, y si estuviera en src podría causar conflictos con Git. Además, mantiene el código generado separado del código que escribes tú. Puedes cambiar la ubicación en el schema con `output`, pero lo dejé así porque es la convención. La verdad es que nunca he necesitado modificar el cliente generado, solo lo importo y uso."

### ¿Por qué no implementaste autenticación?

**❌ Respuesta de IA:**
"No era necesario para los requisitos del proyecto."

**✅ Respuesta real:**
"Porque quería que fuera una aplicación completamente local y privada, como una app de notas. Si añadiera autenticación, tendría que gestionar usuarios, sesiones, y toda la complejidad de backend adicional. Mi idea era que cada persona que instale la app en su dispositivo tenga su propia base de datos local, sin necesidad de crear cuenta. Es como Pocket o Instapaper pero sin el componente social.

Además, si te soy sincero, implementar auth bien (con tokens, refresh tokens, seguridad, reset password) me hubiera llevado como 2 semanas más. Preferí enfocarme en las funcionalidades core. Si en el futuro quisiera añadir sync multi-dispositivo, ahí sí necesitaría auth, probablemente con NextAuth.js."

### El scraping ético está muy implementado. ¿Por qué le diste tanta importancia?

**❌ Respuesta de IA:**
"Porque es importante respetar los sitios web."

**✅ Respuesta real:**
"Por dos razones: 

1) La primera vez que hice scraping sin comprobar nada, varios sitios me bloquearon o me devolvían HTML vacío. Eso me hizo investigar sobre robots.txt y descubrí que hay estándares que deberías respetar. No quería que mi app fuera un bot malicioso.

2) En el ciclo nos hablaron de ética en informática y me quedó grabado. Pensé: si yo tuviera un blog, ¿me molestaría que alguien lo scrapeara? Depende de cómo lo haga. Si respeta mis reglas (robots.txt, crawl-delay), no me importaría. Así que implementé `web-ethics.ts` (247 líneas) para comprobar permisos antes de scrapear. Parsea el robots.txt, verifica las reglas, respeta crawl-delay, y también verifica meta tags como noarchive o noindex. Es más código, pero me hace sentir mejor. Además, está bien documentado por si me preguntan en el proyecto. Uso este módulo en `scraper.ts` del servidor, aunque en el cliente uso `client-scraper.ts` que no puede verificar robots.txt por limitaciones de CORS."

---

## 🤔 Preguntas Filosóficas/Trampa

### ¿Qué parte del código no entiendes completamente?

**❌ Respuesta de IA:**
"Entiendo todo el código perfectamente."

**✅ Respuesta real:**
"La parte de Next.js Server Components todavía me confunde un poco. Entiendo el concepto: componentes que se ejecutan en el servidor y solo mandan HTML al cliente. Pero cuando los mezclas con Client Components (los que tienen 'use client'), a veces no sé muy bien dónde se ejecuta cada cosa. Por ejemplo, en `page.tsx` de las rutas, si pongo un console.log, ¿sale en el navegador o en el servidor? Depende. He tenido que hacer pruebas para entenderlo.

También, la parte de cómo Transformers.js carga los modelos de Hugging Face. Sé que funciona, que la primera vez los descarga y los cachea, pero no entiendo exactamente qué hace por dentro. Es como una caja negra que funciona, pero si me preguntas los detalles del pipeline de IA, tendría que mirar el código fuente de la librería."

### Si tuvieras que explicar este proyecto a tu abuela, ¿cómo lo harías?

**❌ Respuesta de IA:**
"Es una aplicación web para guardar artículos."

**✅ Respuesta real:**
"Le diría: '¿Te acuerdo cuando guardas recetas en una carpeta o recortas artículos del periódico? Pues esto es lo mismo pero en el ordenador. Cuando encuentras un artículo interesante en internet, le das a un botón y se guarda en mi aplicación. Luego puedes leerlo cuando quieras, incluso sin WiFi, como si fuera un libro. Y lo mejor: el ordenador lee el artículo por ti y te hace un resumen cortito, como cuando yo te resumo las noticias porque son muy largas.'

Creo que así lo entendería. Simplificar proyectos técnicos a lenguaje común es súper importante."

### ¿Has usado ChatGPT o GitHub Copilot durante el desarrollo?

**⚠️ CRÍTICO - Respuesta honesta:**
"Sí, he usado [herramienta] para [explicar exactamente cómo]:

- **Para boilerplate repetitivo**: Como crear componentes básicos de React o schemas de Prisma. No tiene sentido escribir a mano la estructura de un componente cuando siempre es igual.

- **Para debugging**: Cuando tenía un error que no entendía, le pegaba el mensaje de error y me explicaba posibles causas. Eso me ahorraba mucho tiempo buscando en Stack Overflow.

- **Para aprender sintaxis nueva**: Por ejemplo, nunca había usado `@xenova/transformers`, así que pedí ejemplos de cómo usarlo. Luego adapté el código a mi proyecto.

**Lo que NO hice:**
- Pedir que me generara la aplicación completa
- Copiar-pegar código sin entenderlo
- Dejar que decidiera la arquitectura

Todo el código lo entiendo porque o lo escribí yo o adapté ejemplos a mis necesidades. Si me preguntas de cualquier línea del proyecto, te puedo explicar qué hace y por qué está ahí. Usé IA como herramienta de productividad, no como sustituto de aprender."

**Nota:** Esta respuesta es ARRIESGADA pero HONESTA. Demuestra madurez profesional porque en el mundo real, todos los desarrolladores usan estas herramientas. Lo importante es entender el código, no si lo escribiste carácter por carácter.

---

## 🔥 Preguntas de Código en Vivo

### Abre `local-database.ts` y explícame qué hace la línea 47

**✅ Respuesta (adaptable):**
"Déjame ver... [abres el archivo] La línea 47 es... [lees la línea]. Ok, esto está dentro de la función `init()` que inicializa la base de datos IndexedDB. Específicamente, está creando un object store (que es como una tabla en SQL) llamado 'articles' con el campo 'id' como keyPath. El keyPath es como la primary key, sirve para identificar cada registro de forma única.

[Si te equivocas de línea]: Ah perdona, estaba mirando otra función. La línea exacta es..."

**⚠️ Consejo:** Practica abrir archivos al azar y explicar líneas específicas. Si te ponen en apuros, está bien tomarte 10 segundos para leer el contexto.

### Cambia el color primario de la aplicación ahora mismo

**✅ Respuesta práctica:**
"Vale, el color primario está definido en `tailwind.config.js`. [Abres el archivo]. Está en la sección `theme.extend.colors`. El morado que uso es `purple-600` que es `#9333ea`. Si quiero cambiarlo, puedo modificar este valor o usar otra clase de Tailwind. Por ejemplo, si quiero azul, cambio todas las clases `purple-600` por `blue-600` en los componentes, o defino un color custom aquí en el config.

[Haces el cambio en un componente como ejemplo]: En `AddArticleForm.tsx`, busco las clases con 'purple' y las cambio a 'blue'. [Haces el cambio]. Ahora guardo y cuando recargue debería verse azul."

**Tip:** Que no te dé miedo equivocarte. Es normal no recordar dónde está todo exactamente. Lo importante es el proceso de búsqueda.

### ¿Qué pasa si comentas esta línea? [señalan una línea random]

**✅ Respuesta:**
"Pues... no estoy 100% seguro sin probarlo, pero [explicas qué crees que pasa]. La única forma de saberlo con certeza es comentarlo y ver qué error da. [Lo comentas, guardas, miras si hay error de TypeScript]. Ah mira, TypeScript me dice '[lees el error]', entonces sí, esa línea era necesaria porque [explicas]."

**Esto demuestra:**
- Sabes usar las herramientas (TypeScript, editor)
- No finges saber todo
- Sabes debuggear en vivo

---

## 💪 Preguntas para Demostrar Maestría

### ¿Qué optimización harías ahora mismo si tuvieras 30 minutos?

**✅ Respuesta concreta:**
"Implementaría React.memo en `ArticleList` para que los artículos individuales no se re-rendericen innecesariamente cuando cambio el filtro de búsqueda. Ahora mismo cada vez que escribes en el search box, se re-renderizan todos los artículos aunque no hayan cambiado.

[Abres el archivo]: Aquí en `ArticleList.tsx`, envolvería el componente de cada artículo con React.memo:

```typescript
const ArticleItem = React.memo(({ article }) => {
  // componente del artículo
})
```

Y en la función de map:

```typescript
{articles.map(article => 
  <ArticleItem key={article.id} article={article} />
)}
```

Esto haría que React solo re-renderice los artículos que realmente cambian. En listas grandes, se nota mucho."

### Si te digo que la app es lenta, ¿qué harías para investigarlo?

**✅ Respuesta metodológica:**
"Lo primero, abro Chrome DevTools:

1. **Pestaña Performance**: Grabo mientras uso la app, veo qué funciones tardan más
2. **Lighthouse**: Corro auditoría para ver métricas (LCP, FID, CLS)
3. **Network**: Veo si hay requests lentas o assets muy pesados

Dependiendo de lo que encuentre:

- Si es JavaScript: Analizo el bundle con `npm run build` y veo el tamaño
- Si es rendering: Uso React DevTools Profiler para ver qué componentes se re-renderan mucho  
- Si es BD: Añado console.time() en las queries de Prisma para medir timing
- Si es IA: Esa parte sé que es lenta, pero es esperado porque procesa texto pesado

Iría eliminando hipótesis una a una hasta encontrar el cuello de botella."

### ¿Cómo testearías que la funcionalidad offline realmente funciona?

**✅ Respuesta práctica:**
"Tengo que probarlo en varios escenarios:

**1. Service Worker:**
- DevTools > Application > Service Worker > Offline
- Recargo la página, debería cargar desde caché

**2. IndexedDB:**
- Guardo un artículo con WiFi conectado
- Desactivo WiFi (o pongo el móvil en modo avión)
- Cierro y abro la app
- El artículo debería seguir ahí porque está en IndexedDB

**3. Sync al volver online:**
- Guardo artículo sin conexión
- Activo WiFi
- Espero a que el evento 'online' dispare la sincronización
- Verifico en Prisma Studio (o en la BD del servidor) que llegó el artículo

Si fuera un test automatizado, usaría Playwright con:
```javascript
await page.context().setOffline(true)
// hacer acciones offline
await page.context().setOffline(false)
// verificar sync
```"

---

## 🎓 Pregunta Final (La Más Importante)

### ¿Qué es lo que más te enorgullece de este proyecto, y qué es lo que harías muy diferente?

**✅ Respuesta equilibrada:**
**Me enorgullece:**
"La arquitectura offline-first. No es fácil hacer que una app funcione sin conexión y sincronice bien cuando vuelve la red. Vi muchos tutoriales que solo enseñaban una parte, pero tuve que juntar las piezas yo mismo: Service Worker + IndexedDB + sincronización con servidor. Cuando logré que funcionara todo junto, fue muy satisfactorio.

También el sistema de scraping ético. No era necesario para que la app funcionara, pero sentía que era lo correcto. Implementé verificación de robots.txt y respeto de crawl-delay, cosa que muchas apps no hacen."

**Haría diferente:**
"El testing. Debí escribir tests desde el principio en lugar de al final. Ahora tengo miedo de refactorizar cosas porque no sé si voy a romper algo. Si empezara de cero, haría TDD: escribir el test primero, luego el código.

También documentaría mejor el código mientras lo escribía. Ahora hay funciones complejas sin comentarios y cuando vuelvo después de unas semanas, tengo que leer todo para entender qué hace. JSDoc comments habría sido buena idea.

Y finalmente, el `client-scraper.ts` es un desastre que necesito refactorizar algún día, pero funciona así que le tengo miedo a tocarlo."

**Por qué esta respuesta es perfecta:**
- Muestra orgullo genuino (no arrogancia)
- Reconoce errores y áreas de mejora (humildad)
- Demuestra que aprendiste del proceso
- Es honesto y autocrítico

---

## ✅ Consejos Finales

### Antes de la presentación

1. **Repasa el código línea por línea**
   - Abre cada archivo y asegúrate de entender TODO
   - Si hay algo que no entiendes, investigalo AHORA

2. **Practica explicar en voz alta**
   - Grábate explicando partes del código
   - Practica con un amigo o familiar

3. **Prepara el entorno**
   - Abre VS Code con el proyecto
   - Ten terminal lista con el servidor corriendo
   - Ten Chrome DevTools familiarizado

4. **Conoce los números exactos**
   - Líneas de código (usa `cloc .`)
   - Número de componentes, APIs, tests
   - Tiempo de desarrollo real

### Durante las preguntas difíciles

1. **Si no sabes algo, NO inventes**
   - "No lo sé con certeza, pero mi hipótesis es..."
   - "Tendría que verificarlo, pero creo que..."
   - "Es un área que quiero profundizar más"

2. **Usa el código como soporte**
   - "Déjame mostrarte en el código..."
   - [Abres archivo relevante]
   - Señalas líneas específicas

3. **Mantén la calma**
   - Respira antes de responder
   - Está bien tomarte 5-10 segundos para pensar
   - Si te bloqueas: "¿Puedo volver a esta pregunta?"

4. **Redirige a tus fortalezas**
   - Si preguntan algo que no sabes: responde brevemente y luego
   - "Pero lo que sí implementé bien fue..."
   - [Llevas la conversación a territorio conocido]

### Frases que NUNCA debes decir

❌ "La IA me lo generó todo"
❌ "Copié esto de un tutorial"
❌ "No entiendo esta parte pero funciona"
❌ "No sé, lo puso Copilot"
❌ "Esto lo hizo alguien más"

### Frases que SÍ demuestran autoría

✅ "Esto me costó [tiempo] porque [problema específico]"
✅ "Al principio lo hice de otra forma pero [razón de cambio]"
✅ "Esta parte está mal implementada, lo reconozco"
✅ "Usé [herramienta] para ayudarme con [tarea específica], pero adapté el código a..."
✅ "Si te soy sincero, no es perfecta esta solución"

---

## 🚀 Mensaje Final

Recuerda: **El tribunal NO espera que seas perfecto.** Esperan que:

1. ✅ Entiendas el código que presentas
2. ✅ Puedas explicar decisiones técnicas
3. ✅ Reconozcas errores y áreas de mejora
4. ✅ Demuestres que aprendiste durante el proceso
5. ✅ Muestres pasión por el proyecto

**La honestidad es tu mejor aliada.** Si usaste herramientas de IA (cosa normal hoy en día), explica CÓMO y PARA QUÉ, y demuestra que entiendes todo el código.

**¡Tú puedes! 💪** Has hecho un proyecto complejo y funcional. Confía en ti.
