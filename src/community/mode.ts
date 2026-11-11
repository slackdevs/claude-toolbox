// Modo de la capa comunitaria. Vive aparte de api.ts para que el shell (App.vue) pueda consultarlo
// sin arrastrar el backend simulado al bundle principal.
export type CommunityMode = 'mock' | 'http';

export const communityMode: CommunityMode = import.meta.env.VITE_COMMUNITY_API === 'http' ? 'http' : 'mock';

/** Modo demo: los datos viven sólo en este navegador y no se cobra nada. */
export const isDemo = communityMode === 'mock';
