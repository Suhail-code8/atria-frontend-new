import React from 'react';
import RegistrationModule from './RegistrationModule';
import PaymentModule from './PaymentModule';
import TeamFormationModule from './TeamFormationModule';
import SubmissionModule from './SubmissionModule';
import CompetitionOptInModule from './CompetitionOptInModule';
import JudgingModule from './JudgingModule';
import LeaderboardModule from './LeaderboardModule';

export const ModuleRenderers: Record<string, React.FC<any>> = {
  REGISTRATION: RegistrationModule,
  PAYMENT: PaymentModule,
  TEAM_FORMATION: TeamFormationModule,
  SUBMISSION: SubmissionModule,
  COMPETITION_OPT_IN: CompetitionOptInModule,
  JUDGING: JudgingModule,
  LEADERBOARD: LeaderboardModule,
  ONBOARDING_COMPLETE: () => null,
};
