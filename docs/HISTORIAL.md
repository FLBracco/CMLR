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
