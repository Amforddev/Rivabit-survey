import { Survey, RewardCategory } from './types';

export const MOCK_SURVEYS: Survey[] = [
  {
    id: 's1',
    title: 'Tech Habits 2026',
    bits: 150,
    time: '3 min',
    category: 'Technology',
    questions: [
      { id: 'q1', text: 'Which device do you use most often?', options: ['Smartphone', 'Laptop', 'Tablet', 'Smartwatch'] },
      { id: 'q2', text: 'How many hours a day do you spend on social media?', options: ['Less than 1', '1-3 hours', '3-5 hours', '5+ hours'] },
      { id: 'q3', text: 'Do you use AI assistants daily?', options: ['Yes, multiple times', 'Yes, occasionally', 'Rarely', 'Never'] }
    ]
  },
  {
    id: 's2',
    title: 'Consumer Preferences',
    bits: 200,
    time: '5 min',
    category: 'Shopping',
    questions: [
      { id: 'q1', text: 'Where do you prefer to shop?', options: ['Online', 'In-store', 'Both equally'] },
      { id: 'q2', text: 'What influences your buying decision the most?', options: ['Price', 'Brand reputation', 'Reviews', 'Eco-friendliness'] }
    ]
  },
  {
    id: 's3',
    title: 'Daily Commute',
    bits: 100,
    time: '2 min',
    category: 'Lifestyle',
    questions: [
      { id: 'q1', text: 'How do you usually commute?', options: ['Car', 'Public Transit', 'Bicycle', 'Walk', 'Work from home'] }
    ]
  },
  {
    id: 's4',
    title: 'Health & Fitness',
    bits: 250,
    time: '4 min',
    category: 'Health',
    questions: [
      { id: 'q1', text: 'How often do you exercise?', options: ['Daily', '3-4 times a week', '1-2 times a week', 'Rarely'] },
      { id: 'q2', text: 'Do you track your calories?', options: ['Yes, strictly', 'Sometimes', 'No'] }
    ]
  },
  {
    id: 's5',
    title: 'Entertainment Choices',
    bits: 120,
    time: '3 min',
    category: 'Entertainment',
    questions: [
      { id: 'q1', text: 'What is your favorite streaming service?', options: ['Netflix', 'Hulu', 'Disney+', 'Other'] },
      { id: 'q2', text: 'How often do you go to the cinema?', options: ['Weekly', 'Monthly', 'Rarely', 'Never'] }
    ]
  },
  {
    id: 's6',
    title: 'Food & Dining',
    bits: 180,
    time: '4 min',
    category: 'Food',
    questions: [
      { id: 'q1', text: 'How often do you eat out or order delivery?', options: ['Every day', '2-3 times a week', 'Once a week', 'Rarely'] },
      { id: 'q2', text: 'What is your favorite cuisine?', options: ['Local', 'Italian', 'Chinese', 'Mexican', 'Other'] }
    ]
  }
];

export const REWARD_CATEGORIES: RewardCategory[] = [
  {
    id: 'cash',
    title: 'Cash',
    iconName: 'Banknote',
    options: [
      { id: 'c1', title: '₦1000 to Wallet', cost: 1100, description: 'Added to your in-app wallet immediately' },
      { id: 'c2', title: '₦5000 to Wallet', cost: 5000, description: 'Added to your in-app wallet immediately' }
    ]
  },
  {
    id: 'raffle',
    title: 'Feeling lucky?',
    iconName: 'Ticket',
    options: [
      { id: 'r1', title: '₦50,000 Weekly Draw', cost: 50, description: 'Draw on Friday. 1 Ticket.' },
      { id: 'r2', title: '₦200,000 Monthly Mega Draw', cost: 400, description: 'Draw at end of month. 10 Tickets.' }
    ]
  }
];
