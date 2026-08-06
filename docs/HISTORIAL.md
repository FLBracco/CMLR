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
