# Familias Palmete - Vivienda Digna

Web de denuncia y organización vecinal por vivienda digna. Nace de la victoria de **11 familias del barrio de Palmete (Sevilla)** que frenaron desahucios ilegales y consiguieron alquileres VPO de **200€/mes**.

El sitio incluye un **mapa interactivo** donde cualquier persona puede reportar alquileres abusivos en Andalucía, ver la situación de la vivienda en Sevilla, conocer la historia de la victoria de Palmete y organizarse colectivamente.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Framework | [Astro 4](https://astro.build/) (SSR) |
| Servidor | Node.js (`@astrojs/node`, modo standalone) |
| Base de datos | MySQL 8.0 (`mysql2` + Docker Compose) |
| Mapas | Leaflet.js + MarkerCluster + Heatmap |
| Autenticación | Token base64 (30 min expiración) |

## Requisitos previos

Antes de empezar, necesitas instalar **Node.js**, **npm** y **Docker** (con Docker Compose) en tu sistema.

### Instalar Node.js y npm

#### Linux (Ubuntu / Debian)

```bash
# Actualizar repositorios
sudo apt update

# Instalar Node.js y npm (versión LTS recomendada)
sudo apt install -y nodejs npm

# Verificar instalación
node --version   # Debería mostrar v18.x o superior
npm --version    # Debería mostrar 9.x o superior
```

#### Linux (Fedora / RHEL)

```bash
sudo dnf install -y nodejs npm
node --version
npm --version
```

#### Linux (Arch Linux)

```bash
sudo pacman -S nodejs npm
node --version
npm --version
```

#### macOS

Opción A - Con [Homebrew](https://brew.sh/) (recomendado):
```bash
brew install node
node --version
npm --version
```

Opción B - Descargar instalador desde [nodejs.org](https://nodejs.org/)

#### Windows

Descarga el instalador LTS desde [nodejs.org](https://nodejs.org/) y ejecútalo. Asegúrate de marcar la opción que instala las herramientas de compilación (build tools).

Tras la instalación, abre una terminal (PowerShell o CMD) y verifica:

```cmd
node --version
npm --version
```

---

## Paso a paso para ejecutar el proyecto

### 1. Clonar el repositorio

Abre una terminal y navega a la carpeta donde quieras guardar el proyecto:

```bash
cd ~/Escritorio   # O la carpeta que prefieras
git clone <URL_DEL_REPOSITORIO>
cd FamiliasPalmete
```

### 2. Instalar las dependencias

```bash
npm install
```

Este comando descarga e instala todas las librerías necesarias (Astro, MySQL, etc.) en la carpeta `node_modules/`. Solo se ejecuta una vez, o cada vez que cambie `package.json`.

### 3. Configurar variables de entorno

El proyecto necesita un archivo `.env` con las credenciales del panel de administración.

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

O créalo manualmente:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=TuContraseñaSegura

DB_HOST=localhost
DB_PORT=3306
DB_USER=familiaspalmete
DB_PASSWORD=familiaspalmete
DB_NAME=familiaspalmete
```

> **Nota:** Si no existe el archivo `.env` pero sí un `.env.example` en el repositorio, copia ese archivo. Si no existe ninguno, crea el archivo `.env` con las credenciales que quieras.

### 4. Inicializar la base de datos (MySQL con Docker)

```bash
# Arrancar MySQL en Docker
docker compose up -d

# (Opcional) Crear la tabla manualmente si no se creó sola
node db/setup.js
```

El contenedor de MySQL crea la tabla `rent_reports` automáticamente al iniciar por primera vez mediante `db/init.sql`. La primera vez puede tardar unos segundos mientras MySQL se inicializa.

### 5. Arrancar el servidor de desarrollo

```bash
npm run dev
```

El servidor se iniciará y mostrará una URL, normalmente:

```
  LOCAL   http://localhost:4321/
```

Abre esa URL en tu navegador. El servidor recarga automáticamente cada vez que modificas un archivo.

### 6. Construir para producción

Cuando estés listo para desplegar:

```bash
npm run build
```

Esto genera los archivos optimizados en `dist/`.

### 7. Previsualizar la build de producción

```bash
npm run preview
```

Inicia un servidor local con los archivos de producción para verificar que todo funciona correctamente.

---

## Estructura del proyecto

```
FamiliasPalmete/
├── db/                         # Base de datos
│   ├── connection.js           # Pool de conexión MySQL
│   ├── init.sql                # Esquema inicial (se ejecuta en Docker)
│   └── setup.js                # Script de inicialización manual
├── public/                     # Archivos estáticos (imágenes, favicon)
├── src/
│   ├── components/
│   │   ├── layout/             # Header, Hero
│   │   ├── sections/           # BannerInfo, CTASection, Features, Story
│   │   └── ui/                 # Badge, Button, Modal, MediaBadge, Section
│   ├── layouts/
│   │   └── Layout.astro        # Plantilla base HTML (SEO, fuentes, footer)
│   ├── pages/
│   │   ├── index.astro         # Home
│   │   ├── el-problema/        # Estadísticas crisis vivienda
│   │   ├── la-solucion/        # Roadmap + historia Palmete
│   │   ├── mapa/               # Mapa interactivo Leaflet
│   │   ├── privacidad/         # Política de privacidad (RGPD)
│   │   ├── admin/              # Login + panel de administración
│   │   └── api/                # Endpoints REST
│   │       ├── submit.json.js       # POST: reportar alquiler
│   │       ├── map-data.json.js     # GET: datos para el mapa
│   │       ├── alquileres.ts        # GET: listado paginado (admin)
│   │       ├── alquileres/[id].ts   # DELETE: borrar registro
│   │       ├── login.ts             # POST: autenticación admin
│   │       └── verify-token.ts      # POST: verificar token
│   └── styles/               # CSS global, componentes, admin
├── docker-compose.yml        # MySQL 8.0 en contenedor
├── astro.config.mjs          # Configuración Astro (SSR + Node.js)
├── package.json              # Dependencias y scripts
├── tsconfig.json             # Configuración TypeScript
└── .env                      # Variables de entorno (NO subir a git)
```

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Construye para producción |
| `npm run preview` | Previsualiza la build de producción |
| `npm run astro` | CLI de Astro (ej: `npx astro check` para verificar tipos) |

## Despliegue

Al usar el adaptador `@astrojs/node` en modo **standalone**, la build genera un ejecutable Node.js autocontenido:

```bash
npm run build
node ./dist/server/entry.mjs
```

El servidor escuchará en el puerto configurado (por defecto 4321). Compatible con cualquier servidor que ejecute Node.js (VPS, Railway, Render, etc.).

## Seguridad y anti-spam

El mapa interactivo incluye protecciones contra envíos masivos y duplicados:

### Fingerprint del navegador

Cada usuario genera un identificador único basado en características de su dispositivo que se envía con cada reporte:

- **User agent** del navegador
- **Resolución de pantalla**
- **Idioma del sistema**
- **Zona horaria**
- **Núcleos del procesador** (`navigator.hardwareConcurrency`)
- **Memoria RAM** (`navigator.deviceMemory`)
- **Profundidad de color**

Estos datos se combinan y se hash en un identificador tipo `fp_x7k9m2`.

### Límite: 1 envío por usuario

El servidor comprueba si el fingerprint ya existe en la base de datos antes de aceptar un nuevo reporte. Si ya ha enviado un alquiler, recibe un error `409` (Conflicto):

```json
{ "error": "Ya has enviado un alquiler. Solo se permite un envío por usuario." }
```

Los administradores (con sesión activa) pueden saltarse esta restricción.

### Validación de campos

El servidor rechaza envíos incompletos (`400`) si faltan campos obligatorios: `lat`, `lng`, `zona` o `precio`.

## Cómo contribuir

### Clonar el repositorio

Puedes clonar el repositorio de dos formas:

**HTTPS** (lectura y escritura con token):
```bash
git clone https://github.com/<usuario>/FamiliasPalmete.git
```

**SSH** (recomendado para contribuir frecuentemente):
```bash
git clone git@github.com:<usuario>/FamiliasPalmete.git
```

> Para usar SSH necesitas configurar una clave SSH en tu cuenta de GitHub. Sigue los pasos más abajo.

### Configurar una clave SSH en GitHub

Si nunca has usado SSH con GitHub, sigue estos pasos:

#### 1. Generar una clave SSH

Abre una terminal y ejecuta:

```bash
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
```

- Pulsa **Enter** para usar la ruta por defecto
- Pulsa **Enter** para no poner passphrase (o escribe una si prefieres)
- Pulsa **Enter** de nuevo para confirmar

Si tu sistema no soporta `ed25519`, usa:
```bash
ssh-keygen -t rsa -b 4096 -C "tu-email@ejemplo.com"
```

#### 2. Copiar la clave pública

```bash
# Para ed25519
cat ~/.ssh/id_ed25519.pub

# Para RSA
cat ~/.ssh/id_rsa.pub
```

Copia **todo** el contenido (empieza por `ssh-ed25519` o `ssh-rsa` y termina con tu email).

#### 3. Añadir la clave a GitHub

> **Importante:** La clave SSH se añade a **tu propia cuenta personal de GitHub**, no a la cuenta del proyecto.

1. Inicia sesión en GitHub con **tu cuenta personal**
2. Ve a [Settings > SSH and GPG keys](https://github.com/settings/keys)
3. Haz clic en **"New SSH key"**
4. Ponle un título (ej: "Mi portátil")
5. Pega la clave pública en el campo **"Key"**
6. Haz clic en **"Add SSH key"**

#### 4. Acceso al repositorio

Una vez tengas tu clave SSH configurada, necesitas permisos de escritura en el repositorio. Hay dos formas:

**Opción A — Como colaborador directo** (para trabajo en equipo):
El propietario del repositorio debe invitarte como colaborador:

1. El dueño del repo va a `Settings > Collaborators`
2. Busca tu usuario de GitHub y te envía la invitación
3. Aceptas la invitación desde tu email o desde las notificaciones de GitHub
4. Una vez aceptada, puedes hacer push directamente a cualquier rama

**Opción B — Fork + Pull Request** (para contribuciones puntuales):
No necesitas ser colaborador:

1. Haz clic en **"Fork"** en la página del repositorio (se copia a tu cuenta personal)
2. Clona tu fork y trabaja normalmente
3. Cuando termines, abre un **Pull Request** desde tu fork hacia el repositorio original
4. El propietario revisará y fusionará tus cambios

Si tu objetivo es colaborar de forma habitual, la **Opción A** es la más cómoda. Si es una contribución puntual, la **Opción B** es suficiente.

#### 5. Verificar la conexión

```bash
ssh -T git@github.com
```

Deberías ver: `Hi <usuario>! You've successfully authenticated, but GitHub does not provide shell access.`

### Flujo de contribución

#### Si eres colaborador del repositorio

1. **Crea una rama** con un nombre descriptivo:
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```

2. **Haz tus cambios** y verifica que todo funciona:
   ```bash
   npm run dev
   ```

3. **Haz commit** con un mensaje claro:
   ```bash
   git add .
   git commit -m "feat: añadir nueva sección de testimonios"
   ```

4. **Sube la rama** a GitHub:
   ```bash
   git push -u origin feature/mi-nueva-funcionalidad
   ```

5. **Abre un Pull Request** desde GitHub con una descripción de los cambios.

#### Si has hecho un fork del repositorio

1. Clona tu fork (no el repositorio original):
   ```bash
   git clone git@github.com:tu-usuario/FamiliasPalmete.git
   ```

2. **Añade el repo original como remoto** para mantenerlo actualizado:
   ```bash
   git remote add upstream git@github.com:usuario-original/FamiliasPalmete.git
   ```

3. Sigue los pasos 1-3 de arriba (rama, cambios, commit).

4. **Sube la rama a tu fork**:
   ```bash
   git push -u origin feature/mi-nueva-funcionalidad
   ```

5. **Abre un Pull Request** desde tu fork hacia el repositorio original desde la interfaz de GitHub.

### Convenciones de commit

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de un bug |
| `docs:` | Cambios en documentación |
| `style:` | Cambos de estilo (CSS, formato, sin cambio funcional) |
| `refactor:` | Refactorización de código |
| `chore:` | Tareas de mantenimiento (dependencias, config) |

El proyecto incluye optimización SEO en todas las páginas:

- **Meta tags**: descripción, canonical, robots
- **Open Graph**: título, descripción, imagen, tipo, locale
- **Twitter Cards**: summary_large_image con imagen
- **JSON-LD**: datos estructurados Schema.org (WebSite + Organization)

Cada página tiene su propia `description` personalizada para mejorar el posicionamiento en buscadores.
