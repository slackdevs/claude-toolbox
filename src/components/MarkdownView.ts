// Renderiza Markdown con nodos de Vue (h), nunca con v-html: el texto del usuario no puede inyectar HTML.
import { computed, defineComponent, h, type PropType, type VNodeChild } from 'vue';
import { parseMarkdown, type Block, type Inline } from '@/lib/markdown';

/** Lleva a un ancla de la página sin tocar la URL (el router usa history real y volvería a hacer scroll arriba). */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ block: 'start' });
  el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

function inline(nodes: Inline[]): VNodeChild[] {
  return nodes.map((n): VNodeChild => {
    switch (n.t) {
      case 'text': return n.v;
      case 'code': return h('code', n.v);
      case 'br': return h('br');
      case 'link':
        return n.href.startsWith('#')
          ? h('a', { href: n.href, onClick: (e: Event) => { e.preventDefault(); scrollToId(n.href.slice(1)); } }, inline(n.c))
          : h('a', { href: n.href, target: '_blank', rel: 'noopener noreferrer nofollow ugc' }, inline(n.c));
      default: return h(n.t, inline(n.c));
    }
  });
}

function item(c: Block[]): VNodeChild[] {
  const [first, ...rest] = c;
  return first?.t === 'p' ? [...inline(first.c), ...blocks(rest)] : blocks(c);
}

function blocks(nodes: Block[]): VNodeChild[] {
  return nodes.map((b): VNodeChild => {
    switch (b.t) {
      case 'p': return h('p', inline(b.c));
      case 'h': return h(`h${b.level}`, { id: b.id }, inline(b.c));
      case 'hr': return h('hr');
      case 'pre': return h('pre', { class: 'md-pre', tabindex: 0 }, [h('code', b.v)]);
      case 'quote': return h('blockquote', blocks(b.c));
      case 'list':
        return h(b.ordered ? 'ol' : 'ul', { start: b.ordered && b.start !== 1 ? b.start : undefined, class: b.items.some((i) => i.checked !== undefined) ? 'md-tasks' : undefined },
          b.items.map((it) => h('li', it.checked === undefined ? item(it.c) : [h('span', { class: 'md-check', 'aria-hidden': 'true' }, it.checked ? '☑' : '☐'), ...item(it.c)])));
      case 'table':
        return h('div', { class: 'md-table', tabindex: 0 }, [
          h('table', [
            h('thead', [h('tr', b.head.map((c) => h('th', { scope: 'col' }, inline(c))))]),
            h('tbody', b.rows.map((r) => h('tr', r.map((c) => h('td', inline(c)))))),
          ]),
        ]);
    }
  });
}

export default defineComponent({
  name: 'MarkdownView',
  props: {
    source: { type: String, default: '' },
    /** Árbol ya parseado (evita volver a parsear documentos grandes). */
    blocks: { type: Array as PropType<Block[]>, default: undefined },
    /** Perfil completo (títulos, tablas, código): sólo para contenido propio, no de usuarios. */
    full: Boolean,
  },
  setup(props) {
    const tree = computed(() => props.blocks ?? parseMarkdown(props.source, { full: props.full }));
    return () => h('div', { class: ['md', { 'md-full': props.full }] }, blocks(tree.value));
  },
});
