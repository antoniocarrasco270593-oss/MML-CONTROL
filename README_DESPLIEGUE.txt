
GUÍA RÁPIDA DE DESPLIEGUE (CLOUD)
=================================

Esta carpeta contiene TODO lo necesario para subir tu proyecto a la nube.
He limpiado los archivos basura para que pese poco.

PASO 1: GITHUB (Donde se guarda el código)
------------------------------------------
1. Entra a https://github.com/new y crea un repositorio llamado "mml-control".
2. Selecciona "Public".
3. Dale a "Create repository".
4. En la siguiente pantalla, busca la opción "uploading an existing file".
5. ARRASTRA todo el contenido de esta carpeta (`CARPETA_PARA_GITHUB`) ahí dentro.
6. Espera a que suban y dale al botón verde "Commit changes".

PASO 2: RENDER (Backend - El Cerebro)
-------------------------------------
1. Entra a https://dashboard.render.com/ y crea una cuenta.
2. Pulsa "New +" -> "Web Service".
3. Conecta tu cuenta de GitHub y selecciona el repo "mml-control".
4. En la configuración, asegúrate de esto:
   - Name: mml-control-api
   - Root Directory: backend
   - Runtime: Python 3
   - Build Command: pip install -r requirements.txt
   - Start Command: gunicorn main:app -k uvicorn.workers.UvicornWorker
5. Dale a "Create Web Service".
6. Espera a que salga "Live". COPIA la URL que te dan (ej: https://mml-control-api.onrender.com).

PASO 3: VERCEL (Admin Panel - La Web)
-------------------------------------
1. Entra a https://vercel.com/new y conecta GitHub.
2. Importa el repo "mml-control".
3. En "Root Directory", dale a "Edit" y selecciona la carpeta `admin_panel`.
4. Despliega la sección "Environment Variables" y añade:
   - Key: VITE_API_URL
   - Value: (Pega la URL de Render del Paso 2)
5. Dale a "Deploy".

¡LISTO! Ahora tendrás tu panel accesible desde cualquier lugar.
