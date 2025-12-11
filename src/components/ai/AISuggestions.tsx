import { useState } from 'react';
import { useAI } from '@/contexts/AIContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  User, 
  ListTodo,
  Loader2,
  Check,
  X,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AISuggestionsProps {
  context?: { tasks: unknown[]; members: unknown[] };
  className?: string;
}

export function AISuggestions({ context = { tasks: [], members: [] }, className }: AISuggestionsProps) {
  const { isLoading, suggestions, generateSuggestions, clearSuggestions } = useAI();
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  const handleGenerate = async () => {
    await generateSuggestions(context);
  };

  const handleApply = (suggestionId: string) => {
    setAppliedSuggestions(prev => new Set([...prev, suggestionId]));
  };

  const handleDismiss = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
  };

  const visibleSuggestions = suggestions.filter(
    s => !appliedSuggestions.has(s.id) && !dismissedSuggestions.has(s.id)
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'priority':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'deadline':
        return <Clock className="w-4 h-4" />;
      case 'assignee':
        return <User className="w-4 h-4" />;
      case 'task':
        return <ListTodo className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'priority':
        return 'Priorité';
      case 'deadline':
        return 'Deadline';
      case 'assignee':
        return 'Assignation';
      case 'task':
        return 'Nouvelle tâche';
      default:
        return 'Suggestion';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-status-done/20 text-status-done';
    if (confidence >= 0.7) return 'bg-status-progress/20 text-status-progress';
    return 'bg-status-review/20 text-status-review';
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Assistant IA</CardTitle>
              <CardDescription>Suggestions intelligentes</CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {suggestions.length > 0 ? 'Actualiser' : 'Générer'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Analyse en cours...</p>
            </div>
          </div>
        )}

        {!isLoading && visibleSuggestions.length === 0 && suggestions.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              Cliquez sur "Générer" pour obtenir des suggestions basées sur vos tâches
            </p>
          </div>
        )}

        {!isLoading && visibleSuggestions.length === 0 && suggestions.length > 0 && (
          <div className="text-center py-6">
            <Check className="w-12 h-12 mx-auto text-status-done mb-3" />
            <p className="text-sm text-muted-foreground">
              Toutes les suggestions ont été traitées!
            </p>
            <Button variant="link" size="sm" onClick={clearSuggestions}>
              Effacer l'historique
            </Button>
          </div>
        )}

        {visibleSuggestions.map((suggestion) => (
          <div 
            key={suggestion.id}
            className="p-4 rounded-lg border bg-secondary/30 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {getTypeIcon(suggestion.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{suggestion.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getTypeLabel(suggestion.type)}
                    </Badge>
                  </div>
                  <Badge className={cn("text-xs mt-1", getConfidenceColor(suggestion.confidence))}>
                    {Math.round(suggestion.confidence * 100)}% confiance
                  </Badge>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {suggestion.description}
            </p>

            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={() => handleApply(suggestion.id)}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-1" />
                Appliquer
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => handleDismiss(suggestion.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {appliedSuggestions.size > 0 && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            {appliedSuggestions.size} suggestion{appliedSuggestions.size > 1 ? 's' : ''} appliquée{appliedSuggestions.size > 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
