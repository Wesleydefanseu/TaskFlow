import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  MoreHorizontal,
  Trash2,
  Pencil,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { EventForm, CalendarEvent } from '@/components/forms/EventForm';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const CalendarPage = () => {
  const { currentWorkspace } = useWorkspace();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentWorkspace) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('workspace_id', currentWorkspace.id)
          .order('date', { ascending: true });

        if (error) throw error;

        const formattedEvents: CalendarEvent[] = (data || []).map(event => ({
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time?.substring(0, 5) || '09:00',
          duration: Number(event.duration) || 1,
          color: event.color || 'bg-primary',
          description: event.description || undefined,
        }));

        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Erreur lors du chargement des événements');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [currentWorkspace]);

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const today = new Date();

    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, isCurrentMonth: false, date: null });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ 
        day: i, 
        isCurrentMonth: true,
        isToday: i === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
        date: dateStr,
      });
    }

    return days;
  };

  const getEventsForDate = (dateStr: string | null) => {
    if (!dateStr) return [];
    return events.filter(e => e.date === dateStr);
  };

  const handleAddEvent = () => {
    setEditingEvent(undefined);
    setEventFormOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventFormOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (eventToDelete) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventToDelete);

        if (error) throw error;

        setEvents(events.filter(e => e.id !== eventToDelete));
        toast.success('Événement supprimé');
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Erreur lors de la suppression');
      }
      setEventToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleEventSubmit = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!currentWorkspace) return;

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update({
            title: eventData.title,
            date: eventData.date,
            time: eventData.time,
            duration: eventData.duration,
            color: eventData.color,
            description: eventData.description,
          })
          .eq('id', editingEvent.id);

        if (error) throw error;

        setEvents(events.map(e => 
          e.id === editingEvent.id ? { ...e, ...eventData } : e
        ));
        toast.success('Événement mis à jour');
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert({
            workspace_id: currentWorkspace.id,
            title: eventData.title,
            date: eventData.date,
            time: eventData.time,
            duration: eventData.duration,
            color: eventData.color,
            description: eventData.description,
          })
          .select()
          .single();

        if (error) throw error;

        const newEvent: CalendarEvent = {
          id: data.id,
          title: data.title,
          date: data.date,
          time: data.time?.substring(0, 5) || '09:00',
          duration: Number(data.duration) || 1,
          color: data.color || 'bg-primary',
          description: data.description || undefined,
        };
        setEvents([...events, newEvent]);
        toast.success('Événement créé');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const calendarDays = generateCalendarDays();
  const monthLabel = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  if (isLoading) {
    return (
      <DashboardLayout title="Calendrier" subtitle={monthLabel}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Calendrier" subtitle={monthLabel}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold">{monthLabel}</h2>
          <Button variant="ghost" size="sm" onClick={goToToday}>Aujourd'hui</Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-secondary rounded-lg p-1">
            <Button variant="ghost" size="sm" className="rounded-md">Mois</Button>
            <Button variant="secondary" size="sm" className="rounded-md">Semaine</Button>
            <Button variant="ghost" size="sm" className="rounded-md">Jour</Button>
          </div>
          <Button variant="gradient" size="sm" onClick={handleAddEvent}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel événement
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-border">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((item, index) => {
              const dayEvents = getEventsForDate(item.date);
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-28 p-2 border-b border-r border-border last:border-r-0 cursor-pointer hover:bg-muted/50 transition-colors",
                    !item.isCurrentMonth && "bg-muted/30",
                    item.isToday && "bg-primary/5"
                  )}
                  onClick={() => {
                    if (item.date) {
                      setEditingEvent({ id: '', title: '', date: item.date, time: '09:00', duration: 1, color: 'bg-primary' });
                      setEventFormOpen(true);
                    }
                  }}
                >
                  {item.day && (
                    <>
                      <span className={cn(
                        "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm",
                        item.isToday && "bg-primary text-primary-foreground font-semibold"
                      )}>
                        {item.day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(event);
                            }}
                            className={cn(
                              "text-xs px-2 py-1 rounded truncate text-primary-foreground cursor-pointer hover:opacity-80",
                              event.color
                            )}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground px-2">
                            +{dayEvents.length - 2} autre(s)
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar - Upcoming Events */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Événements à venir</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun événement
              </p>
            ) : (
              events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-start gap-3 group">
                  <div className={cn("w-1 h-12 rounded-full flex-shrink-0", event.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.time} • {event.duration}h
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>

          <Button variant="outline" className="w-full mt-4">
            Voir tous les événements
          </Button>
        </div>
      </div>

      {/* Event Form */}
      <EventForm
        open={eventFormOpen}
        onOpenChange={setEventFormOpen}
        onSubmit={handleEventSubmit}
        initialData={editingEvent?.id ? editingEvent : undefined}
        mode={editingEvent?.id ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default CalendarPage;
