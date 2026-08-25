# Guía de instalación — Gestión de Árbitros

## Estructura del proyecto

```
appArbitroClaude/
├── app/
│   ├── controllers/        ← endpoints HTTP (FastAPI routers)
│   │   ├── auth_controller.py
│   │   ├── usuario_controller.py
│   │   ├── torneo_controller.py
│   │   ├── partido_controller.py
│   │   └── asignacion_controller.py
│   ├── core/               ← seguridad y dependencias compartidas
│   │   ├── security.py     (JWT, bcrypt)
│   │   └── dependencies.py (get_current_user, require_admin...)
│   ├── models/             ← tablas SQLAlchemy (ORM)
│   │   ├── usuario.py
│   │   ├── torneo.py
│   │   ├── partido.py
│   │   └── asignacion.py
│   ├── repositories/       ← acceso a base de datos
│   │   ├── usuario_repository.py
│   │   ├── torneo_repository.py
│   │   ├── partido_repository.py
│   │   └── asignacion_repository.py
│   ├── schemas/            ← validación Pydantic (request/response)
│   │   ├── usuario.py
│   │   ├── torneo.py
│   │   ├── partido.py
│   │   └── asignacion.py
│   ├── services/           ← lógica de negocio
│   │   ├── auth_service.py
│   │   ├── usuario_service.py
│   │   ├── torneo_service.py
│   │   ├── partido_service.py
│   │   └── asignacion_service.py
│   ├── config.py           ← variables de entorno
│   ├── database.py         ← conexión SQLAlchemy + sesión
│   └── main.py             ← entrada de la app + seed inicial
├── frontend/
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   ├── api.js          ← cliente HTTP con auto-refresh JWT
│   │   └── main.js         ← toda la lógica del dashboard
│   ├── index.html          ← pantalla de login
│   └── dashboard.html      ← dashboard principal
├── .env                    ← variables de entorno (NO subir a git)
├── requirements.txt
└── GUIA_INSTALACION.md
```

---

## Paso 1 — Verificar Python

Abrí la terminal (PowerShell en Windows) y corré:

```
python --version
```

Tiene que ser **3.10 o mayor**. Si no tenés Python, descargalo desde https://python.org y durante la instalación marcá "Add Python to PATH".

---

## Paso 2 — Crear el entorno virtual

Dentro de la carpeta del proyecto (`appArbitroClaude`):

```
python -m venv venv
```

Esto crea una carpeta `venv/` con un Python aislado solo para este proyecto.

---

## Paso 3 — Activar el entorno virtual

Cada vez que abras una terminal nueva, tenés que activarlo:

**Windows PowerShell:**
```
venv\Scripts\Activate.ps1
```

**Windows CMD:**
```
venv\Scripts\activate.bat
```

**Mac / Linux:**
```
source venv/bin/activate
```

Sabrás que está activo porque la terminal muestra `(venv)` al principio.

> Si PowerShell te dice "no se puede cargar el script", corré primero:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

---

## Paso 4 — Instalar dependencias

Con el venv activo:

```
pip install -r requirements.txt
```

Esto instala FastAPI, SQLAlchemy, JWT, bcrypt y todo lo necesario.

---

## Paso 5 — Configurar el .env

El archivo `.env` ya viene con valores por defecto. Antes de usar en producción cambiá `SECRET_KEY` por una clave larga y aleatoria. Para desarrollo local no hace falta tocar nada.

---

## Paso 6 — Levantar el servidor

```
python -m uvicorn app.main:app --reload
```

La primera vez que corra, SQLAlchemy **crea automáticamente** la base de datos SQLite (`arbitros.db`) y crea un usuario admin inicial.

Verás en la terminal:
```
✅  Admin creado — email: admin@arbitros.com  |  contraseña: admin1234
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

## Paso 7 — Abrir la app

Abrí el navegador en:

- **Login:**      http://localhost:8000
- **Dashboard:**  http://localhost:8000/dashboard
- **API docs:**   http://localhost:8000/api/docs

---

## Usuario inicial

| Campo      | Valor                |
|------------|----------------------|
| Email      | admin@arbitros.com   |
| Contraseña | admin1234            |
| Rol        | admin                |

Podés cambiar la contraseña o crear nuevos usuarios desde el dashboard.

---

## Base de datos

No requiere instalación extra. SQLite crea el archivo `arbitros.db` automáticamente en la raíz del proyecto la primera vez que corrés el servidor.

Si querés resetear la base de datos, simplemente borrá el archivo `arbitros.db` y volvé a correr el servidor.

---

## Roles del sistema

| Rol          | Permisos                                              |
|--------------|-------------------------------------------------------|
| admin        | Todo: crear/editar/eliminar torneos, partidos, árbitros |
| organizacion | Crear torneos y partidos, asignar árbitros            |
| arbitro      | Solo lectura: ver partidos y torneos                  |

---

## Flujo de uso típico

1. Entrás como **admin** → creás árbitros desde "Árbitros y Usuarios"
2. Creás un **torneo** desde la sección Torneos
3. Creás **partidos** asociados a ese torneo (con fecha, cancha, cuántos árbitros necesita)
4. Desde cada partido o desde el Dashboard hacés click en **Asignar** para asignar árbitros disponibles
5. El cupo se actualiza en tiempo real

---

## Comandos útiles

```bash
# Activar venv (siempre antes de trabajar)
venv\Scripts\Activate.ps1        # Windows
source venv/bin/activate         # Mac/Linux

# Correr el servidor en modo desarrollo
python -m uvicorn app.main:app --reload

# Correr en un puerto diferente
python -m uvicorn app.main:app --reload --port 8080

# Resetear la base de datos
del arbitros.db                  # Windows
rm arbitros.db                   # Mac/Linux
# Después volver a correr el servidor
```
