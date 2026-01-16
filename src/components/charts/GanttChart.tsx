import { useMemo } from 'react';
import { format, differenceInDays, addDays, parseISO, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface GanttTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  color?: string;
  dependencies?: string[];
  assignee?: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
  startDate?: string;
  endDate?: string;
}

export function GanttChart({ tasks, startDate, endDate }: GanttChartProps) {
  const { chartStartDate, chartEndDate, totalDays, dayWidth } = useMemo(() => {
    let start = startDate ? parseISO(startDate) : new Date();
    let end = endDate ? parseISO(endDate) : addDays(new Date(), 60);
    
    if (tasks.length > 0) {
      const taskDates = tasks.flatMap(t => [parseISO(t.startDate), parseISO(t.endDate)]);
      const minDate = new Date(Math.min(...taskDates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...taskDates.map(d => d.getTime())));
      start = addDays(minDate, -7);
      end = addDays(maxDate, 14);
    }
    
    const days = differenceInDays(end, start) + 1;
    
    return {
      chartStartDate: start,
      chartEndDate: end,
      totalDays: days,
      dayWidth: 40,
    };
  }, [tasks, startDate, endDate]);

  const weeks = useMemo(() => {
    const result = [];
    let currentDate = chartStartDate;
    
    while (currentDate <= chartEndDate) {
      result.push(currentDate);
      currentDate = addDays(currentDate, 7);
    }
    
    return result;
  }, [chartStartDate, chartEndDate]);

  const getTaskPosition = (task: GanttTask) => {
    const start = parseISO(task.startDate);
    const end = parseISO(task.endDate);
    const left = differenceInDays(start, chartStartDate) * dayWidth;
    const width = (differenceInDays(end, start) + 1) * dayWidth;
    
    return { left, width };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const todayPosition = useMemo(() => {
    const today = new Date();
    if (isWithinInterval(today, { start: chartStartDate, end: chartEndDate })) {
      return differenceInDays(today, chartStartDate) * dayWidth;
    }
    return null;
  }, [chartStartDate, chartEndDate, dayWidth]);

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <ScrollArea className="w-full">
        <div style={{ minWidth: totalDays * dayWidth + 200 }}>
          {/* Header - Weeks */}
          <div className="flex border-b bg-secondary/50">
            <div className="w-[200px] flex-shrink-0 px-4 py-3 font-semibold border-r">
              Tâches
            </div>
            <div className="flex relative">
              {weeks.map((week, i) => (
                <div 
                  key={i} 
                  className="text-center py-2 border-r text-sm font-medium"
                  style={{ width: dayWidth * 7 }}
                >
                  {format(week, 'dd MMM', { locale: fr })}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="relative">
            {/* Today indicator */}
            {todayPosition !== null && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10"
                style={{ left: 200 + todayPosition }}
              >
                <div className="absolute -top-1 -left-2 w-4 h-4 rounded-full bg-destructive" />
              </div>
            )}

            {tasks.map((task) => {
              const { left, width } = getTaskPosition(task);
              const taskColor = task.color || 'bg-primary';
              
              return (
                <div key={task.id} className="flex border-b hover:bg-secondary/30 transition-colors">
                  <div className="w-[200px] flex-shrink-0 px-4 py-4 border-r">
                    <div className="font-medium text-sm truncate">{task.name}</div>
                    {task.assignee && (
                      <div className="text-xs text-muted-foreground truncate">{task.assignee}</div>
                    )}
                  </div>
                  <div className="flex-1 relative py-3" style={{ height: 56 }}>
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, i) => (
                        <div key={i} className="border-r border-dashed border-border/50" style={{ width: dayWidth * 7 }} />
                      ))}
                    </div>
                    
                    {/* Task bar */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 h-8 rounded-md cursor-pointer transition-all hover:brightness-110",
                            taskColor
                          )}
                          style={{ left, width: Math.max(width, dayWidth) }}
                        >
                          {/* Progress indicator */}
                          <div 
                            className="absolute inset-0 bg-black/20 rounded-md origin-left"
                            style={{ transform: `scaleX(${1 - task.progress / 100})`, transformOrigin: 'right' }}
                          />
                          <div className="px-2 py-1 text-xs text-primary-foreground font-medium truncate">
                            {task.progress}%
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <p className="font-semibold">{task.name}</p>
                          <p>{format(parseISO(task.startDate), 'dd/MM/yyyy')} - {format(parseISO(task.endDate), 'dd/MM/yyyy')}</p>
                          <p>Progression: {task.progress}%</p>
                          {task.assignee && <p>Assigné: {task.assignee}</p>}
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    {/* Dependencies arrows */}
                    {task.dependencies?.map((depId) => {
                      const depTask = tasks.find(t => t.id === depId);
                      if (!depTask) return null;
                      
                      const depPos = getTaskPosition(depTask);
                      const depRight = depPos.left + depPos.width;
                      
                      return (
                        <svg 
                          key={`${task.id}-${depId}`}
                          className="absolute top-0 left-0 w-full h-full pointer-events-none"
                          style={{ overflow: 'visible' }}
                        >
                          <path
                            d={`M ${depRight + 4} 28 L ${left - 4} 28`}
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            className="text-muted-foreground"
                            markerEnd="url(#arrow)"
                          />
                          <defs>
                            <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                              <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" className="text-muted-foreground" />
                            </marker>
                          </defs>
                        </svg>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
