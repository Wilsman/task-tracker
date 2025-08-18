import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { Link2, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { groupTasksByTrader } from '../utils/taskUtils';
import { cn } from '@/lib/utils';

interface CheckListViewProps {
  tasks: Task[];
  completedTasks: Set<string>;
  hiddenTraders: Set<string>;
  showKappa: boolean;
  showLightkeeper: boolean;
  onToggleComplete: (taskId: string) => void;
  onTaskClick: (taskId: string) => void;
  mapFilter?: string | null;
  groupBy: 'trader' | 'map';
}

export const CheckListView: React.FC<CheckListViewProps> = ({
  tasks,
  completedTasks,
  hiddenTraders,
  showKappa,
  showLightkeeper,
  onToggleComplete,
  onTaskClick,
  mapFilter,
  groupBy,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Start with all groups collapsed by default
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // (dependency map removed; checklist is always interactive)

  // Apply filters
  const filteredTasks = useMemo(
    () => tasks.filter(task => {
      // Kappa/Lightkeeper filters
      if (showKappa && showLightkeeper) {
        if (!(task.kappaRequired || task.lightkeeperRequired)) return false;
      } else if (showKappa && !task.kappaRequired) {
        return false;
      } else if (showLightkeeper && !task.lightkeeperRequired) {
        return false;
      }
      // Map filter (from sidebar)
      if (mapFilter && task.map?.name !== mapFilter) return false;
      // Trader filter
      if (hiddenTraders.has(task.trader.name)) return false;
      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        if (!task.name.toLowerCase().includes(term) && !task.trader.name.toLowerCase().includes(term)) {
          if (!task.map?.name.toLowerCase().includes(term)) return false;
        }
      }
      return true;
    }),
    [tasks, showKappa, showLightkeeper, hiddenTraders, searchTerm, mapFilter],
  );

  // Group tasks
  const tasksByGroup = useMemo(() => {
    if (groupBy === 'trader') {
      return groupTasksByTrader(filteredTasks);
    }
    // groupBy map
    return filteredTasks.reduce<Record<string, Task[]>>((acc, task) => {
      const mapName = task.map?.name || 'Anywhere';
      (acc[mapName] ||= []).push(task);
      return acc;
    }, {});
  }, [filteredTasks, groupBy]);

  const sortedGroups = useMemo(
    () => Object.entries(tasksByGroup).sort(([a], [b]) => a.localeCompare(b)),
    [tasksByGroup],
  );

  const allGroupNames = useMemo(() => sortedGroups.map(([name]) => name), [sortedGroups]);
  // Only use the explicitly expanded groups
  const finalExpandedGroups = expandedGroups;
  const areAllExpanded = finalExpandedGroups.length === allGroupNames.length;

  const handleToggleAll = () => {
    if (areAllExpanded) {
      setExpandedGroups([]);
    } else {
      setExpandedGroups(allGroupNames);
    }
  };

  return (
    <div className="p-4 bg-background text-foreground">
      {/* Grouping selection moved to sidebar under Quests > Checklist */}

      {/* Search and Controls */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleAll}
          className="flex items-center gap-2"
        >
          {areAllExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Expand All
            </>
          )}
        </Button>
      </div>

      {/* Groups */}
      <Accordion
        type="multiple"
        className="w-full space-y-2"
        value={finalExpandedGroups}
        onValueChange={setExpandedGroups}
      >
        {sortedGroups.map(([groupName, groupTasks]) => {
          const completedCount = groupTasks.filter(t => completedTasks.has(t.id)).length;
          const totalCount = groupTasks.length;
          const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

          return (
            <AccordionItem key={groupName} value={groupName} className="border rounded-lg bg-card">
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg font-semibold flex items-center gap-2">
                    {groupBy === 'trader' && groupTasks[0]?.trader?.imageLink && (
                      <img
                        src={groupTasks[0].trader.imageLink}
                        alt={groupName}
                        loading="lazy"
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    )}
                    {groupName}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {completedCount} / {totalCount}
                    </span>
                    <Progress value={progress} className="w-24 h-2" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 border-t">
                <div className="pr-2 space-y-3">
                  {groupTasks.map(task => {
                    const isCompleted = completedTasks.has(task.id);
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-start gap-2 p-1.5 rounded-md transition-colors group",
                          "hover:bg-muted cursor-pointer"
                        )}
                        onClick={() => onTaskClick(task.id)}
                      >
                        <Checkbox
                          id={task.id}
                          checked={isCompleted}
                          onCheckedChange={() => onToggleComplete(task.id)}
                          disabled={false}
                        />
                        <label
                          htmlFor={task.id}
                          className={cn(
                            "flex-1 text-[13px] leading-tight flex items-start gap-1",
                            "cursor-pointer"
                          )}
                        >
                          <div className="flex flex-col">
                            <span className={cn("font-medium", isCompleted && "line-through")}>{task.name}</span>
                            <div className={cn(
                              "flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]",
                              isCompleted ? "text-foreground" : "text-muted-foreground"
                            )}>
                              <span className="inline-flex items-center gap-1">
                                {task.trader?.imageLink && (
                                  <img
                                    src={task.trader.imageLink}
                                    alt={task.trader.name}
                                    loading="lazy"
                                    className="h-4 w-4 rounded-full object-cover"
                                  />
                                )}
                                <span>{task.trader.name}</span>
                              </span>
                              {task.map && <span>• {task.map.name}</span>}
                              {task.kappaRequired && (
                                <span className="text-red-500">• Kappa</span>
                              )}
                              {task.lightkeeperRequired && (
                                <span className="text-green-500">• Lightkeeper</span>
                              )}
                              
                              {/* Objectives and Rewards (inline lists) */}
                              {/* moved out of the metadata row for better readability */}
                            </div>
                            {/* Objectives (compact inline) */}
                            {task.objectives && task.objectives.length > 0 && (
                              <div className={cn(
                                "mt-0.5 text-xs flex flex-wrap items-start gap-x-3 gap-y-1",
                                isCompleted ? "text-foreground" : "text-muted-foreground/25"
                              )}>
                                <span className="text-[11px] text-yellow-500/80">Objectives:</span>
                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                  {task.objectives.map((objective, index) => (
                                    <span key={index} className="inline-flex items-start gap-2">
                                      <span className="mt-1 inline-block h-1 w-1 rounded-full bg-yellow-500" />
                                      <span className="whitespace-pre-wrap">
                                        {'playerLevel' in objective
                                          ? `Reach level ${objective.playerLevel}`
                                          : objective.description}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Rewards */}
                            {((task.startRewards?.items && task.startRewards.items.length > 0) ||
                              (task.finishRewards?.items && task.finishRewards.items.length > 0)) && (
                              <div className={cn(
                                "mt-0.5 text-xs flex flex-wrap items-start gap-x-3 gap-y-1",
                                isCompleted ? "text-foreground" : "text-muted-foreground/25"
                              )}>
                                <span className="inline-flex items-center gap-1 text-[11px] text-blue-500/80">
                                  <Award className="h-3 w-3" />
                                  Rewards:
                                </span>
                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                  {[...(task.startRewards?.items ?? []), ...(task.finishRewards?.items ?? [])].map((reward, index) => (
                                    <span key={index} className="inline-flex items-start gap-2">
                                      <span className="mt-1 inline-block h-1 w-1 rounded-full bg-green-500" />
                                      <span>
                                        {reward.item.name}
                                        {reward.count > 1 ? ` (${reward.count})` : ''}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                        {task.wikiLink && (
                          <a
                            href={task.wikiLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={e => e.stopPropagation()}
                          >
                            <Link2 className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>


    </div>
  );
};
