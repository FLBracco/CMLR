# Reglas del proyecto CMLR

## Reglas de trabajo (obligatorias en cada sesión)

1. **Usar siempre las skills instaladas** en `.opencode/skills/`:
   - `tc-tracker` → registrar cada cambio técnico como TC (`docs/TC/`).
   - `code-reviewer` → revisar el código escrito (code quality checker).
   - `senior-security` → secret scanner sobre el código antes de commitear.
2. **Al terminar cada cambio**, actualizar `docs/HISTORIAL.md` (log diario por fase/sesión).
3. **Realizar commit** al finalizar cada cambio, con mensaje en español siguiendo Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
4. Nunca commitear secretos (`.env` real queda ignorado).
