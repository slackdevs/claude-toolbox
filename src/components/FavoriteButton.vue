<script setup lang="ts">
import { computed } from 'vue';
import { favorites, toggleFavorite } from '@/composables/useAppState';

const props = defineProps<{ path: string; inline?: boolean }>();
const on = computed(() => favorites.value.includes(props.path));
</script>

<template>
  <button
    class="fav" :class="{ on, hbtn: inline }" :style="inline ? 'position:static;font-size:15px' : ''"
    :title="on ? 'Quitar de favoritos' : 'Agregar a favoritos'"
    @click.prevent.stop="toggleFavorite(path)"
  >★</button>
</template>
