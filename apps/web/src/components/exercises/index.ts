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

// Import all exercise components
import { MultipleChoice } from "./MultipleChoice";
import { FillInGaps } from "./FillInGaps";
import { TrueFalse } from "./TrueFalse";
import { DragDrop } from "./DragDrop";
import { Matching } from "./Matching";
import { Listening } from "./Listening";
import { ShortAnswer } from "./ShortAnswer";
import { LongAnswer } from "./LongAnswer";
import { ExerciseType } from "./types";

// Map exercise types to their components
export const exerciseComponents = {
  [ExerciseType.MULTIPLE_CHOICE]: MultipleChoice,
  [ExerciseType.FILL_IN_GAPS]: FillInGaps,
  [ExerciseType.TRUE_FALSE]: TrueFalse,
  [ExerciseType.DRAG_DROP]: DragDrop,
  [ExerciseType.MATCHING]: Matching,
  [ExerciseType.LISTENING]: Listening,
  [ExerciseType.SHORT_ANSWER]: ShortAnswer,
  [ExerciseType.LONG_ANSWER]: LongAnswer,
  // Add more as we implement them
} as const;