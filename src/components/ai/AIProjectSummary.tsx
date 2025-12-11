import { useState } from 'react';
import { useAI } from '@/contexts/AIContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Loader2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIProjectSummaryProps {
  projectName: string;
  projectData?: { tasks: unknown[]; members: unknown[] };
  className?: string;
}

export function AIProjectSummary({ projectName, projectData = { tasks: [], members: [] }, className }: AIProjectSummaryProps) {
  const { isLoading, generateProjectSummary } = useAI();
  const [summary, setSummary] = useState<{
    summary: string;
    keyMetrics: {
      completionRate: number;
      onTrackTasks: number;
      delayedTasks: number;
      riskLevel: 'low' | 'medium' | 'high';
    };
    recommendations: string[];
  } | null>(null);

  const handleGenerate = async () => {
    const result = await generateProjectSummary({
      name: projectName,
      ...projectData,
    });
    setSummary(result);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-status-done/20 text-status-done';
      case 'medium':
        return 'bg-status-progress/20 text-status-progress';
      case 'high':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'Faible';
      case 'medium':
        return 'Moyen';
      case 'high':
        return 'Élevé';
      default:
        return risk;
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <FileText className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Résumé IA</CardTitle>
              <CardDescription>{projectName}</CardDescription>
            </div>
          </div>
          <Button 
            variant="gradient" 
            size="sm" 
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {summary ? 'Actualiser' : 'Générer'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Génération du résumé en cours...</p>
              <p className="text-xs text-muted-foreground mt-1">Analyse des données du projet</p>
            </div>
          </div>
        )}

        {!isLoading && !summary && (
          <div className="text-center py-12">
            <FileText className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-medium mb-2">Aucun résumé généré</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cliquez sur "Générer" pour créer un résumé intelligent de votre projet
            </p>
          </div>
        )}

        {summary && !isLoading && (
          <>
            {/* Summary Text */}
            <div className="p-4 rounded-lg bg-secondary/50 border">
              <p className="text-sm leading-relaxed">{summary.summary}</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Progression</span>
                </div>
                <div className="text-2xl font-bold mb-2">{summary.keyMetrics.completionRate}%</div>
                <Progress value={summary.keyMetrics.completionRate} className="h-2" />
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Niveau de risque</span>
                </div>
                <Badge className={cn("mt-1", getRiskColor(summary.keyMetrics.riskLevel))}>
                  {getRiskLabel(summary.keyMetrics.riskLevel)}
                </Badge>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-status-done" />
                  <span className="text-sm font-medium">À jour</span>
                </div>
                <div className="text-2xl font-bold text-status-done">
                  {summary.keyMetrics.onTrackTasks}
                </div>
                <p className="text-xs text-muted-foreground">tâches en temps</p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium">En retard</span>
                </div>
                <div className="text-2xl font-bold text-destructive">
                  {summary.keyMetrics.delayedTasks}
                </div>
                <p className="text-xs text-muted-foreground">tâches retardées</p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h4 className="font-medium">Recommandations</h4>
              </div>
              <ul className="space-y-2">
                {summary.recommendations.map((rec, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-2 text-sm p-3 rounded-lg bg-secondary/30 border"
                  >
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
