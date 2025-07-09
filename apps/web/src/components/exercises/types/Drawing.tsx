"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Pencil,
  Eraser,
  RotateCcw,
  Download,
  Palette,
  Minus,
} from "lucide-react";

interface DrawingExerciseProps {
  content: {
    instruction: string;
    instructionKh?: string;
    backgroundImage?: string;
    drawingPrompt?: string;
    gridSize?: number;
  };
  onAnswerChange: (answer: any) => void;
  userAnswer: string | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  solution: {
    sampleDrawing?: string;
    explanation?: string;
  } | null;
}

export function DrawingExercise({
  content,
  onAnswerChange,
  userAnswer,
  isSubmitted,
  isCorrect,
  solution,
}: DrawingExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(2);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [history, setHistory] = useState<ImageData[]>([]);

  const colors = [
    "#000000", "#FF0000", "#00FF00", "#0000FF",
    "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500",
    "#800080", "#FFC0CB", "#A52A2A", "#808080",
  ];

  useEffect(() => {
    if (userAnswer && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = userAnswer;
    }
  }, []);

  useEffect(() => {
    if (content.backgroundImage && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = new Image();
      img.onload = () => {
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
          saveToHistory();
        }
      };
      img.src = content.backgroundImage;
    }
  }, [content.backgroundImage]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSubmitted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isSubmitted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";

    if (tool === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    } else {
      ctx.globalCompositeOperation = "destination-out";
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
      saveDrawing();
    }
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([...history.slice(-9), imageData]);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();
    onAnswerChange(dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw background if exists
    if (content.backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveToHistory();
        saveDrawing();
      };
      img.src = content.backgroundImage;
    } else {
      saveToHistory();
      saveDrawing();
    }
  };

  const undo = () => {
    if (history.length <= 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop();
    const previousState = newHistory[newHistory.length - 1];

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
      saveDrawing();
    }
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="space-y-2">
        <p className="font-medium">{content.instruction}</p>
        {content.instructionKh && (
          <p className="text-sm text-muted-foreground">{content.instructionKh}</p>
        )}
        {content.drawingPrompt && (
          <p className="text-sm bg-muted/50 p-3 rounded-lg">
            Draw: {content.drawingPrompt}
          </p>
        )}
      </div>

      {/* Drawing Tools */}
      {!isSubmitted && (
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
          {/* Tool Selection */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={tool === "pen" ? "default" : "outline"}
              onClick={() => setTool("pen")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={tool === "eraser" ? "default" : "outline"}
              onClick={() => setTool("eraser")}
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </div>

          {/* Color Palette */}
          {tool === "pen" && (
            <div className="flex gap-1">
              {colors.map((c) => (
                <button
                  key={c}
                  className={cn(
                    "w-8 h-8 rounded border-2",
                    color === c ? "border-gray-600" : "border-gray-300"
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          )}

          {/* Brush Size */}
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[brushSize]}
              onValueChange={(value) => setBrushSize(value[0])}
              max={20}
              min={1}
              step={1}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground w-8">{brushSize}px</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={undo} disabled={history.length <= 1}>
              Undo
            </Button>
            <Button size="sm" variant="outline" onClick={clearCanvas}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className={cn(
            "border-2 border-gray-300 rounded-lg bg-white",
            !isSubmitted && "cursor-crosshair",
            content.gridSize && "bg-grid"
          )}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            backgroundSize: content.gridSize ? `${content.gridSize}px ${content.gridSize}px` : undefined,
          }}
        />
      </div>

      {/* Download Button */}
      {isSubmitted && userAnswer && (
        <div className="flex justify-center">
          <Button onClick={downloadDrawing} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Drawing
          </Button>
        </div>
      )}

      {/* Sample Solution */}
      {isSubmitted && solution?.sampleDrawing && (
        <div className="space-y-2">
          <h4 className="font-medium">Sample Solution:</h4>
          <div className="flex justify-center">
            <img
              src={solution.sampleDrawing}
              alt="Sample solution"
              className="border-2 border-gray-300 rounded-lg max-w-md"
            />
          </div>
        </div>
      )}

      {/* Explanation */}
      {isSubmitted && solution?.explanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Tips:</span> {solution.explanation}
          </p>
        </div>
      )}
    </div>
  );
}