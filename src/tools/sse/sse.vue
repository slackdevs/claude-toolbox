<script setup lang="ts">
import { computed, ref } from 'vue';
import CodeOutput from '@/components/CodeOutput.vue';
import KpiCard from '@/components/KpiCard.vue';
import LintList from '@/components/LintList.vue';
import { esc, fmt } from '@/lib/format';
import { blockContent, parseSse, SSE_SAMPLE } from './sse.service';

const raw = ref('');
const res = computed(() => parseSse(raw.value));
</script>

<template>
  <div>
    <div class="card">
      <div class="btns"><button class="btn ghost sm" @click="raw = SSE_SAMPLE">Cargar ejemplo</button></div>
      <label>Stream SSE crudo<textarea v-model="raw" style="min-height:220px" placeholder="event: message_start&#10;data: {...}" /></label>
    </div>
    <div class="card">
      <div v-if="!res" class="empty">Pegá un stream o cargá el ejemplo.</div>
      <template v-else>
        <div class="kpis">
          <KpiCard label="Eventos" :value="res.events" />
          <KpiCard label="stop_reason" :value="res.stopReason" small />
          <KpiCard label="Tokens entrada" :value="fmt(res.inputTokens)" />
          <KpiCard label="Tokens salida" :value="fmt(res.outputTokens)" />
        </div>
        <LintList v-if="res.errors.length" :items="res.errors.map((e) => ['bad', esc(e)])" />
        <p class="note">
          <template v-if="res.model">Modelo: <code>{{ res.model }}</code> · </template>
          <span v-for="(v, k) in res.counts" :key="k"><code>{{ k }}</code>×{{ v }} </span>
        </p>
        <LintList v-if="res.stopReason === 'tool_use'" :items="[['ok', 'stop_reason = tool_use: ejecutá la herramienta y devolvé un bloque <code>tool_result</code> con el mismo <code>tool_use_id</code> en el próximo mensaje de usuario.']]" />
        <div v-for="[i, b] in res.blocks" :key="i" style="margin-top:12px">
          <h3>Bloque {{ i }} · <span class="pill">{{ b.type }}</span> <code v-if="b.name">{{ b.name }}</code></h3>
          <CodeOutput :code="blockContent(b)" :label="b.type" />
        </div>
      </template>
    </div>
  </div>
</template>
