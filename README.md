# Mi Cerebro Público

Sitio web estático y futurista (negro + verde neón) que expone tu vault de Obsidian
como un **grafo de conocimiento interactivo**. Construido con:

- **Next.js 16** (App Router, exportación estática `output: 'export'`)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** (configuración CSS-first en `globals.css`)
- **Radix UI** (Dialog de búsqueda, ToggleGroup de filtros por etiqueta)
- **react-force-graph-2d** para el grafo grande e interactivo

## Cómo funciona

Los datos se leen de tu vault **en tiempo de build** (no hay servidor en runtime):

1. `scripts/generate-vault-data.ts` lee `OBSIDIAN_VAULT_PATH` desde `.env.local`.
2. Parsea cada `.md`: frontmatter (YAML `tags`), `[[wikilinks]]`, etiquetas inline `#tag`
   y backlinks.
3. Escribe `src/generated/vault-data.json` con `{ notes, graph, tags, folders }`.

Los scripts `predev` y `prebuild` regeneran los datos automáticamente.

## Configuración

Edita `.env.local`:

```
OBSIDIAN_VAULT_PATH=/ruta/absoluta/a/tu/vault   # la carpeta que contiene .obsidian
```

## Comandos

```bash
npm install          # instala dependencias (incluye dev)
npm run dev          # regenera datos + servidor de desarrollo en http://localhost:3000
npm run build        # regenera datos + exportación estática a /out
npm start            # sirve /out con `serve` (producción estática)
```

## Despliegue

La carpeta `out/` es un sitio estático listo para cualquier hosting
(Netlify, Vercel Static, GitHub Pages, Cloudflare Pages, etc.).

## Estructura

```
src/
  app/
    layout.tsx              # fuentes + metadata
    page.tsx                # home: monta el grafo
    note/[slug]/page.tsx    # nota individual (SSG con generateStaticParams)
  components/
    BrainApp.tsx            # orquesta grafo + header + búsqueda + filtros
    GraphView.tsx           # force-graph (cliente, ssr:false)
    SearchDialog.tsx        # búsqueda (Radix Dialog)
    TagFilter.tsx           # filtros por etiqueta (Radix ToggleGroup)
    Markdown.tsx            # render de markdown + wikilinks
  lib/
    vault/parse.ts          # parser del vault
    vault/types.ts          # tipos
    vault-data.ts           # carga vault-data.json
    slug.ts                 # slugify
scripts/generate-vault-data.ts
```
