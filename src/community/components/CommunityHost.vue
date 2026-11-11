<script setup lang="ts">
// Diálogos globales de la capa comunitaria: una sola instancia de cada uno. App.vue lo carga de forma diferida
// y sólo en las páginas comunitarias, para que un fallo de esta capa no afecte a las herramientas.
import DonateDialog from './DonateDialog.vue';
import VoterDialog from './VoterDialog.vue';
</script>

<template>
  <VoterDialog />
  <DonateDialog />
</template>
