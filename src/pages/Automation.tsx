import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAutomation, AutomationRule } from '@/contexts/AutomationContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Zap, 
  Play, 
  Trash2, 
  Settings2,
  ArrowRight,
  Bell,
  Tag,
  Users,
  MoveRight,
  Flag,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const triggerIcons: Record<string, React.ReactNode> = {
  status_change: <MoveRight className="w-4 h-4" />,
  due_date: <CheckCircle2 className="w-4 h-4" />,
  assignee_change: <Users className="w-4 h-4" />,
  priority_change: <Flag className="w-4 h-4" />,
  task_created: <Plus className="w-4 h-4" />,
  comment_added: <Bell className="w-4 h-4" />,
};

const actionIcons: Record<string, React.ReactNode> = {
  change_status: <MoveRight className="w-4 h-4" />,
  assign_user: <Users className="w-4 h-4" />,
  add_label: <Tag className="w-4 h-4" />,
  send_notification: <Bell className="w-4 h-4" />,
  move_to_list: <MoveRight className="w-4 h-4" />,
  set_priority: <Flag className="w-4 h-4" />,
};

const triggerLabels: Record<string, string> = {
  status_change: 'Changement de statut',
  due_date: 'Date d\'échéance',
  assignee_change: 'Changement d\'assigné',
  priority_change: 'Changement de priorité',
  task_created: 'Tâche créée',
  comment_added: 'Commentaire ajouté',
};

const actionLabels: Record<string, string> = {
  change_status: 'Changer le statut',
  assign_user: 'Assigner à',
  add_label: 'Ajouter un label',
  send_notification: 'Envoyer notification',
  move_to_list: 'Déplacer vers',
  set_priority: 'Définir priorité',
};

const Automation = () => {
  const { rules, addRule, toggleRule, deleteRule } = useAutomation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    trigger: { type: 'status_change' as const, condition: '' },
    actions: [{ type: 'send_notification' as const, value: '' }],
  });

  const handleCreate = () => {
    if (!newRule.name) return;
    addRule({
      ...newRule,
      isActive: true,
    });
    setNewRule({
      name: '',
      description: '',
      trigger: { type: 'status_change', condition: '' },
      actions: [{ type: 'send_notification', value: '' }],
    });
    setIsCreateOpen(false);
  };

  const activeRules = rules.filter(r => r.isActive);
  const totalExecutions = rules.reduce((sum, r) => sum + r.executionCount, 0);

  return (
    <DashboardLayout title="Automatisation" subtitle="Règles et workflows automatisés">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rules.length}</p>
              <p className="text-sm text-muted-foreground">Règles totales</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-status-done/10">
              <Play className="w-6 h-6 text-status-done" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeRules.length}</p>
              <p className="text-sm text-muted-foreground">Règles actives</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <CheckCircle2 className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalExecutions}</p>
              <p className="text-sm text-muted-foreground">Exécutions totales</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Règles d'automatisation</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle règle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Créer une règle d'automatisation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nom de la règle</Label>
                <Input
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="Ex: Auto-assign reviewer"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Décrivez ce que fait cette règle..."
                />
              </div>
              <div className="space-y-2">
                <Label>Déclencheur (Quand)</Label>
                <Select
                  value={newRule.trigger.type}
                  onValueChange={(value) => setNewRule({
                    ...newRule,
                    trigger: { ...newRule.trigger, type: value as any },
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(triggerLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {triggerIcons[key]}
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition (Si)</Label>
                <Input
                  value={newRule.trigger.condition || ''}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    trigger: { ...newRule.trigger, condition: e.target.value },
                  })}
                  placeholder="Ex: done, urgent, etc."
                />
              </div>
              <div className="space-y-2">
                <Label>Action (Alors)</Label>
                <Select
                  value={newRule.actions[0].type}
                  onValueChange={(value) => setNewRule({
                    ...newRule,
                    actions: [{ ...newRule.actions[0], type: value as any }],
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(actionLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {actionIcons[key]}
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valeur de l'action</Label>
                <Input
                  value={newRule.actions[0].value}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    actions: [{ ...newRule.actions[0], value: e.target.value }],
                  })}
                  placeholder="Ex: Jean-Paul Mbarga, Archive, etc."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button variant="gradient" onClick={handleCreate} disabled={!newRule.name}>
                Créer la règle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            onToggle={() => toggleRule(rule.id)}
            onDelete={() => deleteRule(rule.id)}
          />
        ))}
      </div>
    </DashboardLayout>
  );
};

interface RuleCardProps {
  rule: AutomationRule;
  onToggle: () => void;
  onDelete: () => void;
}

function RuleCard({ rule, onToggle, onDelete }: RuleCardProps) {
  return (
    <Card className={cn(
      "p-6 transition-all",
      !rule.isActive && "opacity-60"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-xl",
            rule.isActive ? "bg-primary/10" : "bg-muted"
          )}>
            <Zap className={cn(
              "w-5 h-5",
              rule.isActive ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">{rule.name}</h3>
              <Badge variant={rule.isActive ? "default" : "secondary"}>
                {rule.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
            
            {/* Trigger & Actions */}
            <div className="flex items-center gap-3 mt-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
                {triggerIcons[rule.trigger.type]}
                <span>{triggerLabels[rule.trigger.type]}</span>
                {rule.trigger.condition && (
                  <Badge variant="outline" className="ml-1">{rule.trigger.condition}</Badge>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              {rule.actions.map((action, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                  {actionIcons[action.type]}
                  <span>{actionLabels[action.type]}</span>
                  <Badge variant="outline" className="ml-1">{action.value}</Badge>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span>Créée {formatDistanceToNow(rule.createdAt, { addSuffix: true, locale: fr })}</span>
              <span>•</span>
              <span>{rule.executionCount} exécutions</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={rule.isActive} onCheckedChange={onToggle} />
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default Automation;
