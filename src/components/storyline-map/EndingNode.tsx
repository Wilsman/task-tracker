import { Handle, Position } from "@xyflow/react";
import { memo } from "react";
import { cn } from "@/lib/utils";

export type EndingType = "survivor" | "savior" | "fallen" | "debtor";

export interface EndingNodeData {
  label: string;
  description?: string;
  endingType: EndingType;
  isSelected?: boolean;
  isUndetermined?: boolean;
}

const endingColors: Record<EndingType, string> = {
  survivor: "#22c55e", // Survivor (green)
  savior: "#f59e0b", // Savior (orange/amber)
  fallen: "#6b7280", // Fallen (gray)
  debtor: "#a78bfa", // Debtor (purple)
};

const endingIconUrls: Record<EndingType, string> = {
  survivor:
    "https://assets.tarkov.dev/achievement-68e8f02ff3a1196d1a05f2cb-icon.webp",
  savior:
    "https://assets.tarkov.dev/achievement-68e8f0575eb7e5ce5000ba0a-icon.webp",
  fallen:
    "https://assets.tarkov.dev/achievement-68e8f042b8efa2bbeb009d89-icon.webp",
  debtor:
    "https://assets.tarkov.dev/achievement-68e8f04eb841bc8ac305350a-icon.webp",
};

function EndingNode({ data }: { data: EndingNodeData }) {
  const baseColor = endingColors[data.endingType] || "#64748b";
  const color = data.isUndetermined ? "#a855f7" : baseColor;
  const iconUrl = endingIconUrls[data.endingType];

  return (
    <div
      className={cn(
        "min-w-[180px] max-w-[240px] rounded-lg border-2 bg-card p-3 shadow-lg cursor-pointer transition-all hover:scale-105",
        data.isSelected && "ring-4 ring-offset-2 ring-offset-background",
        data.isUndetermined && "border-dashed"
      )}
      style={{
        borderColor: color,
        boxShadow: data.isSelected
          ? `0 0 30px ${color}80`
          : `0 0 20px ${color}40`,
        // @ts-expect-error CSS custom property for ring color
        "--tw-ring-color": color,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: color }}
      />
      <div className="space-y-1.5 text-center">
        <div className="flex justify-center">
          {data.isUndetermined ? (
            <span className="text-2xl">❓</span>
          ) : iconUrl ? (
            <img
              src={iconUrl}
              alt={data.label}
              className="w-15 h-15 object-contain"
            />
          ) : (
            <span className="text-2xl">🏁</span>
          )}
        </div>
        <span className="font-bold text-sm" style={{ color }}>
          {data.label}
        </span>
        {data.description && (
          <p className="text-xs text-muted-foreground">{data.description}</p>
        )}
        {data.isUndetermined && (
          <span className="inline-block rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-medium text-purple-400">
            ⚠ Path Unconfirmed
          </span>
        )}
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          Click to see path breakdown
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: color }}
      />
    </div>
  );
}

export default memo(EndingNode);
