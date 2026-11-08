<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { certFilter } from '@/composables/useAppState';
import { useStorage } from '@/composables/useStorage';
import type { CertKey } from '@/lib/certs';
import { CERT_INFO, DOMAINS } from './certificaciones.data';

const router = useRouter();
const done = useStorage<Record<string, boolean>>('ct-study', {});
const total = DOMAINS.reduce((a, d) => a + d.topics.length, 0);
const pct = computed(() => Math.round((Object.values(done.value).filter(Boolean).length / total) * 100));
const domainDone = (di: number) => DOMAINS[di]!.topics.filter((_, ti) => done.value[`${di}-${ti}`]).length;

function showTools(key: CertKey) {
  certFilter.value = key;
  router.push('/');
}
</script>

<template>
  <div>
    <div class="cards" style="margin-bottom:16px">
      <div v-for="c in CERT_INFO" :key="c.code" class="card" style="margin:0">
        <span class="pill">{{ c.code }}</span>
        <h3 style="margin:8px 0 4px">{{ c.name }}</h3>
        <p class="note" style="margin:0 0 6px"><b>Para:</b> {{ c.audience }}</p>
        <p style="margin:0 0 6px;font-size:13px">{{ c.focus }}</p>
        <p class="note" style="margin:0 0 8px">{{ c.format }}</p>
        <button class="btn ghost sm" @click="showTools(c.key)">Ver herramientas relacionadas</button>
      </div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
        <h3 style="margin:0">Checklist CCAR-F por dominio</h3>
        <span class="pill">{{ pct }}% completado</span>
      </div>
      <div class="progress" style="margin:10px 0 14px"><div :style="{ width: pct + '%' }" /></div>
      <details v-for="(d, di) in DOMAINS" :key="d.name" class="dom" :open="di === 0">
        <summary><span>{{ d.name }}</span><span class="note">{{ d.weight }}% del examen · {{ domainDone(di) }}/{{ d.topics.length }}</span></summary>
        <label v-for="(t, ti) in d.topics" :key="t" class="chk"><input v-model="done[`${di}-${ti}`]" type="checkbox"> {{ t }}</label>
      </details>
      <p class="note">Formato, precios y ponderaciones de fuentes públicas (2026); confirmalos en la guía oficial del examen en Anthropic Academy antes de rendir. Tu progreso se guarda solo en este navegador.</p>
    </div>
  </div>
</template>
