<script setup lang="ts">
import { computed, ref } from 'vue';
import CodeOutput from './CodeOutput.vue';

const props = defineProps<{ tabs: { key: string; label: string; code: string }[]; title?: string }>();
const active = ref(props.tabs[0]?.key ?? '');
const current = computed(() => props.tabs.find((t) => t.key === active.value) ?? props.tabs[0]);
</script>

<template>
  <div>
    <div class="tabs">
      <button v-for="t in tabs" :key="t.key" :class="{ on: t.key === active }" @click="active = t.key">{{ t.label }}</button>
    </div>
    <CodeOutput v-if="current" :code="current.code" :label="title ?? current.label" />
  </div>
</template>
