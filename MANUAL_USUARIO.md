# Manual de Usuario — Gestión de Árbitros

Esta guía sigue el orden en que realmente se usa el sistema: primero se cargan las
personas, después los torneos y los partidos, y sobre esa base se hace lo más
importante — **asignar árbitros y asistentes**. El Dashboard, al final, es el
resumen de todo lo anterior.

**Flujo de trabajo:** Usuarios → Torneos → Partidos → Asignar → Dashboard

> 📌 **Sobre las imágenes**: los espacios marcados como `![Figura N — descripción](imagenes/nombre.png)`
> son placeholders. Creá una carpeta `imagenes/` al lado de este archivo y guardá ahí cada
> captura con el nombre indicado (por ejemplo `imagenes/login.png`) — el enlace se arma solo
> apenas el archivo exista, no hace falta tocar el texto.

## Índice

1. [Primeros pasos](#primeros-pasos)
2. [La interfaz, de un vistazo](#la-interfaz-de-un-vistazo)
3. [Usuarios y roles](#1-usuarios-y-roles)
4. [Torneos](#2-torneos)
5. [Partidos](#3-partidos)
6. [Asignar árbitros a un partido](#4-asignar-árbitros-a-un-partido)
7. [Dashboard](#5-dashboard)
8. [Preguntas frecuentes](#preguntas-frecuentes)
9. [Glosario](#glosario)

---

## Primeros pasos

### Iniciar sesión

Al entrar a la aplicación aparece la pantalla de login, con dos campos: **Email** y
**Contraseña**. Se ingresan las credenciales y se presiona **Ingresar**. Si algo
falla, un mensaje en rojo indica el motivo.

![Figura 1 — Pantalla de login](imagenes/login.png)

Por el momento, solo las cuentas con rol **Admin** pueden iniciar sesión — el
porqué se explica en la sección de Usuarios y roles, más abajo.

### Modo oscuro / claro

Arriba a la derecha (o en la esquina superior de la pantalla de login) hay un
botón circular 🌙 / ☀️ que alterna el tema visual. La elección queda guardada en
el dispositivo.

### Cerrar sesión

En la barra lateral (o, en el celular, tocando el círculo con tu inicial junto al
botón de tema) se encuentra la opción de salir. Siempre pide confirmación antes de
cerrar la sesión.

---

## La interfaz, de un vistazo

### En computadora

A la izquierda queda fija una barra con las secciones del sistema, agrupadas en
dos bloques:

- **Principal** — 📊 Dashboard y 📋 Partidos.
- **Gestión** — 🏆 Torneos y 👤 Árbitros y Usuarios.

![Figura 2 — Barra lateral en computadora, con el Dashboard abierto](imagenes/sidebar-desktop.png)

### En el celular

La barra lateral se convierte en un menú fijo abajo de la pantalla, con las
mismas secciones. El recuadro de usuario pasa a ser un círculo con tu inicial
arriba a la derecha (junto al botón de tema): tocarlo cierra la sesión.

![Figura 3 — Menú inferior en celular](imagenes/sidebar-mobile.png)

> 💡 **Buscadores y tablas**: en pantallas chicas, las tablas se pueden deslizar
> hacia los costados si tienen más columnas de las que entran — el resto de la
> pantalla no se mueve.

---

## 1. Usuarios y roles

*Paso 1 de 5 — lo primero que hay que cargar: quiénes van a poder ser asignados a
un partido, y quién organiza cada torneo.*

Se administra desde el menú «Árbitros y Usuarios» (solo lo ve una cuenta Admin).
Hay tres roles:

| Rol | Para qué sirve |
|---|---|
| **Admin** | Maneja todo el sistema. Es, por ahora, el único rol habilitado para iniciar sesión. |
| **Árbitro** | Persona que puede ser asignada a partidos como árbitro o asistente. |
| **Organización** | Se usa para identificar quién organiza cada torneo. |

### Crear un usuario

Con **+ Nuevo usuario** se completa nombre, email, rol y (opcional) teléfono.

![Figura 4 — Formulario «Nuevo usuario»](imagenes/modal-usuario.png)

> ⚠️ **Por el momento, solo Admin puede iniciar sesión**
> Si el rol es **Árbitro** u **Organización**, el campo de contraseña aparece
> deshabilitado — esas cuentas quedan registradas para asignarlas a partidos o
> identificarlas como organizadoras, pero no van a poder loguearse. Solo con el
> rol **Admin** se habilita la contraseña.

### Dirección del árbitro (opcional)

Cuando el rol elegido es **Árbitro**, aparece un campo de dirección con un mapa
interactivo: se puede escribir una localidad y tocar **🔍 Buscar**, o marcar el
punto directamente haciendo clic en el mapa. No hace falta la dirección exacta —
alcanza con la localidad o una referencia aproximada. Esta ubicación es la que
después usa el sistema para **recomendar a los árbitros más cercanos** a cada
partido (ver «Asignar árbitros»).

![Figura 5 — Mapa de dirección al crear un árbitro](imagenes/mapa-usuario.png)

Para editar (✏️) solo se pueden cambiar nombre, rol, teléfono y dirección — el
email y la contraseña no se modifican desde ahí. 🗑️ elimina, con confirmación
previa.

---

## 2. Torneos

*Paso 2 de 5 — el contenedor bajo el cual se cargan los partidos. Ya con los
usuarios cargados, se puede elegir un organizador.*

**+ Nuevo torneo** abre un formulario con estos campos:

| Campo | Descripción |
|---|---|
| Nombre * | Obligatorio. Es lo que se ve en todos lados: partidos, selectores, exportables. |
| Descripción | Opcional, texto libre. |
| Organizador | Un usuario con rol Organización o Admin (de los cargados en el paso anterior). |
| Fecha inicio / fin | Opcionales, solo informativas. |
| Torneo activo | Decide si cuenta en la tarjeta «Torneos activos» del Dashboard. |

![Figura 6 — Formulario «Nuevo torneo»](imagenes/modal-torneo.png)

La tabla de Torneos muestra la organización de cada uno, sus fechas y su estado.
Cada fila tiene ✏️ para editar y 🗑️ para eliminar (esto último borra también sus
partidos asociados).

![Figura 7 — Tabla de Torneos](imagenes/tabla-torneos.png)

---

## 3. Partidos

*Paso 3 de 5 — con torneos ya creados, cada partido es la unidad de trabajo del
día a día: la fila que hay que cubrir con árbitros.*

**+ Nuevo partido** abre el formulario completo:

| Campo | Descripción |
|---|---|
| Torneo * | A qué torneo pertenece. |
| Fecha y hora * | Define si el partido es «próximo» o ya pasó. |
| Cancha * | Nombre libre del lugar donde se juega. |
| Ubicación de la cancha | Localidad o referencia aproximada + mapa — la usa la recomendación por cercanía al asignar. |
| Equipo local / visitante * | Los dos equipos que se enfrentan. |
| Árbitros / asistentes requeridos | Cuántos hacen falta para completar el cupo (por defecto, 1 y 0). |
| Modalidad de pago | «En cancha» o «Administrador» — quién le paga al árbitro. |
| Valor árbitro / asistente | Montos de referencia para cada rol de trabajo. |
| Notas / Observaciones | Texto libre para avisos como «llevar pelota propia». |

![Figura 8 — Formulario «Nuevo partido», con el mapa de ubicación](imagenes/modal-partido.png)

### Encontrar un partido

La barra de filtros permite buscar por cancha, torneo o nombre de equipo, acotar
por torneo específico, o tildar **Solo sin asignar** para ver únicamente los que
todavía necesitan árbitros.

![Figura 9 — Tabla de Partidos con los filtros](imagenes/tabla-partidos.png)

### Exportar la ficha de un partido

El botón 📄 genera una ficha con fecha, cancha, equipos, cupos, modalidad de
pago, notas y árbitros asignados, y abre el diálogo de impresión del navegador —
desde ahí se puede **guardar como PDF** o imprimir directamente.

---

## 4. Asignar árbitros a un partido

*Paso 4 de 5 — lo más importante: el motivo de ser del sistema. Cubrir cada
partido con la cantidad de árbitros y asistentes que necesita, sin duplicar a
nadie ni pasarse del cupo.*

### Entender el cupo antes de empezar

Cada partido define cuántos árbitros y asistentes necesita. El indicador de
**cupo** aparece en todas las tablas y resume el estado con un punto de color:

| Indicador | Significado |
|---|---|
| 🟠 `0/2` | Vacío — nadie asignado todavía. |
| 🔵 `1/2` | Parcial — falta completar el cupo. |
| 🟢 `2/2` | Completo — árbitros y asistentes cubiertos. |

### Paso a paso

1. **Abrir la asignación** — desde el Dashboard o desde Partidos, tocar
   **Asignar** (⚡) en la fila del partido que se quiere cubrir.

   ![Figura 10 — Botón «Asignar» en la tabla de Partidos](imagenes/asignar-boton.png)

2. **Revisar el resumen del partido** — arriba del todo se muestra el
   enfrentamiento, la cancha, la fecha y el torneo, para confirmar de un vistazo
   que es el partido correcto.

3. **Mirar «Ya asignados»** — lista quién ya está confirmado, con una etiqueta
   de su rol en el encuentro (*árbitro* o *asistente*) y un botón **Quitar**
   para desasignarlo.

4. **Elegir de «Disponibles» — ordenados por cercanía** — si el partido tiene
   una ubicación cargada, la lista de árbitros disponibles se ordena por
   distancia a la cancha, y los **5 más cercanos** quedan marcados con
   **⭐ Recomendado**, mostrando la distancia aproximada de cada uno.

   ![Figura 11 — Lista de disponibles con las etiquetas de recomendado](imagenes/disponibles-recomendados.png)

5. **Usar el buscador si hace falta** — el campo de búsqueda arriba de la lista
   filtra a los disponibles por nombre o email, sin perder el orden por
   cercanía ni las recomendaciones.

6. **Asignar con el rol correcto** — cada disponible tiene dos botones:
   **Árbitro** y **Asistente**. Tocar el que corresponda a la función que va a
   cumplir *en ese partido* — no es lo mismo que su rol de usuario. Cualquier
   persona con rol de usuario «Árbitro» puede asignarse como árbitro o como
   asistente según haga falta.

7. **Cuidado con los que ya tienen partido ese día** — un árbitro que ya está
   asignado a **otro partido el mismo día** aparece atenuado (en gris) con la
   etiqueta «Ocupado ese día». Se lo puede asignar igual, pero el sistema pide
   una confirmación aparte antes de hacerlo, para evitar una superposición sin
   querer.

   ![Figura 12 — Árbitro marcado «Ocupado ese día» y el aviso de confirmación](imagenes/ocupado-mismo-dia.png)

8. **Repetir hasta completar el cupo** — la lista se actualiza sola después de
   cada asignación. Si se intenta asignar de más, el sistema avisa («Cupo de
   árbitros completo» o «Cupo de asistentes completo») y no lo permite.

9. **Cerrar** — con **Cerrar** se vuelve a la lista de partidos; el cupo
   actualizado ya se refleja ahí y en el Dashboard.

### Quitar una asignación

Desde «Ya asignados», el botón **Quitar** libera a esa persona al instante —
vuelve a aparecer en «Disponibles» y el cupo baja en uno.

> ⏳ **Mientras se procesa**: al asignar o quitar a alguien, el modal muestra un
> indicador de carga (además de la barra de progreso de arriba de la pantalla) —
> es normal, tarda uno o dos segundos en confirmar el cambio contra el servidor.

> 💡 **Ruta rápida**: no hace falta entrar a Partidos para asignar: filtrando
> «Solo sin asignar» en esa sección, o mirando la tarjeta «Sin asignar» del
> Dashboard, se llega directo a lo que falta cubrir.

---

## 5. Dashboard

*Paso 5 de 5 — con usuarios, torneos, partidos y asignaciones ya en marcha, esta
pantalla es el resumen diario: qué falta resolver hoy.*

Cuatro tarjetas resumen la operación:

| Tarjeta | Qué muestra |
|---|---|
| Próximos partidos | Partidos de hoy en adelante (los de hoy cuentan aunque su horario ya haya pasado). |
| Sin asignar | De esos próximos partidos, cuántos todavía no completan el cupo. |
| Torneos activos | Torneos marcados como «activo» en este momento. |
| Árbitros | Usuarios registrados con rol Árbitro. |

![Figura 13 — Tarjetas de estadísticas del Dashboard](imagenes/dashboard-stats.png)

Debajo, la tabla **«Próximos partidos»** lista los diez más cercanos en el
tiempo. Desde ahí mismo se puede abrir **Asignar** sin ir a la sección Partidos,
o **📄 Exportar** la ficha del partido.

![Figura 14 — Tabla «Próximos partidos» del Dashboard](imagenes/dashboard-tabla.png)

> 💡 **Uso diario recomendado**: el Dashboard es el punto de partida de cada
> sesión: la tarjeta «Sin asignar» dice de un vistazo cuántos partidos necesitan
> atención antes de jugarse.

---

## Preguntas frecuentes

**Creé un árbitro y no puede loguearse, ¿está mal?**
No. Es el comportamiento esperado hoy: solo las cuentas Admin pueden iniciar
sesión.

**¿Por qué no veo la sección «Árbitros y Usuarios»?**
Esa sección solo la muestra el menú a una cuenta con rol Admin.

**¿Es obligatorio cargar la dirección del árbitro o la ubicación de la cancha?**
No, es opcional en los dos casos. Sin esos datos, el sistema simplemente no
puede calcular distancias ni recomendar árbitros cercanos para ese partido o esa
persona.

**Un árbitro no aparece en «Disponibles» al asignar**
O ya está asignado a ese mismo partido (va a figurar en «Ya asignados»), o su
usuario no tiene rol Árbitro.

**¿Qué diferencia hay entre el rol del usuario y el rol de la asignación?**
El rol del usuario (Árbitro, Organización, Admin) define su cuenta. El rol de la
asignación (árbitro o asistente) define qué función cumple *en un partido
puntual*, y puede variar de un partido a otro.

**¿La recomendación por cercanía evita que asigne a alguien con superposición de horarios?**
La cercanía y la superposición son dos avisos independientes. El sistema sí
marca en gris a quien ya tiene otro partido el mismo día (y pide confirmar antes
de asignarlo igual), pero no controla superposición de horario exacto dentro del
mismo día — eso queda a criterio propio.

**Exporté un partido, ¿dónde queda guardado?**
No se guarda un archivo automáticamente: se abre el diálogo de impresión del
navegador, y desde ahí se elige «Guardar como PDF» o imprimir en papel.

---

## Glosario

- **Cupo** — Cantidad de árbitros y asistentes ya asignados sobre el total
  requerido por el partido.
- **Disponibles** — Usuarios con rol Árbitro que aún no fueron asignados a ese
  partido en particular.
- **Recomendado** — Uno de los 5 árbitros disponibles más cercanos a la cancha,
  calculado a partir de la dirección cargada en el partido y en cada árbitro.
- **Ocupado ese día** — Aviso sobre un árbitro que ya tiene asignado otro
  partido en la misma fecha — igual se puede asignar, con confirmación.
- **Modalidad de pago** — Quién abona al árbitro: «En cancha» (el mismo día, en
  el lugar) o «Administrador» (gestionado aparte).
- **Organización** — Usuario que figura como responsable de un torneo.
- **Sin asignar** — Partido próximo cuyo cupo de árbitros y/o asistentes
  todavía no está completo.
