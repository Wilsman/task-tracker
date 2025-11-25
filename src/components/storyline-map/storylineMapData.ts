import type { Node, Edge } from "@xyflow/react";

// Layout constants for better alignment
const ROW_HEIGHT = 120;
const COL_WIDTH = 280;

// Ending IDs for easy reference
export const ENDING_IDS = [
  "debtor-ending",
  "survivor-ending",
  "fallen-ending",
  "savior-ending",
] as const;

export type EndingId = (typeof ENDING_IDS)[number];

// Find path from prologue to a target ending using BFS
export function findPathToEnding(
  targetEndingId: string,
  nodes: Node[],
  edges: Edge[]
): Node[] {
  // Build adjacency list (reverse direction - from target to sources)
  const incomingEdges = new Map<string, string[]>();
  for (const edge of edges) {
    const sources = incomingEdges.get(edge.target) || [];
    sources.push(edge.source);
    incomingEdges.set(edge.target, sources);
  }

  // BFS from ending back to prologue
  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const queue: string[] = [targetEndingId];
  visited.add(targetEndingId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === "prologue") break;

    const sources = incomingEdges.get(current) || [];
    for (const source of sources) {
      if (!visited.has(source)) {
        visited.add(source);
        parent.set(source, current);
        queue.push(source);
      }
    }
  }

  // Reconstruct path from prologue to ending
  const path: string[] = [];
  let current: string | undefined = "prologue";
  while (current) {
    path.push(current);
    current = parent.get(current);
  }

  // Convert to nodes
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return path.map((id) => nodeMap.get(id)).filter(Boolean) as Node[];
}

// Extract breakdown info from a path
export interface PathBreakdown {
  steps: Array<{
    id: string;
    label: string;
    description?: string;
    cost?: number;
    isTimeGate?: boolean;
    timeGateHours?: number;
  }>;
  totalCostRoubles: number;
  totalCostBTC: number;
  totalTimeGateHours: number;
}

export function getPathBreakdown(pathNodes: Node[]): PathBreakdown {
  const steps: PathBreakdown["steps"] = [];
  let totalCostRoubles = 0;
  let totalCostBTC = 0;
  let totalTimeGateHours = 0;

  for (const node of pathNodes) {
    const data = node.data as Record<string, unknown>;
    const label = (data.label as string) || node.id;
    const description = data.description as string | undefined;
    const cost = data.cost as number | undefined;

    // Detect time gates from description
    const timeGateMatch = description?.match(/(\d+)\s*hour/i);
    const isTimeGate = !!timeGateMatch;
    const timeGateHours = timeGateMatch ? parseInt(timeGateMatch[1], 10) : 0;

    if (isTimeGate) {
      totalTimeGateHours += timeGateHours;
    }

    if (cost !== undefined && cost > 0) {
      // BTC costs are < 1000, rouble costs are >= 1000
      if (cost < 1000) {
        totalCostBTC += cost;
      } else {
        totalCostRoubles += cost;
      }
    }

    steps.push({
      id: node.id,
      label,
      description,
      cost,
      isTimeGate,
      timeGateHours: isTimeGate ? timeGateHours : undefined,
    });
  }

  return {
    steps,
    totalCostRoubles,
    totalCostBTC,
    totalTimeGateHours,
  };
}

// Initial nodes based on the Tarkov 1.0 storyline flowchart
// Source: STORYLINE_FLOWCHART.md
export const initialNodes: Node[] = [
  // ============ PROLOGUE: FALLING SKIES ============
  {
    id: "prologue",
    type: "story",
    position: { x: 0, y: -ROW_HEIGHT * 2 },
    data: {
      label: "Prologue: Falling Skies",
      description: "Investigate crash on Woods, retrieve flight recorder & transcripts",
      note: "Requires Prapor LL2",
    },
  },
  {
    id: "retrieve-case",
    type: "story",
    position: { x: 0, y: -ROW_HEIGHT },
    data: {
      label: "Retrieve Armored Case",
      description: "Recover the armored case from plane wreckage on Woods",
    },
  },

  // ============ DECISION 1: ARMORED CASE ============
  {
    id: "start",
    type: "decision",
    position: { x: 0, y: 0 },
    data: {
      label: "Decision 1: The Armored Case",
      description: "Hand over to Prapor or keep it for yourself?",
      isIrreversible: true,
    },
  },

  // ============ PRAPOR'S BRANCH (Left side - Green) ============
  {
    id: "give-prapor",
    type: "story",
    position: { x: -COL_WIDTH * 1.2, y: ROW_HEIGHT },
    data: {
      label: "Hand Over to Prapor",
      description: "₽1M reward, keep Prapor's trust (Recommended)",
      cost: -1000000, // Negative = reward
      isIrreversible: true,
    },
  },
  {
    id: "the-ticket-prapor",
    type: "story",
    position: { x: -COL_WIDTH * 1.2, y: ROW_HEIGHT * 2 },
    data: {
      label: "The Ticket Quest",
      description: "Build Intel Center 1, wait for Kerman's call",
      note: "Hideout: Intelligence Center Level 1",
    },
  },
  {
    id: "contact-kerman-prapor",
    type: "story",
    position: { x: -COL_WIDTH * 1.2, y: ROW_HEIGHT * 3 },
    data: {
      label: "Contact Mr. Kerman",
      description: "Establish secure line via hideout intel center",
    },
  },
  {
    id: "investigate-lighthouse",
    type: "story",
    position: { x: -COL_WIDTH * 1.2, y: ROW_HEIGHT * 4 },
    data: {
      label: "Investigate Lighthouse Camp",
      description: "Search Prapor's camp on Lighthouse for clues",
    },
  },
  {
    id: "unlock-lightkeeper",
    type: "story",
    position: { x: -COL_WIDTH * 1.2, y: ROW_HEIGHT * 5 },
    data: {
      label: "Unlock Lightkeeper",
      description: "Complete tasks to gain access to Lightkeeper trader",
    },
  },
  {
    id: "recover-case-lk",
    type: "story",
    position: { x: -COL_WIDTH * 1.2, y: ROW_HEIGHT * 6 },
    data: {
      label: "Recover Case from LK",
      description: "Lightkeeper returns the case contents after his requests",
    },
  },

  // ============ INDEPENDENT BRANCH (Right side - Gray/Purple) ============
  {
    id: "keep-case",
    type: "story",
    position: { x: COL_WIDTH * 1.2, y: ROW_HEIGHT },
    data: {
      label: "Keep the Case",
      description: "Lose almost ALL Prapor rep, ~58 hour unlock",
      isIrreversible: true,
    },
  },
  {
    id: "the-ticket-keep",
    type: "story",
    position: { x: COL_WIDTH * 1.2, y: ROW_HEIGHT * 2 },
    data: {
      label: "The Ticket Quest",
      description: "Build Intel Center 1, Kerman contacts you",
      note: "Hideout: Intelligence Center Level 1",
    },
  },
  {
    id: "ask-mechanic",
    type: "story",
    position: { x: COL_WIDTH * 1.2, y: ROW_HEIGHT * 3 },
    data: {
      label: "Ask Mechanic for Help",
      description: "Case is locked - need signal jammer from Labs",
    },
  },
  {
    id: "prepare-labs",
    type: "story",
    position: { x: COL_WIDTH * 1.2, y: ROW_HEIGHT * 4 },
    data: {
      label: "Prepare for Labs",
      description: "Acquire Labs keycard if needed",
      note: "Optional: Get keycard access",
    },
  },
  {
    id: "obtain-jammer",
    type: "story",
    position: { x: COL_WIDTH * 1.2, y: ROW_HEIGHT * 5 },
    data: {
      label: "Obtain Signal Jammer",
      description: "Find experimental jammer in The Lab",
    },
  },
  {
    id: "unlock-case-jammer",
    type: "story",
    position: { x: COL_WIDTH * 1.2, y: ROW_HEIGHT * 6 },
    data: {
      label: "Unlock the Case",
      description: "Use jammer to crack open - get Ticket keycard + instructions",
    },
  },

  // ============ PATHS CONVERGE - READ INSTRUCTIONS ============
  {
    id: "read-instructions",
    type: "story",
    position: { x: 0, y: ROW_HEIGHT * 7 },
    data: {
      label: "Read Case Instructions",
      description: "Examine documents - contains original escape plan for Tarkov",
    },
  },
  {
    id: "report-kerman",
    type: "story",
    position: { x: 0, y: ROW_HEIGHT * 8 },
    data: {
      label: "Report to Kerman",
      description: "Inform him of case contents and the escape plan",
    },
  },

  // ============ DECISION 2: TRUST KERMAN ============
  {
    id: "trust-kerman",
    type: "decision",
    position: { x: 0, y: ROW_HEIGHT * 9 },
    data: {
      label: "Decision 2: Trust Mr. Kerman?",
      description: "Follow his plan or go your own way?",
      isIrreversible: true,
    },
  },

  // ============ KERMAN'S PATH (Left - Green/Best endings) ============
  {
    id: "trust-yes",
    type: "story",
    position: { x: -COL_WIDTH * 1.2, y: ROW_HEIGHT * 10 },
    data: {
      label: "Trust Kerman",
      description: "Side with Kerman's alternative escape plan",
    },
  },
  {
    id: "build-replacement-key",
    type: "story",
    position: { x: -COL_WIDTH * 1.2, y: ROW_HEIGHT * 11 },
    data: {
      label: "Build Replacement Key",
      description: "Gather: RFID Encrypter, Lab Master Pass, Blank RFID, Encryptor Chip",
      note: "Items from Labs offices (Kruglov's office)",
    },
  },
  {
    id: "hideout-solar",
    type: "story",
    position: { x: -COL_WIDTH * 1.2, y: ROW_HEIGHT * 12 },
    data: {
      label: "Install Solar Power",
      description: "Hideout upgrade needed for encryption setup",
      note: "Hideout: Solar Power Module",
    },
  },
  {
    id: "activate-ticket",
    type: "story",
    position: { x: -COL_WIDTH * 1.2, y: ROW_HEIGHT * 13 },
    data: {
      label: "Activate the Ticket",
      description: "Use Intel Center to encrypt/activate keycard",
    },
  },
  {
    id: "side-quests",
    type: "decision",
    position: { x: -COL_WIDTH * 1.2, y: ROW_HEIGHT * 14 },
    data: {
      label: "Complete ALL Side Quests?",
      description: "Batya, Bogatyr, Chronicles of Ryzhy required for Savior",
      isIrreversible: true,
    },
  },
  {
    id: "terminal-battle",
    type: "decision",
    position: { x: -COL_WIDTH * 1.2, y: ROW_HEIGHT * 15 },
    data: {
      label: "Terminal Battle",
      description: "Fight Black Division at Terminal - Do you survive?",
      isIrreversible: true,
    },
  },

  // ============ REFUSE KERMAN PATH (Right - Blue/Survivor or Red/Debtor) ============
  {
    id: "trust-no",
    type: "story",
    position: { x: COL_WIDTH * 1.2, y: ROW_HEIGHT * 10 },
    data: {
      label: "Refuse Kerman",
      description: "Follow original instructions from the case",
    },
  },
  {
    id: "head-to-terminal",
    type: "story",
    position: { x: COL_WIDTH * 1.2, y: ROW_HEIGHT * 11 },
    data: {
      label: "Head to Terminal",
      description: "Go to port Terminal via Shoreline checkpoint",
    },
  },
  {
    id: "use-ticket-terminal",
    type: "story",
    position: { x: COL_WIDTH * 1.2, y: ROW_HEIGHT * 12 },
    data: {
      label: "Use Ticket at Terminal",
      description: "Swipe keycard at gate intercom - alerts authorities",
    },
  },
  {
    id: "meet-prapor",
    type: "story",
    position: { x: COL_WIDTH * 1.2, y: ROW_HEIGHT * 13 },
    data: {
      label: "Meet Prapor",
      description: "Prapor arrives with his men - he controls this exit",
    },
  },

  // ============ DECISION 3: PRAPOR'S BRIBE ============
  {
    id: "prapor-bribe",
    type: "decision",
    position: { x: COL_WIDTH * 1.2, y: ROW_HEIGHT * 14 },
    data: {
      label: "Decision 3: Pay Prapor's Bribe?",
      description: "₽500M to escape or refuse?",
      isIrreversible: true,
    },
  },
  {
    id: "pay-500m",
    type: "story",
    position: { x: COL_WIDTH * 0.6, y: ROW_HEIGHT * 15 },
    data: {
      label: "Pay ₽500 Million",
      description: "Buy your freedom from Prapor",
      cost: 500000000,
    },
  },
  {
    id: "cant-pay",
    type: "story",
    position: { x: COL_WIDTH * 1.8, y: ROW_HEIGHT * 15 },
    data: {
      label: "Can't/Won't Pay",
      description: "Refuse or unable to pay Prapor's bribe",
      note: "Initially disabled to prevent rushing worst ending",
    },
  },

  // ============ ENDINGS ============
  {
    id: "savior-ending",
    type: "ending",
    position: { x: -COL_WIDTH * 1.8, y: ROW_HEIGHT * 17 },
    data: {
      label: "🌟 Savior Ending",
      description: "Best: Save Tarkov, thwart bad actors. Complete ALL side quests + survive Terminal",
      endingType: "savior",
    },
  },
  {
    id: "fallen-ending",
    type: "ending",
    position: { x: -COL_WIDTH * 0.6, y: ROW_HEIGHT * 17 },
    data: {
      label: "💀 Fallen Ending",
      description: "Escape but 'fall into darkness' - skipped side quests or failed Terminal",
      endingType: "fallen",
    },
  },
  {
    id: "survivor-ending",
    type: "ending",
    position: { x: COL_WIDTH * 0.6, y: ROW_HEIGHT * 17 },
    data: {
      label: "🛡️ Survivor Ending",
      description: "Selfish: Buy freedom with ₽500M, Tarkov left to rot",
      endingType: "survivor",
    },
  },
  {
    id: "debtor-ending",
    type: "ending",
    position: { x: COL_WIDTH * 1.8, y: ROW_HEIGHT * 17 },
    data: {
      label: "⛓️ Debtor Ending",
      description: "Worst: 'Escape without escaping yourself' - debts catch up",
      endingType: "debtor",
    },
  },
];

export const initialEdges: Edge[] = [
  // ============ PROLOGUE ============
  {
    id: "e-prologue-retrieve",
    source: "prologue",
    target: "retrieve-case",
    style: { stroke: "#666" },
  },
  {
    id: "e-retrieve-start",
    source: "retrieve-case",
    target: "start",
    style: { stroke: "#666" },
  },

  // ============ DECISION 1: ARMORED CASE ============
  {
    id: "e-start-give",
    source: "start",
    target: "give-prapor",
    label: "Hand Over",
    style: { stroke: "#22c55e" },
  },
  {
    id: "e-start-keep",
    source: "start",
    target: "keep-case",
    label: "Keep It",
    style: { stroke: "#8b5cf6" },
  },

  // ============ PRAPOR'S BRANCH (Green path - Recommended) ============
  {
    id: "e-give-ticket",
    source: "give-prapor",
    target: "the-ticket-prapor",
    style: { stroke: "#22c55e" },
  },
  {
    id: "e-ticket-contact",
    source: "the-ticket-prapor",
    target: "contact-kerman-prapor",
    style: { stroke: "#22c55e" },
  },
  {
    id: "e-contact-investigate",
    source: "contact-kerman-prapor",
    target: "investigate-lighthouse",
    style: { stroke: "#22c55e" },
  },
  {
    id: "e-investigate-lk",
    source: "investigate-lighthouse",
    target: "unlock-lightkeeper",
    style: { stroke: "#22c55e" },
  },
  {
    id: "e-lk-recover",
    source: "unlock-lightkeeper",
    target: "recover-case-lk",
    style: { stroke: "#22c55e" },
  },
  {
    id: "e-recover-read",
    source: "recover-case-lk",
    target: "read-instructions",
    style: { stroke: "#22c55e" },
  },

  // ============ INDEPENDENT BRANCH (Purple path) ============
  {
    id: "e-keep-ticket",
    source: "keep-case",
    target: "the-ticket-keep",
    style: { stroke: "#8b5cf6" },
  },
  {
    id: "e-ticket-mechanic",
    source: "the-ticket-keep",
    target: "ask-mechanic",
    style: { stroke: "#8b5cf6" },
  },
  {
    id: "e-mechanic-labs",
    source: "ask-mechanic",
    target: "prepare-labs",
    style: { stroke: "#8b5cf6" },
  },
  {
    id: "e-labs-jammer",
    source: "prepare-labs",
    target: "obtain-jammer",
    style: { stroke: "#8b5cf6" },
  },
  {
    id: "e-jammer-unlock",
    source: "obtain-jammer",
    target: "unlock-case-jammer",
    style: { stroke: "#8b5cf6" },
  },
  {
    id: "e-unlock-read",
    source: "unlock-case-jammer",
    target: "read-instructions",
    style: { stroke: "#8b5cf6" },
  },

  // ============ PATHS CONVERGE ============
  {
    id: "e-read-report",
    source: "read-instructions",
    target: "report-kerman",
    style: { stroke: "#666" },
  },
  {
    id: "e-report-trust",
    source: "report-kerman",
    target: "trust-kerman",
    style: { stroke: "#666" },
  },

  // ============ DECISION 2: TRUST KERMAN ============
  {
    id: "e-trust-yes",
    source: "trust-kerman",
    target: "trust-yes",
    label: "Trust Him",
    style: { stroke: "#22c55e" },
  },
  {
    id: "e-trust-no",
    source: "trust-kerman",
    target: "trust-no",
    label: "Refuse",
    style: { stroke: "#3b82f6" },
  },

  // ============ KERMAN'S PATH (Green - Best endings) ============
  {
    id: "e-yes-build",
    source: "trust-yes",
    target: "build-replacement-key",
    style: { stroke: "#22c55e" },
  },
  {
    id: "e-build-solar",
    source: "build-replacement-key",
    target: "hideout-solar",
    style: { stroke: "#22c55e" },
  },
  {
    id: "e-solar-activate",
    source: "hideout-solar",
    target: "activate-ticket",
    style: { stroke: "#22c55e" },
  },
  {
    id: "e-activate-sidequests",
    source: "activate-ticket",
    target: "side-quests",
    style: { stroke: "#22c55e" },
  },
  {
    id: "e-sidequests-terminal",
    source: "side-quests",
    target: "terminal-battle",
    style: { stroke: "#22c55e" },
  },

  // ============ TERMINAL BATTLE OUTCOMES ============
  {
    id: "e-terminal-savior",
    source: "terminal-battle",
    target: "savior-ending",
    label: "Survive + All Quests",
    style: { stroke: "#22c55e" },
  },
  {
    id: "e-terminal-fallen",
    source: "terminal-battle",
    target: "fallen-ending",
    label: "Survive (No Quests)",
    style: { stroke: "#6b7280" },
  },

  // ============ REFUSE KERMAN PATH (Blue/Red - Survivor/Debtor) ============
  {
    id: "e-no-terminal",
    source: "trust-no",
    target: "head-to-terminal",
    style: { stroke: "#3b82f6" },
  },
  {
    id: "e-terminal-use",
    source: "head-to-terminal",
    target: "use-ticket-terminal",
    style: { stroke: "#3b82f6" },
  },
  {
    id: "e-use-meet",
    source: "use-ticket-terminal",
    target: "meet-prapor",
    style: { stroke: "#3b82f6" },
  },
  {
    id: "e-meet-bribe",
    source: "meet-prapor",
    target: "prapor-bribe",
    style: { stroke: "#3b82f6" },
  },

  // ============ DECISION 3: PRAPOR'S BRIBE ============
  {
    id: "e-bribe-pay",
    source: "prapor-bribe",
    target: "pay-500m",
    label: "Pay ₽500M",
    style: { stroke: "#3b82f6" },
  },
  {
    id: "e-bribe-refuse",
    source: "prapor-bribe",
    target: "cant-pay",
    label: "Refuse",
    style: { stroke: "#ef4444" },
  },

  // ============ FINAL ENDINGS ============
  {
    id: "e-pay-survivor",
    source: "pay-500m",
    target: "survivor-ending",
    style: { stroke: "#3b82f6" },
  },
  {
    id: "e-cantpay-debtor",
    source: "cant-pay",
    target: "debtor-ending",
    style: { stroke: "#ef4444" },
  },
];
