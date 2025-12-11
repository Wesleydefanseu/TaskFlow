import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AISuggestion {
  id: string;
  type: 'priority' | 'deadline' | 'assignee' | 'task';
  title: string;
  description: string;
  confidence: number;
  data?: Record<string, unknown>;
}

interface AIProjectSummary {
  projectId: string;
  summary: string;
  keyMetrics: {
    completionRate: number;
    onTrackTasks: number;
    delayedTasks: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  recommendations: string[];
  generatedAt: string;
}

interface AIContextType {
  isLoading: boolean;
  suggestions: AISuggestion[];
  generateSuggestions: (context: { tasks: unknown[]; members: unknown[] }) => Promise<AISuggestion[]>;
  generateProjectSummary: (projectData: { name: string; tasks: unknown[]; members: unknown[] }) => Promise<AIProjectSummary>;
  clearSuggestions: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

// Simulated AI responses for frontend demo
const simulatePrioritySuggestions = (): AISuggestion[] => [
  {
    id: 'sug-1',
    type: 'priority',
    title: 'Augmenter la priorité',
    description: 'La tâche "Intégration authentification" devrait être prioritaire car elle bloque d\'autres fonctionnalités.',
    confidence: 0.92,
    data: { taskId: '5', newPriority: 'urgent' },
  },
  {
    id: 'sug-2',
    type: 'deadline',
    title: 'Ajuster la deadline',
    description: 'La documentation API risque d\'être en retard. Suggérer une extension de 2 jours.',
    confidence: 0.78,
    data: { taskId: '3', suggestedDeadline: '2024-12-20' },
  },
  {
    id: 'sug-3',
    type: 'assignee',
    title: 'Réassigner une tâche',
    description: 'Jean-Paul a une charge de travail élevée. Suggérer de réassigner "Wireframes dashboard" à Sandrine.',
    confidence: 0.85,
    data: { taskId: '2', suggestedAssignee: 'Sandrine Tchamba' },
  },
];

const simulateTaskSuggestions = (): AISuggestion[] => [
  {
    id: 'sug-4',
    type: 'task',
    title: 'Ajouter des tests unitaires',
    description: 'Basé sur les tâches récentes, il serait judicieux d\'ajouter une tâche de tests unitaires.',
    confidence: 0.88,
    data: { suggestedTask: { title: 'Tests unitaires - Module Auth', priority: 'high' } },
  },
  {
    id: 'sug-5',
    type: 'task',
    title: 'Revue de sécurité',
    description: 'Avant le déploiement, une revue de sécurité est recommandée.',
    confidence: 0.91,
    data: { suggestedTask: { title: 'Audit de sécurité', priority: 'urgent' } },
  },
];

export function AIProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  const generateSuggestions = async (context: { tasks: unknown[]; members: unknown[] }): Promise<AISuggestion[]> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newSuggestions = [...simulatePrioritySuggestions(), ...simulateTaskSuggestions()];
    setSuggestions(newSuggestions);
    setIsLoading(false);
    
    return newSuggestions;
  };

  const generateProjectSummary = async (projectData: { name: string; tasks: unknown[]; members: unknown[] }): Promise<AIProjectSummary> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const summary: AIProjectSummary = {
      projectId: 'generated',
      summary: `Le projet "${projectData.name}" progresse bien avec une équipe de ${(projectData.members as unknown[]).length || 5} membres actifs. Les objectifs principaux sont en bonne voie, avec quelques ajustements recommandés pour optimiser les délais de livraison.`,
      keyMetrics: {
        completionRate: 68,
        onTrackTasks: 12,
        delayedTasks: 3,
        riskLevel: 'low',
      },
      recommendations: [
        'Planifier une réunion de synchronisation hebdomadaire pour maintenir l\'alignement.',
        'Considérer l\'ajout d\'un développeur supplémentaire pour le module backend.',
        'Mettre en place des revues de code systématiques avant chaque merge.',
        'Prioriser la documentation technique pour faciliter l\'onboarding.',
      ],
      generatedAt: new Date().toISOString(),
    };
    
    setIsLoading(false);
    return summary;
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  return (
    <AIContext.Provider value={{
      isLoading,
      suggestions,
      generateSuggestions,
      generateProjectSummary,
      clearSuggestions,
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
