<script setup lang="ts">
import { tr } from '@/i18n';
import { STATUS_LABELS } from '../labels';
import type { ProposalStatus } from '../types';

// El estado se comunica con ícono y texto; el color es sólo un refuerzo.
defineProps<{ status: ProposalStatus }>();
</script>

<template>
  <span class="pill status-badge" :class="STATUS_LABELS[status].color" :title="tr(STATUS_LABELS[status].hint)">
    <span aria-hidden="true">{{ STATUS_LABELS[status].icon }}</span> {{ tr(STATUS_LABELS[status].name) }}
  </span>
</template>
