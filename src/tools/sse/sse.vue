<script setup lang="ts">
import { computed, ref } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import KpiCard from '@/components/KpiCard.vue';
import LintList from '@/components/LintList.vue';
import { tr, useMessages } from '@/i18n';
import { esc, fmt } from '@/lib/format';
import type { Lint } from '@/lib/types';
import { blockContent, parseSse, SSE_MESSAGES, SSE_SAMPLE } from './sse.service';

const t = useMessages({
  es: {
    load: 'Cargar ejemplo',
    raw: 'Stream SSE crudo',
    empty: 'Pegá un stream o cargá el ejemplo.',
    events: 'Eventos',
    inTok: 'Tokens entrada',
    outTok: 'Tokens salida',
    model: 'Modelo',
    toolUse: 'stop_reason = tool_use: ejecutá la herramienta y devolvé un bloque <code>tool_result</code> con el mismo <code>tool_use_id</code> en el próximo mensaje de usuario.',
    block: 'Bloque',
  },
  en: {
    load: 'Load example',
    raw: 'Raw SSE stream',
    empty: 'Paste a stream or load the example.',
    events: 'Events',
    inTok: 'Input tokens',
    outTok: 'Output tokens',
    model: 'Model',
    toolUse: 'stop_reason = tool_use: run the tool and return a <code>tool_result</code> block with the same <code>tool_use_id</code> in the next user message.',
    block: 'Block',
  },
});

const raw = ref('');
const res = computed(() => parseSse(raw.value, tr(SSE_MESSAGES)));
const errors = computed<Lint[]>(() => (res.value?.errors ?? []).map((e) => ['bad', esc(e)]));
const toolUseHint = computed<Lint[]>(() => [['ok', t.value.toolUse]]);
</script>

<template>
  <div>
    <div class="card">
      <div class="btns"><button class="btn ghost sm" @click="raw = tr(SSE_SAMPLE)">{{ t.load }}</button></div>
      <label>{{ t.raw }}<textarea v-model="raw" style="min-height:220px" placeholder="event: message_start&#10;data: {...}" /></label>
    </div>
    <div class="card">
      <div v-if="!res" class="empty">{{ t.empty }}</div>
      <template v-else>
        <div class="kpis">
          <KpiCard :label="t.events" :value="res.events" />
          <KpiCard label="stop_reason" :value="res.stopReason" small />
          <KpiCard :label="t.inTok" :value="fmt(res.inputTokens)" />
          <KpiCard :label="t.outTok" :value="fmt(res.outputTokens)" />
        </div>
        <LintList v-if="errors.length" :items="errors" />
        <p class="note">
          <template v-if="res.model">{{ t.model }}: <code>{{ res.model }}</code> · </template>
          <span v-for="(v, k) in res.counts" :key="k"><code>{{ k }}</code>×{{ v }} </span>
        </p>
        <LintList v-if="res.stopReason === 'tool_use'" :items="toolUseHint" />
        <div v-for="[i, b] in res.blocks" :key="i" style="margin-top:12px">
          <h3>{{ t.block }} {{ i }} · <span class="pill">{{ b.type }}</span> <code v-if="b.name">{{ b.name }}</code></h3>
          <CodeOutput :code="blockContent(b, tr(SSE_MESSAGES))" :label="b.type" />
        </div>
      </template>
    </div>
  </div>
</template>
