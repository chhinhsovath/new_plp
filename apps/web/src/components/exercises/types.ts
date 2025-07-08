export interface BaseExercise {
  id: string;
  type: ExerciseType;
  title: string;
  titleKh?: string;
  instructions: string;
  instructionsKh?: string;
  points: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export enum ExerciseType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  FILL_IN_GAPS = "FILL_IN_GAPS",
  DRAG_DROP = "DRAG_DROP",
  MATCHING = "MATCHING",
  TRUE_FALSE = "TRUE_FALSE",
  SHORT_ANSWER = "SHORT_ANSWER",
  LONG_ANSWER = "LONG_ANSWER",
  LISTENING = "LISTENING",
  SPEAKING = "SPEAKING",
  DRAWING = "DRAWING",
  SORTING = "SORTING",
  SEQUENCING = "SEQUENCING",
  LABELING = "LABELING",
  DICTATION = "DICTATION",
  FIND_WORD = "FIND_WORD",
  FIND_LETTER = "FIND_LETTER",
  CHOOSE_WORD = "CHOOSE_WORD",
  INPUT = "INPUT",
  SELECT_SENTENCE = "SELECT_SENTENCE",
  WRITE_ANSWER = "WRITE_ANSWER",
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: ExerciseType.MULTIPLE_CHOICE;
  content: {
    question: string;
    questionKh?: string;
    options: string[];
    imageUrl?: string;
    audioUrl?: string;
  };
  solution: {
    correctAnswer: number;
    explanation?: string;
  };
}

export interface FillInGapsExercise extends BaseExercise {
  type: ExerciseType.FILL_IN_GAPS;
  content: {
    text: string;
    textKh?: string;
    gaps: Array<{
      id: string;
      position: number;
      length?: number;
    }>;
    options?: string[]; // For drag-drop fill in gaps
  };
  solution: {
    answers: Record<string, string>;
  };
}

export interface DragDropExercise extends BaseExercise {
  type: ExerciseType.DRAG_DROP;
  content: {
    items: Array<{
      id: string;
      content: string;
      imageUrl?: string;
    }>;
    dropZones: Array<{
      id: string;
      label: string;
      acceptIds: string[];
    }>;
  };
  solution: {
    mapping: Record<string, string>;
  };
}

export interface MatchingExercise extends BaseExercise {
  type: ExerciseType.MATCHING;
  content: {
    leftColumn: Array<{
      id: string;
      content: string;
      imageUrl?: string;
    }>;
    rightColumn: Array<{
      id: string;
      content: string;
      imageUrl?: string;
    }>;
  };
  solution: {
    matches: Array<{
      leftId: string;
      rightId: string;
    }>;
  };
}

export interface TrueFalseExercise extends BaseExercise {
  type: ExerciseType.TRUE_FALSE;
  content: {
    statement: string;
    statementKh?: string;
    imageUrl?: string;
  };
  solution: {
    isTrue: boolean;
    explanation?: string;
  };
}

export interface ShortAnswerExercise extends BaseExercise {
  type: ExerciseType.SHORT_ANSWER;
  content: {
    question: string;
    questionKh?: string;
    hint?: string;
    imageUrl?: string;
  };
  solution: {
    acceptableAnswers: string[];
    caseSensitive?: boolean;
    explanation?: string;
  };
}

export interface LongAnswerExercise extends BaseExercise {
  type: ExerciseType.LONG_ANSWER;
  content: {
    question: string;
    questionKh?: string;
    minWords?: number;
    maxWords?: number;
    rubric?: string[];
  };
  solution: {
    sampleAnswer?: string;
    keyPoints?: string[];
  };
}

export interface SortingExercise extends BaseExercise {
  type: ExerciseType.SORTING;
  content: {
    question: string;
    questionKh?: string;
    items: string[];
    instruction?: string;
  };
  solution: {
    correctOrder: string[];
    explanation?: string;
  };
}

export interface DrawingExercise extends BaseExercise {
  type: ExerciseType.DRAWING;
  content: {
    question: string;
    questionKh?: string;
    backgroundImage?: string;
    gridSize?: number;
    tools?: ("pen" | "eraser" | "line" | "rectangle" | "circle")[];
  };
  solution: {
    referenceImage?: string;
    keyElements?: string[];
  };
}

export interface ListeningExercise extends BaseExercise {
  type: ExerciseType.LISTENING;
  content: {
    audioUrl: string;
    question: string;
    questionKh?: string;
    options?: string[]; // For multiple choice listening
    transcript?: string; // Hidden transcript for teachers
  };
  solution: {
    correctAnswer?: number | string;
    acceptableAnswers?: string[];
    explanation?: string;
  };
}

export type Exercise = 
  | MultipleChoiceExercise
  | FillInGapsExercise
  | DragDropExercise
  | MatchingExercise
  | TrueFalseExercise
  | ShortAnswerExercise
  | LongAnswerExercise
  | SortingExercise
  | DrawingExercise
  | ListeningExercise;

export interface ExerciseAttempt {
  exerciseId: string;
  answer: any;
  timeSpent: number;
  attempts: number;
}

export interface ExerciseResult {
  correct: boolean;
  score: number;
  feedback?: string;
  explanation?: string;
}