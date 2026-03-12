# Ficha de Corrección de Errores - ApuntesIT 24/7

En este documento se detallan los errores encontrados en el proyecto, su causa y la solución técnica aplicada para prepararlo para producción.

---

## 1. Pérdida de Archivos e Imágenes al Suspenderse el Servidor
**Problema:** En servidores gratuitos o sin estado persistente local (como Render), el servidor se "duerme". Al reiniciarse, el sistema borraba todos los avatares, PDFs y fotos de apuntes, ya que estaban almacenados físicamente en la carpeta `/uploads/` del sistema de archivos local.
**Causa:** Se utilizaba `multer.diskStorage()` para guardar en el disco del servidor.
**Solución Técnica:** 
- Se migró toda la capa de almacenamiento para no depender del disco. 
- Se creó un esquema `File` en **MongoDB** para convertir los archivos a un buffer binario (Buffer Data). 
- Se modificó `multer.memoryStorage()` para interceptar la subida en RAM y pasar los bytes directos a la Base de Datos.
- Se implementaron las rutas `/api/files/view/:id` y `/api/files/download/:id` para procesarlos de vuelta a un archivo físico al cliente.
- Se desarrolló el script `migrate_to_db.js` para mover todos los archivos locales preexistentes a MongoDB, eliminando la carpeta `/uploads` y añadiéndola al `.gitignore`.
**Estado Actual:** Las fotos y documentos perduran indefinidamente en la base de datos MongoDB Atlas. Ya no hay pérdida de datos en despliegue.

---

## 2. Layout y Navegación Rota en Dispositivos Móviles
**Problema:** Al ver la aplicación desde un teléfono, los componentes solapaban el contenido, la navegación resultaba errática y la barra superior móvil no se mostraba bien.
**Causa:** El contenedor base de React Router (`RootLayout.jsx`) tenía un `div` con la clase `flex` por defecto (que aplica orientación horizontal de fila). Esto causaba que la barra de navegación superior de móviles se inyectara como una columna al lado del contenido en lugar de situarse arriba.
**Solución Técnica:** 
- Se cambió el flexbox estructural a `<div className="flex flex-col md:flex-row ...">`.
- En escritorio se mantiene la fila (Barra lateral a la izquierda).
- En móviles pasa a columna vertical respetando que el `Top Bar` ocupe todo el ancho y no rompa los márgenes de los apuntes.
**Estado Actual:** Diseño *responsive* consistente en cualquier resolución, sin contenido aplastado o fugado.

---

## 3. Fallo y Confusión en la Funcionalidad de Portadas
**Problema:** Existía un input en el formulario de subidas para inyectar una "Imagen de Portada" personalizada para cada apunte. Esta función daba problemas al parsearse en el frontend y recargaba el grid inconsistentemente.
**Solución Técnica / Rediseño:** 
- Se depuró todo el código frontend en `Category.jsx` y `Profile.jsx` para eliminar completamente este *input*.
- Se hizo un barrido masivo en la base de datos reasignando un fondo estético por defecto para estructurar visualmente todas las publicaciones de igual modo.
**Estado Actual:** Proceso de subida de apuntes mucho más ligero y a prueba de caídas al requerir menos carga asíncrona redundante.

---

## 4. Experiencia de Usuario (Navegación Intuitiva y UI)
**Problema:** Ciertas pantallas terminales (como el Panel de Administración o la visualización de un Apunte concreto) presentaban difícil retorno sin forzar el menú principal. En el perfil, mostrar la foto y nombre en los propios apuntes subidos era redundante.
**Solución Técnica:**
- Se insertaron selectores semánticos (`<FiArrowLeft />`) en formato cadena (breadcrumbs) como botones de "Volver atrás".
- Se eliminó el bloque de Autor durante el mapeo de `userPosts.map` dentro de la vista de Pefil personal, mostrando una tabla limpia y concentrada solo en el material subido y su interacción.
**Estado Actual:** Navegación en red más usable y adaptada a la costumbre instintiva del usuario móvil (atrás, adelante).

---

## 5. Preparación Módulos para Producción
**Problema:** El código de Node.js (backend) y Vite/React (frontend) se mezclaban causando cruces de puerto e imposibilitando conectar el despliegue nativo de Vercel/Render correctamente.
**Solución Técnica:**
- Separación de contextos de compilación.
- Implementación de entorno seguro usando la librería `dotenv`.
- Inyección de variables paramétricas: Sustituir `localhost:27017` por `process.env.MONGO_URI` y todos los *fetches* del cliente por `import.meta.env.VITE_API_URL`.
**Estado Actual:** Listo para su subida a la nube separando roles (Frontend estático -> Vercel, API dinámica -> Render, DB -> MongoDB Atlas).

---

## 6. Error 404 al Recargar la Página en Repositorios Cloud (Vercel)
**Problema:** Al navegar de forma nativa por la página (React Router) todo funciona correctamente, pero al recargar el navegador (F5/Refresh) en páginas anidadas como `/perfil` o `/category/asir`, Vercel devolvía un Error 404.
**Causa:** Vercel de forma nativa busca un archivo físico para cada URL (ej: busca un archivo `asir.html` dentro de la carpeta `category/`). Al ser una Single Page Application (SPA), estas rutas son virtuales y manejadas por JS.
**Solución Técnica:**
- Se ha creado un archivo explícito de redirección `vercel.json` en la carpeta `frontend/`.
- Este archivo intercepta todas las peticiones `/(.*)` que no coincidan con un archivo físico y las redirige silenciosamente al archivo de entrada principal `index.html`.
**Estado Actual:** Las recargas funcionan globalmente en SPA alojadas estáticamente, delegando de nuevo a React el enrutamiento correcto de la URL activa.

---

## 7. Avatares Rotos al Actualizar Perfil de Usuario
**Problema:** Pese a migrar correctamente el almacenamiento de fotografías, si el usuario intentaba establecerse una nueva foto de perfil, resultaba en un archivo inválido que no se mostraba.
**Causa:** El controlador de actualización `/api/auth/avatar` internamente seguía empleando el acceso físico `req.file.filename` esperando un fichero en disco local `/uploads/`.
**Solución Técnica:**
- Se corrigió el endpoint del Backend, sustituyendo el parseo al modelo obsoleto por el de Memoria.
- Se capturan las subidas interceptadas como fragmentos intermedios y se construyen en el modelo Mongoose `File`, pasándose el buffer ininterrumpido.
- Posterior indexación del enrutado API `/api/files/view/[ID]` sobre la BD.
**Estado Actual:** La subida de nuevos avatares se registra permanentemente en la base segura, viéndose al instante.
