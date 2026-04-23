import axiosInstance from './axios'

export type TeamRole = 'MANAGER' | 'ASST_MANAGER' | 'CAPTAIN' | 'MEMBER'

export interface ITeamMember {
  user: any
  role: TeamRole
  category: any
}

export interface ITeam {
  _id: string
  name: string
  event: string
  members: ITeamMember[]
  totalPoints: number
  inviteCode?: string
  leaderId?: any
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const teamApi = {
  /** Organizer creates a team (with manager email - legacy) */
  createTeam: (eventId: string, name: string, managerEmail: string) =>
    axiosInstance.post<ApiResponse<ITeam>>('/teams', { eventId, name, managerEmail }),

  /** Organizer creates a team shell (new - no manager email required) */
  createOrganizerTeam: (eventId: string, name: string) =>
    axiosInstance.post<ApiResponse<ITeam>>('/teams', { eventId, name, managerEmail: 'organizer@placeholder.internal' }),

  /** Participant creates their own team */
  createParticipantTeam: (eventId: string, name: string) =>
    axiosInstance.post<ApiResponse<ITeam>>('/teams/participant', { eventId, name }),

  /** Join via invite code */
  joinTeamViaCode: (inviteCode: string) =>
    axiosInstance.post<ApiResponse<ITeam>>('/teams/join', { inviteCode }),

  /** Join a specific team (self-enrollment) */
  joinTeam: (teamId: string) =>
    axiosInstance.post<ApiResponse<ITeam>>(`/teams/${teamId}/join`),

  /** Organizer assigns a participant to a specific team (triggers auto-advance) */
  assignMemberByOrganizer: (teamId: string, email: string, eventId: string) =>
    axiosInstance.post<ApiResponse<ITeam>>(`/teams/${teamId}/assign`, { email, eventId }),

  /** Team manager adds a member */
  addMember: (teamId: string, email: string, role: string, categoryId: string) =>
    axiosInstance.post<ApiResponse<ITeam>>(`/teams/${teamId}/members`, {
      email,
      role,
      categoryId
    }),

  /** Organizer sets the team leader */
  setLeader: (teamId: string, leaderId: string) =>
    axiosInstance.patch<ApiResponse<ITeam>>(`/teams/${teamId}/leader`, { leaderId }),

  /** Enroll team in competition items with specific member selection (participant team leader) */
  enrollInItems: (teamId: string, enrollments: { itemId: string, participantIds: string[] }[]) =>
    axiosInstance.post<ApiResponse<any>>(`/teams/${teamId}/competition-items`, { enrollments }),

  /** Update members for a specific competition item (team leader) */
  updateItemMembers: (teamId: string, itemId: string, participantIds: string[]) =>
    axiosInstance.put<ApiResponse<any>>(`/teams/${teamId}/competition-items/${itemId}/members`, { participantIds }),

  /** Get current competition enrollments for a team */
  getTeamEnrollments: (teamId: string) =>
    axiosInstance.get<ApiResponse<any[]>>(`/teams/${teamId}/competition-items`),

  /** Get all teams for an event */
  getEventTeams: (eventId: string) =>
    axiosInstance.get<ApiResponse<ITeam[]>>(`/teams/event/${eventId}`),

  /** Get a specific team */
  getTeamById: (teamId: string) =>
    axiosInstance.get<ApiResponse<ITeam>>(`/teams/${teamId}`),
}
