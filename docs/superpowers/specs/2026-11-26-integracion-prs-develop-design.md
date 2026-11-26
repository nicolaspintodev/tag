# Integración de `fix/liquidaciones` a `develop`

> Aprobado por el usuario el 2026-11-26.

## Objetivo

Integrar todo el trabajo pendiente de `fix/liquidaciones` en `develop` mediante un único Pull Request, con verificación local y merge automático sólo si CI pasa.

## Alcance

- Base: `develop` (`origin/develop` = `568b2e5`).
- Head: `fix/liquidaciones`.
- No crear PRs para `feat/mvp-003-liquidaciones-wizard`, `feat/mvp-004-liquidacion-choferes` ni `feat/mvp-002-viajes`: ya son ancestros de `origin/develop`.
- PR abierto #106 (`fix/cd-migrate-diagnostics`) queda intacto.
- No push directo a `develop` o `main`; no force-push; no stash ni reset.

## Decisiones

1. Un solo PR con merge commit, sin squash ni rebase, según `AGENTS.md` y `CONTRIBUTING.md`.
2. Se conserva el historial ya publicado de `fix/liquidaciones`: `989fd21` es el punto de divergencia y los 4 commits por encima de `origin/develop` son `6f5866a`, `800f368`, `a3e1cfe` y `c62bad9`.
3. Los cambios pendientes del working tree se agrupan en un commit: `fix(liquidaciones): ajustar confirmación y resaltar entidad`.
4. La spec y el plan se escriben en `docs/superpowers/` y se commitean por separado antes del commit funcional.
5. El botón azul oscuro no tendrá test automático porque el usuario lo pidió explícitamente; queda como verificación visual/manual.

## Cambios incluidos

### Historial ya publicado en la rama (incluye el punto de divergencia)

- `989fd21 chore: remove client docs and ignore workspace artifacts`
- `6f5866a feat(viajes): mostrar procesos y montos de liquidaciones`
- `800f368 docs: spec de colores y filtros de viajes`
- `a3e1cfe docs: plan de colores y filtros de viajes`
- `c62bad9 feat(viajes): colorear estados y filtrar procesos`

### Pendientes a commitear

- `client/src/components/liquidacion/LiquidacionDetailModal.jsx`: el diálogo “Pasar a pendiente” usa `confirmVariant="primary"`.
- `client/src/components/ui/ConfirmDialog.jsx`: nueva prop `confirmVariant`, con default `danger`.
- `client/src/components/liquidacion/LiquidacionToolbar.jsx`: clase `entity-pick-required` cuando falta cliente/chofer/proveedor.
- `client/src/index.css`: resaltado azul oscuro (`--bg-primary` / `--text-invert`) y halo con `--bg-primary-rgb`.
- `client/src/components/liquidacion/LiquidacionToolbar.test.js`: tests del resaltado.
- `client/src/components/ui/ConfirmDialog.test.js`: tests de variante primary/default.

`client/src/index.css.test.js` fue eliminado y no debe incluirse.

## Verificación requerida

- Frontend: `npm test`, `npm run lint`, `npm run build` en `client/`.
- Backend: `composer test`, `composer lint` en `api/`.
- Git: `git diff --check` y `git merge-tree` contra `origin/develop` para detectar conflictos.
- CI: jobs `backend` y `frontend` verdes en el PR.

## Pull Request

- Título: `feat(viajes): colorear estados, filtrar procesos y ajustes de liquidación`.
- Cuerpo: plantilla `.github/PULL_REQUEST_TEMPLATE.md`, sin issue inventado.
- Estrategia de merge: merge commit (`gh pr merge --merge`).

## Riesgos y mitigaciones

- **Conflicto en `index.css`**: se detecta con `git merge-tree` antes de abrir el PR y con CI en el PR.
- **CI roja**: se corrige con commits nuevos en `fix/liquidaciones`; no se mergea hasta estar verde.
- **Commit accidental de secretos**: se revisa `git status` y el diff antes de `git add`.
- **Historial reescrito**: prohibido; el push es fast-forward.

## Criterios de aceptación

- `fix/liquidaciones` tiene un commit nuevo con los 6 archivos pendientes.
- PR abierto contra `develop` con la plantilla completa y sin secretos.
- CI verde y merge realizado con merge commit.
- `origin/develop` apunta al merge commit del PR.
- PR #106 sigue abierto; la rama local no se borra.
