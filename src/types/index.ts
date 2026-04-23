export const EventType = {
  CONFERENCE: 'CONFERENCE',
  FEST: 'FEST',
  PROGRAM: 'PROGRAM',
  CUSTOM: 'CUSTOM'
} as const
export type EventType = typeof EventType[keyof typeof EventType]

export const EventStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  REGISTRATION_OPEN: 'REGISTRATION_OPEN',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  ARCHIVED: 'ARCHIVED'
} as const
export type EventStatus = typeof EventStatus[keyof typeof EventStatus]

export interface EventCapabilities {
  registration: boolean
  submissions: boolean
  review: boolean
  teams: boolean
  scoring: boolean
  leaderboardPublished?: boolean
  sessions: boolean
  realtime: boolean
}

export interface EventLimits {
  maxCategoriesPerTeam?: number
  maxParticipantsPerCategoryPerTeam?: number
  maxItemsPerTeam?: number
  maxIndividualItemsPerParticipant?: number
}

export interface EventScoringRules {
  places?: Record<string, number>
  grades?: Record<string, number>
}

export interface CompetitionPlacePoints {
  first: number
  second: number
  third: number
}

export interface CompetitionGradeRange {
  grade: string
  minPoints: number
  maxPoints: number
}

export interface CompetitionItem {
  _id: string
  name: string
  type: 'INDIVIDUAL' | 'GROUP' | 'SINGLE'
  allowedCategories: Array<{ _id: string; name: string; description?: string }>
  minParticipantsPerTeam?: number
  maxParticipantsPerTeam: number
  placePoints?: CompetitionPlacePoints
  gradeRanges?: CompetitionGradeRange[]
  countsTowardOverallTotal?: boolean
}

export interface CreateCompetitionItemPayload {
  name: string
  type: 'INDIVIDUAL' | 'GROUP' | 'SINGLE'
  allowedCategories?: string[]
  minParticipantsPerTeam?: number
  maxParticipantsPerTeam?: number
  placePoints?: CompetitionPlacePoints
  gradeRanges?: CompetitionGradeRange[]
  countsTowardOverallTotal?: boolean
}

export interface CompetitionEnrollment {
  itemId: string
  participantIds: string[]
}

export interface CompetitionEnrollmentPayload {
  enrollments: CompetitionEnrollment[]
}

export interface FormField {
  id: string
  label: string
  type: 'text' | 'number' | 'email' | 'select' | 'checkbox' | 'textarea'
  required: boolean
  options?: string[]
  placeholder?: string
}

export interface Event {
  _id: string
  title: string
  description: string
  posterUrl?: string
  eventType: EventType
  isCompetition?: boolean
  isLeaderboardPublished?: boolean
  isPaid?: boolean
  price?: number
  totalSeats?: number
  availableSeats?: number
  accessCode?: string
  startDate: string | Date
  endDate: string | Date
  registrationStartDate?: string | Date
  registrationEndDate?: string | Date
  createdBy: string
  isPublic: boolean
  status: EventStatus
  capabilities: EventCapabilities
  scoringRules?: EventScoringRules
  limits?: EventLimits
  workflow?: {
    nodes: unknown[]
    edges: unknown[]
  }
  registrationForm?: FormField[]
  generatedPosters?: Array<{
    style: string
    url: string
    prompt: string
    createdAt: string | Date
  }>
  createdAt?: string
  updatedAt?: string
}

export const ParticipationRole = {
  PARTICIPANT: 'PARTICIPANT',
  ORGANIZER: 'ORGANIZER',
  JUDGE: 'JUDGE'
} as const
export type ParticipationRole = typeof ParticipationRole[keyof typeof ParticipationRole]

export const ParticipationStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  WAITLISTED: 'WAITLISTED',
  REGISTERED: 'REGISTERED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN'
} as const
export type ParticipationStatus = typeof ParticipationStatus[keyof typeof ParticipationStatus]

export interface Participation {
  _id: string
  user: { _id: string; name: string; email: string; role: string }
  event: string
  role: ParticipationRole
  status: ParticipationStatus
  answers?: Record<string, unknown>
  metadata?: Record<string, unknown>
  lockedUntil?: string | null
  razorpayOrderId?: string
  razorpayPaymentId?: string
  registeredAt: string
  currentWorkflowNodeId?: string
  workflowState?: string
  workflowData?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export const ContentType = {
  ABSTRACT: 'ABSTRACT',
  PAPER: 'PAPER',
  FILE: 'FILE',
  LINK: 'LINK',
  CUSTOM: 'CUSTOM'
} as const
export type ContentType = typeof ContentType[keyof typeof ContentType]

export const SubmissionStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
} as const
export type SubmissionStatus = typeof SubmissionStatus[keyof typeof SubmissionStatus]

export interface SubmissionFile {
  publicId: string
  url: string
  originalName: string
  mimetype: string
  size: number
}

export interface SubmissionReview {
  score: number         
  comment: string
  feedbackFile?: {
    publicId: string
    url: string
  }
  reviewedBy: string | { _id: string; name: string; email: string }
  reviewedAt: string | Date
}

export interface Submission {
  _id: string
  event: string
  participant: string
  title: string
  description?: string
  type: ContentType
  status: SubmissionStatus
  content?: string
  file?: SubmissionFile
  review?: SubmissionReview
  submittedAt?: string | null
  metadata?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export const UserRole = {
  ORGANIZER: 'ORGANIZER',
  PARTICIPANT: 'PARTICIPANT',
  JUDGE: 'JUDGE'
} as const
export type UserRole = typeof UserRole[keyof typeof UserRole]

export interface User {
  _id: string
  name: string
  email: string
  role: UserRole
}

export interface AuthResponse {
  success: boolean
  message?: string
  data: {
    accessToken: string
    user: User
  }
}

export interface ApiError {
  message: string
  statusCode?: number
}
