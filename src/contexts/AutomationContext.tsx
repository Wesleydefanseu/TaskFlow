import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'status_change' | 'due_date' | 'assignee_change' | 'priority_change' | 'task_created' | 'comment_added';
    condition?: string;
  };
  actions: {
    type: 'change_status' | 'assign_user' | 'add_label' | 'send_notification' | 'move_to_list' | 'set_priority';
    value: string;
  }[];
  isActive: boolean;
  createdAt: Date;
  executionCount: number;
}

interface AutomationContextType {
  rules: AutomationRule[];
  addRule: (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'executionCount'>) => void;
  updateRule: (id: string, updates: Partial<AutomationRule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  executeRule: (ruleId: string) => void;
}

const AutomationContext = createContext<AutomationContextType | undefined>(undefined);

const initialRules: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Auto-assign reviewer',
    description: 'Quand une tâche passe en "En revue", assigner automatiquement un reviewer',
    trigger: { type: 'status_change', condition: 'review' },
    actions: [
      { type: 'assign_user', value: 'Jean-Paul Mbarga' },
      { type: 'send_notification', value: 'Nouvelle tâche à réviser' },
    ],
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    executionCount: 23,
  },
  {
    id: 'rule-2',
    name: 'Priorité urgente - Notification',
    description: 'Notifier l\'équipe quand une tâche devient urgente',
    trigger: { type: 'priority_change', condition: 'urgent' },
    actions: [
      { type: 'send_notification', value: 'Tâche urgente ajoutée!' },
      { type: 'add_label', value: '🔥 Urgent' },
    ],
    isActive: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    executionCount: 8,
  },
  {
    id: 'rule-3',
    name: 'Archivage automatique',
    description: 'Déplacer les tâches terminées vers l\'archive après 7 jours',
    trigger: { type: 'status_change', condition: 'done' },
    actions: [
      { type: 'move_to_list', value: 'Archive' },
    ],
    isActive: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    executionCount: 45,
  },
  {
    id: 'rule-4',
    name: 'Nouvelle tâche - Labels par défaut',
    description: 'Ajouter des labels automatiques aux nouvelles tâches',
    trigger: { type: 'task_created' },
    actions: [
      { type: 'add_label', value: 'Nouveau' },
      { type: 'set_priority', value: 'medium' },
    ],
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    executionCount: 67,
  },
];

export function AutomationProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<AutomationRule[]>(initialRules);

  const addRule = useCallback((rule: Omit<AutomationRule, 'id' | 'createdAt' | 'executionCount'>) => {
    const newRule: AutomationRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date(),
      executionCount: 0,
    };
    setRules(prev => [...prev, newRule]);
  }, []);

  const updateRule = useCallback((id: string, updates: Partial<AutomationRule>) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  }, []);

  const deleteRule = useCallback((id: string) => {
    setRules(prev => prev.filter(rule => rule.id !== id));
  }, []);

  const toggleRule = useCallback((id: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  }, []);

  const executeRule = useCallback((ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, executionCount: rule.executionCount + 1 } : rule
    ));
  }, []);

  return (
    <AutomationContext.Provider value={{
      rules,
      addRule,
      updateRule,
      deleteRule,
      toggleRule,
      executeRule,
    }}>
      {children}
    </AutomationContext.Provider>
  );
}

export function useAutomation() {
  const context = useContext(AutomationContext);
  if (context === undefined) {
    throw new Error('useAutomation must be used within an AutomationProvider');
  }
  return context;
}
