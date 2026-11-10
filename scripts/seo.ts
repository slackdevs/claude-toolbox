// Plugin de build para SEO y LLMs. Corre sólo en `vite build`, después de generar dist/:
// - dist/<herramienta>/index.html: HTML estático por herramienta (title, description, canonical, OG, JSON-LD
//   y contenido legible sin JS). Vue lo reemplaza al montar.
// - dist/index.html (home) y dist/404.html (fallback para rutas desconocidas, noindex).
// - sitemap.xml, robots.txt, llms.txt y llms-full.txt (https://llmstxt.org).
// Los datos salen del mismo registro de herramientas que usa la app: no hay que mantener listas aparte.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { runnerImport, type Plugin, type ResolvedConfig } from 'vite';
import type { Localized } from '../src/i18n';
import type { CategoryKey, Tool } from '../src/tools/tool';
import { BRAND } from '../src/lib/brand';

type Cert = { code: string; name: string };

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

      // sitemap.xml
      const urls = [site, ...tools.map(urlOf)];
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
      const optional = ['## Optional', '', `- [Full tool details](${site}llms-full.txt): every tool with Spanish and English descriptions, certifications and keywords`, `- [SlackDevs](${BRAND.site}): author's site, articles about Claude and Claude Code`, `- [Source code](${BRAND.github}): GitHub repository`, ''];

      await writeFile(join(outDir, 'llms.txt'), [...intro, ...section(false), ...optional].join('\n'));
      await writeFile(join(outDir, 'llms-full.txt'), [...intro, ...section(true)].join('\n'));

      config.logger.info(`[seo] ${tools.length} páginas de herramienta + sitemap.xml, robots.txt, llms.txt, llms-full.txt`);
    },
  };
}
