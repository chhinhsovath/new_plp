"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ExerciseType,
  type SequencingExercise,
  type ImageSelectionExercise,
  type CalculationExercise,
  type VocabularyExercise,
  type SliderExercise,
  type ReadingComprehensionExercise,
  type PatternRecognitionExercise,
  exerciseComponents
} from "@/components/exercises";
import { Badge } from "@/components/ui/badge";

// Sample exercises for demonstration
const sampleExercises = {
  sequencing: {
    id: "seq-1",
    type: ExerciseType.SEQUENCING,
    title: "Order the Story",
    titleKh: "រៀបលំដាប់រឿង",
    instructions: "Put these story events in the correct order",
    instructionsKh: "ដាក់ព្រឹត្តិការណ៍ទាំងនេះតាមលំដាប់ត្រឹមត្រូវ",
    points: 10,
    difficulty: "MEDIUM",
    content: {
      items: [
        { id: "1", content: "The boy woke up early in the morning" },
        { id: "2", content: "He brushed his teeth and had breakfast" },
        { id: "3", content: "He walked to school with his friends" },
        { id: "4", content: "He attended all his classes" },
        { id: "5", content: "He came home and did his homework" }
      ],
      instruction: "Arrange these events in chronological order",
      instructionKh: "រៀបចំព្រឹត្តិការណ៍ទាំងនេះតាមលំដាប់ពេលវេលា"
    },
    solution: {
      correctSequence: ["1", "2", "3", "4", "5"]
    }
  } as SequencingExercise,

  imageSelection: {
    id: "img-1",
    type: ExerciseType.IMAGE_SELECTION,
    title: "Select Healthy Foods",
    titleKh: "ជ្រើសរើសអាហារដែលមានសុខភាពល្អ",
    instructions: "Choose all the healthy food items",
    instructionsKh: "ជ្រើសរើសអាហារដែលល្អសម្រាប់សុខភាព",
    points: 15,
    difficulty: "EASY",
    content: {
      question: "Which of these foods are healthy choices?",
      questionKh: "តើអាហារណាខ្លះដែលជាជម្រើសល្អសម្រាប់សុខភាព?",
      images: [
        { id: "1", url: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=200", alt: "Apple" },
        { id: "2", url: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=200", alt: "Donut" },
        { id: "3", url: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=200", alt: "Salad" },
        { id: "4", url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200", alt: "Candy" },
        { id: "5", url: "https://images.unsplash.com/photo-1557844352-761f2565b576?w=200", alt: "Orange" },
        { id: "6", url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200", alt: "Pizza" }
      ],
      multiSelect: true
    },
    solution: {
      correctImageIds: ["1", "3", "5"]
    }
  } as ImageSelectionExercise,

  calculation: {
    id: "calc-1",
    type: ExerciseType.CALCULATION,
    title: "Solve the Math Problem",
    titleKh: "ដោះស្រាយបញ្ហាគណិតវិទ្យា",
    instructions: "Calculate the result",
    instructionsKh: "គណនាលទ្ធផល",
    points: 20,
    difficulty: "MEDIUM",
    content: {
      expression: "(12 + 8) × 3 - 15",
      showWorkspace: true
    },
    solution: {
      answer: 45,
      steps: [
        "First, solve the parentheses: 12 + 8 = 20",
        "Then multiply: 20 × 3 = 60",
        "Finally subtract: 60 - 15 = 45"
      ],
      tolerance: 0
    }
  } as CalculationExercise,

  vocabulary: {
    id: "vocab-1",
    type: ExerciseType.VOCABULARY,
    title: "Vocabulary Quiz",
    titleKh: "សំណួរវាក្យសព្ទ",
    instructions: "Select the correct definition",
    instructionsKh: "ជ្រើសរើសនិយមន័យត្រឹមត្រូវ",
    points: 10,
    difficulty: "EASY",
    content: {
      word: "Photosynthesis",
      wordKh: "រស្មីសំយោគ",
      context: "Plants use photosynthesis to make their own food",
      imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=200",
      options: [
        "The process by which plants convert light into energy",
        "The way animals breathe underwater",
        "A type of camera that takes pictures",
        "The study of ancient photographs"
      ]
    },
    solution: {
      correctOption: 0,
      definition: "The process by which plants use sunlight to synthesize foods from carbon dioxide and water",
      synonyms: ["light synthesis", "carbon fixation"],
      antonyms: ["respiration", "decomposition"]
    }
  } as VocabularyExercise,

  slider: {
    id: "slider-1",
    type: ExerciseType.SLIDER,
    title: "Temperature Estimation",
    titleKh: "ការប៉ាន់ស្មានសីតុណ្ហភាព",
    instructions: "Estimate the temperature",
    instructionsKh: "ប៉ាន់ស្មានសីតុណ្ហភាព",
    points: 15,
    difficulty: "MEDIUM",
    content: {
      question: "What is the normal human body temperature in Celsius?",
      questionKh: "តើសីតុណ្ហភាពរាងកាយមនុស្សធម្មតាគិតជាអង្សាសេ?",
      min: 30,
      max: 45,
      step: 0.1,
      unit: "°C",
      labels: {
        30: "Cold",
        37: "Normal",
        40: "Fever",
        45: "Danger"
      }
    },
    solution: {
      correctValue: 37,
      tolerance: 0.5
    }
  } as SliderExercise,

  readingComprehension: {
    id: "read-1",
    type: ExerciseType.READING_COMPREHENSION,
    title: "The Water Cycle",
    titleKh: "វដ្តទឹក",
    instructions: "Read the passage and answer questions",
    instructionsKh: "អានអត្ថបទ និងឆ្លើយសំណួរ",
    points: 30,
    difficulty: "HARD",
    content: {
      passage: `The water cycle is the continuous movement of water on, above, and below the surface of the Earth. Water changes between liquid, vapor, and ice at various stages of the water cycle.

The sun drives the water cycle by evaporating water from oceans, lakes, and rivers. This water vapor rises into the atmosphere where cooler temperatures cause it to condense into clouds. Air currents move clouds around the globe, and cloud particles collide, grow, and fall out of the sky as precipitation.

Some precipitation falls as snow and can accumulate as ice caps and glaciers, which can store frozen water for thousands of years. Most precipitation falls back into the oceans or onto land, where it flows over the ground as surface runoff.`,
      passageKh: "",
      questions: [
        {
          id: "q1",
          question: "What drives the water cycle?",
          type: "multiple_choice",
          options: ["The moon", "The sun", "The wind", "The earth's rotation"]
        },
        {
          id: "q2",
          question: "Water vapor condenses into clouds when it encounters what?",
          type: "short_answer"
        },
        {
          id: "q3",
          question: "Frozen water can be stored in glaciers for thousands of years.",
          type: "true_false"
        }
      ]
    },
    solution: {
      answers: {
        q1: 1, // The sun
        q2: "cooler temperatures",
        q3: true
      }
    }
  } as ReadingComprehensionExercise,

  patternRecognition: {
    id: "pattern-1",
    type: ExerciseType.PATTERN_RECOGNITION,
    title: "Number Pattern",
    titleKh: "លំនាំលេខ",
    instructions: "Find the missing number in the pattern",
    instructionsKh: "រកលេខដែលបាត់ក្នុងលំនាំ",
    points: 15,
    difficulty: "MEDIUM",
    content: {
      sequence: [2, 4, 8, 16, "?", 64],
      missingIndex: 4,
      options: [24, 28, 32, 48]
    },
    solution: {
      answer: 32,
      rule: "Each number is multiplied by 2 (powers of 2)"
    }
  } as PatternRecognitionExercise
};

export default function AllExercisesDemo() {
  const [activeExercise, setActiveExercise] = useState<keyof typeof sampleExercises>("sequencing");
  const [showFeedback, setShowFeedback] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, boolean>>({});

  const handleSubmit = (exerciseKey: string, answer: any) => {
    setUserAnswers(prev => ({ ...prev, [exerciseKey]: answer }));
    setShowFeedback(true);
    
    // Check if answer is correct (simplified logic)
    const isCorrect = true; // In real implementation, check against solution
    setCorrectAnswers(prev => ({ ...prev, [exerciseKey]: isCorrect }));
  };

  const resetExercise = () => {
    setShowFeedback(false);
    setUserAnswers({});
    setCorrectAnswers({});
  };

  const exercise = sampleExercises[activeExercise];
  const ExerciseComponent = exerciseComponents[exercise.type];

  // Count implemented vs total exercise types
  const implementedCount = Object.values(exerciseComponents).filter(c => c !== null).length;
  const totalCount = Object.keys(ExerciseType).length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Exercise Types Showcase</h1>
        <p className="text-gray-600 mb-4">
          Explore all {totalCount} exercise types available in the platform
        </p>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {implementedCount} / {totalCount} Exercise Types Implemented
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Exercise Categories */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exercise Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="basic" orientation="vertical">
                <TabsList className="flex flex-col h-auto w-full">
                  <TabsTrigger value="basic" className="w-full justify-start">
                    Basic Questions ({implementedCount})
                  </TabsTrigger>
                  <TabsTrigger value="language" className="w-full justify-start">
                    Language Skills (7)
                  </TabsTrigger>
                  <TabsTrigger value="interactive" className="w-full justify-start">
                    Interactive (5)
                  </TabsTrigger>
                  <TabsTrigger value="math" className="w-full justify-start">
                    Math & Logic (2)
                  </TabsTrigger>
                  <TabsTrigger value="games" className="w-full justify-start">
                    Game-based (0)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="mt-4 space-y-2">
                  <button
                    onClick={() => { setActiveExercise("sequencing"); resetExercise(); }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                      activeExercise === "sequencing" ? "bg-blue-50 text-blue-700" : ""
                    }`}
                  >
                    Sequencing
                  </button>
                </TabsContent>

                <TabsContent value="language" className="mt-4 space-y-2">
                  <button
                    onClick={() => { setActiveExercise("vocabulary"); resetExercise(); }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                      activeExercise === "vocabulary" ? "bg-blue-50 text-blue-700" : ""
                    }`}
                  >
                    Vocabulary
                  </button>
                  <button
                    onClick={() => { setActiveExercise("readingComprehension"); resetExercise(); }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                      activeExercise === "readingComprehension" ? "bg-blue-50 text-blue-700" : ""
                    }`}
                  >
                    Reading Comprehension
                  </button>
                </TabsContent>

                <TabsContent value="interactive" className="mt-4 space-y-2">
                  <button
                    onClick={() => { setActiveExercise("imageSelection"); resetExercise(); }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                      activeExercise === "imageSelection" ? "bg-blue-50 text-blue-700" : ""
                    }`}
                  >
                    Image Selection
                  </button>
                  <button
                    onClick={() => { setActiveExercise("slider"); resetExercise(); }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                      activeExercise === "slider" ? "bg-blue-50 text-blue-700" : ""
                    }`}
                  >
                    Slider
                  </button>
                </TabsContent>

                <TabsContent value="math" className="mt-4 space-y-2">
                  <button
                    onClick={() => { setActiveExercise("calculation"); resetExercise(); }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                      activeExercise === "calculation" ? "bg-blue-50 text-blue-700" : ""
                    }`}
                  >
                    Calculation
                  </button>
                  <button
                    onClick={() => { setActiveExercise("patternRecognition"); resetExercise(); }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                      activeExercise === "patternRecognition" ? "bg-blue-50 text-blue-700" : ""
                    }`}
                  >
                    Pattern Recognition
                  </button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Exercise Display */}
        <div className="lg:col-span-3">
          {ExerciseComponent ? (
            <ExerciseComponent
              exercise={exercise as any}
              onSubmit={(answer: any) => handleSubmit(activeExercise, answer)}
              userAnswer={userAnswers[activeExercise]}
              isCorrect={correctAnswers[activeExercise]}
              showFeedback={showFeedback}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">
                  This exercise type is not implemented yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}