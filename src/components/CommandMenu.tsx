import * as React from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

interface CommandMenuProps {
  viewMode: "tree" | "grouped" | "collector" | "flow" | "prestiges" | "achievements";
  groupBy: "trader" | "map";
  collectorGroupBy: "collector" | "hideout-stations";
  traders: string[];
  hiddenTraders: Set<string>;
  maps: string[];
  selectedMap: string | null;
  onSetViewMode: (mode: CommandMenuProps["viewMode"]) => void;
  onSetGroupBy: (mode: "trader" | "map") => void;
  onSetCollectorGroupBy: (mode: "collector" | "hideout-stations") => void;
  onClearTraderFilter: () => void;
  onToggleTraderVisibility: (trader: string) => void;
  onSelectMap: (map: string | null) => void;
}

export function CommandMenu(props: CommandMenuProps) {
  const {
    viewMode,
    groupBy,
    collectorGroupBy,
    traders,
    hiddenTraders,
    maps,
    selectedMap,
    onSetViewMode,
    onSetGroupBy,
    onSetCollectorGroupBy,
    onClearTraderFilter,
    onToggleTraderVisibility,
    onSelectMap,
  } = props;

  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    const openHandler = () => setOpen(true);
    window.addEventListener("open-command-menu", openHandler as EventListener);
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-command-menu", openHandler as EventListener);
    };
  }, []);

  const handle = {
    navigateGrouped() {
      onSetViewMode("grouped");
      setOpen(false);
    },
    navigateGroupedByTrader() {
      onSetGroupBy("trader");
      onSetViewMode("grouped");
      setOpen(false);
    },
    navigateGroupedByMap() {
      onSetGroupBy("map");
      onSetViewMode("grouped");
      setOpen(false);
    },
    navigateCollector() {
      onSetViewMode("collector");
      setOpen(false);
    },
    navigateCollectorItems() {
      onSetCollectorGroupBy("collector");
      onSetViewMode("collector");
      setOpen(false);
    },
    navigateHideoutStations() {
      onSetCollectorGroupBy("hideout-stations");
      onSetViewMode("collector");
      setOpen(false);
    },
    navigatePrestiges() {
      onSetViewMode("prestiges");
      setOpen(false);
    },
    navigateAchievements() {
      onSetViewMode("achievements");
      setOpen(false);
    },
    showAllTraders() {
      onClearTraderFilter();
      setOpen(false);
    },
    selectMap(map: string | null) {
      onSelectMap(map);
      onSetViewMode("grouped");
      setOpen(false);
    },
    toggleTrader(trader: string) {
      onToggleTraderVisibility(trader);
      setOpen(false);
    },
    openStoryline() {
      window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
      setOpen(false);
    },
  } as const;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigate">
          <CommandItem value="quests" onSelect={handle.navigateGrouped}>
            Quests {viewMode === "grouped" || viewMode === "tree" || viewMode === "flow" ? "(current)" : ""}
          </CommandItem>
          <CommandItem value="checklist-view" onSelect={handle.navigateGrouped}>
            Checklist View {viewMode === "grouped" ? "(current)" : ""}
          </CommandItem>
          <CommandItem value="by-trader" onSelect={handle.navigateGroupedByTrader}>
            By Trader {viewMode === "grouped" && groupBy === "trader" ? "(current)" : ""}
          </CommandItem>
          <CommandItem value="by-map" onSelect={handle.navigateGroupedByMap}>
            By Map {viewMode === "grouped" && groupBy === "map" ? "(current)" : ""}
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Items">
          <CommandItem value="items" onSelect={handle.navigateCollector}>
            Items {viewMode === "collector" ? "(current)" : ""}
          </CommandItem>
          <CommandItem value="collector-items" onSelect={handle.navigateCollectorItems}>
            Collector Items {viewMode === "collector" && collectorGroupBy === "collector" ? "(current)" : ""}
          </CommandItem>
          <CommandItem value="hideout-stations" onSelect={handle.navigateHideoutStations}>
            Hideout Stations {viewMode === "collector" && collectorGroupBy === "hideout-stations" ? "(current)" : ""}
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="More">
          <CommandItem value="prestiges" onSelect={handle.navigatePrestiges}>
            Prestiges {viewMode === "prestiges" ? "(current)" : ""}
          </CommandItem>
          <CommandItem value="achievements" onSelect={handle.navigateAchievements}>
            Achievements {viewMode === "achievements" ? "(current)" : ""}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Filters • Traders">
          <CommandItem value="show-all-traders" onSelect={handle.showAllTraders}>
            Show All Traders
          </CommandItem>
          {traders.map((t) => {
            const visible = !hiddenTraders.has(t);
            return (
              <CommandItem key={t} value={`trader-${t}`} onSelect={() => handle.toggleTrader(t)}>
                {visible ? "Hide" : "Show"} {t}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandGroup heading="Filters • Maps">
          <CommandItem value="all-maps" onSelect={() => handle.selectMap(null)}>
            All Maps {selectedMap === null ? "(current)" : ""}
          </CommandItem>
          {maps.map((m) => (
            <CommandItem key={m} value={`map-${m}`} onSelect={() => handle.selectMap(m)}>
              {m} {selectedMap === m ? "(current)" : ""}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Links">
          <CommandItem value="storyline-quests" onSelect={handle.openStoryline}>
            1.0 Storyline Quests
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
