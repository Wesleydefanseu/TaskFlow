import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const events = [
  { id: 1, title: 'Sprint Planning', time: '09:00', duration: 2, color: 'bg-primary', day: 2 },
  { id: 2, title: 'Design Review', time: '14:00', duration: 1, color: 'bg-accent', day: 3 },
  { id: 3, title: 'Team Standup', time: '10:00', duration: 0.5, color: 'bg-status-progress', day: 4 },
  { id: 4, title: 'Client Call', time: '15:00', duration: 1, color: 'bg-status-review', day: 4 },
  { id: 5, title: 'Code Review', time: '11:00', duration: 1.5, color: 'bg-status-done', day: 5 },
  { id: 6, title: 'Retrospective', time: '16:00', duration: 1, color: 'bg-primary', day: 6 },
];

const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const currentDate = new Date();

const CalendarPage = () => {
  const [currentMonth] = useState(new Date());

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Get the day of the week for the first day (0 = Sunday, adjust to Monday = 0)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    // Add days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ 
        day: i, 
        isCurrentMonth: true,
        isToday: i === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <DashboardLayout title="Calendrier" subtitle="Décembre 2024">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold">Décembre 2024</h2>
          <Button variant="ghost" size="sm">Aujourd'hui</Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-secondary rounded-lg p-1">
            <Button variant="ghost" size="sm" className="rounded-md">Mois</Button>
            <Button variant="secondary" size="sm" className="rounded-md">Semaine</Button>
            <Button variant="ghost" size="sm" className="rounded-md">Jour</Button>
          </div>
          <Button variant="gradient" size="sm">
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
            {calendarDays.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "min-h-28 p-2 border-b border-r border-border last:border-r-0",
                  !item.isCurrentMonth && "bg-muted/30",
                  item.isToday && "bg-primary/5"
                )}
              >
                {item.day && (
                  <>
                    <span className={cn(
                      "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm",
                      item.isToday && "bg-primary text-primary-foreground font-semibold"
                    )}>
                      {item.day}
                    </span>
                    {/* Events for this day */}
                    <div className="mt-1 space-y-1">
                      {events
                        .filter(e => e.day === item.day)
                        .map(event => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-xs px-2 py-1 rounded truncate text-primary-foreground",
                              event.color
                            )}
                          >
                            {event.title}
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            ))}
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
              <div key={event.id} className="flex items-start gap-3">
                <div className={cn("w-1 h-12 rounded-full", event.color)} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.time} • {event.duration}h
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4">
            Voir tous les événements
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage;
