import axiosInstance from './axios'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface SubmitResultPayload {
  eventId: string
  itemId: string
  teamId: string
  entryId?: string
  participantId?: string
  place?: number
  grade?: string
}

export interface TeamLeaderboardEntry {
  _id: string
  name: string
  totalPoints: number
}

export const resultApi = {
  submitResult: (payload: SubmitResultPayload) =>
    axiosInstance.post<ApiResponse<any>>('/results', payload),

  /** Alias used by judge scoring UI */
  addResult: (payload: Partial<SubmitResultPayload>) =>
    axiosInstance.post<ApiResponse<any>>('/results', payload),

  getTeamLeaderboard: (eventId: string) =>
    axiosInstance.get<ApiResponse<TeamLeaderboardEntry[]>>(
      `/results/event/${eventId}/leaderboards/teams`
    ),

  getIndividualLeaderboard: (eventId: string) =>
    axiosInstance.get<ApiResponse<any[]>>(
      `/results/event/${eventId}/leaderboards/individuals`
    ),

  getEventResults: (eventId: string) =>
    axiosInstance.get<ApiResponse<any[]>>(`/results/event/${eventId}`),
}
