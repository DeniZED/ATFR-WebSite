import { ref, get, set, push, remove, query, orderByChild } from 'firebase/database';
import { db } from '../firebase';
import type { Application, Event, ClanMember } from '../../types';

export const databaseService = {
  // Applications
  async getApplications() {
    const applicationsRef = ref(db, 'applications');
    const snapshot = await get(applicationsRef);
    return snapshot.val();
  },

  async createApplication(application: Omit<Application, 'id'>) {
    const applicationsRef = ref(db, 'applications');
    const newRef = push(applicationsRef);
    await set(newRef, application);
    return newRef.key;
  },

  async updateApplication(id: string, status: string) {
    const applicationRef = ref(db, `applications/${id}`);
    await set(applicationRef, { status });
  },

  async deleteApplication(id: string) {
    const applicationRef = ref(db, `applications/${id}`);
    await remove(applicationRef);
  },

  // Events
  async getEvents() {
    const eventsRef = ref(db, 'events');
    const snapshot = await get(eventsRef);
    return snapshot.val();
  },

  async createEvent(event: Omit<Event, 'id'>) {
    const eventsRef = ref(db, 'events');
    const newRef = push(eventsRef);
    await set(newRef, event);
    return newRef.key;
  },

  async updateEvent(id: string, event: Partial<Event>) {
    const eventRef = ref(db, `events/${id}`);
    await set(eventRef, event);
  },

  async deleteEvent(id: string) {
    const eventRef = ref(db, `events/${id}`);
    await remove(eventRef);
  },

  // Members
  async getMembers() {
    const membersRef = ref(db, 'members');
    const snapshot = await get(membersRef);
    return snapshot.val();
  },

  async updateMember(id: string, member: Partial<ClanMember>) {
    const memberRef = ref(db, `members/${id}`);
    await set(memberRef, member);
  },

  // Activity Logs
  async addActivityLog(activity: any) {
    const logsRef = ref(db, 'activityLogs');
    const newRef = push(logsRef);
    await set(newRef, {
      ...activity,
      timestamp: Date.now()
    });
    return newRef.key;
  },

  async getActivityLogs() {
    const logsRef = ref(db, 'activityLogs');
    const logsQuery = query(logsRef, orderByChild('timestamp'));
    const snapshot = await get(logsQuery);
    return snapshot.val();
  }
};