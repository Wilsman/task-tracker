import { Panel } from "@xyflow/react";
import type { Node } from "@xyflow/react";

interface CostPanelProps {
  nodes: Node[];
}

export function CostPanel({ nodes }: CostPanelProps) {
  const completedSteps = nodes.filter((n) => n.data.isCompleted).length;
  const totalSteps = nodes.filter((n) => n.type === "story").length;
  const currentStep = nodes.find((n) => n.data.isCurrentStep);

  const totals = nodes
    .filter((n) => n.data.isCompleted)
    .reduce(
      (acc, node) => {
        const data = node.data as Record<string, unknown>;
        const cost = (data.cost as number) || 0;
        if (!cost) return acc;

        const currency = data.currency as "roubles" | "btc" | "usd" | undefined;
        if (currency === "usd") {
          acc.usd += cost;
          return acc;
        }
        if (currency === "btc") {
          acc.btc += cost;
          return acc;
        }
        if (currency === "roubles") {
          acc.roubles += cost;
          return acc;
        }

        if (cost < 100) {
          acc.btc += cost;
          return acc;
        }

        acc.roubles += cost;
        return acc;
      },
      { roubles: 0, btc: 0, usd: 0 }
    );

  return (
    <Panel position="top-right" className="!m-4">
      <div className="rounded-lg border bg-card p-4 shadow-lg min-w-[200px]">
        <h3 className="font-bold text-sm mb-3">Progress Tracker</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Steps Completed:</span>
            <span className="font-medium">
              {completedSteps} / {totalSteps}
            </span>
          </div>

          {currentStep && (
            <div className="flex justify-between text-amber-500">
              <span>Current Step:</span>
              <span className="font-medium truncate max-w-[120px]">
                {currentStep.data.label as string}
              </span>
            </div>
          )}

          {totals.roubles > 0 && (
            <div className="flex justify-between text-yellow-500">
              <span>Roubles:</span>
              <span className="font-medium">
                {totals.roubles >= 1000000
                  ? `${(totals.roubles / 1000000).toFixed(0)}M ₽`
                  : `${totals.roubles.toLocaleString()} ₽`}
              </span>
            </div>
          )}
          {totals.btc > 0 && (
            <div className="flex justify-between text-orange-500">
              <span>Bitcoin:</span>
              <span className="font-medium">{totals.btc} BTC</span>
            </div>
          )}
          {totals.usd > 0 && (
            <div className="flex justify-between text-emerald-500">
              <span>USD:</span>
              <span className="font-medium">
                {totals.usd.toLocaleString()} USD
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">
            Legend
          </h4>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span>Decision</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Ending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-400/70" />
              <span>⏳ Time Gate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500/70" />
              <span>💰 Cost</span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
