export type View = 'home' | 'surveys' | 'survey_active' | 'rewards' | 'profile' | 'auth';

export interface Survey {
  id: string;
  title: string;
  points: number;
  time: string;
  category: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
}

export interface RewardCategory {
  id: string;
  title: string;
  iconName: string;
  color: string;
  options: RewardOption[];
}

export interface RewardOption {
  id: string;
  title: string;
  cost: number;
  description: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  points: number;
  referralCode: string;
  referredBy?: string;
  createdAt: any;
  phoneNumber?: string;
  accountNumber?: string;
  bankName?: string;
}

export interface SurveySubmission {
  id?: string;
  userId: string;
  surveyId: string;
  pointsEarned: number;
  submittedAt: any;
}

export interface Redemption {
  id?: string;
  userId: string;
  rewardId: string;
  rewardTitle: string;
  cost: number;
  redeemedAt: any;
  status: 'pending' | 'completed' | 'failed';
}

export interface AppNotification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
  type: 'survey' | 'trivia' | 'redemption' | 'referral' | 'system';
}
