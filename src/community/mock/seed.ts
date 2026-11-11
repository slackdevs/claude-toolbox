// Datos de ejemplo del modo demo. Todas las propuestas son de Slackdevs; los votantes y donantes son ficticios
// (dominio example.com). Las fechas son fijas para que el ranking de la demo sea reproducible.
import type { CertKey } from '@/lib/certs';
import type { Donation, DonationTier, Proposal, ProposalStatus, ProposalType, Vote, Voter } from '../types';
import { COMMUNITY_CONFIG } from '../config';
import { emailHash, fakeIp, fakeRegion } from './util';

const AUTHOR = { displayName: 'Slackdevs', emailHash: emailHash('slackdevs@example.com') };

const day = (d: string, time = '12:00') => `${d}T${time}:00.000Z`;

interface SeedProposal {
  id: string;
  type: ProposalType;
  title: string;
  description: string;
  certs: CertKey[];
  toolPath?: string;
  status: ProposalStatus;
  estimateHours?: number;
  statusReason?: string;
  duplicateOf?: string;
  publishedPath?: string;
  created: string;
  updated?: string;
  up?: number;
  down?: number;
  donations?: [tier: DonationTier, donor?: string][];
}

const SEED: SeedProposal[] = [
  {
    id: 'p-101', type: 'tool', status: 'open', estimateHours: 16, certs: ['D', 'AF'], created: '2026-10-06', up: 14, down: 1,
    title: 'Simulador de agentic loop paso a paso',
    description:
      'Una herramienta para recorrer un loop agéntico turno por turno: request, `stop_reason`, bloques `tool_use` y `tool_result`.\n\n- Editar la respuesta simulada de cada tool\n- Ver cómo crece el historial de mensajes\n- Marcar los errores típicos (no devolver el `tool_result`, cortar en `max_tokens`)',
    donations: [['coffee', 'Ana'], ['coffee'], ['pizza', 'Equipo Plataforma']],
  },
  {
    id: 'p-102', type: 'improvement', toolPath: '/costos', status: 'open', estimateHours: 6, certs: ['D', 'AF', 'AP'], created: '2026-10-09', up: 11, down: 0,
    title: 'Comparar dos configuraciones de costos lado a lado',
    description:
      'Hoy la calculadora muestra un escenario por vez. La mejora: guardar un **escenario A** y un **escenario B** (modelo, caching, Batch) y ver la diferencia por request, día y mes.',
    donations: [['coffee', 'Lucía'], ['beer']],
  },
  {
    id: 'p-103', type: 'improvement', toolPath: '/hooks', status: 'open', estimateHours: 5, certs: ['B', 'D'], created: '2026-10-12', up: 9, down: 2,
    title: 'Plantillas de hooks listas por caso de uso',
    description:
      'Sumar al generador de hooks una galería de plantillas:\n\n- Bloquear `git push` a main\n- Correr tests antes de terminar (hook `Stop`)\n- Formatear al editar\n- Registrar comandos de Bash para auditoría',
    donations: [['coffee']],
  },
  {
    id: 'p-104', type: 'content', status: 'open', estimateHours: 8, certs: ['D', 'AF'], created: '2026-10-15', up: 8, down: 0,
    title: 'Guía de prompt caching con ejemplos de breakpoints',
    description:
      'Una guía corta y práctica: dónde poner cada `cache_control`, qué invalida el caché y cómo leer `cache_read_input_tokens`. Con ejemplos para system prompt, tools y conversaciones largas.',
    donations: [['beer', 'Martín']],
  },
  {
    id: 'p-105', type: 'tool', status: 'open', estimateHours: 12, certs: ['B'], created: '2026-10-20', up: 6, down: 1,
    title: 'Generador de plugins de Claude Code',
    description:
      'Armar la estructura de un plugin (`.claude-plugin/plugin.json`, `commands/`, `agents/`, `skills/`, `hooks/`) a partir de un formulario, con vista previa de cada archivo y descarga.',
  },
  {
    id: 'p-106', type: 'improvement', toolPath: '/certificaciones', status: 'open', estimateHours: 6, certs: ['A', 'D'], created: '2026-10-23', up: 5, down: 0,
    title: 'Checklist de estudio para CCAO-F y CCDV-F',
    description:
      'El mapa de certificaciones tiene checklist solo para CCAR-F. Sumar los de Associate y Developer, con el mismo guardado de progreso en el navegador.',
    donations: [['coffee', 'Sofía']],
  },
  {
    id: 'p-107', type: 'tool', status: 'received', certs: ['AF', 'AP'], created: '2026-11-07',
    title: 'Visualizador de trazas de subagentes',
    description:
      'Pegar el log de una sesión con subagentes y ver un árbol: quién delegó qué, cuánto contexto recibió cada uno y qué devolvió al coordinador.',
  },
  {
    id: 'p-108', type: 'improvement', toolPath: '/mcp', status: 'received', certs: ['D', 'B'], created: '2026-11-08',
    title: 'Validar la configuración MCP por alcance',
    description:
      'Que el configurador de servidores MCP avise cuando un mismo servidor está definido en más de un alcance (usuario, proyecto, local) y cuál gana.',
  },
  {
    id: 'p-109', type: 'tool', status: 'planned', estimateHours: 10, certs: ['AP', 'A'], created: '2026-09-22', updated: '2026-11-02', up: 19, down: 2,
    title: 'Estimador de ROI para un caso de uso con Claude',
    description:
      'Calcular el retorno de un caso de uso: volumen, minutos ahorrados por tarea, costo de API, costo de revisión humana y tiempo de implementación. Salida lista para pegar en una propuesta.',
    donations: [['pizza', 'Consultora Norte'], ['coffee'], ['coffee', 'Diego']],
  },
  {
    id: 'p-110', type: 'improvement', toolPath: '/tokens', status: 'planned', estimateHours: 4, certs: ['D'], created: '2026-09-28', updated: '2026-11-02', up: 13, down: 0,
    title: 'Estimar tokens de imágenes y PDFs',
    description: 'Sumar al estimador de tokens el cálculo para imágenes (según dimensiones) y para PDFs (por página).',
    donations: [['coffee']],
  },
  {
    id: 'p-111', type: 'content', status: 'in_progress', estimateHours: 20, certs: ['A', 'D', 'AF', 'AP', 'B'], created: '2026-09-15', updated: '2026-11-05', up: 24, down: 1,
    title: 'Cheatsheets por credencial',
    description:
      'Un cheatsheet por cada una de las 5 credenciales: referencia rápida, conceptos clave, workflows, decisiones y checklists, con fecha de revisión y link a la guía oficial.',
    donations: [['beer', 'Paula'], ['coffee'], ['coffee'], ['pizza']],
  },
  {
    id: 'p-112', type: 'improvement', toolPath: '/costos', status: 'published', estimateHours: 3, certs: ['D', 'AF'], created: '2026-09-08', updated: '2026-10-18', up: 17, down: 0,
    publishedPath: '/costos',
    title: 'Sumar la Batch API a la calculadora de costos',
    description: 'Agregar el descuento de la Message Batches API como opción de la calculadora, combinable con prompt caching.',
    donations: [['coffee', 'Ana']],
  },
  {
    id: 'p-113', type: 'tool', status: 'discarded', certs: ['D'], created: '2026-10-02', updated: '2026-10-10', up: 3, down: 6,
    statusReason: 'Fuera de alcance: el Toolbox corre en el navegador y no maneja API keys ni reenvía requests a terceros.',
    title: 'Proxy para llamar a la Claude API desde el navegador',
    description: 'Un servicio que reciba la request desde el navegador y la reenvíe a la Claude API, para probar prompts sin instalar nada.',
    donations: [['coffee']],
  },
  {
    id: 'p-114', type: 'improvement', toolPath: '/hooks', status: 'duplicate', duplicateOf: 'p-103', certs: ['B'], created: '2026-10-27', updated: '2026-10-29',
    statusReason: 'Ya está cubierta por "Plantillas de hooks listas por caso de uso".',
    title: 'Ejemplos de hooks para bloquear comandos peligrosos',
    description: 'Que el generador de hooks traiga ejemplos para bloquear `rm -rf`, `git push --force` y similares.',
  },
];

const voterEmail = (n: number) => `persona${String(n).padStart(2, '0')}@example.com`;

export function seed(): { proposals: Proposal[]; votes: Vote[]; donations: Donation[]; voters: Voter[] } {
  const proposals: Proposal[] = [];
  const votes: Vote[] = [];
  const donations: Donation[] = [];
  const emails = new Set<string>();

  SEED.forEach((s, i) => {
    proposals.push({
      id: s.id, type: s.type, title: s.title, description: s.description, lang: 'es', certs: s.certs, toolPath: s.toolPath,
      status: s.status, estimateHours: s.estimateHours, statusReason: s.statusReason, duplicateOf: s.duplicateOf,
      createdAt: day(s.created), updatedAt: day(s.updated ?? s.created), author: AUTHOR,
      links: s.publishedPath ? { publishedPath: s.publishedPath } : undefined, sample: true,
    });

    // Cada propuesta arranca en un votante distinto para que no voten siempre los mismos.
    const total = (s.up ?? 0) + (s.down ?? 0);
    for (let v = 0; v < total; v++) {
      const email = voterEmail(((i * 3 + v) % 40) + 1);
      emails.add(email);
      votes.push({
        proposalId: s.id, voterEmail: email, value: v < (s.up ?? 0) ? 1 : -1,
        ip: fakeIp(email), region: fakeRegion(email), createdAt: day(s.created, `${String(13 + (v % 10)).padStart(2, '0')}:${String((v * 7) % 60).padStart(2, '0')}`),
      });
    }

    (s.donations ?? []).forEach(([tier, donor], d) => {
      donations.push({
        id: `d-${s.id.slice(2)}-${d + 1}`, proposalId: s.id, tier, amount: COMMUNITY_CONFIG.tiers[tier].amount, status: 'confirmed',
        donorDisplayName: donor, showPublicly: !!donor, createdAt: day(s.created, `${String(15 + d).padStart(2, '0')}:30`),
      });
    });
  });

  const voters: Voter[] = [...emails].sort().map((email) => ({ email, verified: true, consentAt: day('2026-09-01') }));
  return { proposals, votes, donations, voters };
}
