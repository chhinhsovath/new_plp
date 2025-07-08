"use client";

import { useState } from "react";
import { ReadingComprehensionExercise } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, CheckCircle, XCircle } from "lucide-react";

interface ReadingComprehensionProps {
  exercise: ReadingComprehensionExercise;
  onSubmit: (answers: Record<string, number | string | boolean>) => void;
  userAnswers?: Record<string, number | string | boolean>;
  isCorrect?: boolean;
  showFeedback?: boolean;
}

export function ReadingComprehension({ 
  exercise, 
  onSubmit, 
  userAnswers, 
  isCorrect, 
  showFeedback 
}: ReadingComprehensionProps) {
  const [answers, setAnswers] = useState<Record<string, number | string | boolean>>(
    userAnswers || {}
  );

  const handleAnswerChange = (questionId: string, value: number | string | boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const isQuestionCorrect = (questionId: string) => {
    if (!showFeedback) return null;
    return answers[questionId] === exercise.solution.answers[questionId];
  };

  const allQuestionsAnswered = exercise.content.questions.every(q => 
    answers[q.id] !== undefined && answers[q.id] !== ""
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">{exercise.title}</h3>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h4 className="font-semibold mb-3">Read the passage carefully:</h4>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed">{exercise.content.passage}</p>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-semibold">Answer the following questions:</h4>
          
          {exercise.content.questions.map((question, index) => (
            <Card key={question.id} className="p-4">
              <div className="flex items-start gap-2 mb-3">
                <span className="font-semibold text-gray-700">{index + 1}.</span>
                <p className="flex-1">{question.question}</p>
                {showFeedback && (
                  isQuestionCorrect(question.id) ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )
                )}
              </div>

              {question.type === "multiple_choice" && question.options && (
                <div className="ml-6 space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = answers[question.id] === optionIndex;
                    const isCorrectOption = exercise.solution.answers[question.id] === optionIndex;
                    
                    return (
                      <button
                        key={optionIndex}
                        onClick={() => !showFeedback && handleAnswerChange(question.id, optionIndex)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          isSelected && !showFeedback
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        } ${
                          showFeedback && isSelected && isCorrectOption
                            ? "border-green-500 bg-green-50"
                            : ""
                        } ${
                          showFeedback && isSelected && !isCorrectOption
                            ? "border-red-500 bg-red-50"
                            : ""
                        } ${
                          showFeedback && !isSelected && isCorrectOption
                            ? "border-green-500 bg-green-50"
                            : ""
                        }`}
                        disabled={showFeedback}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-current" : "border-gray-300"
                          }`}>
                            {isSelected && (
                              <div className={`w-2.5 h-2.5 rounded-full ${
                                !showFeedback
                                  ? "bg-blue-500"
                                  : isCorrectOption
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`} />
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {question.type === "short_answer" && (
                <div className="ml-6">
                  <Input
                    value={(answers[question.id] as string) || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Type your answer here..."
                    disabled={showFeedback}
                    className={showFeedback && !isQuestionCorrect(question.id) ? "border-red-500" : ""}
                  />
                  {showFeedback && !isQuestionCorrect(question.id) && (
                    <p className="text-sm text-red-600 mt-1">
                      Correct answer: {exercise.solution.answers[question.id]}
                    </p>
                  )}
                </div>
              )}

              {question.type === "true_false" && (
                <div className="ml-6 flex gap-4">
                  {[true, false].map((value) => {
                    const isSelected = answers[question.id] === value;
                    const isCorrectOption = exercise.solution.answers[question.id] === value;
                    
                    return (
                      <button
                        key={value.toString()}
                        onClick={() => !showFeedback && handleAnswerChange(question.id, value)}
                        className={`px-6 py-2 rounded-lg border-2 font-medium transition-all ${
                          isSelected && !showFeedback
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        } ${
                          showFeedback && isSelected && isCorrectOption
                            ? "border-green-500 bg-green-50 text-green-700"
                            : ""
                        } ${
                          showFeedback && isSelected && !isCorrectOption
                            ? "border-red-500 bg-red-50 text-red-700"
                            : ""
                        } ${
                          showFeedback && !isSelected && isCorrectOption
                            ? "border-green-500 bg-green-50 text-green-700"
                            : ""
                        }`}
                        disabled={showFeedback}
                      >
                        {value ? "True" : "False"}
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>

        {showFeedback && (
          <div className={`mt-6 p-4 rounded-lg ${
            isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            {isCorrect 
              ? "Excellent! You answered all questions correctly!" 
              : "Some answers need improvement. Review the correct answers above."
            }
          </div>
        )}

        <Button
          onClick={handleSubmit}
          className="mt-6 w-full"
          disabled={showFeedback || !allQuestionsAnswered}
        >
          Submit All Answers
        </Button>
      </Card>
    </div>
  );
}