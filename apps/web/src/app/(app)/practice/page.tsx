"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseRenderer, Exercise } from "@/components/exercises/ExerciseRenderer";
import {
  BookOpen,
  Brain,
  Headphones,
  Pencil,
  Shuffle,
  Type,
  MousePointer,
  CheckSquare,
} from "lucide-react";

// Sample exercises for each type
const sampleExercises: Record<string, Exercise> = {
  MULTIPLE_CHOICE: {
    id: "mc1",
    type: "MULTIPLE_CHOICE",
    title: "Science Question",
    titleKh: "សំណួរវិទ្យាសាស្ត្រ",
    instructions: "Choose the correct answer.",
    difficulty: "EASY",
    points: 10,
    content: {
      question: "What is the largest planet in our solar system?",
      questionKh: "តើភពណាធំជាងគេក្នុងប្រព័ន្ធព្រះអាទិត្យរបស់យើង?",
      options: [
        { id: "1", text: "Earth", textKh: "ផែនដី" },
        { id: "2", text: "Mars", textKh: "ភពអង្គារ" },
        { id: "3", text: "Jupiter", textKh: "ភពព្រហស្បតិ៍" },
        { id: "4", text: "Saturn", textKh: "ភពសៅរ៍" },
      ],
    },
    solution: {
      correct: "3",
      explanation: "Jupiter is the largest planet in our solar system, with a diameter of about 88,846 miles.",
    },
  },
  
  FILL_IN_GAPS: {
    id: "fig1",
    type: "FILL_IN_GAPS",
    title: "Complete the Sentence",
    titleKh: "បំពេញប្រយោគ",
    instructions: "Fill in the blanks with the correct words.",
    difficulty: "MEDIUM",
    points: 15,
    content: {
      text: "The ___ rises in the east and sets in the ___.",
      textKh: "ព្រះអាទិត្យ ___ នៅទិសខាងកើត ហើយលិចនៅទិស ___។",
      gaps: 2,
    },
    solution: {
      gaps: ["sun", "west"],
      explanation: "The sun rises in the east and sets in the west due to Earth's rotation.",
    },
  },

  TRUE_FALSE: {
    id: "tf1",
    type: "TRUE_FALSE",
    title: "Fact Check",
    titleKh: "ពិនិត្យការពិត",
    instructions: "Is this statement true or false?",
    difficulty: "EASY",
    points: 5,
    content: {
      statement: "Water boils at 100 degrees Celsius at sea level.",
      statementKh: "ទឹករំពុះនៅសីតុណ្ហភាព ១០០ អង្សាសេ នៅកម្រិតទឹកសមុទ្រ។",
    },
    solution: {
      correct: true,
      explanation: "At standard atmospheric pressure (sea level), pure water boils at exactly 100°C or 212°F.",
    },
  },

  DRAG_DROP: {
    id: "dd1",
    type: "DRAG_DROP",
    title: "Animal Classification",
    titleKh: "ការចាត់ថ្នាក់សត្វ",
    instructions: "Drag each animal to its correct category.",
    difficulty: "MEDIUM",
    points: 20,
    content: {
      items: [
        { id: "1", text: "Lion", textKh: "សិង្ហ" },
        { id: "2", text: "Eagle", textKh: "ឥន្ទ្រី" },
        { id: "3", text: "Shark", textKh: "ត្រីឆ្លាម" },
        { id: "4", text: "Frog", textKh: "កង្កែប" },
      ],
      targetZones: [
        { id: "mammals", label: "Mammals", labelKh: "ថនិកសត្វ" },
        { id: "birds", label: "Birds", labelKh: "បក្សី" },
        { id: "fish", label: "Fish", labelKh: "ត្រី" },
        { id: "amphibians", label: "Amphibians", labelKh: "សត្វទឹកគោក" },
      ],
    },
    solution: {
      correctPlacements: {
        mammals: ["1"],
        birds: ["2"],
        fish: ["3"],
        amphibians: ["4"],
      },
    },
  },

  MATCHING: {
    id: "m1",
    type: "MATCHING",
    title: "Match Countries to Capitals",
    titleKh: "ផ្គូផ្គងប្រទេសនិងរាជធានី",
    instructions: "Match each country with its capital city.",
    difficulty: "MEDIUM",
    points: 15,
    content: {
      leftItems: [
        { id: "1", text: "Cambodia", textKh: "កម្ពុជា" },
        { id: "2", text: "Thailand", textKh: "ថៃ" },
        { id: "3", text: "Vietnam", textKh: "វៀតណាម" },
        { id: "4", text: "Laos", textKh: "ឡាវ" },
      ],
      rightItems: [
        { id: "a", text: "Phnom Penh", textKh: "ភ្នំពេញ" },
        { id: "b", text: "Bangkok", textKh: "បាងកក" },
        { id: "c", text: "Hanoi", textKh: "ហាណូយ" },
        { id: "d", text: "Vientiane", textKh: "វៀងចន្ទន៍" },
      ],
    },
    solution: {
      pairs: {
        "1": "a",
        "2": "b",
        "3": "c",
        "4": "d",
      },
    },
  },

  SHORT_ANSWER: {
    id: "sa1",
    type: "SHORT_ANSWER",
    title: "Explain the Water Cycle",
    titleKh: "ពន្យល់អំពីវដ្តទឹក",
    instructions: "Explain in your own words how the water cycle works.",
    difficulty: "HARD",
    points: 25,
    content: {
      question: "Describe the main stages of the water cycle.",
      questionKh: "ពិពណ៌នាអំពីដំណាក់កាលសំខាន់ៗនៃវដ្តទឹក។",
      maxLength: 300,
    },
    solution: {
      acceptableAnswers: [
        "The water cycle involves evaporation, condensation, and precipitation.",
        "Water evaporates from oceans and lakes, forms clouds through condensation, and falls back as rain or snow.",
      ],
      explanation: "The water cycle is a continuous process where water moves between the Earth's surface and atmosphere.",
    },
  },

  SORTING: {
    id: "s1",
    type: "SORTING",
    title: "Order the Planets",
    titleKh: "តម្រៀបភពតាមលំដាប់",
    instructions: "Arrange the planets from closest to farthest from the Sun.",
    difficulty: "MEDIUM",
    points: 15,
    content: {
      items: [
        { id: "1", text: "Earth", textKh: "ផែនដី" },
        { id: "2", text: "Mercury", textKh: "ភពពុធ" },
        { id: "3", text: "Venus", textKh: "ភពសុក្រ" },
        { id: "4", text: "Mars", textKh: "ភពអង្គារ" },
      ],
      instruction: "Drag to reorder from closest to farthest from the Sun",
    },
    solution: {
      correctOrder: ["2", "3", "1", "4"],
    },
  },

  LISTENING: {
    id: "l1",
    type: "LISTENING",
    title: "Listen and Answer",
    titleKh: "ស្តាប់និងឆ្លើយ",
    instructions: "Listen to the audio and answer the question.",
    difficulty: "MEDIUM",
    points: 20,
    content: {
      audioUrl: "/audio/sample.mp3",
      question: "What animal is mentioned in the audio?",
      questionKh: "តើសត្វអ្វីដែលបាននិយាយក្នុងសំឡេង?",
      options: [
        { id: "1", text: "Dog", textKh: "ឆ្កែ" },
        { id: "2", text: "Cat", textKh: "ឆ្មា" },
        { id: "3", text: "Bird", textKh: "បក្សី" },
        { id: "4", text: "Fish", textKh: "ត្រី" },
      ],
      allowReplay: true,
    },
    solution: {
      correct: "2",
      transcript: "The cat jumped over the fence and ran across the yard.",
      explanation: "The audio clearly mentions a cat jumping over a fence.",
    },
  },

  DRAWING: {
    id: "d1",
    type: "DRAWING",
    title: "Draw a Shape",
    titleKh: "គូររូបរាង",
    instructions: "Draw the requested shape on the canvas.",
    difficulty: "EASY",
    points: 10,
    content: {
      instruction: "Draw a house with a triangular roof, square walls, and a door.",
      instructionKh: "គូរផ្ទះមួយដែលមានដំបូលរាងត្រីកោណ ជញ្ជាំងការ៉េ និងទ្វារមួយ។",
      drawingPrompt: "A simple house",
      gridSize: 20,
    },
    solution: {
      explanation: "A house typically has a triangular roof, square or rectangular walls, and at least one door.",
    },
  },
};

const exerciseTypeInfo = [
  { type: "MULTIPLE_CHOICE", icon: CheckSquare, label: "Multiple Choice", color: "bg-blue-100 text-blue-700" },
  { type: "FILL_IN_GAPS", icon: Type, label: "Fill in Gaps", color: "bg-green-100 text-green-700" },
  { type: "TRUE_FALSE", icon: CheckSquare, label: "True/False", color: "bg-purple-100 text-purple-700" },
  { type: "DRAG_DROP", icon: MousePointer, label: "Drag & Drop", color: "bg-orange-100 text-orange-700" },
  { type: "MATCHING", icon: Shuffle, label: "Matching", color: "bg-pink-100 text-pink-700" },
  { type: "SHORT_ANSWER", icon: Type, label: "Short Answer", color: "bg-indigo-100 text-indigo-700" },
  { type: "SORTING", icon: Shuffle, label: "Sorting", color: "bg-yellow-100 text-yellow-700" },
  { type: "LISTENING", icon: Headphones, label: "Listening", color: "bg-red-100 text-red-700" },
  { type: "DRAWING", icon: Pencil, label: "Drawing", color: "bg-teal-100 text-teal-700" },
];

export default function PracticePage() {
  const [selectedType, setSelectedType] = useState("MULTIPLE_CHOICE");
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  const handleComplete = (exerciseId: string, score: number, isCorrect: boolean) => {
    console.log("Exercise completed:", { exerciseId, score, isCorrect });
    if (isCorrect) {
      setCompletedExercises(new Set([...completedExercises, exerciseId]));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Practice Exercises</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Try different types of interactive exercises
        </p>
      </div>

      {/* Exercise Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {exerciseTypeInfo.map(({ type, icon: Icon, label, color }) => (
          <Card
            key={type}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedType === type ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedType(type)}
          >
            <CardContent className="p-4 text-center">
              <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">{label}</p>
              {completedExercises.has(sampleExercises[type].id) && (
                <Badge className="mt-2" variant="secondary">
                  Completed
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Exercise Display */}
      <div className="max-w-4xl mx-auto">
        {sampleExercises[selectedType] && (
          <ExerciseRenderer
            key={selectedType}
            exercise={sampleExercises[selectedType]}
            onComplete={(score, isCorrect) => 
              handleComplete(sampleExercises[selectedType].id, score, isCorrect)
            }
            practiceMode={true}
          />
        )}
      </div>

      {/* Progress Summary */}
      <div className="mt-12 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>
              Complete all exercise types to master different learning styles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-primary">
                {completedExercises.size}/{Object.keys(sampleExercises).length}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Exercises completed</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${(completedExercises.size / Object.keys(sampleExercises).length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}