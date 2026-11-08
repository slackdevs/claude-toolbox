<script setup lang="ts">
defineProps<{ label: string; value: string | number; small?: boolean }>();
</script>

<template>
  <div class="kpi">
    <span>{{ label }}</span>
    <b :style="small ? 'font-size:15px' : ''"><slot>{{ value }}</slot></b>
  </div>
</template>
