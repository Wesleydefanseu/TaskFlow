import { useState } from 'react';
import { useAI } from '@/contexts/AIContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  Brain,
  MessageSquare,
  FileText,
  Lightbulb,
  TrendingUp,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  Users,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIAssistantProps {
  className?: string;
}

export function AIAssistant({ className }: AIAssistantProps) {
  const { isLoading, suggestions, generateSuggestions, generateProjectSummary } = useAI();
  const [activeTab, setActiveTab] = useState('chat');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: 'Bonjour! Je suis votre assistant IA. Je peux vous aider à optimiser vos projets, suggérer des améliorations, et répondre à vos questions sur la gestion de tâches. Comment puis-je vous aider?',
    },
  ]);
  const [summary, setSummary] = useState<any>(null);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;
    
    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responses = [
      `J'ai analysé votre demande concernant "${userMessage.slice(0, 30)}...". Voici mes recommandations:\n\n1. Priorisez les tâches en retard\n2. Répartissez la charge de travail équitablement\n3. Planifiez des points de synchronisation`,
      `Excellente question! Pour "${userMessage.slice(0, 30)}...", je suggère d'utiliser une approche agile avec des sprints de 2 semaines pour mieux suivre la progression.`,
      `D'après mon analyse, vous pourriez améliorer la productivité de 20% en automatisant les tâches répétitives et en utilisant les règles d'automatisation.`,
    ];
    
    setChatMessages(prev => [
      ...prev,
      { role: 'assistant', content: responses[Math.floor(Math.random() * responses.length)] },
    ]);
  };

  const handleGenerateSuggestions = async () => {
    await generateSuggestions({ tasks: [], members: [] });
  };

  const handleGenerateSummary = async () => {
    const result = await generateProjectSummary({
      name: 'Projet Web Refonte',
      tasks: [],
      members: [],
    });
    setSummary(result);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Assistant IA</h3>
            <p className="text-xs text-muted-foreground">Propulsé par l'intelligence artificielle</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[500px]">
        <TabsList className="w-full justify-start rounded-none border-b border-border px-4 bg-transparent">
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <FileText className="w-4 h-4" />
            Résumé
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                      msg.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-secondary rounded-tl-sm"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                  <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2">
                    <p className="text-sm text-muted-foreground">En train de réfléchir...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Posez une question..."
                className="min-h-[40px] max-h-[100px] resize-none"
              />
              <Button
                variant="gradient"
                size="icon"
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="flex-1 m-0 p-4 overflow-auto">
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGenerateSuggestions}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Générer des suggestions
            </Button>

            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    suggestion.type === 'priority' && "bg-destructive/10",
                    suggestion.type === 'deadline' && "bg-status-progress/10",
                    suggestion.type === 'assignee' && "bg-accent/10",
                    suggestion.type === 'task' && "bg-primary/10"
                  )}>
                    {suggestion.type === 'priority' && <TrendingUp className="w-4 h-4 text-destructive" />}
                    {suggestion.type === 'deadline' && <Clock className="w-4 h-4 text-status-progress" />}
                    {suggestion.type === 'assignee' && <Users className="w-4 h-4 text-accent" />}
                    {suggestion.type === 'task' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{suggestion.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(suggestion.confidence * 100)}% confiance
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                    <Button variant="link" size="sm" className="px-0 mt-2 h-auto text-primary">
                      Appliquer la suggestion
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="flex-1 m-0 p-4 overflow-auto">
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGenerateSummary}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Générer un résumé
            </Button>

            {summary && (
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Résumé du projet</h4>
                  <p className="text-sm text-muted-foreground">{summary.summary}</p>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Complétion</span>
                    </div>
                    <p className="text-xl font-bold mt-1">{summary.keyMetrics.completionRate}%</p>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-status-done" />
                      <span className="text-xs text-muted-foreground">En bonne voie</span>
                    </div>
                    <p className="text-xl font-bold mt-1">{summary.keyMetrics.onTrackTasks}</p>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-status-review" />
                      <span className="text-xs text-muted-foreground">En retard</span>
                    </div>
                    <p className="text-xl font-bold mt-1">{summary.keyMetrics.delayedTasks}</p>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center gap-2 capitalize">
                      <Badge variant={summary.keyMetrics.riskLevel === 'low' ? 'default' : 'destructive'}>
                        {summary.keyMetrics.riskLevel}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Niveau de risque</p>
                  </Card>
                </div>

                <Card className="p-4">
                  <h4 className="font-medium mb-3">Recommandations</h4>
                  <ul className="space-y-2">
                    {summary.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Lightbulb className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
