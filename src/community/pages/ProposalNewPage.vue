<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import CertTags from '@/components/CertTags.vue';
import MarkdownView from '@/components/MarkdownView';
import PageHead from '@/components/PageHead.vue';
import { useStorage } from '@/composables/useStorage';
import { locale, tr, useMessages } from '@/i18n';
import { CERT_KEYS, CERTS, type CertKey } from '@/lib/certs';
import { findTool, tools } from '@/tools';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge.vue';
import { COMMUNITY_CONFIG } from '../config';
import { errorText } from '../format';
import { STATUS_LABELS, TYPE_LABELS } from '../labels';
import { CommunityError, PROPOSAL_TYPES, type ProposalSummary, type ProposalType } from '../types';

const t = useMessages({
  es: {
    type: 'Tipo de propuesta', title: 'Título', titleHint: 'Corto y concreto: qué querés que exista.',
    description: 'Descripción', descHint: 'Markdown simple: **negrita**, *cursiva*, listas con "- ", `código` y [links](https://…).',
    certs: 'Credenciales relacionadas', certsHint: 'Elegí al menos una.', tool: 'Herramienta a mejorar', toolPick: 'Elegí una herramienta…',
    email: 'Tu email', emailHint: 'No se publica. Sirve para avisarte cuando cambie de estado.', name: 'Nombre público (opcional)', namePh: 'Anónimo',
    submit: 'Enviar propuesta', sending: 'Enviando…', draft: 'El borrador se guarda en este navegador.', discard: 'Descartar borrador',
    preview: 'Vista previa', previewTitle: 'Título de la propuesta', previewEmpty: 'La descripción aparece acá mientras escribís.',
    dupTitle: 'Posibles duplicados', dupHint: 'Si alguna ya cubre tu idea, sumale tu voto en lugar de repetirla.',
    chars: (n: number, max: number) => `${n}/${max}`,
    errors: {
      title: 'Escribí un título.', description: 'Contá de qué se trata.', certs: 'Elegí al menos una credencial.',
      toolPath: 'Elegí la herramienta que querés mejorar.', email: 'Ingresá un email válido.',
    },
    fix: 'Revisá los campos marcados.',
    doneTitle: 'Recibida', done: 'Sebastián la revisa y le asigna un tiempo estimado antes de abrirla a votación.',
    doneNote: 'Mientras esté en revisión no se puede votar ni donar.', view: 'Ver mi propuesta', another: 'Proponer otra', back: 'Volver a las propuestas',
  },
  en: {
    type: 'Proposal type', title: 'Title', titleHint: 'Short and specific: what you want to exist.',
    description: 'Description', descHint: 'Simple Markdown: **bold**, *italic*, lists with "- ", `code` and [links](https://…).',
    certs: 'Related credentials', certsHint: 'Pick at least one.', tool: 'Tool to improve', toolPick: 'Pick a tool…',
    email: 'Your email', emailHint: 'Never published. Used to notify you when the status changes.', name: 'Public name (optional)', namePh: 'Anonymous',
    submit: 'Submit proposal', sending: 'Sending…', draft: 'The draft is saved in this browser.', discard: 'Discard draft',
    preview: 'Preview', previewTitle: 'Proposal title', previewEmpty: 'The description shows up here as you type.',
    dupTitle: 'Possible duplicates', dupHint: 'If one already covers your idea, vote for it instead of repeating it.',
    chars: (n: number, max: number) => `${n}/${max}`,
    errors: {
      title: 'Write a title.', description: 'Describe what it is about.', certs: 'Pick at least one credential.',
      toolPath: 'Pick the tool you want to improve.', email: 'Enter a valid email.',
    },
    fix: 'Check the highlighted fields.',
    doneTitle: 'Received', done: 'Sebastián reviews it and assigns an estimated time before opening it to voting.',
    doneNote: 'While it is under review it cannot be voted on or funded.', view: 'View my proposal', another: 'Propose another', back: 'Back to proposals',
  },
});

type Field = 'title' | 'description' | 'certs' | 'toolPath' | 'email';
interface Draft { type: ProposalType; title: string; description: string; certs: CertKey[]; toolPath: string; email: string; displayName: string }

const LIMITS = COMMUNITY_CONFIG.limits;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const blank = (): Draft => ({ type: 'tool', title: '', description: '', certs: [], toolPath: '', email: '', displayName: '' });

const route = useRoute();
const form = useStorage<Draft>('ct-proposal-draft', blank());
// Un borrador viejo o corrupto no debe romper el formulario.
form.value = { ...blank(), ...form.value, certs: (form.value.certs ?? []).filter((c) => CERT_KEYS.includes(c)) };

// Precarga desde la URL ("Proponer mejora" de una herramienta, "Proponer mejora a este cheatsheet").
const q = (key: string) => String(route.query[key] ?? '');
const qType = PROPOSAL_TYPES.find((x) => x === q('type'));
const qTool = findTool(q('tool'));
const qCert = CERT_KEYS.find((x) => x === q('cert'));
if (qType) form.value.type = qType;
if (qTool) {
  form.value.type = 'improvement';
  form.value.toolPath = qTool.path;
  for (const c of qTool.certs) if (!form.value.certs.includes(c)) form.value.certs.push(c);
}
if (qCert && !form.value.certs.includes(qCert)) form.value.certs.push(qCert);

const touched = reactive<Record<Field, boolean>>({ title: false, description: false, certs: false, toolPath: false, email: false });
const serverError = ref('');
const sending = ref(false);
const created = shallowRef<ProposalSummary | null>(null);

const errors = computed(() => {
  const f = form.value;
  const e: Partial<Record<Field, string>> = {};
  if (!f.title.trim()) e.title = t.value.errors.title;
  if (!f.description.trim()) e.description = t.value.errors.description;
  if (!f.certs.length) e.certs = t.value.errors.certs;
  if (f.type === 'improvement' && !f.toolPath) e.toolPath = t.value.errors.toolPath;
  if (!EMAIL_RE.test(f.email.trim())) e.email = t.value.errors.email;
  return e;
});
/** El error se muestra recién cuando el campo se tocó (o se intentó enviar): no se interrumpe al escribir. */
const shown = (f: Field) => (touched[f] ? errors.value[f] : undefined);

// Posibles duplicados: coincidencia simple por palabras del título contra las propuestas existentes.
const existing = shallowRef<ProposalSummary[]>([]);
onMounted(async () => {
  try {
    existing.value = await api.listProposals();
  } catch {
    /* sin la lista no hay sugerencias; el formulario sigue funcionando */
  }
});
const words = (s: string) => new Set(s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter((w) => w.length > 3));
const duplicates = computed(() => {
  const mine = words(form.value.title);
  if (!mine.size) return [];
  const need = mine.size >= 3 ? 2 : 1;
  return existing.value
    .map((p) => ({ p, hits: [...words(p.title)].filter((w) => mine.has(w)).length }))
    .filter((x) => x.hits >= need)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 3)
    .map((x) => x.p);
});

async function submit() {
  for (const k of Object.keys(touched) as Field[]) touched[k] = true;
  serverError.value = '';
  const firstError = (Object.keys(errors.value) as Field[])[0];
  if (firstError) {
    serverError.value = t.value.fix;
    document.getElementById(`f-${firstError}`)?.focus();
    return;
  }
  sending.value = true;
  try {
    const f = form.value;
    created.value = await api.createProposal({
      type: f.type, title: f.title, description: f.description, lang: locale.value, certs: f.certs,
      toolPath: f.type === 'improvement' ? f.toolPath : undefined, email: f.email, displayName: f.displayName,
    });
    form.value = { ...blank(), email: f.email, displayName: f.displayName };
    for (const k of Object.keys(touched) as Field[]) touched[k] = false;
  } catch (e) {
    serverError.value = errorText(e);
    if (e instanceof CommunityError && e.field && e.field in touched) document.getElementById(`f-${e.field}`)?.focus();
  } finally {
    sending.value = false;
  }
}

function discard() {
  form.value = blank();
  for (const k of Object.keys(touched) as Field[]) touched[k] = false;
  serverError.value = '';
}
</script>

<template>
  <div>
    <PageHead />

    <div v-if="created" class="card done-card" role="status">
      <StatusBadge status="received" />
      <h2>{{ t.doneTitle }}</h2>
      <p><strong>{{ created.title }}</strong></p>
      <p>{{ t.done }}</p>
      <p class="note">{{ t.doneNote }}</p>
      <div class="btns">
        <RouterLink class="btn" :to="`/propuestas/${created.id}`">{{ t.view }}</RouterLink>
        <button class="btn ghost" type="button" @click="created = null">{{ t.another }}</button>
        <RouterLink class="btn ghost" to="/propuestas">{{ t.back }}</RouterLink>
      </div>
    </div>

    <div v-else class="grid2 new-grid">
      <form class="card" novalidate @submit.prevent="submit">
        <fieldset class="field">
          <legend>{{ t.type }}</legend>
          <div class="seg-group">
            <label v-for="k in PROPOSAL_TYPES" :key="k" class="seg-radio">
              <input v-model="form.type" type="radio" name="type" :value="k">
              <span><span aria-hidden="true">{{ TYPE_LABELS[k].icon }}</span> {{ tr(TYPE_LABELS[k].name) }}</span>
            </label>
          </div>
        </fieldset>

        <div v-if="form.type === 'improvement'" class="field">
          <label for="f-toolPath">{{ t.tool }}</label>
          <select id="f-toolPath" v-model="form.toolPath" :aria-invalid="!!shown('toolPath')" :aria-describedby="shown('toolPath') ? 'e-toolPath' : undefined" @blur="touched.toolPath = true">
            <option value="">{{ t.toolPick }}</option>
            <option v-for="tl in tools" :key="tl.path" :value="tl.path">{{ tr(tl.name) }}</option>
          </select>
          <p v-if="shown('toolPath')" id="e-toolPath" class="field-error">{{ shown('toolPath') }}</p>
        </div>

        <div class="field">
          <label for="f-title">{{ t.title }} <span class="counter">{{ t.chars(form.title.length, LIMITS.title) }}</span></label>
          <input id="f-title" v-model="form.title" type="text" :maxlength="LIMITS.title" autocomplete="off" :aria-invalid="!!shown('title')"
            :aria-describedby="shown('title') ? 'e-title' : 'h-title'" @blur="touched.title = true">
          <p v-if="shown('title')" id="e-title" class="field-error">{{ shown('title') }}</p>
          <p v-else id="h-title" class="field-hint">{{ t.titleHint }}</p>
        </div>

        <div v-if="duplicates.length" class="dups" role="status">
          <b>{{ t.dupTitle }}</b>
          <ul>
            <li v-for="p in duplicates" :key="p.id">
              <RouterLink :to="`/propuestas/${p.id}`" target="_blank">{{ p.title }}</RouterLink>
              <span class="tag">{{ tr(STATUS_LABELS[p.status].name) }}</span>
            </li>
          </ul>
          <p class="note">{{ t.dupHint }}</p>
        </div>

        <div class="field">
          <label for="f-description">{{ t.description }} <span class="counter">{{ t.chars(form.description.length, LIMITS.description) }}</span></label>
          <textarea id="f-description" v-model="form.description" rows="8" :maxlength="LIMITS.description" :aria-invalid="!!shown('description')"
            :aria-describedby="shown('description') ? 'e-description' : 'h-description'" @blur="touched.description = true" />
          <p v-if="shown('description')" id="e-description" class="field-error">{{ shown('description') }}</p>
          <p v-else id="h-description" class="field-hint">{{ t.descHint }}</p>
        </div>

        <fieldset class="field" :aria-describedby="shown('certs') ? 'e-certs' : 'h-certs'">
          <legend>{{ t.certs }}</legend>
          <div class="check-chips">
            <label v-for="(k, i) in CERT_KEYS" :key="k" class="check-chip">
              <input :id="i === 0 ? 'f-certs' : undefined" v-model="form.certs" type="checkbox" :value="k" :aria-invalid="!!shown('certs')" @change="touched.certs = true">
              <span><span class="dot" :class="CERTS[k].color" />{{ CERTS[k].code }}</span>
            </label>
          </div>
          <p v-if="shown('certs')" id="e-certs" class="field-error">{{ shown('certs') }}</p>
          <p v-else id="h-certs" class="field-hint">{{ t.certsHint }}</p>
        </fieldset>

        <div class="row">
          <div class="field">
            <label for="f-email">{{ t.email }}</label>
            <input id="f-email" v-model="form.email" type="email" autocomplete="email" :aria-invalid="!!shown('email')"
              :aria-describedby="shown('email') ? 'e-email' : 'h-email'" @blur="touched.email = true">
            <p v-if="shown('email')" id="e-email" class="field-error">{{ shown('email') }}</p>
            <p v-else id="h-email" class="field-hint">{{ t.emailHint }}</p>
          </div>
          <div class="field">
            <label for="f-name">{{ t.name }}</label>
            <input id="f-name" v-model="form.displayName" type="text" maxlength="40" autocomplete="nickname" :placeholder="t.namePh">
          </div>
        </div>

        <p v-if="serverError" class="field-error" role="alert">{{ serverError }}</p>
        <div class="btns">
          <button class="btn" type="submit" :disabled="sending">{{ sending ? t.sending : t.submit }}</button>
          <button class="btn ghost" type="button" :disabled="sending" @click="discard">{{ t.discard }}</button>
        </div>
        <p class="note">{{ t.draft }}</p>
      </form>

      <section class="card preview" :aria-label="t.preview">
        <h3>{{ t.preview }}</h3>
        <div class="pcard-tags">
          <span class="tag"><span aria-hidden="true">{{ TYPE_LABELS[form.type].icon }}</span> {{ tr(TYPE_LABELS[form.type].name) }}</span>
          <StatusBadge status="received" />
          <span v-if="form.type === 'improvement' && form.toolPath" class="tag">{{ tr(findTool(form.toolPath)!.name) }}</span>
        </div>
        <p class="preview-title" :class="{ faint: !form.title.trim() }">{{ form.title.trim() || t.previewTitle }}</p>
        <CertTags :certs="form.certs" />
        <MarkdownView v-if="form.description.trim()" :source="form.description" />
        <p v-else class="note">{{ t.previewEmpty }}</p>
      </section>
    </div>
  </div>
</template>
