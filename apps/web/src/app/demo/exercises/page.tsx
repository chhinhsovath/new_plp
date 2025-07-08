"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseWrapper, MultipleChoice, FillInGaps, TrueFalse } from "@/components/exercises";
import { MultipleChoiceExercise, FillInGapsExercise, TrueFalseExercise, ExerciseType, ExerciseResult } from "@/components/exercises/types";

// Sample exercises for demonstration
const multipleChoiceExample: MultipleChoiceExercise = {
  id: "mc1",
  type: ExerciseType.MULTIPLE_CHOICE,
  title: "Basic Addition",
  titleKh: "ការបូកមូលដ្ឋាន",
  instructions: "Choose the correct answer for the math problem below.",
  instructionsKh: "ជ្រើសរើសចម្លើយត្រឹមត្រូវសម្រាប់បញ្ហាគណិតវិទ្យាខាងក្រោម។",
  points: 10,
  difficulty: "EASY",
  content: {
    question: "What is 5 + 3?",
    questionKh: "តើ ៥ + ៣ ស្មើនឹងប៉ុន្មាន?",
    options: ["6", "7", "8", "9"],
  },
  solution: {
    correctAnswer: 2, // Index 2 = "8"
    explanation: "5 + 3 = 8",
  },
};

const fillInGapsExample: FillInGapsExercise = {
  id: "fig1",
  type: ExerciseType.FILL_IN_GAPS,
  title: "Complete the Sentence",
  titleKh: "បំពេញប្រយោគ",
  instructions: "Fill in the missing words in the sentence below.",
  instructionsKh: "បំពេញពាក្យដែលបាត់ក្នុងប្រយោគខាងក្រោម។",
  points: 15,
  difficulty: "MEDIUM",
  content: {
    text: "The sun rises in the ___ and sets in the ___.",
    textKh: "ព្រះអាទិត្យរះនៅទិស ___ ហើយលិចនៅទិស ___។",
    gaps: [
      { id: "gap1", position: 22 },
      { id: "gap2", position: 41 },
    ],
    options: ["east", "west", "north", "south"],
  },
  solution: {
    answers: {
      gap1: "east",
      gap2: "west",
    },
  },
};

const trueFalseExample: TrueFalseExercise = {
  id: "tf1",
  type: ExerciseType.TRUE_FALSE,
  title: "Science Fact Check",
  titleKh: "ពិនិត្យការពិតវិទ្យាសាស្ត្រ",
  instructions: "Is this statement true or false?",
  instructionsKh: "តើសេចក្តីថ្លែងការណ៍នេះពិតឬមិនពិត?",
  points: 5,
  difficulty: "EASY",
  content: {
    statement: "Water boils at 100 degrees Celsius at sea level.",
    statementKh: "ទឹករំពុះនៅសីតុណ្ហភាព ១០០ អង្សាសេ នៅកម្រិតទឹកសមុទ្រ។",
  },
  solution: {
    isTrue: true,
    explanation: "At standard atmospheric pressure (sea level), pure water boils at 100°C.",
  },
};

export default function ExerciseDemoPage() {
  const [results, setResults] = useState<Record<string, ExerciseResult>>({});

  const handleComplete = (exerciseId: string, result: ExerciseResult) => {
    setResults(prev => ({ ...prev, [exerciseId]: result }));
    console.log(`Exercise ${exerciseId} completed:`, result);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Exercise Components Demo</h1>
        <p className="text-gray-600">
          Interactive exercise components for the Primary Learning Platform
        </p>
      </div>

      <Tabs defaultValue="multiple-choice" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="multiple-choice">Multiple Choice</TabsTrigger>
          <TabsTrigger value="fill-gaps">Fill in Gaps</TabsTrigger>
          <TabsTrigger value="true-false">True/False</TabsTrigger>
        </TabsList>

        <TabsContent value="multiple-choice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multiple Choice Exercise</CardTitle>
              <CardDescription>
                Students select one correct answer from multiple options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExerciseWrapper
                exercise={multipleChoiceExample}
                onComplete={(result) => handleComplete(multipleChoiceExample.id, result)}
              >
                <MultipleChoice exercise={multipleChoiceExample} />
              </ExerciseWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fill-gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fill in the Gaps Exercise</CardTitle>
              <CardDescription>
                Students complete sentences by filling in missing words
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExerciseWrapper
                exercise={fillInGapsExample}
                onComplete={(result) => handleComplete(fillInGapsExample.id, result)}
              >
                <FillInGaps exercise={fillInGapsExample} />
              </ExerciseWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="true-false" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>True/False Exercise</CardTitle>
              <CardDescription>
                Students determine if a statement is true or false
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExerciseWrapper
                exercise={trueFalseExample}
                onComplete={(result) => handleComplete(trueFalseExample.id, result)}
              >
                <TrueFalse exercise={trueFalseExample} />
              </ExerciseWrapper>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {Object.keys(results).length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-50 p-4 rounded">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}