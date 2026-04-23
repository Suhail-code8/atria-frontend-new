import RegistrationModule from './RegistrationModule';
import PaymentModule from './PaymentModule';
import TeamFormationModule from './TeamFormationModule';
import SubmissionModule from './SubmissionModule';
import LeaderboardModule from './LeaderboardModule';
import JudgingModule from './JudgingModule';
import CompetitionOptInModule from './CompetitionOptInModule';

export const ModuleRenderers: Record<string, React.ComponentType<any>> = {
  REGISTRATION: RegistrationModule,
  PAYMENT: PaymentModule,
  TEAM_FORMATION: TeamFormationModule,
  COMPETITION_OPT_IN: CompetitionOptInModule,
  SUBMISSION: SubmissionModule,
  LEADERBOARD: LeaderboardModule,
  JUDGING_ROUND: JudgingModule,
};
