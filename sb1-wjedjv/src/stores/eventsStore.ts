import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  description: string;
  isPublic: boolean;
  backgroundImage?: string;
}

interface EventsState {
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  deleteEvent: (id: string) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (event) => set((state) => ({
        events: [...state.events, { ...event, id: crypto.randomUUID() }]
      })),
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(event => event.id !== id)
      })),
      updateEvent: (id, updatedEvent) => set((state) => ({
        events: state.events.map(event => 
          event.id === id ? { ...event, ...updatedEvent } : event
        )
      }))
    }),
    {
      name: 'events-storage',
    }
  )
);