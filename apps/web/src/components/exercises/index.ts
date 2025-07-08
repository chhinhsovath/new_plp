export * from "./types";
export * from "./ExerciseWrapper";
export * from "./MultipleChoice";
export * from "./FillInGaps";
export * from "./TrueFalse";
export * from "./DragDrop";
export * from "./Matching";
export * from "./Listening";
export * from "./ShortAnswer";
export * from "./LongAnswer";
export * from "./Sequencing";
export * from "./ImageSelection";
export * from "./Calculation";
export * from "./Vocabulary";
export * from "./Slider";
export * from "./ReadingComprehension";
export * from "./PatternRecognition";

// Import all exercise components
import { MultipleChoice } from "./MultipleChoice";
import { FillInGaps } from "./FillInGaps";
import { TrueFalse } from "./TrueFalse";
import { DragDrop } from "./DragDrop";
import { Matching } from "./Matching";
import { Listening } from "./Listening";
import { ShortAnswer } from "./ShortAnswer";
import { LongAnswer } from "./LongAnswer";
import { Sequencing } from "./Sequencing";
import { ImageSelection } from "./ImageSelection";
import { Calculation } from "./Calculation";
import { Vocabulary } from "./Vocabulary";
import { Slider } from "./Slider";
import { ReadingComprehension } from "./ReadingComprehension";
import { PatternRecognition } from "./PatternRecognition";
import { ExerciseType } from "./types";

// Map exercise types to their components
export const exerciseComponents = {
  // Basic Question Types
  [ExerciseType.MULTIPLE_CHOICE]: MultipleChoice,
  [ExerciseType.TRUE_FALSE]: TrueFalse,
  [ExerciseType.SHORT_ANSWER]: ShortAnswer,
  [ExerciseType.LONG_ANSWER]: LongAnswer,
  [ExerciseType.FILL_IN_GAPS]: FillInGaps,
  [ExerciseType.DRAG_DROP]: DragDrop,
  [ExerciseType.MATCHING]: Matching,
  [ExerciseType.SORTING]: null, // To be implemented
  [ExerciseType.SEQUENCING]: Sequencing,
  [ExerciseType.LABELING]: null, // To be implemented
  
  // Language Skills
  [ExerciseType.LISTENING]: Listening,
  [ExerciseType.SPEAKING]: null, // To be implemented
  [ExerciseType.DICTATION]: null, // To be implemented
  [ExerciseType.PRONUNCIATION]: null, // To be implemented
  [ExerciseType.READING_COMPREHENSION]: ReadingComprehension,
  [ExerciseType.VOCABULARY]: Vocabulary,
  [ExerciseType.GRAMMAR]: null, // To be implemented
  [ExerciseType.SPELLING]: null, // To be implemented
  [ExerciseType.WORD_FORMATION]: null, // To be implemented
  [ExerciseType.SENTENCE_CONSTRUCTION]: null, // To be implemented
  
  // Interactive Types
  [ExerciseType.DRAWING]: null, // To be implemented
  [ExerciseType.IMAGE_SELECTION]: ImageSelection,
  [ExerciseType.IMAGE_ANNOTATION]: null, // To be implemented
  [ExerciseType.VIDEO_RESPONSE]: null, // To be implemented
  [ExerciseType.AUDIO_RECORDING]: null, // To be implemented
  [ExerciseType.CLICK_MAP]: null, // To be implemented
  [ExerciseType.HOTSPOT]: null, // To be implemented
  [ExerciseType.SLIDER]: Slider,
  [ExerciseType.RATING]: null, // To be implemented
  [ExerciseType.POLL]: null, // To be implemented
  
  // Math & Logic
  [ExerciseType.CALCULATION]: Calculation,
  [ExerciseType.EQUATION]: null, // To be implemented
  [ExerciseType.GRAPH_PLOTTING]: null, // To be implemented
  [ExerciseType.NUMBER_LINE]: null, // To be implemented
  [ExerciseType.FRACTION]: null, // To be implemented
  [ExerciseType.GEOMETRY]: null, // To be implemented
  [ExerciseType.PATTERN_RECOGNITION]: PatternRecognition,
  [ExerciseType.LOGIC_PUZZLE]: null, // To be implemented
  [ExerciseType.CODING]: null, // To be implemented
  [ExerciseType.FLOWCHART]: null, // To be implemented
  
  // Game-based
  [ExerciseType.CROSSWORD]: null, // To be implemented
  [ExerciseType.WORD_SEARCH]: null, // To be implemented
  [ExerciseType.MEMORY_GAME]: null, // To be implemented
  [ExerciseType.PUZZLE]: null, // To be implemented
  [ExerciseType.QUIZ_GAME]: null, // To be implemented
  [ExerciseType.TIMED_CHALLENGE]: null, // To be implemented
  [ExerciseType.SCAVENGER_HUNT]: null, // To be implemented
  [ExerciseType.ESCAPE_ROOM]: null, // To be implemented
  [ExerciseType.BOARD_GAME]: null, // To be implemented
  [ExerciseType.CARD_GAME]: null, // To be implemented
  
  // Legacy types
  [ExerciseType.FIND_WORD]: null, // To be implemented
  [ExerciseType.FIND_LETTER]: null, // To be implemented
  [ExerciseType.CHOOSE_WORD]: null, // To be implemented
  [ExerciseType.INPUT]: null, // To be implemented
  [ExerciseType.SELECT_SENTENCE]: null, // To be implemented
  [ExerciseType.WRITE_ANSWER]: null, // To be implemented
} as const;