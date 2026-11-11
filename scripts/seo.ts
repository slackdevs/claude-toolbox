// Plugin de build para SEO y LLMs. Corre sólo en `vite build`, después de generar dist/:
// - dist/<herramienta>/index.html: HTML estático por herramienta (title, description, canonical, OG, JSON-LD
//   y contenido legible sin JS). Vue lo reemplaza al montar.
// - dist/index.html (home) y dist/404.html (fallback para rutas desconocidas, noindex).
// - dist/cheatsheets/ y dist/cheatsheets/<slug>/: índice y un HTML por cheatsheet, con el contenido de docs/Cheatsheets/*.md.
// - dist/propuestas/, dist/roadmap/ (title, description y canonical; su contenido es dinámico) y
//   dist/propuestas/nueva/, dist/admin/ (noindex, fuera de sitemap y llms).
// - sitemap.xml, robots.txt, llms.txt y llms-full.txt (https://llmstxt.org).
// Los datos salen del mismo registro de herramientas que usa la app: no hay que mantener listas aparte.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { runnerImport, type Plugin, type ResolvedConfig } from 'vite';
import type { Localized } from '../src/i18n';
import type { Block } from '../src/lib/markdown';
import type { CategoryKey, Tool } from '../src/tools/tool';
import { BRAND } from '../src/lib/brand';

type Cert = { code: string; name: string };
type Sheet = { cert: Tool['certs'][number]; slug: string; source: string; reviewedAt: string; summary: Localized };
type PageRoute = { name: string; meta: { title: Localized; description: Localized; noindex?: boolean } };

const SITE_NAME = 'Claude Toolbox';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c');

const HOME = {
  title: 'Claude Toolbox · SlackDevs — herramientas para profesionales de Claude',
  description:
    'Herramientas gratis en el navegador para profesionales de Claude, la Claude API y Claude Code: calculadora de costos, tokens, prompts, MCP, hooks, subagentes y preparación para las certificaciones de Anthropic.',
  descriptionEn:
    'Free in-browser tools for professionals working with Claude, the Claude API and Claude Code: cost calculator, tokens, prompts, MCP, hooks, subagents and prep for the Anthropic certifications.',
};

export function seo(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'claude-toolbox:seo',
    apply: 'build',
    configResolved(c) {
      config = c;
    },
    async closeBundle() {
      const root = config.root;
      const outDir = resolve(root, config.build.outDir);
      const load = async <T>(id: string) =>
        (await runnerImport<T>(id, { configFile: false, root, resolve: { alias: config.resolve.alias }, logLevel: 'error' })).module;

      const { tools, categories } = await load<{ tools: Tool[]; categories: { key: CategoryKey; name: Localized }[] }>('/src/tools/index.ts');
      const { CERTS } = await load<{ CERTS: Record<string, Cert> }>('/src/lib/certs.ts');

      const site = BRAND.tools; // URL absoluta con barra final
      const urlOf = (t: Tool) => `${site}${t.path.slice(1)}/`;
      const catName = (k: CategoryKey) => categories.find((c) => c.key === k)!.name;
      const certList = (t: Tool) => t.certs.map((c) => CERTS[c].code).join(', ');
      const today = new Date().toISOString().slice(0, 10);

      const template = await readFile(join(outDir, 'index.html'), 'utf8');
      if (!template.includes('<!--seo-->') || !template.includes('<div id="app"></div>')) {
        throw new Error('[seo] index.html debe contener <!--seo-->…<!--/seo--> y <div id="app"></div>');
      }

      const publisher = { '@type': 'Person', name: BRAND.author, url: BRAND.site, sameAs: [BRAND.site, BRAND.github, `https://x.com/${BRAND.twitter.slice(1)}`] };

      const head = (p: { title: string; description: string; url: string; jsonld: unknown[]; noindex?: boolean }) =>
        [
          `<title>${esc(p.title)}</title>`,
          `<meta name="description" content="${esc(p.description)}">`,
          `<meta name="robots" content="${p.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">`,
          p.noindex ? '' : `<link rel="canonical" href="${p.url}">`,
          `<meta property="og:url" content="${p.url}">`,
          `<meta property="og:title" content="${esc(p.title)}">`,
          `<meta property="og:description" content="${esc(p.description)}">`,
          `<meta name="twitter:title" content="${esc(p.title)}">`,
          `<meta name="twitter:description" content="${esc(p.description)}">`,
          ...p.jsonld.map((j) => `<script type="application/ld+json">${json(j)}</script>`),
        ].filter(Boolean).join('\n  ');

      // Índice estático de herramientas: navegable por crawlers y fetchers de LLM que no ejecutan JS.
      const toolIndex = categories
        .map((c) => {
          const items = tools.filter((t) => t.category === c.key)
            .map((t) => `<li><a href="${urlOf(t)}">${esc(t.name.es)}</a> — ${esc(t.description.es)}</li>`).join('');
          return `<h2>${esc(c.name.es)}</h2><ul>${items}</ul>`;
        })
        .join('');

      const render = (headHtml: string, body: string) =>
        template
          .replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, `<!--seo-->\n  ${headHtml}\n  <!--/seo-->`)
          .replace('<div id="app"></div>', `<div id="app"><div class="seo-static">${body}</div></div>`);

      // Home
      const homeLd = [
        { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, alternateName: 'SlackDevs Tools', url: site, inLanguage: ['es', 'en'], description: HOME.description, publisher },
        {
          '@context': 'https://schema.org', '@type': 'ItemList', name: `${SITE_NAME} — herramientas`,
          itemListElement: tools.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: urlOf(t), name: t.name.es })),
        },
      ];
      const homeBody = `<h1>Herramientas para profesionales de Claude</h1><p>${esc(HOME.description)}</p><p lang="en">${esc(HOME.descriptionEn)}</p>${toolIndex}`;
      await writeFile(join(outDir, 'index.html'), render(head({ ...HOME, url: site, jsonld: homeLd }), homeBody));

      // 404: fallback para rutas desconocidas (si el hosting lo sirve); la SPA muestra su propio NotFound.
      await writeFile(join(outDir, '404.html'), render(head({ ...HOME, title: `404 — ${SITE_NAME}`, url: site, jsonld: [], noindex: true }), `<h1>404</h1>${toolIndex}`));

      // Una página por herramienta
      for (const t of tools) {
        const url = urlOf(t);
        const title = `${t.name.es} — ${SITE_NAME} · SlackDevs`;
        const description = `${t.description.es} Gratis, en tu navegador, sin enviar datos.`;
        const ld = [
          {
            '@context': 'https://schema.org', '@type': 'WebApplication', name: t.name.es, genre: catName(t.category).en, alternateName: t.name.en, url,
            description: t.description.es, inLanguage: ['es', 'en'], applicationCategory: 'DeveloperApplication', operatingSystem: 'Any (web browser)',
            isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            keywords: [...t.keywords, 'Claude', 'Anthropic', ...t.certs.map((c) => CERTS[c].code)].join(', '),
            isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: site }, author: publisher,
          },
          {
            '@context': 'https://schema.org', '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: SITE_NAME, item: site },
              { '@type': 'ListItem', position: 2, name: t.name.es, item: url },
            ],
          },
        ];
        const body =
          `<nav><a href="${site}">${SITE_NAME}</a> › ${esc(catName(t.category).es)}</nav>` +
          `<h1>${esc(t.name.es)}</h1><p>${esc(t.description.es)}</p><p lang="en"><strong>${esc(t.name.en)}</strong>: ${esc(t.description.en)}</p>` +
          `<p>Certificaciones: ${esc(certList(t))}</p><h2>Otras herramientas</h2>${toolIndex}`;
        const dir = join(outDir, t.path.slice(1));
        await mkdir(dir, { recursive: true });
        await writeFile(join(dir, 'index.html'), render(head({ title, description, url, jsonld: ld }), body));
      }

      // ---- Cheatsheets y capa comunitaria ----
      const sheetsMod = await load<{
        cheatsheets: Sheet[];
        CHEATSHEETS_DIR: string;
        parseCheatsheet: (markdown: string) => { blocks: Block[]; sections: { id: string; text: string }[] };
      }>('/src/cheatsheets/index.ts');
      const { toHtml } = await load<{ toHtml: (blocks: Block[]) => string }>('/src/lib/markdown.ts');
      const { cheatsheetRoutes } = await load<{ cheatsheetRoutes: PageRoute[] }>('/src/cheatsheets/routes.ts');
      const { communityRoutes } = await load<{ communityRoutes: PageRoute[] }>('/src/community/routes.ts');
      const routeMeta = (name: string) => [...cheatsheetRoutes, ...communityRoutes].find((r) => r.name === name)!.meta;

      const pageUrl = (path: string) => `${site}${path}/`;
      const crumbs = (...items: [name: string, url: string][]) => ({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [[SITE_NAME, site] as [string, string], ...items].map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
      });
      const writePage = async (path: string, headHtml: string, body: string) => {
        const dir = join(outDir, path);
        await mkdir(dir, { recursive: true });
        await writeFile(join(dir, 'index.html'), render(headHtml, body));
      };

      // Índice de cheatsheets
      const sheets = sheetsMod.cheatsheets.map((s) => ({ ...s, code: CERTS[s.cert]!.code, certName: CERTS[s.cert]!.name, url: pageUrl(`cheatsheets/${s.slug}`) }));
      const sheetsMeta = routeMeta('cheatsheets');
      const sheetsUrl = pageUrl('cheatsheets');
      const sheetIndex = `<ul>${sheets.map((s) => `<li><a href="${s.url}">Cheatsheet ${esc(s.code)} — ${esc(s.certName)}</a>: ${esc(s.summary.es)}</li>`).join('')}</ul>`;
      await writePage(
        'cheatsheets',
        head({ title: `${sheetsMeta.title.es} — ${SITE_NAME} · SlackDevs`, description: sheetsMeta.description.es, url: sheetsUrl, jsonld: [crumbs([sheetsMeta.title.es, sheetsUrl])] }),
        `<nav><a href="${site}">${SITE_NAME}</a></nav><h1>${esc(sheetsMeta.title.es)}</h1><p>${esc(sheetsMeta.description.es)}</p><p lang="en">${esc(sheetsMeta.description.en)}</p>${sheetIndex}`,
      );

      // Un cheatsheet por credencial, con su contenido completo legible sin JS
      const sheetSections = new Map<string, string[]>();
      for (const s of sheets) {
        const doc = sheetsMod.parseCheatsheet(await readFile(join(root, sheetsMod.CHEATSHEETS_DIR, s.source), 'utf8'));
        sheetSections.set(s.slug, doc.sections.map((x) => x.text));
        const name = `Cheatsheet ${s.code} — ${s.certName}`;
        const ld = [
          {
            '@context': 'https://schema.org', '@type': 'TechArticle', headline: name, description: s.summary.es, url: s.url, inLanguage: 'es',
            dateModified: s.reviewedAt, isAccessibleForFree: true, author: publisher, publisher, isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: site },
          },
          crumbs([sheetsMeta.title.es, sheetsUrl], [name, s.url]),
        ];
        const related = tools.filter((t) => t.certs.includes(s.cert)).map((t) => `<li><a href="${urlOf(t)}">${esc(t.name.es)}</a> — ${esc(t.description.es)}</li>`).join('');
        await writePage(
          `cheatsheets/${s.slug}`,
          head({ title: `${name} — ${SITE_NAME} · SlackDevs`, description: s.summary.es, url: s.url, jsonld: ld }),
          `<nav><a href="${site}">${SITE_NAME}</a> › <a href="${sheetsUrl}">Cheatsheets</a></nav><h1>${esc(name)}</h1><p>${esc(s.summary.es)}</p><p lang="en">${esc(s.summary.en)}</p>` +
            `<p>Última revisión: ${s.reviewedAt}. Puede estar desactualizado: confirmá siempre con la guía oficial del examen.</p>${toHtml(doc.blocks)}` +
            (related ? `<h2>Herramientas relacionadas</h2><ul>${related}</ul>` : ''),
        );
      }

      // Propuestas y roadmap: el contenido es dinámico, la página estática lleva title, description y canonical.
      const dynamicPages = [
        { name: 'proposals', path: 'propuestas' },
        { name: 'roadmap', path: 'roadmap' },
        { name: 'proposal-new', path: 'propuestas/nueva' },
        { name: 'admin', path: 'admin' },
      ].map((p) => ({ ...p, meta: routeMeta(p.name), url: pageUrl(p.path) }));
      for (const p of dynamicPages) {
        await writePage(
          p.path,
          head({ title: `${p.meta.title.es} — ${SITE_NAME} · SlackDevs`, description: p.meta.description.es, url: p.url, jsonld: p.meta.noindex ? [] : [crumbs([p.meta.title.es, p.url])], noindex: p.meta.noindex }),
          `<nav><a href="${site}">${SITE_NAME}</a></nav><h1>${esc(p.meta.title.es)}</h1><p>${esc(p.meta.description.es)}</p><p lang="en">${esc(p.meta.description.en)}</p>`,
        );
      }
      const indexedPages = dynamicPages.filter((p) => !p.meta.noindex);

      // sitemap.xml (sin /admin/ ni páginas noindex)
      const urls = [site, ...tools.map(urlOf), sheetsUrl, ...sheets.map((s) => s.url), ...indexedPages.map((p) => p.url)];
      await writeFile(
        join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
          `\n</urlset>\n`,
      );

      // robots.txt: abierto a buscadores y crawlers de IA.
      await writeFile(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}sitemap.xml\n`);

      // llms.txt (resumen) y llms-full.txt (detalle)
      const intro = [
        `# ${SITE_NAME} (SlackDevs)`,
        '',
        `> ${HOME.descriptionEn} The UI is available in Spanish and English. Everything runs client-side: no data leaves the browser.`,
        '',
        `${SITE_NAME} is an independent project by ${BRAND.author} (${BRAND.site}), not affiliated with or endorsed by Anthropic. Tools are grouped by topic and tagged with the Anthropic credentials whose syllabus they practice: ${Object.values(CERTS).map((c) => `${c.code} (${c.name})`).join(', ')}.`,
        '',
        'Pricing and exam data come from public sources; verify them in the official Anthropic documentation.',
        '',
      ];
      const section = (full: boolean) =>
        categories.flatMap((c) => [
          `## ${c.name.en}`,
          '',
          ...tools.filter((t) => t.category === c.key).flatMap((t) =>
            full
              ? [
                  `### ${t.name.en} / ${t.name.es}`,
                  '',
                  `- URL: ${urlOf(t)}`,
                  `- EN: ${t.description.en}`,
                  `- ES: ${t.description.es}`,
                  `- Certifications: ${certList(t)}`,
                  `- Keywords: ${t.keywords.join(', ')}`,
                  '',
                ]
              : [`- [${t.name.en}](${urlOf(t)}): ${t.description.en}`],
          ),
          ...(full ? [] : ['']),
        ]);
      const extra = (full: boolean) => [
        '## Cheatsheets',
        '',
        ...(full ? ['One cheatsheet per credential (content in Spanish): quick reference, core knowledge, workflows, decision tables, troubleshooting, checklists and glossary.', ''] : []),
        ...sheets.flatMap((s) =>
          full
            ? [
                `### Cheatsheet ${s.code} — ${s.certName}`,
                '',
                `- URL: ${s.url}`,
                `- EN: ${s.summary.en}`,
                `- ES: ${s.summary.es}`,
                `- Last reviewed: ${s.reviewedAt}`,
                `- Sections: ${sheetSections.get(s.slug)!.join('; ')}`,
                '',
              ]
            : [`- [Cheatsheet ${s.code} — ${s.certName}](${s.url}): ${s.summary.en}`],
        ),
        ...(full ? [] : ['']),
        '## Community',
        '',
        ...indexedPages.flatMap((p) =>
          full ? [`### ${p.meta.title.en} / ${p.meta.title.es}`, '', `- URL: ${p.url}`, `- EN: ${p.meta.description.en}`, `- ES: ${p.meta.description.es}`, ''] : [`- [${p.meta.title.en}](${p.url}): ${p.meta.description.en}`],
        ),
        ...(full ? [] : ['']),
      ];
      const optional = ['## Optional', '', `- [Full details](${site}llms-full.txt): every tool and cheatsheet with Spanish and English descriptions, certifications and keywords`, `- [SlackDevs](${BRAND.site}): author's site, articles about Claude and Claude Code`, `- [Source code](${BRAND.github}): GitHub repository`, ''];

      await writeFile(join(outDir, 'llms.txt'), [...intro, ...section(false), ...extra(false), ...optional].join('\n'));
      await writeFile(join(outDir, 'llms-full.txt'), [...intro, ...section(true), ...extra(true)].join('\n'));

      config.logger.info(
        `[seo] ${tools.length} páginas de herramienta, ${sheets.length + 1} de cheatsheets, ${dynamicPages.length} de comunidad + sitemap.xml, robots.txt, llms.txt, llms-full.txt`,
      );
    },
  };
}
