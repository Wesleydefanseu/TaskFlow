import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  MoreHorizontal,
  Trash2,
  Pencil
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { EventForm, CalendarEvent } from '@/components/forms/EventForm';
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

const initialEvents: CalendarEvent[] = [
  { id: '1', title: 'Sprint Planning', time: '09:00', duration: 2, color: 'bg-primary', date: '2024-12-02', description: 'Planification du sprint 3' },
  { id: '2', title: 'Design Review', time: '14:00', duration: 1, color: 'bg-accent', date: '2024-12-03', description: 'Revue des maquettes' },
  { id: '3', title: 'Daily Standup', time: '10:00', duration: 0.5, color: 'bg-status-progress', date: '2024-12-04' },
  { id: '4', title: 'Call Client - MTN', time: '15:00', duration: 1, color: 'bg-status-review', date: '2024-12-04', description: 'Appel avec l\'équipe MTN Cameroun' },
  { id: '5', title: 'Code Review', time: '11:00', duration: 1.5, color: 'bg-status-done', date: '2024-12-05' },
  { id: '6', title: 'Retrospective', time: '16:00', duration: 1, color: 'bg-primary', date: '2024-12-06' },
];

const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

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

  const confirmDelete = () => {
    if (eventToDelete) {
      setEvents(events.filter(e => e.id !== eventToDelete));
      setEventToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleEventSubmit = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (editingEvent) {
      setEvents(events.map(e => 
        e.id === editingEvent.id ? { ...e, ...eventData } : e
      ));
    } else {
      const newEvent: CalendarEvent = {
        ...eventData,
        id: Date.now().toString(),
      };
      setEvents([...events, newEvent]);
    }
  };

  const calendarDays = generateCalendarDays();
  const monthLabel = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

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
            {events.slice(0, 5).map((event) => (
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
            ))}
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
