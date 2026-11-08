<script setup lang="ts">
import { MODELS } from '@/lib/models';

const model = defineModel<string>({ required: true });
</script>

<template>
  <select v-model="model">
    <option v-for="m in MODELS" :key="m.id" :value="m.id">{{ m.name }} — {{ m.id }}</option>
  </select>
</template>
