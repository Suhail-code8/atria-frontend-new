import axiosInstance from './axios'
import type { Event, EventStatus } from '../types'

export interface EventAnalytics {
  totalRegistrations: number
  totalSubmissions: number
  conversionRate: number
  registrationsByDate: Array<{ date: string; count: number }>
  submissionsByStatus: {
    DRAFT: number
    SUBMITTED: number
    UNDER_REVIEW: number
    ACCEPTED: number
    REJECTED: number
  }
  averageScore: number | null
  reviewedCount: number
}

export interface GeneratePosterResponse {
  posterUrl: string;
  backgroundUrl?: string;
  eventTitle: string;
  eventDescription: string;
  eventType: string;
  startDate: string | Date;
  location: string;
  endDate?: string | Date;
  isPaid?: boolean;
  price?: number;
}

export const eventsApi = {
  listEvents: (status?: string) =>
    axiosInstance.get<{ success: boolean; data: Event[] }>('/events', { params: { status } }),

  getMyEvents: () =>
    axiosInstance.get<{ success: boolean; data: Event[] }>('/events?organizerId=ME'),

  getEvent: (eventId: string, code?: string) =>
    axiosInstance.get<{ success: boolean; data: Event }>(
      `/events/${eventId}`,
      code ? { params: { code } } : undefined
    ),

  createEvent: (data: Partial<Event>) =>
    axiosInstance.post<{ success: boolean; data: Event }>('/events', data),

  updateEvent: (eventId: string, data: Partial<Event>) =>
    axiosInstance.put<{ success: boolean; data: Event }>(`/events/${eventId}`, data),

  deleteEvent: (eventId: string) =>
    axiosInstance.delete<{ success: boolean; data: Event }>(`/events/${eventId}`),

  transitionEvent: (eventId: string, targetState: EventStatus) =>
    axiosInstance.post<{ success: boolean; message: string; data: Event }>(
      `/events/${eventId}/transition`,
      { targetState }
    ),

  getEventAnalytics: (eventId: string) =>
    axiosInstance.get<{ success: boolean; data: EventAnalytics }>(
      `/events/${eventId}/analytics`
    ),

  generateEventPoster: (eventId: string, style?: string, customPrompt?: string) =>
    axiosInstance.post<{ success: boolean; message?: string; data: GeneratePosterResponse }>(
      `/events/${eventId}/poster/generate`,
      { style, customPrompt }
    ),

  getAccessCode: (eventId: string) =>
    axiosInstance.get<{ success: boolean; data: { accessCode: string | null } }>(
      `/events/${eventId}/access-code`
    ),

    regenerateAccessCode: (eventId: string) =>
    axiosInstance.post<{ success: boolean; data: { accessCode: string } }>(
      `/events/${eventId}/regenerate-access-code`
    ),

  updateEventWorkflow: (eventId: string, workflow: any) =>
    axiosInstance.patch<{ success: boolean; data: Event }>(
      `/events/${eventId}/workflow`,
      workflow
    )
}
