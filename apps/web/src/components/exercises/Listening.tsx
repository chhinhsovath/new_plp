"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BaseExercise, ExerciseType } from "./types";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

interface ListeningExercise extends BaseExercise {
  type: ExerciseType.LISTENING;
  content: {
    audioUrl: string;
    question: string;
    questionKh?: string;
    options: string[];
    transcript?: string;
  };
  solution: {
    correctAnswer: number;
    explanation?: string;
  };
}

interface ListeningProps {
  exercise: ListeningExercise;
  onSubmit?: (answer: number, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function Listening({ exercise, onSubmit, disabled }: ListeningProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      setPlayCount(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (isPlaying) {
      audioRef.current.play();
    }
  };

  const handleSubmit = () => {
    if (!selectedAnswer || !onSubmit) return;
    
    const answerIndex = parseInt(selectedAnswer);
    const isCorrect = answerIndex === exercise.solution.correctAnswer;
    onSubmit(answerIndex, isCorrect);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Audio player */}
      <div className="bg-gray-50 rounded-lg p-6">
        <audio
          ref={audioRef}
          src={exercise.content.audioUrl}
          preload="metadata"
        />
        
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handlePlayPause}
            disabled={disabled}
            className={`
              w-16 h-16 rounded-full flex items-center justify-center
              bg-blue-600 text-white hover:bg-blue-700
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-colors
            `}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <button
            onClick={handleRestart}
            disabled={disabled}
            className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            <span>Listen carefully before answering</span>
          </div>
          <span>Plays: {playCount}</span>
        </div>
      </div>

      {/* Question */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{exercise.content.question}</h3>
        {exercise.content.questionKh && (
          <p className="text-gray-600">{exercise.content.questionKh}</p>
        )}
      </div>

      {/* Answer options */}
      <RadioGroup 
        value={selectedAnswer} 
        onValueChange={setSelectedAnswer}
        disabled={disabled || playCount === 0}
      >
        <div className="space-y-3">
          {exercise.content.options.map((option, index) => (
            <label
              key={index}
              htmlFor={`option-${index}`}
              className={`
                flex items-center space-x-3 p-4 rounded-lg border cursor-pointer
                transition-colors hover:bg-gray-50
                ${selectedAnswer === index.toString() ? 'border-primary bg-primary/5' : 'border-gray-200'}
                ${disabled || playCount === 0 ? 'cursor-not-allowed opacity-60' : ''}
              `}
            >
              <RadioGroupItem 
                value={index.toString()} 
                id={`option-${index}`}
                disabled={disabled || playCount === 0}
              />
              <Label 
                htmlFor={`option-${index}`} 
                className="flex-1 cursor-pointer font-normal"
              >
                {option}
              </Label>
            </label>
          ))}
        </div>
      </RadioGroup>

      {playCount === 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          Please listen to the audio before selecting an answer.
        </p>
      )}

      {!disabled && (
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedAnswer || playCount === 0}
          className="w-full"
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
}