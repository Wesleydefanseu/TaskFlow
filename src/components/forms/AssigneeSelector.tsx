import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { UserPlus, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface AssigneeSelectorProps {
  selectedAssignees: TeamMember[];
  availableMembers: TeamMember[];
  onAssign: (member: TeamMember) => void;
  onRemove: (memberId: string) => void;
  disabled?: boolean;
}

export function AssigneeSelector({
  selectedAssignees,
  availableMembers,
  onAssign,
  onRemove,
  disabled = false,
}: AssigneeSelectorProps) {
  const [open, setOpen] = useState(false);

  const isSelected = (memberId: string) => 
    selectedAssignees.some(a => a.id === memberId);

  const handleSelect = (member: TeamMember) => {
    if (isSelected(member.id)) {
      onRemove(member.id);
    } else {
      onAssign(member);
    }
  };

  return (
    <div className="space-y-2">
      {/* Selected Assignees */}
      <div className="flex flex-wrap gap-2">
        {selectedAssignees.map((assignee) => (
          <Badge
            key={assignee.id}
            variant="secondary"
            className="flex items-center gap-2 pl-1 pr-2 py-1"
          >
            <Avatar className="h-5 w-5">
              <AvatarImage src={assignee.avatar} />
              <AvatarFallback className="text-[10px]">{assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs">{assignee.name}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemove(assignee.id)}
                className="ml-1 hover:bg-muted rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>

      {/* Add Assignee Button */}
      {!disabled && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Ajouter un assigné
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-64" align="start">
            <Command>
              <CommandInput placeholder="Rechercher un membre..." />
              <CommandList>
                <CommandEmpty>Aucun membre trouvé.</CommandEmpty>
                <CommandGroup>
                  {availableMembers.map((member) => (
                    <CommandItem
                      key={member.id}
                      value={member.name}
                      onSelect={() => handleSelect(member)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{member.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                        </div>
                        {isSelected(member.id) && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
