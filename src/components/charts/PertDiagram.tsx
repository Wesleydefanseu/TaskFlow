import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface PertNode {
  id: string;
  name: string;
  duration: number; // in days
  dependencies: string[];
  status: 'not-started' | 'in-progress' | 'completed';
}

interface PertDiagramProps {
  nodes: PertNode[];
}

interface PositionedNode extends PertNode {
  level: number;
  position: number;
  es: number; // Early Start
  ef: number; // Early Finish
  ls: number; // Late Start
  lf: number; // Late Finish
  slack: number;
  isCritical: boolean;
}

export function PertDiagram({ nodes }: PertDiagramProps) {
  const positionedNodes = useMemo(() => {
    if (nodes.length === 0) return [];

    // Calculate levels based on dependencies
    const calculateLevel = (node: PertNode, visited: Set<string> = new Set()): number => {
      if (visited.has(node.id)) return 0;
      visited.add(node.id);
      
      if (node.dependencies.length === 0) return 0;
      
      const depLevels = node.dependencies.map(depId => {
        const depNode = nodes.find(n => n.id === depId);
        return depNode ? calculateLevel(depNode, visited) + 1 : 0;
      });
      
      return Math.max(...depLevels);
    };

    const nodesWithLevels = nodes.map(node => ({
      ...node,
      level: calculateLevel(node),
    }));

    // Group by level
    const levels: Map<number, typeof nodesWithLevels> = new Map();
    nodesWithLevels.forEach(node => {
      const levelNodes = levels.get(node.level) || [];
      levelNodes.push(node);
      levels.set(node.level, levelNodes);
    });

    // Calculate positions within each level
    const positioned: PositionedNode[] = [];
    levels.forEach((levelNodes, level) => {
      levelNodes.forEach((node, index) => {
        positioned.push({
          ...node,
          position: index,
          es: 0,
          ef: 0,
          ls: 0,
          lf: 0,
          slack: 0,
          isCritical: false,
        });
      });
    });

    // Forward pass - calculate ES and EF
    const maxLevel = Math.max(...positioned.map(n => n.level));
    for (let level = 0; level <= maxLevel; level++) {
      positioned
        .filter(n => n.level === level)
        .forEach(node => {
          if (node.dependencies.length === 0) {
            node.es = 0;
          } else {
            const maxEf = Math.max(...node.dependencies.map(depId => {
              const dep = positioned.find(n => n.id === depId);
              return dep?.ef || 0;
            }));
            node.es = maxEf;
          }
          node.ef = node.es + node.duration;
        });
    }

    // Backward pass - calculate LS and LF
    const projectEnd = Math.max(...positioned.map(n => n.ef));
    for (let level = maxLevel; level >= 0; level--) {
      positioned
        .filter(n => n.level === level)
        .forEach(node => {
          const successors = positioned.filter(n => n.dependencies.includes(node.id));
          if (successors.length === 0) {
            node.lf = projectEnd;
          } else {
            node.lf = Math.min(...successors.map(s => s.ls));
          }
          node.ls = node.lf - node.duration;
          node.slack = node.ls - node.es;
          node.isCritical = node.slack === 0;
        });
    }

    return positioned;
  }, [nodes]);

  const maxLevel = Math.max(...positionedNodes.map(n => n.level), 0);
  const maxPosition = Math.max(...positionedNodes.map(n => n.position), 0);

  const nodeWidth = 180;
  const nodeHeight = 100;
  const horizontalGap = 80;
  const verticalGap = 40;

  const getNodePosition = (node: PositionedNode) => {
    const x = node.level * (nodeWidth + horizontalGap) + 40;
    const y = node.position * (nodeHeight + verticalGap) + 40;
    return { x, y };
  };

  const getStatusColor = (status: string, isCritical: boolean) => {
    if (isCritical) {
      return 'border-destructive bg-destructive/10';
    }
    switch (status) {
      case 'completed':
        return 'border-status-done bg-status-done/10';
      case 'in-progress':
        return 'border-status-progress bg-status-progress/10';
      default:
        return 'border-border bg-card';
    }
  };

  return (
    <div className="border rounded-lg bg-card overflow-auto">
      <svg 
        width={(maxLevel + 1) * (nodeWidth + horizontalGap) + 80}
        height={(maxPosition + 1) * (nodeHeight + verticalGap) + 80}
        className="min-w-full"
      >
        {/* Draw connections */}
        {positionedNodes.map(node => 
          node.dependencies.map(depId => {
            const depNode = positionedNodes.find(n => n.id === depId);
            if (!depNode) return null;
            
            const from = getNodePosition(depNode);
            const to = getNodePosition(node);
            
            const fromX = from.x + nodeWidth;
            const fromY = from.y + nodeHeight / 2;
            const toX = to.x;
            const toY = to.y + nodeHeight / 2;
            
            const isCriticalPath = node.isCritical && depNode.isCritical;
            
            return (
              <g key={`${depId}-${node.id}`}>
                <path
                  d={`M ${fromX} ${fromY} C ${fromX + horizontalGap/2} ${fromY}, ${toX - horizontalGap/2} ${toY}, ${toX} ${toY}`}
                  stroke={isCriticalPath ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'}
                  strokeWidth={isCriticalPath ? 3 : 2}
                  fill="none"
                  strokeDasharray={isCriticalPath ? '' : '5,5'}
                />
                <polygon
                  points={`${toX},${toY} ${toX-8},${toY-5} ${toX-8},${toY+5}`}
                  fill={isCriticalPath ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'}
                />
              </g>
            );
          })
        )}

        {/* Draw nodes */}
        {positionedNodes.map(node => {
          const { x, y } = getNodePosition(node);
          
          return (
            <g key={node.id}>
              <foreignObject x={x} y={y} width={nodeWidth} height={nodeHeight}>
                <div 
                  className={cn(
                    "w-full h-full rounded-lg border-2 p-3 flex flex-col",
                    getStatusColor(node.status, node.isCritical)
                  )}
                >
                  <div className="font-semibold text-sm truncate">{node.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Durée: {node.duration} jours
                  </div>
                  <div className="flex justify-between mt-auto text-xs">
                    <div className="space-y-0.5">
                      <div className="text-muted-foreground">ES: {node.es}</div>
                      <div className="text-muted-foreground">LS: {node.ls}</div>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <div className="text-muted-foreground">EF: {node.ef}</div>
                      <div className="text-muted-foreground">LF: {node.lf}</div>
                    </div>
                  </div>
                  {node.isCritical && (
                    <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                      Critique
                    </div>
                  )}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="border-t p-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-destructive bg-destructive/10 rounded" />
          <span>Chemin critique</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-status-done bg-status-done/10 rounded" />
          <span>Terminé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-status-progress bg-status-progress/10 rounded" />
          <span>En cours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-border bg-card rounded" />
          <span>Non démarré</span>
        </div>
        <div className="ml-auto text-muted-foreground">
          ES: Early Start | EF: Early Finish | LS: Late Start | LF: Late Finish
        </div>
      </div>
    </div>
  );
}
