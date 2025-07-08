export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExerciseContent {
  question: string;
  options?: string[];
  gaps?: Gap[];
  items?: DragItem[];
  audioUrl?: string;
  imageUrl?: string;
  [key: string]: any;
}

export interface Gap {
  id: string;
  position: number;
  answer?: string;
}

export interface DragItem {
  id: string;
  content: string;
  targetId?: string;
}

export interface ExerciseAttempt {
  exerciseId: string;
  answer: any;
  timeSpent: number;
}

export interface ExerciseResult {
  correct: boolean;
  score: number;
  feedback?: string;
  explanation?: string;
}