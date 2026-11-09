<script setup lang="ts">
import { CERTS, type CertKey } from '@/lib/certs';

defineProps<{ certs: CertKey[] }>();
</script>

<template>
  <div class="tags">
    <span v-for="c in certs" :key="c" class="tag" :title="CERTS[c].name">
      <span class="dot" :class="CERTS[c].color" />{{ CERTS[c].code }}
    </span>
  </div>
</template>
