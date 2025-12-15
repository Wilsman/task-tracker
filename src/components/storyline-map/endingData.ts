import type { Node, Edge } from "@xyflow/react";
import {
  initialNodes,
  initialEdges,
  findPathToNode,
  getPathBreakdown,
} from "./storylineMapData";
import type { EndingType } from "./EndingNode";

// ============================================================================
// ENDING METADATA & REWARDS
// ============================================================================

export interface EndingReward {
  name: string;
  icon?: string;
  description?: string;
}

export interface EndingInfo {
  id: string;
  endingType: EndingType;
  label: string;
  description: string;
  tagline: string;
  color: string;
  icon: string;
  iconUrl: string;
  // Pre-calculated from path data
  totalCraftHours: number;
  totalTimeGateHours: number;
  totalCostRoubles: number;
  totalCostBTC: number;
  totalCostUSD: number;
  totalSteps: number;
  // Rewards
  rewards: EndingReward[];
  // Node IDs for this ending (can have multiple paths)
  endingNodeIds: string[];
  // Key decisions required
  keyDecisions: string[];
  // Achievements unlocked on this path
  achievements: string[];
}

// Ending node IDs from storylineMapData
const ENDING_NODE_IDS = {
  survivor: ["survivor-ending"],
  savior: ["savior-ending"],
  fallen: ["fallen-ending"],
  debtor: ["debtor-ending"],
};

// Calculate stats for a specific ending by finding the shortest path
function calculateEndingStats(endingNodeIds: string[]): {
  totalCraftHours: number;
  totalTimeGateHours: number;
  totalCostRoubles: number;
  totalCostBTC: number;
  totalCostUSD: number;
  totalSteps: number;
} {
  let bestPath = {
    totalCraftHours: Infinity,
    totalTimeGateHours: Infinity,
    totalCostRoubles: Infinity,
    totalCostBTC: Infinity,
    totalCostUSD: Infinity,
    totalSteps: Infinity,
  };

  for (const endingId of endingNodeIds) {
    const pathNodes = findPathToNode(endingId, initialNodes, initialEdges);
    if (pathNodes.length === 0) continue;

    const breakdown = getPathBreakdown(pathNodes);

    // Use the path with lowest total cost as "best"
    const totalCost =
      breakdown.totalCostRoubles +
      breakdown.totalCostBTC * 10000000 +
      breakdown.totalCostUSD * 150; // Rough USD conversion
    const bestTotalCost =
      bestPath.totalCostRoubles +
      bestPath.totalCostBTC * 10000000 +
      bestPath.totalCostUSD * 150;

    if (totalCost < bestTotalCost || bestPath.totalSteps === Infinity) {
      bestPath = {
        totalCraftHours: breakdown.totalCraftHours,
        totalTimeGateHours: breakdown.totalTimeGateHours,
        totalCostRoubles: breakdown.totalCostRoubles,
        totalCostBTC: breakdown.totalCostBTC,
        totalCostUSD: breakdown.totalCostUSD,
        totalSteps: breakdown.steps.length,
      };
    }
  }

  return bestPath.totalSteps === Infinity
    ? {
        totalCraftHours: 0,
        totalTimeGateHours: 0,
        totalCostRoubles: 0,
        totalCostBTC: 0,
        totalCostUSD: 0,
        totalSteps: 0,
      }
    : bestPath;
}

// ============================================================================
// ENDING DEFINITIONS
// ============================================================================

export const endingInfos: EndingInfo[] = [
  {
    id: "survivor",
    endingType: "survivor",
    label: "Survivor",
    description:
      "Escape Tarkov by not working with Kerman - the quickest path with Prapor's help",
    tagline: "The path of independence",
    color: "#22c55e",
    icon: "🏃",
    iconUrl:
      "https://assets.tarkov.dev/achievement-68e8f02ff3a1196d1a05f2cb-icon.webp",
    ...calculateEndingStats(ENDING_NODE_IDS.survivor),
    rewards: [
      { name: "Survivor Armband", icon: "🎗️", description: "Cosmetic only" },
      { name: "Survivor Poster", icon: "🖼️", description: "Commemorative art" },
    ],
    endingNodeIds: ENDING_NODE_IDS.survivor,
    keyDecisions: [
      "Keep or Give Case to Prapor",
      "Don't work with Kerman",
      "Pay Prapor 300M/500M Roubles",
    ],
    achievements: ["Easy Way"],
  },
  {
    id: "savior",
    endingType: "savior",
    label: "Savior",
    description:
      "Escape Tarkov by fully helping Kerman find evidence on Terragroup - requires 4.0 Fence rep and BTR rep",
    tagline: "The path of righteousness",
    color: "#f59e0b",
    icon: "🛡️",
    iconUrl:
      "https://assets.tarkov.dev/achievement-68e8f0575eb7e5ce5000ba0a-icon.webp",
    ...calculateEndingStats(ENDING_NODE_IDS.savior),
    rewards: [
      // All items are Found in Raid (FIR) - PvE exclusive reward
      { name: "1x Red Rebel", icon: "⛏️", description: "FIR" },
      { name: "1x Taiga", icon: "🔪", description: "FIR" },
      { name: "4x 12/70 AP-20 Boxes", icon: "📦", description: "FIR" },
      { name: "10x 9x39 BP Boxes", icon: "📦", description: "FIR" },
      { name: "10x 9.3x64 7N33 Boxes", icon: "📦", description: "FIR" },
      { name: "10x .338 LM AP Boxes", icon: "📦", description: "FIR" },
      { name: "18x 40MM M441", icon: "💥", description: "FIR" },
      { name: "18x 40MM M433", icon: "💥", description: "FIR" },
      { name: "10x 7.62x54MMr BS Boxes", icon: "📦", description: "FIR" },
      { name: "1x THICC Item Case", icon: "📦", description: "FIR" },
      { name: "1x THICC Weapon Case", icon: "📦", description: "FIR" },
      { name: "2x Ammo Cases", icon: "📦", description: "FIR" },
      { name: "1x Mag Case", icon: "📦", description: "FIR" },
      { name: "1x Plate Case", icon: "📦", description: "FIR" },
      { name: "1x Money Case", icon: "💰", description: "FIR" },
      { name: "1x Medicine Case", icon: "💊", description: "FIR" },
      { name: "3x Saiga FA", icon: "🔫", description: "FIR" },
      { name: "3x MSGL", icon: "🔫", description: "FIR" },
      { name: "3x AS VAL MOD 4", icon: "🔫", description: "FIR" },
      { name: "3x TKPD", icon: "🔫", description: "FIR" },
      { name: "3x MK-18 Mjolnir", icon: "🔫", description: "FIR" },
      { name: "3x PKP", icon: "🔫", description: "FIR" },
      { name: "40K USD", icon: "💵", description: "Cash reward" },
    ],
    endingNodeIds: ENDING_NODE_IDS.savior,
    keyDecisions: [
      "Keep or Give Case to Prapor",
      "Work together with Kerman",
      "Help Kerman find Evidence on Terragroup",
      "Complete all story chapters",
      "Get 4.0 Fence rep & 0.4 BTR rep",
    ],
    achievements: [],
  },
  {
    id: "fallen",
    endingType: "fallen",
    label: "Fallen",
    description:
      "Escape Tarkov by refusing to help Kerman after working with him - requires 1M USD and giving up secure container",
    tagline: "The path of betrayal",
    color: "#6b7280",
    icon: "💀",
    iconUrl:
      "https://assets.tarkov.dev/achievement-68e8f042b8efa2bbeb009d89-icon.webp",
    ...calculateEndingStats(ENDING_NODE_IDS.fallen),
    rewards: [
      { name: "10M Roubles", icon: "💰", description: "Cash payout" },
      {
        name: "Money Case",
        icon: "💼",
        description: "Secure currency storage",
      },
    ],
    endingNodeIds: ENDING_NODE_IDS.fallen,
    keyDecisions: [
      "Keep or Give Case to Prapor",
      "Work together with Kerman",
      "Do not help Kerman find Evidence",
      "Hand over 1M USD to Prapor",
    ],
    achievements: ["Enough of your Games!", "Will it Blow?"],
  },
  {
    id: "debtor",
    endingType: "debtor",
    label: "Debtor",
    description:
      "Escape Tarkov by partially helping Kerman then switching to Lightkeeper - requires cultist amulets and 100 PMC dogtags",
    tagline: "The path of debt",
    color: "#a78bfa",
    icon: "🔮",
    iconUrl:
      "https://assets.tarkov.dev/achievement-68e8f04eb841bc8ac305350a-icon.webp",
    ...calculateEndingStats(ENDING_NODE_IDS.debtor),
    rewards: [
      { name: "30,000 EUR", icon: "💶", description: "Cash reward" },
      { name: "4x AP-20 Boxes", icon: "📦", description: "FIR" },
      { name: "10x M993 Boxes", icon: "📦", description: "FIR" },
      { name: "10x Hybrid Boxes", icon: "📦", description: "FIR" },
      { name: "10x AP Boxes", icon: "📦", description: "FIR" },
      { name: "Magazine Case", icon: "📦", description: "FIR" },
      { name: "1x THICC Weapon Case", icon: "📦", description: "FIR" },
      { name: "2x Ammo Case", icon: "📦", description: "FIR" },
      { name: "Money Case", icon: "💰", description: "FIR" },
      { name: "Plates Case", icon: "📦", description: "FIR" },
      { name: "Iskra", icon: "�", description: "FIR" },
      { name: "Hose", icon: "🧴", description: "FIR" },
      { name: "2x RShG-2", icon: "💥", description: "FIR" },
      { name: "Condensed Milk", icon: "🥛", description: "FIR" },
      { name: "3x AA-12", icon: "🔫", description: "FIR" },
      { name: "3x M60E6", icon: "🔫", description: "FIR" },
      { name: "3x SPEAR", icon: "🔫", description: "FIR" },
      { name: "Blue Fuel", icon: "⛽", description: "FIR" },
      { name: "Mr Kerman", icon: "🧔", description: "FIR" },
      { name: "Slickers", icon: "🧴", description: "FIR" },
      { name: "Calok-B", icon: "�", description: "FIR" },
      { name: "Toolbox (Discord Version)", icon: "🧰", description: "FIR" },
      { name: "Targrad poster", icon: "🖼️", description: "FIR" },
      { name: "What You Seek poster", icon: "🖼️", description: "FIR" },
      { name: "3x AXMC", icon: "🔫", description: "FIR" },
      { name: "3x TRG M10", icon: "🔫", description: "FIR" },
    ],
    endingNodeIds: ENDING_NODE_IDS.debtor,
    keyDecisions: [
      "Keep or Give Case to Prapor",
      "Work together with Kerman",
      "Hand 2 Major Evidence to Kerman",
      "Stop working with Kerman",
      "Work with Lightkeeper",
    ],
    achievements: ["U Turn"],
  },
];

// ============================================================================
// HELPER: Get filtered nodes/edges for a specific ending
// ============================================================================

export function getEndingPathData(endingId: string): {
  nodes: Node[];
  edges: Edge[];
  breakdown: ReturnType<typeof getPathBreakdown>;
} {
  const endingInfo = endingInfos.find((e) => e.id === endingId);
  if (!endingInfo) {
    return { nodes: [], edges: [], breakdown: getPathBreakdown([]) };
  }

  let pathNodes: Node[] = [];

  // Special handling for Savior ending to show both PVP and PVE paths
  if (endingId === "savior") {
    // Find the PVP path
    const pvpPathNodes = findPathToNode("pvp", initialNodes, initialEdges);
    const pvePathNodes = findPathToNode("pve", initialNodes, initialEdges);

    // Find the path from the convergence point (btr-04) to the ending
    const convergencePathNodes = findPathToNode(
      "savior-ending",
      initialNodes,
      initialEdges
    );

    // Combine all unique nodes
    const allNodeIds = new Set([
      ...pvpPathNodes.map((n) => n.id),
      ...pvePathNodes.map((n) => n.id),
      ...convergencePathNodes.map((n) => n.id),
    ]);

    pathNodes = Array.from(allNodeIds)
      .map((id) => initialNodes.find((n) => n.id === id)!)
      .filter(Boolean);
  } else {
    // For other endings, use the shortest path as before
    const endingNodeId = endingInfo.endingNodeIds[0];
    pathNodes = findPathToNode(endingNodeId, initialNodes, initialEdges);
  }

  const pathNodeIds = new Set(pathNodes.map((n) => n.id));

  // Filter edges to only those in the path
  const pathEdges = initialEdges.filter(
    (e) => pathNodeIds.has(e.source) && pathNodeIds.has(e.target)
  );

  // Re-position nodes for vertical layout
  const repositionedNodes = pathNodes.map((node, idx) => ({
    ...node,
    position: { x: 0, y: idx * 120 },
  }));

  return {
    nodes: repositionedNodes,
    edges: pathEdges,
    breakdown: getPathBreakdown(pathNodes),
  };
}

// ============================================================================
// HELPER: Format currency
// ============================================================================

export function formatRoubles(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B ₽`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)}M ₽`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K ₽`;
  }
  return `${amount} ₽`;
}

export function formatUSD(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M USD`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K USD`;
  }
  return `${amount} USD`;
}

export function formatHours(hours: number): string {
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
  return `${hours}h`;
}
