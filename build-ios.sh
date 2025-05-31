#!/bin/bash

# Cocoa Reader - Build script para iOS
echo "🚀 Compilando Cocoa Reader para iOS..."

# 1. Generar build estático
echo "📦 Generando build estático..."
npx next build

if [ $? -ne 0 ]; then
    echo "❌ Error en el build de Next.js"
    exit 1
fi

# 2. Sincronizar con Capacitor
echo "📱 Sincronizando con Capacitor iOS..."
npx cap sync ios

if [ $? -ne 0 ]; then
    echo "❌ Error sincronizando con Capacitor"
    exit 1
fi

echo "✅ Build completado exitosamente!"
echo ""
echo "📋 Pasos siguientes:"
echo "1. Abrir Xcode: npx cap open ios"
echo "2. Conectar tu dispositivo iOS o seleccionar simulator"
echo "3. Cambiar el Bundle Identifier si es necesario"
echo "4. Presionar ▶️ para compilar y ejecutar"
echo ""
echo "🎉 ¡Tu app Cocoa Reader está lista para iOS!"
