"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ExerciseType,
  exerciseComponents
} from "@/components/exercises";
import { 
  Brain, 
  BookOpen, 
  Calculator, 
  Gamepad2, 
  Languages,
  MousePointer,
  CheckCircle,
  XCircle,
  Trophy
} from "lucide-react";

interface ExerciseCategory {
  name: string;
  icon: any;
  types: string[];
  color: string;
}

const exerciseCategories: Record<string, ExerciseCategory> = {
  basic: {
    name: "Basic Questions",
    icon: BookOpen,
    types: [
      "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "LONG_ANSWER",
      "FILL_IN_GAPS", "DRAG_DROP", "MATCHING", "SORTING", 
      "SEQUENCING", "LABELING"
    ],
    color: "bg-blue-500"
  },
  language: {
    name: "Language Skills",
    icon: Languages,
    types: [
      "LISTENING", "SPEAKING", "DICTATION", "PRONUNCIATION",
      "READING_COMPREHENSION", "VOCABULARY", "GRAMMAR", "SPELLING",
      "WORD_FORMATION", "SENTENCE_CONSTRUCTION"
    ],
    color: "bg-purple-500"
  },
  interactive: {
    name: "Interactive Types",
    icon: MousePointer,
    types: [
      "DRAWING", "IMAGE_SELECTION", "IMAGE_ANNOTATION", "VIDEO_RESPONSE",
      "AUDIO_RECORDING", "CLICK_MAP", "HOTSPOT", "SLIDER", "RATING", "POLL"
    ],
    color: "bg-green-500"
  },
  math: {
    name: "Math & Logic",
    icon: Calculator,
    types: [
      "CALCULATION", "EQUATION", "GRAPH_PLOTTING", "NUMBER_LINE",
      "FRACTION", "GEOMETRY", "PATTERN_RECOGNITION", "LOGIC_PUZZLE",
      "CODING", "FLOWCHART"
    ],
    color: "bg-orange-500"
  },
  games: {
    name: "Game-based",
    icon: Gamepad2,
    types: [
      "CROSSWORD", "WORD_SEARCH", "MEMORY_GAME", "PUZZLE",
      "QUIZ_GAME", "TIMED_CHALLENGE", "SCAVENGER_HUNT", "ESCAPE_ROOM",
      "BOARD_GAME", "CARD_GAME"
    ],
    color: "bg-red-500"
  }
};

export default function ExerciseShowcasePage() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof exerciseCategories>("basic");
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const getImplementationStatus = (type: string) => {
    return exerciseComponents[type as keyof typeof exerciseComponents] !== null;
  };

  const totalTypes = Object.keys(ExerciseType).length;
  const implementedTypes = Object.values(exerciseComponents).filter(c => c !== null).length;
  const completionPercentage = Math.round((implementedTypes / totalTypes) * 100);

  const formatTypeName = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Exercise Types Library</h1>
        <p className="text-xl text-gray-600 mb-6">
          Comprehensive collection of {totalTypes} interactive exercise types for enhanced learning
        </p>
        
        {/* Progress Overview */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Implementation Progress</span>
              <span className="text-sm text-gray-600">
                {implementedTypes} / {totalTypes} types
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3 mb-2" />
            <p className="text-xs text-gray-500">
              {completionPercentage}% of exercise types are ready for use
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {Object.entries(exerciseCategories).map(([key, category]) => {
          const Icon = category.icon;
          const implementedInCategory = category.types.filter(getImplementationStatus).length;
          
          return (
            <Card
              key={key}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedCategory === key ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedCategory(key as keyof typeof exerciseCategories)}
            >
              <CardContent className="pt-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-lg ${category.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">{category.name}</h3>
                <Badge variant="secondary">
                  {implementedInCategory} / {category.types.length}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Exercise Types Grid */}
      <Card>
        <CardHeader>
          <CardTitle>{exerciseCategories[selectedCategory].name} Exercise Types</CardTitle>
          <CardDescription>
            Click on any exercise type to see more details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exerciseCategories[selectedCategory].types.map((type) => {
              const isImplemented = getImplementationStatus(type);
              const isExpanded = expandedType === type;
              
              return (
                <Card 
                  key={type}
                  className={`transition-all ${
                    isImplemented 
                      ? 'hover:shadow-lg cursor-pointer' 
                      : 'opacity-60'
                  }`}
                  onClick={() => isImplemented && setExpandedType(isExpanded ? null : type)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {formatTypeName(type)}
                          {isImplemented ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {getExerciseDescription(type)}
                        </p>
                      </div>
                      <Badge variant={isImplemented ? "default" : "secondary"}>
                        {isImplemented ? "Ready" : "Coming Soon"}
                      </Badge>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="space-y-2 text-sm">
                          <p><strong>Use Cases:</strong> {getUseCases(type)}</p>
                          <p><strong>Features:</strong> {getFeatures(type)}</p>
                          <Button 
                            className="w-full mt-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/demo/all-exercises?type=${type}`;
                            }}
                          >
                            Try Demo
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold">{totalTypes}</p>
            <p className="text-sm text-gray-600">Total Exercise Types</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{implementedTypes}</p>
            <p className="text-sm text-gray-600">Implemented</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Brain className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold">15</p>
            <p className="text-sm text-gray-600">AI-Powered Types</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="text-2xl font-bold">10</p>
            <p className="text-sm text-gray-600">Gamified Types</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper functions for exercise descriptions
function getExerciseDescription(type: string): string {
  const descriptions: Record<string, string> = {
    // Basic
    MULTIPLE_CHOICE: "Select the correct answer from multiple options",
    TRUE_FALSE: "Determine if a statement is true or false",
    SHORT_ANSWER: "Type a brief response to a question",
    LONG_ANSWER: "Write a detailed response or essay",
    FILL_IN_GAPS: "Complete sentences by filling in missing words",
    DRAG_DROP: "Drag items to their correct locations",
    MATCHING: "Match items from two columns",
    SORTING: "Arrange items in a specific order",
    SEQUENCING: "Put events or steps in chronological order",
    LABELING: "Add labels to parts of an image or diagram",
    
    // Language
    LISTENING: "Listen to audio and answer questions",
    SPEAKING: "Record voice responses to prompts",
    DICTATION: "Type what you hear from audio",
    PRONUNCIATION: "Practice and assess pronunciation accuracy",
    READING_COMPREHENSION: "Read passages and answer questions",
    VOCABULARY: "Learn and test word meanings",
    GRAMMAR: "Practice grammar rules and structures",
    SPELLING: "Spell words correctly from audio or prompts",
    WORD_FORMATION: "Create new words from root words",
    SENTENCE_CONSTRUCTION: "Build sentences from given words",
    
    // Interactive
    DRAWING: "Create drawings or sketches",
    IMAGE_SELECTION: "Choose correct images from a set",
    IMAGE_ANNOTATION: "Add notes or marks to images",
    VIDEO_RESPONSE: "Answer questions about video content",
    AUDIO_RECORDING: "Record audio responses",
    CLICK_MAP: "Click on specific areas of an image",
    HOTSPOT: "Identify interactive areas in content",
    SLIDER: "Select values using a slider control",
    RATING: "Rate items on a scale",
    POLL: "Participate in opinion polls",
    
    // Math & Logic
    CALCULATION: "Solve mathematical calculations",
    EQUATION: "Solve algebraic equations",
    GRAPH_PLOTTING: "Create or interpret graphs",
    NUMBER_LINE: "Place values on a number line",
    FRACTION: "Work with fractions and ratios",
    GEOMETRY: "Solve geometry problems",
    PATTERN_RECOGNITION: "Identify patterns in sequences",
    LOGIC_PUZZLE: "Solve logic-based puzzles",
    CODING: "Write and test code solutions",
    FLOWCHART: "Create or complete flowcharts",
    
    // Games
    CROSSWORD: "Complete crossword puzzles",
    WORD_SEARCH: "Find hidden words in a grid",
    MEMORY_GAME: "Match pairs in memory games",
    PUZZLE: "Solve various puzzle types",
    QUIZ_GAME: "Compete in timed quiz games",
    TIMED_CHALLENGE: "Complete tasks within time limits",
    SCAVENGER_HUNT: "Find items based on clues",
    ESCAPE_ROOM: "Solve puzzles to escape",
    BOARD_GAME: "Play educational board games",
    CARD_GAME: "Learn through card-based games"
  };
  
  return descriptions[type] || "Interactive exercise type";
}

function getUseCases(type: string): string {
  const useCases: Record<string, string> = {
    MULTIPLE_CHOICE: "Assessments, quick checks, surveys",
    VOCABULARY: "Language learning, terminology practice",
    CALCULATION: "Math practice, problem-solving",
    PATTERN_RECOGNITION: "Logic development, IQ tests",
    READING_COMPREHENSION: "Literature analysis, text understanding",
    IMAGE_SELECTION: "Visual learning, recognition tasks",
    SEQUENCING: "Process learning, historical events",
    SLIDER: "Estimation, continuous values",
  };
  
  return useCases[type] || "Various educational scenarios";
}

function getFeatures(type: string): string {
  const features: Record<string, string> = {
    MULTIPLE_CHOICE: "Auto-grading, instant feedback, analytics",
    VOCABULARY: "Context clues, multimedia support, spaced repetition",
    CALCULATION: "Step-by-step solutions, work shown, formula support",
    PATTERN_RECOGNITION: "Visual and numeric patterns, difficulty scaling",
    READING_COMPREHENSION: "Passage highlighting, mixed question types",
    IMAGE_SELECTION: "Multi-select, visual feedback, image zoom",
    SEQUENCING: "Drag-and-drop, visual ordering, hint system",
    SLIDER: "Precise control, unit display, tolerance settings",
  };
  
  return features[type] || "Interactive interface, immediate feedback";
}