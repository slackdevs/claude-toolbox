// Estado compartido de la capa comunitaria (sólo UI: los datos viven detrás de CommunityApi).
import { ref } from 'vue';

/** Sube cada vez que cambia algo que afecta a varias pantallas (sesión, donación, reset de la demo): los listados se recargan. */
export const dataVersion = ref(0);

export const bumpData = () => void dataVersion.value++;
