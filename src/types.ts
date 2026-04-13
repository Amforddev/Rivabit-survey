export type View = 'onboarding' | 'profile-builder' | 'home' | 'surveys' | 'survey_active' | 'rewards' | 'profile' | 'wallet';

export interface Survey {
  id: string;
  title: string;
  bits: number;
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
  bits: number;
  walletBalance: number;
  referralCode: string;
  referredBy?: string;
  createdAt: any;
  phoneNumber?: string;
  accountNumber?: string;
  bankName?: string;
  kycName?: string;
}

export interface SurveySubmission {
  id?: string;
  userId: string;
  surveyId: string;
  bitsEarned: number;
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
  type: 'survey' | 'redemption' | 'referral' | 'system';
}
