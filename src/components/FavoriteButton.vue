<script setup lang="ts">
import { computed } from 'vue';
import { favorites, toggleFavorite } from '@/composables/useAppState';
import { ui } from '@/i18n';

const props = defineProps<{ path: string; inline?: boolean }>();
const on = computed(() => favorites.value.includes(props.path));
</script>

<template>
  <button
    class="fav" :class="{ on, hbtn: inline }" :style="inline ? 'position:static;font-size:15px' : ''"
    :title="on ? ui.removeFav : ui.addFav"
    @click.prevent.stop="toggleFavorite(path)"
  >★</button>
</template>
