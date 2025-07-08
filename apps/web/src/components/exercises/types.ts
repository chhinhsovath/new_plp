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
  // Basic Question Types (1-10)
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  SHORT_ANSWER = "SHORT_ANSWER",
  LONG_ANSWER = "LONG_ANSWER",
  FILL_IN_GAPS = "FILL_IN_GAPS",
  DRAG_DROP = "DRAG_DROP",
  MATCHING = "MATCHING",
  SORTING = "SORTING",
  SEQUENCING = "SEQUENCING",
  LABELING = "LABELING",
  
  // Language Skills (11-20)
  LISTENING = "LISTENING",
  SPEAKING = "SPEAKING",
  DICTATION = "DICTATION",
  PRONUNCIATION = "PRONUNCIATION",
  READING_COMPREHENSION = "READING_COMPREHENSION",
  VOCABULARY = "VOCABULARY",
  GRAMMAR = "GRAMMAR",
  SPELLING = "SPELLING",
  WORD_FORMATION = "WORD_FORMATION",
  SENTENCE_CONSTRUCTION = "SENTENCE_CONSTRUCTION",
  
  // Interactive Types (21-30)
  DRAWING = "DRAWING",
  IMAGE_SELECTION = "IMAGE_SELECTION",
  IMAGE_ANNOTATION = "IMAGE_ANNOTATION",
  VIDEO_RESPONSE = "VIDEO_RESPONSE",
  AUDIO_RECORDING = "AUDIO_RECORDING",
  CLICK_MAP = "CLICK_MAP",
  HOTSPOT = "HOTSPOT",
  SLIDER = "SLIDER",
  RATING = "RATING",
  POLL = "POLL",
  
  // Math & Logic (31-40)
  CALCULATION = "CALCULATION",
  EQUATION = "EQUATION",
  GRAPH_PLOTTING = "GRAPH_PLOTTING",
  NUMBER_LINE = "NUMBER_LINE",
  FRACTION = "FRACTION",
  GEOMETRY = "GEOMETRY",
  PATTERN_RECOGNITION = "PATTERN_RECOGNITION",
  LOGIC_PUZZLE = "LOGIC_PUZZLE",
  CODING = "CODING",
  FLOWCHART = "FLOWCHART",
  
  // Game-based (41-50)
  CROSSWORD = "CROSSWORD",
  WORD_SEARCH = "WORD_SEARCH",
  MEMORY_GAME = "MEMORY_GAME",
  PUZZLE = "PUZZLE",
  QUIZ_GAME = "QUIZ_GAME",
  TIMED_CHALLENGE = "TIMED_CHALLENGE",
  SCAVENGER_HUNT = "SCAVENGER_HUNT",
  ESCAPE_ROOM = "ESCAPE_ROOM",
  BOARD_GAME = "BOARD_GAME",
  CARD_GAME = "CARD_GAME",
  
  // Legacy types for backward compatibility
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

// Language Skills Exercises

export interface SpeakingExercise extends BaseExercise {
  type: ExerciseType.SPEAKING;
  content: {
    prompt: string;
    promptKh?: string;
    modelAudioUrl?: string;
    duration?: number; // Max recording duration in seconds
    rubric?: string[];
  };
  solution: {
    modelTranscript?: string;
    keyPhrases?: string[];
  };
}

export interface DictationExercise extends BaseExercise {
  type: ExerciseType.DICTATION;
  content: {
    audioUrl: string;
    playbackSpeed?: number;
    maxReplays?: number;
    sentenceCount?: number;
  };
  solution: {
    text: string;
    acceptableVariations?: string[];
  };
}

export interface PronunciationExercise extends BaseExercise {
  type: ExerciseType.PRONUNCIATION;
  content: {
    word: string;
    wordKh?: string;
    audioUrl: string;
    phonetic?: string;
    syllables?: string[];
  };
  solution: {
    accuracyThreshold?: number;
  };
}

export interface ReadingComprehensionExercise extends BaseExercise {
  type: ExerciseType.READING_COMPREHENSION;
  content: {
    passage: string;
    passageKh?: string;
    questions: Array<{
      id: string;
      question: string;
      type: "multiple_choice" | "short_answer" | "true_false";
      options?: string[];
    }>;
  };
  solution: {
    answers: Record<string, number | string | boolean>;
  };
}

export interface VocabularyExercise extends BaseExercise {
  type: ExerciseType.VOCABULARY;
  content: {
    word: string;
    wordKh?: string;
    context?: string;
    imageUrl?: string;
    options?: string[]; // For definition matching
  };
  solution: {
    definition?: string;
    correctOption?: number;
    synonyms?: string[];
    antonyms?: string[];
  };
}

// Interactive Types

export interface ImageSelectionExercise extends BaseExercise {
  type: ExerciseType.IMAGE_SELECTION;
  content: {
    question: string;
    questionKh?: string;
    images: Array<{
      id: string;
      url: string;
      alt?: string;
    }>;
    multiSelect?: boolean;
  };
  solution: {
    correctImageIds: string[];
  };
}

export interface ImageAnnotationExercise extends BaseExercise {
  type: ExerciseType.IMAGE_ANNOTATION;
  content: {
    imageUrl: string;
    question: string;
    questionKh?: string;
    annotationType: "point" | "rectangle" | "circle" | "polygon";
  };
  solution: {
    annotations: Array<{
      type: string;
      coordinates: number[];
      label?: string;
    }>;
    tolerance?: number; // Pixel tolerance for correct answers
  };
}

export interface VideoResponseExercise extends BaseExercise {
  type: ExerciseType.VIDEO_RESPONSE;
  content: {
    videoUrl: string;
    questions: Array<{
      id: string;
      timestamp: number;
      question: string;
      type: "multiple_choice" | "short_answer";
      options?: string[];
    }>;
  };
  solution: {
    answers: Record<string, number | string>;
  };
}

export interface ClickMapExercise extends BaseExercise {
  type: ExerciseType.CLICK_MAP;
  content: {
    imageUrl: string;
    question: string;
    questionKh?: string;
    targets: Array<{
      id: string;
      label: string;
    }>;
  };
  solution: {
    hotspots: Array<{
      targetId: string;
      x: number;
      y: number;
      radius: number;
    }>;
  };
}

export interface SliderExercise extends BaseExercise {
  type: ExerciseType.SLIDER;
  content: {
    question: string;
    questionKh?: string;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    labels?: Record<number, string>;
  };
  solution: {
    correctValue: number;
    tolerance?: number;
  };
}

// Math & Logic Exercises

export interface CalculationExercise extends BaseExercise {
  type: ExerciseType.CALCULATION;
  content: {
    expression: string;
    variables?: Record<string, number>;
    showWorkspace?: boolean;
  };
  solution: {
    answer: number;
    steps?: string[];
    tolerance?: number;
  };
}

export interface EquationExercise extends BaseExercise {
  type: ExerciseType.EQUATION;
  content: {
    equation: string;
    variableToSolve: string;
    hints?: string[];
  };
  solution: {
    answer: number | string;
    steps?: string[];
  };
}

export interface GraphPlottingExercise extends BaseExercise {
  type: ExerciseType.GRAPH_PLOTTING;
  content: {
    question: string;
    graphType: "line" | "bar" | "pie" | "scatter" | "function";
    xAxisLabel?: string;
    yAxisLabel?: string;
    gridSize?: number;
  };
  solution: {
    points?: Array<{ x: number; y: number }>;
    function?: string;
    data?: Record<string, number>;
  };
}

export interface FractionExercise extends BaseExercise {
  type: ExerciseType.FRACTION;
  content: {
    question: string;
    visualize?: boolean;
    operation?: "add" | "subtract" | "multiply" | "divide" | "simplify";
  };
  solution: {
    numerator: number;
    denominator: number;
    wholeNumber?: number;
  };
}

export interface PatternRecognitionExercise extends BaseExercise {
  type: ExerciseType.PATTERN_RECOGNITION;
  content: {
    sequence: (string | number | { imageUrl: string })[];
    missingIndex: number;
    options?: (string | number | { imageUrl: string })[];
  };
  solution: {
    answer: string | number;
    rule?: string;
  };
}

export interface CodingExercise extends BaseExercise {
  type: ExerciseType.CODING;
  content: {
    question: string;
    language: "python" | "javascript" | "scratch" | "blockly";
    starterCode?: string;
    testCases?: Array<{
      input: any;
      expectedOutput: any;
    }>;
  };
  solution: {
    sampleSolution?: string;
    hints?: string[];
  };
}

// Game-based Exercises

export interface CrosswordExercise extends BaseExercise {
  type: ExerciseType.CROSSWORD;
  content: {
    gridSize: { width: number; height: number };
    clues: {
      across: Array<{ number: number; clue: string; startPos: { x: number; y: number } }>;
      down: Array<{ number: number; clue: string; startPos: { x: number; y: number } }>;
    };
  };
  solution: {
    words: {
      across: Record<number, string>;
      down: Record<number, string>;
    };
  };
}

export interface WordSearchExercise extends BaseExercise {
  type: ExerciseType.WORD_SEARCH;
  content: {
    gridSize: number;
    words: string[];
    theme?: string;
  };
  solution: {
    grid: string[][];
    positions: Array<{
      word: string;
      start: { x: number; y: number };
      end: { x: number; y: number };
    }>;
  };
}

export interface MemoryGameExercise extends BaseExercise {
  type: ExerciseType.MEMORY_GAME;
  content: {
    pairs: Array<{
      id: string;
      content: string | { imageUrl: string };
      match: string | { imageUrl: string };
    }>;
    gridSize?: { rows: number; cols: number };
    timeLimit?: number;
  };
  solution: {
    matchingPairs: Array<[string, string]>;
  };
}

export interface TimedChallengeExercise extends BaseExercise {
  type: ExerciseType.TIMED_CHALLENGE;
  content: {
    questions: Array<{
      id: string;
      question: string;
      type: "multiple_choice" | "short_answer" | "true_false";
      options?: string[];
    }>;
    timePerQuestion?: number;
    totalTime?: number;
  };
  solution: {
    answers: Record<string, number | string | boolean>;
  };
}

// Additional types for new features
export interface SequencingExercise extends BaseExercise {
  type: ExerciseType.SEQUENCING;
  content: {
    items: Array<{
      id: string;
      content: string;
      imageUrl?: string;
    }>;
    instruction: string;
    instructionKh?: string;
  };
  solution: {
    correctSequence: string[];
  };
}

export interface LabelingExercise extends BaseExercise {
  type: ExerciseType.LABELING;
  content: {
    imageUrl: string;
    labels: string[];
    dropZones: Array<{
      id: string;
      x: number;
      y: number;
      width?: number;
      height?: number;
    }>;
  };
  solution: {
    mapping: Record<string, string>;
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
  | ListeningExercise
  | SpeakingExercise
  | DictationExercise
  | PronunciationExercise
  | ReadingComprehensionExercise
  | VocabularyExercise
  | ImageSelectionExercise
  | ImageAnnotationExercise
  | VideoResponseExercise
  | ClickMapExercise
  | SliderExercise
  | CalculationExercise
  | EquationExercise
  | GraphPlottingExercise
  | FractionExercise
  | PatternRecognitionExercise
  | CodingExercise
  | CrosswordExercise
  | WordSearchExercise
  | MemoryGameExercise
  | TimedChallengeExercise
  | SequencingExercise
  | LabelingExercise;

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