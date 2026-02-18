import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import "react-big-calendar/lib/css/react-big-calendar.css";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { useGetData } from "@/hooks/useGetData";
import { X } from '@phosphor-icons/react';
import { Spinner } from '@/components/ui/Spinner';

// Event interface - واجهة الحدث
interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  resource: string;
}

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface EventsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventsDrawer = ({ isOpen, onClose }: EventsDrawerProps) => {
  const { data: events, isLoading, error } = useGetData<CalendarEvent[]>(
    'events',
    undefined,
    { retry: false, enabled: isOpen }
  );

  // Convert string dates to Date objects; use empty array when API returns 404 or error
  const calendarEvents = (error ? [] : events)?.map(event => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  })) ?? [];

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[85vh] mt-0 rounded-t-xl bg-white dark:bg-gray-900 shadow-xl border-t border-gray-200 dark:border-gray-700">
        <DrawerHeader className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-900">
          <DrawerTitle className="text-xl font-bold text-gray-900 dark:text-white">Event Calendar</DrawerTitle>
          <DrawerClose asChild>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-700 dark:text-gray-300">
              <X size={24} />
            </button>
          </DrawerClose>
        </DrawerHeader>
        <div className="p-6 h-full overflow-hidden bg-white dark:bg-gray-900">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="h-full min-h-0 rounded-lg overflow-hidden bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 events-calendar-wrapper">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100% - 60px)' }}
                views={['month', 'week', 'day', 'agenda']}
                defaultView='month'
              />
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
