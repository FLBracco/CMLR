# HISTORIAL DE TRABAJO — CMLR

> Log diario de sesiones. Se actualiza al final de cada jornada de desarrollo.

---

## Jueves 06/08/2026

### Contexto de la sesión
- Proyecto CMLR (SaaS para psicólogos/psiquiatras). Objetivo: terminar el MVP para el martes 11/08 a la tarde.
- Fuente de documentación: vault de Obsidian (`clinica-online/Documents/Clinica Medica`, docs 00-07).
- Se decidió **auto-registro simple** de profesionales (sin superadmin para el MVP).
- La especialidad se modela como **tabla catálogo** `professional_specialities` (escalable, seed `psychologist`/`psychiatrist`).

### Skills instaladas
- `.opencode/skills/`: `senior-security`, `code-reviewer`, `tc-tracker` (desde alirezarezvani/claude-skills).

### Documentación
- `06 - Modelo Físico`: tabla `professional_specialities` (corregidos plural, FK `specialty_id`, ortografía).
- `04 - Modelo Conceptual` y `05 - Modelo Lógico`: actualizados con la entidad Especialidad.
- `TODO.md`: creado con el plan por fases y fechas hasta la entrega.

### Fase 0 — Fundaciones (completada)
- PostgreSQL en Docker verificado (`docker compose up`).
- `.env` completo: `PORT`, `DATABASE_*`, `JWT_SECRET` (48 bytes generado), `JWT_EXPIRES_IN=2h`; reflejado en `.env.example` y `environment.ts`.
- Middleware global de errores: `shared/errors/AppError.ts` + `shared/middlewares/error-handler.ts` (verificado: JSON inválido → 400).
- Estructura modular creada: `src/modules/{auth,professionals,patients,consultations}`.

### Verificación
- `pnpm build` OK, servidor arranca y conecta a la DB (puerto 3001).
- Skills: `tc-tracker` → `TC-001-08-06-26-fase0-fundaciones` (`implemented`); `senior-security` secret scanner → 0 hallazgos; `code-reviewer` → 97/100 (A).

### Commit
- Mensaje elegido: `feat: fase 0 - fundaciones del backend`

### Fase 1 — Base de datos (completada)
- 4 entities TypeORM según modelo físico 06: `ProfessionalSpeciality`, `Professional`, `Patient`, `Consultation` (convención snake_case en DB, camelCase en TS).
- Relaciones e índices: email único, specialty_id, dni, professional_id, patient_id, consultation_date.
- Migración inicial `InitialSchema` generada y ejecutada (tablas verificadas con `\dt`).
- Seed de especialidades (`pnpm seed`): psychologist / psychiatrist insertados.
- DTO de Especialidad (`ISpecialityDto`) para el listado del registro.

### Notas técnicas Fase 1
- TypeORM 1.1.0 exporta `MigrationInterface`/`QueryRunner` solo como tipos → las migraciones usan `import type`.
- El script `migration:generate` requiere el path como argumento (se corrió directamente por CLI).
- Se habilitaron `experimentalDecorators` + `emitDecoratorMetadata` en `tsconfig.json`.
- Patrón strict: properties de entities con `!` (definite assignment).

### Verificación Fase 1
- `pnpm build` OK.
- Skills: `tc-tracker` → `TC-002-08-06-26-fase1-database` (`implemented`); `code-reviewer` → 97.4/100 (A); `senior-security` → 0 hallazgos.

### Commit
- Mensaje elegido: `feat: fase 1 - base de datos (entities, migracion y seed)`

### Fase 2 — Autenticación (completada)
- DTOs con class-validator (`RegisterProfessionalDto`, `LoginDto`) + middleware `validate-dto`.
- bcrypt (hash + compare) para `password_hash`.
- JWT: `token.service.ts` (emisión/firma) + middleware `authenticate` (Bearer).
- Endpoints:
  - `GET /api/specialities` (catálogo público).
  - `POST /api/auth/register` → 201 (email único → 409, validación → 400).
  - `POST /api/auth/login` → 200.
  - `POST /api/auth/logout` → 204 (con token), 401 (sin token).
- Estructura del módulo `auth` completa: dto / services / controllers / routes.
- Repositories de `professionals` (findByEmail, create) y `professional_specialities`.

### Notas técnicas Fase 2
- **Dependencia circular ESM**: `emitDecoratorMetadata` producía `ReferenceError` entre entities → se desactivó (las columnas usan tipo explícito, así que TypeORM no lo necesita).
- **Globs de entities en `data-source.ts`**: al correr `node dist`, el glob cargaba `.ts` fuente → se reemplazó por registro explícito de entities/migraciones (funciona igual en dev y prod).
- `expiresIn` de JWT: tipado estricto obligó a cast con `Exclude<SignOptions["expiresIn"], undefined>`.
- Se habilitó build de `bcrypt` en `pnpm-workspace.yaml` (`allowBuilds`).

### Verificación Fase 2
- `pnpm build` OK, servidor arranca y conecta a la DB.
- Endpoints probados en vivo (register/login/logout/specialities, 400/401/409).
- Skills: `tc-tracker` → `TC-003-08-06-26-fase2-auth` (`implemented`); `code-reviewer` → 98.2/100 (A); `senior-security` → 0 hallazgos.

### Commit
- Mensaje elegido: `feat: fase 2 - autenticacion (register, login, JWT)`

### Fase 3 — Pacientes (completada)
- DTOs con class-validator: `CreatePatientDto`, `UpdatePatientDto`, `PatientResponseDto`.
- `PatientRepository`: create, findByDni, findByIdScoped, search (nombre/apellido/DNI con `LOWER` + LIKE).
- `PatientService`: reglas de negocio — scoping por profesional, DNI único por profesional (409), 404 si no existe.
- `PatientController` + rutas protegidas con `authenticate` (Bearer):
  - `POST /api/patients` → 201
  - `GET /api/patients?search=` → listado
  - `GET /api/patients/:id` → ficha
  - `PATCH /api/patients/:id` → editar

### Notas técnicas Fase 3
- **Columna `date` de TypeORM**: se devuelve como string (`"1990-05-15"`), no `Date` → `toDto` lo maneja con `instanceof` (evita TypeError → 500).
- Tipado estricto: `req.params.id` casteado a `string`; `exactOptionalPropertyTypes` exige omitir `search` cuando es `undefined`.

### Verificación Fase 3
- `pnpm build` OK.
- Endpoints probados en vivo: create 201, search, get, patch; DNI duplicado → 409; acceso cruzado entre profesionales → 404.
- Skills: `tc-tracker` → `TC-004-08-06-26-fase3-pacientes` (`implemented`); `code-reviewer` → 98.0/100 (A); `senior-security` → 0 hallazgos.

### Commit
- Mensaje elegido: `feat: fase 3 - CRUD de pacientes`

## Miércoles 12/08/2026

### Fase 5 — Frontend: base (completada)
- Scaffold con Vite (`react-ts`) en `frontend/`, Tailwind CSS v4 vía `@tailwindcss/vite`.
- Router (`react-router-dom`): `/login`, `/registro`, `/dashboard`, `/pacientes/:patientId`, catch-all 404. `/` redirige a `/dashboard`.
- `AuthContext` (`src/auth/AuthContext.tsx`): login/register/logout contra la API real, persiste token y datos del profesional en `localStorage`.
- Cliente API (`src/api/client.ts`): wrapper de `fetch` con `Authorization: Bearer`, mapea `{ error: { message } }` del backend a `ApiError`.
- `ProtectedRoute`: redirige a `/login` (con `state.from`) si no hay sesión.
- Páginas: Login y Registro funcionales (registro carga el catálogo de especialidades); Dashboard y Ficha de paciente quedan como stub para la Fase 6.

### Bug encontrado y corregido
- El backend no tenía middleware CORS: el frontend no podía llamar a la API desde el navegador (bloqueado por el navegador, sin headers `Access-Control-Allow-Origin`). Se agregó el paquete `cors`, `Environment.app.corsOrigin` (env `CORS_ORIGIN`, default `http://localhost:5173`) y `app.use(cors(...))` en `backend/src/app.ts`.

### Verificación Fase 5
- `pnpm --filter backend build` y `pnpm --filter frontend build` OK.
- Prueba manual end-to-end en Chrome (backend + frontend reales): ruta protegida sin sesión → redirige a `/login`; registro con especialidad → redirige a `/dashboard` con nombre del profesional; sesión persiste al recargar; logout → redirige a `/login`; login con las mismas credenciales → OK.
- Skills: `tc-tracker` → `TC-005-08-12-26-frontend-base` (`tested`); `senior-security` secret scanner → 0 hallazgos (frontend y backend); `code-reviewer` → promedio 94/100 (A) en `frontend/src`. `LoginPage`/`RegisterPage` marcadas D/C por falsos positivos del checker (números de clases Tailwind interpretados como "magic numbers" y conteo de líneas de `handleSubmit` que incluye el JSX de retorno) — revisado manualmente, no amerita cambios.

### Commit
- Mensaje elegido: `feat: fase 5 - frontend base (scaffold, router, cliente API, rutas protegidas)`

### Fase 6 — Frontend: pantallas (completada)
- Tipos y cliente API para pacientes (`src/types/patient.ts`, `src/api/patients.ts`) y consultas (`src/types/consultation.ts`, `src/api/consultations.ts`), calcados de los DTOs reales del backend.
- `AppHeader` compartido (nombre del profesional + cerrar sesión) extraído del Dashboard, reutilizado también en la ficha de paciente.
- `PatientForm` y `ConsultationForm`: formularios reutilizables entre alta y edición, montados inline (toggle de estado) sin agregar rutas ni modales nuevas.
- `DashboardPage`: listado de pacientes, búsqueda por nombre/apellido/DNI, alta de paciente.
- `PatientDetailPage`: datos del paciente con edición inline, historial de consultas (más reciente primero), alta de consulta y edición inline por consulta.

### Verificación Fase 6
- `pnpm --filter frontend build` OK.
- Prueba manual end-to-end en Chrome (backend + frontend reales): alta de paciente → aparece en el listado; edición de paciente → cambios persistidos; alta de consulta → aparece en el historial; edición de consulta → cambios persistidos; búsqueda por apellido → resultado correcto; logout → redirige a `/login`.
- Revisión manual de seguridad: sin `dangerouslySetInnerHTML`, JSX auto-escapa el contenido de pacientes/consultas, sin secretos en el código nuevo.
- `tc-tracker` → `TC-006-08-12-26-fase6-pantallas` (`tested`).

### Nota pendiente
- Falta el TC record retroactivo de la Fase 4 (CRUD de consultas del backend, commit `865e9b2`) — no se generó en su momento.

### Commit
- Mensaje elegido: `feat: fase 6 - pantallas de pacientes y consultas (dashboard, ficha, formularios)`

### Fase 7 — Pulido y entrega (completada)

#### Bug encontrado y corregido
- `AuthService.login` y el chequeo de duplicados de `AuthService.register` buscaban el email tal cual lo tipeaba el usuario, sin normalizar, mientras que el alta siempre lo guardaba en minúsculas. Un profesional que se registraba con mayúsculas en el email (ej. `Ana@Mail.com`) no podía volver a iniciar sesión escribiendo el mismo email con la misma casing, porque la búsqueda en la base (case-sensitive por collation default de Postgres) no coincidía con el valor guardado en minúsculas. Se agregó `normalizeEmail` (trim + lowercase) y se aplicó en los tres puntos de búsqueda/alta.

#### Manejo de errores en UI
- `AuthContext` ahora se suscribe a un listener de "no autorizado" expuesto por el cliente API (`setUnauthorizedListener`): cualquier respuesta 401 con un token activo dispara la limpieza de sesión (`localStorage` + estado en memoria), lo que hace que `ProtectedRoute` redirija automáticamente a `/login` en vez de dejar al usuario varado con un mensaje de error sin salida. No afecta a intentos de login con credenciales inválidas (no hay token todavía en ese caso).
- Se revisaron los estados de carga/error ya existentes (Dashboard, ficha de paciente, formularios) y se consideraron suficientes: loaders de texto simple, deshabilitado de botones durante el submit, mensajes de error con fallback genérico ante fallas de red.

#### Revisión de seguridad (manual, sin skill `senior-security` disponible en este entorno)
- JWT: secreto vía `.env` (no commiteado), verificado con `jsonwebtoken`, expiración configurable (`JWT_EXPIRES_IN`).
- bcrypt: `SALT_ROUNDS = 10` para el hash de contraseñas; nunca se expone `password_hash` en las respuestas (`buildAuthResponse` hace allow-list explícito de campos).
- CORS restringido a `CORS_ORIGIN` (no wildcard).
- Sin `.env` trackeado en git (`git ls-files` no devuelve ningún `.env`); sin secretos hardcodeados en el código nuevo del frontend (`dangerouslySetInnerHTML`, `eval`, API keys: 0 hallazgos).
- `error-handler` no filtra stack traces al cliente; errores no controlados devuelven mensaje genérico y quedan logueados server-side.

#### Revisión de código (skill `code-review`, effort medium)
- Confirmó el bug de case-sensitivity de email (ya corregido en esta misma sesión antes de correr la revisión).
- Señaló duplicación de `.toLowerCase()` en tres puntos de `auth.service.ts` como riesgo de mantenimiento — se extrajo el helper `normalizeEmail`.
- La advertencia sobre emails legacy guardados con mayúsculas no aplica en este código: el alta siempre normalizó el email antes de guardar (desde la Fase 2), así que no hay filas existentes con casing mixto en la base.

### Verificación Fase 7
- `pnpm --filter backend build` y `pnpm --filter frontend build` OK.
- Prueba manual end-to-end en Chrome: registro con email en mayúsculas → login exitoso con la misma casing (bug corregido verificado); simulación de token corrupto en `localStorage` → recarga del dashboard dispara 401 → logout automático y redirección a `/login` con `localStorage` limpio.
- `tc-tracker` → `TC-007-08-12-26-fase7-pulido` (`tested`).

### Commit
- Mensaje elegido: `fix: fase 7 - normaliza email en auth, logout automatico ante 401 y pulido final`

---

## Martes 01/09/2026

### Contexto de la sesión
- Se retoma el trabajo post-MVP. Board de Trello "CMLR" creado con las tareas pendientes; se elige empezar por la tarjeta #19 "SuperAdmin — Gestión de suscripciones de profesionales" (revierte la decisión de HISTORIAL 06/08 de diferir el superadmin).
- Se armó un plan de implementación completo (agente `Plan`, modelo Opus según `.claude/rules/model-routing.md`) en 9 fases, con decisiones de arquitectura, modelo de datos, backend, frontend y riesgos.

### Decisiones de diseño (Fase 0 del plan, confirmadas con el usuario)
- **Modelo de datos**: `subscription_status` como columna (`varchar(20)` + `CHECK`) en `professionals`, no tabla `subscriptions` aparte — evita un JOIN en el guard que corre en cada request a pacientes/consultas; se puede migrar a tabla propia cuando llegue la tarjeta de Facturación (fuera de alcance acá).
- **SuperAdmin**: tabla `admins` separada (no un `role` en `professionals`) — `specialty_id` es `NOT NULL` en `Professional` y el admin no encaja en el dominio de profesionales/pacientes.
- **JWT**: el payload suma `role` (`professional` | `superadmin`), pero el `subscriptionStatus` **no** viaja en el token — se lee fresco de la base en cada request protegido, para que activar/desactivar a un profesional tenga efecto inmediato y no hasta 2h después (duración del token).
- **DISABLED**: bloqueo total (igual que PENDING) en esta v1, con el guard parametrizado para poder pasar a solo-lectura sin refactor si se decide más adelante.
- **Transiciones de estado**: solo `PENDING↔ACTIVE` y `ACTIVE↔DISABLED`; se prohíbe `ACTIVE→PENDING` (sin semántica de negocio clara).
- **Rate limiting**: se suma `express-rate-limit` a ambos logins (profesional y SuperAdmin) en la Fase 8 del plan — hoy ninguno tiene protección contra fuerza bruta.
- **Login**: siempre permitido en cualquier estado de suscripción; el bloqueo ocurre después, al acceder a pacientes/consultas (evita que un profesional en PENDING no pueda distinguir "contraseña mal" de "cuenta sin activar").

### Fase 1 — Modelo de datos y migración (completada)
- `subscription-status.ts`: `SUBSCRIPTION_STATUSES` (`PENDING`/`ACTIVE`/`DISABLED`) + tipo derivado.
- `Professional` suma `subscriptionStatus` (default `PENDING`) y `subscriptionUpdatedAt` (nullable).
- Nueva entity `Admin` (`backend/src/modules/admin/entities/admin.entity.ts`), misma convención que `Professional` (uuid, email unique, password_hash, timestamps).
- Migración `AddSubscriptionsAndAdmins1788274429176`: crea `admins`, agrega columnas a `professionals`, backfill (`UPDATE ... SET subscription_status = 'ACTIVE'` para los 8 profesionales existentes) y `CHECK` constraint — el orden importa: el backfill corre antes del `CHECK` para no depender de que el default matchee la constraint.
- Verificado: `migration:run` → backfill correcto (8/8 en ACTIVE) → `migration:revert` (down simétrico) → `migration:run` de nuevo. `pnpm build` limpio.
- Nuevo `Environment.superAdmin` (`SUPERADMIN_EMAIL`/`SUPERADMIN_PASSWORD`), reflejado en `.env` y `.env.example`.
- `seed-admin.ts` (idempotente, mismo patrón que `seed.ts`) + script `seed:admin` — probado dos veces (crea, luego detecta existente y no pisa la contraseña).

### Pendiente (próximas sesiones)
- Fase 2: `role` en el JWT (`token.service.ts`, `authenticate.ts` + nuevo `authenticateAdmin`), `buildAuthResponse` con `subscriptionStatus`.
- Fases 3-8 según el plan: guard de suscripción, módulo admin backend, frontend (sesión con rol, panel del SuperAdmin, UX de bloqueo), seguridad y cierre.
