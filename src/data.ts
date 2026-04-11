import { Survey, RewardCategory, TriviaQuestion } from './types';

export const MOCK_SURVEYS: Survey[] = [
  {
    id: 's1',
    title: 'Tech Habits 2026',
    points: 150,
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
    points: 200,
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
    points: 100,
    time: '2 min',
    category: 'Lifestyle',
    questions: [
      { id: 'q1', text: 'How do you usually commute?', options: ['Car', 'Public Transit', 'Bicycle', 'Walk', 'Work from home'] }
    ]
  },
  {
    id: 's4',
    title: 'Health & Fitness',
    points: 250,
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
    points: 120,
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
    points: 180,
    time: '4 min',
    category: 'Food',
    questions: [
      { id: 'q1', text: 'How often do you eat out or order delivery?', options: ['Every day', '2-3 times a week', 'Once a week', 'Rarely'] },
      { id: 'q2', text: 'What is your favorite cuisine?', options: ['Local', 'Italian', 'Chinese', 'Mexican', 'Other'] }
    ]
  }
];

export const MOCK_TRIVIA: TriviaQuestion[] = [
  {
    id: 't1',
    question: 'What is the capital of Nigeria?',
    options: ['Lagos', 'Abuja', 'Kano', 'Port Harcourt'],
    correctAnswerIndex: 1,
    points: 10
  },
  {
    id: 't2',
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Jupiter', 'Mars', 'Saturn'],
    correctAnswerIndex: 2,
    points: 10
  },
  {
    id: 't3',
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
    correctAnswerIndex: 3,
    points: 10
  },
  {
    id: 't4',
    question: 'Who wrote "Things Fall Apart"?',
    options: ['Wole Soyinka', 'Chinua Achebe', 'Chimamanda Ngozi Adichie', 'Buchi Emecheta'],
    correctAnswerIndex: 1,
    points: 15
  },
  {
    id: 't5',
    question: 'What is the chemical symbol for Gold?',
    options: ['Ag', 'Au', 'Fe', 'Cu'],
    correctAnswerIndex: 1,
    points: 15
  }
];

export const REWARD_CATEGORIES: RewardCategory[] = [
  {
    id: 'airtime',
    title: 'Airtime',
    iconName: 'Smartphone',
    color: 'bg-[#FF90E8]', // Pink
    options: [
      { id: 'a1', title: '₦500 Airtime', cost: 500, description: 'Direct top-up to your mobile number' },
      { id: 'a2', title: '₦1000 Airtime', cost: 950, description: 'Direct top-up to your mobile number' }
    ]
  },
  {
    id: 'data',
    title: 'Data',
    iconName: 'Wifi',
    color: 'bg-[#23A094]', // Teal
    options: [
      { id: 'd1', title: '1GB Data Bundle', cost: 300, description: 'Valid for 7 days' },
      { id: 'd2', title: '5GB Data Bundle', cost: 1200, description: 'Valid for 30 days' }
    ]
  },
  {
    id: 'cash',
    title: 'Cash',
    iconName: 'Banknote',
    color: 'bg-[#90A8ED]', // Light Blue
    options: [
      { id: 'c1', title: '₦1000 Bank Transfer', cost: 1100, description: 'Transferred within 24 hours' },
      { id: 'c2', title: '₦5000 Bank Transfer', cost: 5000, description: 'Transferred within 2-3 business days' }
    ]
  },
  {
    id: 'raffle',
    title: 'Raffle',
    iconName: 'Ticket',
    color: 'bg-[#FFC900]', // Yellow
    options: [
      { id: 'r1', title: 'PS5 Pro Raffle Ticket', cost: 50, description: 'Draw on Friday. 1 Ticket.' },
      { id: 'r2', title: 'iPhone 17 Raffle (10x)', cost: 400, description: 'Draw at end of month. 10 Tickets.' }
    ]
  },
  {
    id: 'trivia',
    title: 'Trivia',
    iconName: 'BrainCircuit',
    color: 'bg-[#FF90E8]', // Pink
    options: [
      { id: 't1', title: 'Daily Trivia Pass', cost: 20, description: 'Play today\'s trivia to win up to 500 pts' },
      { id: 't2', title: 'Mega Trivia Tournament', cost: 100, description: 'Weekend tournament entry' }
    ]
  }
];
