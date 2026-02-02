# Fichaje App - Proyecto Completo

Este directorio contiene el código fuente completo para la aplicación de fichaje de repartidores.

## Estructura del Proyecto

1.  **backend/** (El Cerebro)
    *   Contiene el servidor que gestiona la base de datos, los usuarios y el rastreo GPS.
    *   Tecnología: Python (FastAPI).
   
2.  **mobile_app/** (La App del Repartidor)
    *   El código fuente para crear la aplicación de Android y iPhone.
    *   Contiene las pantallas de Login, Dashboard de Fichaje y Rastreo GPS.
    *   Tecnología: Flutter (Dart).

3.  **admin_panel/** (El Panel de Control)
    *   La página web para que tú (Antonio) veas a los trabajadores en tiempo real.
    *   Tecnología: React.

## Instrucciones de Instalación

Como este es el código fuente, se necesita "compilar" para generar la App instalable.

### Paso 1: Backend (Servidor)
1.  Instala Python: [python.org](https://www.python.org/downloads/)
2.  Abre una terminal en la carpeta `backend/`.
3.  Ejecuta: `pip install -r requirements.txt`
4.  Inicia el servidor: `uvicorn main:app --reload`
5.  El servidor estará activo en: `http://localhost:8000`

### Paso 2: App Móvil
1.  Instala Flutter: [flutter.dev](https://docs.flutter.dev/get-started/install/windows)
2.  Abre una terminal en la carpeta `mobile_app/`.
3.  Ejecuta: `flutter pub get`
4.  Para generar el archivo instalable (APK):
    *   Ejecuta: `flutter build apk`
    *   El archivo estará en: `build/app/outputs/flutter-apk/app-release.apk`
5.  Envía ese archivo a los móviles de los repartidores.

### Paso 3: Panel Admin
1.  Instala Node.js: [nodejs.org](https://nodejs.org/)
2.  Abre una terminal en la carpeta `admin_panel/`.
3.  Ejecuta: `npm install`
4.  Inicia el panel: `npm run dev`
5.  Abre el navegador en la dirección que te muestre.

---
**Nota Importante:** Este código está configurado para un entorno de desarrollo. Para usarlo en producción real con muchos usuarios, necesitarás subir el "Backend" a un servidor en la nube (como AWS o Render).
