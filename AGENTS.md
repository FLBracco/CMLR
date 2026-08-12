# Reglas del proyecto CMLR

## Reglas de trabajo (obligatorias en cada sesión)

1. **Usar siempre las skills instaladas** en `.opencode/skills/`:
   - `tc-tracker` → registrar cada cambio técnico como TC (`docs/TC/`).
   - `code-reviewer` → revisar el código escrito (code quality checker).
   - `senior-security` → secret scanner sobre el código antes de commitear.
2. **Al terminar cada cambio**, actualizar `docs/HISTORIAL.md` (log diario por fase/sesión).
   - Además, registrar el cambio en el changelog del vault de Obsidian (`obsidian/Changelog/AAAA/MM/DD.md`, no se commitea).
3. **No hacer commit.** Al finalizar cada cambio, recomendar un mensaje en español siguiendo Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`) y dejar que el usuario haga el commit.
4. Nunca commitear secretos (`.env` real queda ignorado).
