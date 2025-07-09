"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Headphones,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface ListeningExerciseProps {
  content: {
    audioUrl: string;
    transcriptUrl?: string;
    question: string;
    questionKh?: string;
    options?: Array<{
      id: string;
      text: string;
      textKh?: string;
    }>;
    allowReplay?: boolean;
    maxPlays?: number;
  };
  onAnswerChange: (answer: any) => void;
  userAnswer: string | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  solution: {
    correct: string;
    transcript?: string;
    explanation?: string;
  } | null;
}

export function ListeningExercise({
  content,
  onAnswerChange,
  userAnswer,
  isSubmitted,
  isCorrect,
  solution,
}: ListeningExerciseProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playCount, setPlayCount] = useState(0);
  const maxPlays = content.maxPlays || 3;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

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
      if (playCount < maxPlays || content.allowReplay !== false) {
        audioRef.current.play();
        setIsPlaying(true);
        if (currentTime === 0) {
          setPlayCount(playCount + 1);
        }
      }
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

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const canPlay = playCount < maxPlays || content.allowReplay !== false;

  return (
    <div className="space-y-6">
      {/* Audio Player */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-center mb-4">
          <Headphones className="h-12 w-12 text-primary" />
        </div>

        <audio ref={audioRef} src={content.audioUrl} />

        {/* Play Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            size="icon"
            variant="outline"
            onClick={handleRestart}
            disabled={!canPlay}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            onClick={handlePlayPause}
            disabled={!canPlay && !isPlaying}
            className="px-6"
          >
            {isPlaying ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Play
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            disabled={!canPlay}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-32"
          />
        </div>

        {/* Play Count */}
        {content.allowReplay === false && (
          <p className="text-sm text-center text-muted-foreground">
            Plays remaining: {Math.max(0, maxPlays - playCount)}
          </p>
        )}
      </div>

      {/* Question */}
      <div className="space-y-2">
        <p className="text-lg font-medium">{content.question}</p>
        {content.questionKh && (
          <p className="text-base text-muted-foreground">{content.questionKh}</p>
        )}
      </div>

      {/* Answer Options */}
      {content.options && (
        <RadioGroup
          value={userAnswer || ""}
          onValueChange={onAnswerChange}
          disabled={isSubmitted}
          className="space-y-3"
        >
          {content.options.map((option) => {
            const isSelected = userAnswer === option.id;
            const isCorrectOption = solution?.correct === option.id;
            const showCorrect = isSubmitted && isCorrectOption;
            const showIncorrect = isSubmitted && isSelected && !isCorrectOption;

            return (
              <div
                key={option.id}
                className={cn(
                  "relative flex items-center space-x-3 rounded-lg border p-4 transition-all",
                  isSubmitted && {
                    "border-green-500 bg-green-50": showCorrect,
                    "border-red-500 bg-red-50": showIncorrect,
                    "opacity-60": !isSelected && !isCorrectOption,
                  },
                  !isSubmitted && "hover:bg-muted/50 cursor-pointer"
                )}
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label
                  htmlFor={option.id}
                  className={cn(
                    "flex-1 cursor-pointer text-base",
                    isSubmitted && "cursor-default"
                  )}
                >
                  <span className="block">{option.text}</span>
                  {option.textKh && (
                    <span className="block text-sm text-muted-foreground mt-1">
                      {option.textKh}
                    </span>
                  )}
                </Label>
                
                {showCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-green-600 absolute right-4" />
                )}
                {showIncorrect && (
                  <XCircle className="h-5 w-5 text-red-600 absolute right-4" />
                )}
              </div>
            );
          })}
        </RadioGroup>
      )}

      {/* Transcript (shown after submission) */}
      {isSubmitted && solution?.transcript && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-semibold mb-2">Transcript:</p>
          <p className="text-sm text-blue-700 italic">"{solution.transcript}"</p>
        </div>
      )}

      {/* Explanation */}
      {isSubmitted && solution?.explanation && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Explanation:</span> {solution.explanation}
          </p>
        </div>
      )}
    </div>
  );
}