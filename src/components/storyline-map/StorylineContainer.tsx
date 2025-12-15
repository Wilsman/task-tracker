import { ReactFlowProvider } from "@xyflow/react";
import { EndingSelector } from "./EndingSelector";
import { EndingFlowView } from "./EndingFlowView";
import { StorylineMapView } from "./StorylineMapView";

type ViewMode = "selector" | "ending" | "fullMap";

interface StorylineContainerProps {
  completedNodes: Set<string>;
  currentNodeId?: string;
  onToggleNode: (id: string) => void;
  onBack?: () => void;
  viewMode?: ViewMode;
  selectedEndingId?: string | null;
  onViewChange?: (view: ViewMode, endingId?: string | null) => void;
}

export function StorylineContainer({
  completedNodes,
  currentNodeId,
  onToggleNode,
  onBack,
  viewMode: externalViewMode,
  selectedEndingId: externalSelectedEndingId,
  onViewChange,
}: StorylineContainerProps) {
  // Use URL-controlled state if provided, otherwise fall back to internal state
  const viewMode = externalViewMode || "selector";
  const selectedEndingId = externalSelectedEndingId || null;

  const handleSelectEnding = (endingId: string) => {
    if (onViewChange) {
      onViewChange("ending", endingId);
    }
  };

  const handleViewFullMap = () => {
    if (onViewChange) {
      onViewChange("fullMap");
    }
  };

  const handleBackToSelector = () => {
    if (onViewChange) {
      onViewChange("selector");
    }
  };

  const handleBackFromFullMap = () => {
    if (onBack) {
      onBack();
    } else if (onViewChange) {
      onViewChange("selector");
    }
  };

  if (viewMode === "selector") {
    return (
      <EndingSelector
        onSelectEnding={handleSelectEnding}
        onViewFullMap={handleViewFullMap}
      />
    );
  }

  if (viewMode === "ending" && selectedEndingId) {
    return (
      <ReactFlowProvider>
        <EndingFlowView
          endingId={selectedEndingId}
          onBack={handleBackToSelector}
        />
      </ReactFlowProvider>
    );
  }

  return (
    <ReactFlowProvider>
      <StorylineMapView
        completedNodes={completedNodes}
        currentNodeId={currentNodeId}
        onToggleNode={onToggleNode}
        onBack={handleBackFromFullMap}
      />
    </ReactFlowProvider>
  );
}
