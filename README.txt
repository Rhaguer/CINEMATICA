🎵 CIMÁTICA 2025 – El Arte del Sonido
--------------------------------------

Autores: Lorenzo Haguer (5toA) y Lorenzo Haguer Raggi
Proyecto de Feria Científica – Escuela Gabriela – Año 2025

📁 Archivos principales:
│
├── index.html         ← Aplicación principal (interfaz responsiva)
├── manifest.json      ← Configuración de instalación PWA
├── service-worker.js  ← Funciona sin conexión (offline)
├── icon512.png        ← Ícono principal de la app
└── icon192.png        ← Ícono secundario

🧩 Cómo ejecutarlo:
1. Guarda todos los archivos en una carpeta, por ejemplo:
   C:\Users\NASHO\Desktop\CimaticaApp_Feria2025

2. Abre la consola (CMD o PowerShell):
   cd "C:\Users\NASHO\Desktop\CimaticaApp_Feria2025"
   python -m http.server 8000

3. Abre el navegador y entra en:
   http://localhost:8000

4. Cuando cargue la app, abre el menú ⋮ → "Agregar a pantalla de inicio".
   ¡Listo! Ya tendrás la app CIMÁTICA 2025 instalada sin conexión.

🎚️ Características:
- Generador de ondas graves reales (20–400 Hz)
- Selector de forma de onda (senoidal, cuadrada, triangular, diente de sierra)
- Visualización en osciloscopio
- Registro automático de experimentos (almacenamiento local)
- Funciona sin Internet (Service Worker + LocalStorage)
- Compatible con tablets, celulares y notebooks

🎯 Consejos:
- Usa audífonos o parlante externo para mejor resultado.
- Comienza con frecuencias entre 40 y 80 Hz para ver vibraciones claras.
- En tablet, gira la pantalla a modo horizontal para una experiencia de feria.

🌐 Para generar APK:
1. Sube la carpeta a https://app.netlify.com/drop
2. Copia la URL resultante (ej: https://cimatica2025.netlify.app)
3. Ve a https://www.pwabuilder.com y pega esa URL → "Build
