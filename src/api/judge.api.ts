import axiosInstance from './axios'

export interface IEventJudge {
  _id: string
  event: string
  user: { _id: string; name: string; email: string; role: string }
  assignedItems: { _id: string; name: string; type: string }[]
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const judgeApi = {
  /** Organizer: assign a judge to an event with specific item IDs */
  assignJudge: (eventId: string, email: string, assignedItems: string[]) =>
    axiosInstance.post<ApiResponse<IEventJudge>>('/event-judges', {
      eventId,
      email,
      assignedItems,
    }),

  /** Organizer: get all judges for an event */
  getEventJudges: (eventId: string) =>
    axiosInstance.get<ApiResponse<IEventJudge[]>>(`/event-judges/event/${eventId}`),

  /** Judge: get all their event assignments */
  getMyAllAssignments: () =>
    axiosInstance.get<ApiResponse<IEventJudge[]>>('/event-judges/me/all'),

  /** Judge: get their own assignment for an event */
  getMyAssignment: (eventId: string) =>
    axiosInstance.get<ApiResponse<IEventJudge | null>>(`/event-judges/event/${eventId}/me`),

  /** Organizer: update a judge's assigned items */
  updateJudgeItems: (judgeId: string, assignedItems: string[]) =>
    axiosInstance.patch<ApiResponse<IEventJudge>>(`/event-judges/${judgeId}`, { assignedItems }),

  /** Organizer: remove a judge */
  removeJudge: (judgeId: string) =>
    axiosInstance.delete<ApiResponse<{ deleted: true }>>(`/event-judges/${judgeId}`),
}
