# 📱 Cocoa Reader - Guía de Compilación iOS

## 🎯 Resumen
Tu app **Cocoa Reader** está 100% lista para compilar como app nativa de iOS usando Capacitor. Mantienes toda la funcionalidad local sin perder ninguna característica.

## ✅ ¿Qué está incluido?

### Funcionalidades Preservadas:
- ✅ **Procesamiento local de artículos** con @mozilla/readability
- ✅ **Base de datos SQLite local** para privacidad total
- ✅ **Funciona 100% offline** sin necesidad de internet
- ✅ **Scraping client-side** de contenido web
- ✅ **Sharing limpio** sin información de debug
- ✅ **Dark mode** automático
- ✅ **Gestión de favoritos y progreso de lectura**

### Mejoras Nativas para iOS:
- 📱 **App nativa real** (no WebView wrapper)
- 🎨 **Splash screen** personalizada
- 📤 **Sharing nativo** de iOS
- 🌐 **Browser nativo** para enlaces externos
- ⚡ **Mejor rendimiento** que PWA
- 🔧 **Status bar** personalizada

## 🚀 Comandos Rápidos

### Build y Compilación:
```bash
# Build completo para iOS
npm run build:ios

# O usar el script directo
./build-ios.sh

# Abrir en Xcode
npm run ios:open

# Solo sincronizar cambios
npm run ios:sync
```

### Desarrollo Independiente:
```bash
# Versión PWA (desarrollo web)
npm run dev

# Versión iOS (después de cambios)
npm run build:ios && npm run ios:open
```

## 📋 Pasos para Compilar

### 1. **Build Automático**
```bash
npm run build:ios
```

### 2. **Abrir Xcode**
Se abrirá automáticamente, o ejecuta:
```bash
npm run ios:open
```

### 3. **Configurar en Xcode**
1. **Bundle Identifier**: Cambia `coco.reader.app` por tu ID único (ej: `com.tudominio.cocoereader`)
2. **Signing**: Selecciona tu equipo de desarrollo
3. **Device/Simulator**: Elige tu dispositivo o simulador

### 4. **Compilar y Ejecutar**
1. Presiona ▶️ en Xcode
2. La app se instalará automáticamente
3. ¡Disfruta tu app nativa! 🎉

## 🔄 Workflow de Desarrollo

### Para Desarrollo Web (PWA):
```bash
npm run dev  # Puerto 3000
```

### Para Compilar iOS (después de cambios):
```bash
npm run build:ios
npm run ios:open
```

### ⚠️ Importante:
- Ambas versiones son **independientes**
- Los cambios en web **NO** afectan automáticamente a iOS
- Ejecuta `build:ios` después de hacer cambios web

## 📁 Estructura del Proyecto

```
cocoa-readerweb/
├── src/                 # Código fuente web
├── ios/                 # Proyecto iOS nativo
│   └── App/App/public/  # Assets web copiados
├── out/                 # Build estático
├── capacitor.config.ts  # Configuración Capacitor
└── build-ios.sh        # Script de build
```

## 🔧 Configuración Avanzada

### Cambiar Nombre de App:
Edita `capacitor.config.ts`:
```typescript
appName: 'Tu Nombre de App'
```

### Cambiar ID de Bundle:
Edita `capacitor.config.ts`:
```typescript
appId: 'com.tudominio.tuapp'
```

### Personalizar Splash Screen:
Edita los colores en `capacitor.config.ts`:
```typescript
SplashScreen: {
  backgroundColor: "#tu-color"
}
```

## 📤 Distribución

### TestFlight (Beta):
1. Archive en Xcode
2. Upload to App Store Connect
3. Distribuir via TestFlight

### App Store:
1. Archive en Xcode
2. Submit for Review
3. Publicar en App Store

## ⭐ Ventajas de esta Implementación

### ✅ **Total Independencia**:
- Desarrollo web continúa sin restricciones
- App iOS funciona completamente offline
- Sin dependencias externas

### ✅ **Privacidad Máxima**:
- Todo el procesamiento es local
- Sin APIs externas
- Sin tracking ni telemetría

### ✅ **Funcionalidad Completa**:
- Extracción de contenido web
- Base de datos local
- Sharing entre apps
- Gestión de favoritos

### ✅ **Experiencia Nativa**:
- App real de iOS (no web wrapper)
- Integración con sistema operativo
- Rendimiento optimizado

## 🎊 ¡Felicidades!

Tu **Cocoa Reader** ahora es una verdadera app nativa de iOS manteniendo toda su funcionalidad local y privada. Puedes seguir desarrollando la versión web independientemente y compilar para iOS cuando necesites actualizar la app nativa.

**¡Tu app de lectura privada y local está lista para el App Store!** 🚀📱
