export interface Session {
  id: string;
  creatorId: string;
  creatorName: string;
  shareCode: string;
  status: "waiting" | "completed";
  createdAt: string;
}

export interface Answer {
  id: string;
  sessionId: string;
  userType: "creator" | "guesser";
  questionId: string;
  selectedOption: string;
  guesserId?: string;
  guesserName?: string;
  answeredAt: string;
}

export interface GuessResult {
  id: string;
  sessionId: string;
  guesserId: string;
  guesserName: string;
  correctCount: number;
  totalQuestions: number;
  createdAt: string;
}
