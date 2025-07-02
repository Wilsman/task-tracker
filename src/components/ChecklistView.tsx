import { useMemo, useState } from "react";
import { Task } from "../types";
import { groupTasksByTrader, canComplete, buildTaskDependencyMap } from "../utils/taskUtils";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Link2 } from "lucide-react";

interface ChecklistViewProps {
  tasks: Task[];
  completedTasks: Set<string>;
  hiddenTraders: Set<string>;
  onToggleComplete: (taskId: string) => void;
  showKappa: boolean;
  showLightkeeper: boolean;
}

export function ChecklistView({
  tasks,
  completedTasks,
  hiddenTraders,
  onToggleComplete,
  showKappa,
  showLightkeeper,
}: ChecklistViewProps) {
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  const taskDependencyMap = useMemo(() => buildTaskDependencyMap(tasks), [tasks]);

  const visibleTasks = useMemo(() => {
    const requirementFilterActive = showKappa || showLightkeeper;

    if (requirementFilterActive) {
      return tasks.filter(task => {
        if (showKappa && showLightkeeper) {
          return task.kappaRequired || task.lightkeeperRequired;
        }
        if (showKappa) {
          return task.kappaRequired;
        }
        if (showLightkeeper) {
          return task.lightkeeperRequired;
        }
        return false;
      });
    }
    
    return tasks.filter(task => !hiddenTraders.has(task.trader.name));
  }, [tasks, hiddenTraders, showKappa, showLightkeeper]);

  const tasksByTrader = useMemo(
    () => groupTasksByTrader(visibleTasks),
    [visibleTasks]
  );

  const handleSearchChange = (trader: string, value: string) => {
    setSearchTerms(prev => ({ ...prev, [trader]: value }));
  };

  const filteredTasksByTrader = useMemo(() => {
    const filtered: Record<string, Task[]> = {};
    for (const trader in tasksByTrader) {
      const searchTerm = searchTerms[trader]?.toLowerCase() || "";
      if (searchTerm) {
        filtered[trader] = tasksByTrader[trader].filter(task =>
          task.name.toLowerCase().includes(searchTerm)
        );
      } else {
        filtered[trader] = tasksByTrader[trader];
      }
    }
    return filtered;
  }, [tasksByTrader, searchTerms]);

  const traderOrder = Object.keys(tasksByTrader).sort();

  return (
    <div className="h-full overflow-y-auto p-4 bg-background text-foreground">
      <Accordion type="multiple" className="w-full space-y-2">
        {traderOrder.map(trader => {
          const traderTasks = tasksByTrader[trader];
          if (traderTasks.length === 0) return null;

          const completedCount = traderTasks.filter(t => completedTasks.has(t.id)).length;
          const totalCount = traderTasks.length;
          const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
          const displayedTasks = filteredTasksByTrader[trader] || [];

          return (
            <AccordionItem key={trader} value={trader} className="border rounded-lg bg-card">
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg font-semibold">{trader}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {completedCount} / {totalCount}
                    </span>
                    <Progress value={progress} className="w-24 h-2" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 border-t">
                <div className="mt-4">
                  <Input
                    placeholder={`Search ${trader} tasks...`}
                    value={searchTerms[trader] || ""}
                    onChange={e => handleSearchChange(trader, e.target.value)}
                    className="mb-4"
                  />
                  <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                    {displayedTasks.map(task => {
                                                                                        const isCompletable = canComplete(task.id, completedTasks, taskDependencyMap);
                      const isCompleted = completedTasks.has(task.id);
                      return (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-md transition-colors",
                            !isCompletable && !isCompleted ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
                          )}
                        >
                          <Checkbox
                            id={task.id}
                            checked={isCompleted}
                            onCheckedChange={() => onToggleComplete(task.id)}
                            disabled={!isCompletable && !isCompleted}
                          />
                          <label
                            htmlFor={task.id}
                            className={cn(
                              "flex-1 text-sm",
                              isCompleted && "line-through text-muted-foreground",
                              !isCompletable && !isCompleted ? "cursor-not-allowed" : "cursor-pointer"
                            )}
                          >
                            {task.name}
                          </label>
                          {task.wikiLink && (
                            <a
                              href={task.wikiLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Link2 className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
