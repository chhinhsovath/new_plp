"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Users,
  MessageSquare,
  Hand,
  PhoneOff,
  Settings,
  Maximize,
  Grid,
  AlertCircle,
  Clock,
  BookOpen,
  FileText,
  Share2,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassDetails {
  id: string;
  name: string;
  subject: {
    name: string;
  };
  teacher: {
    firstName: string;
    lastName: string;
  };
  _count: {
    enrollments: number;
  };
}

interface Participant {
  id: string;
  name: string;
  role: "teacher" | "student";
  isVideoOn: boolean;
  isAudioOn: boolean;
  isHandRaised: boolean;
  isSpeaking: boolean;
  joinedAt: Date;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

export default function TeacherLiveClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("participants");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"speaker" | "grid">("speaker");
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchClassDetails();
    // In a real implementation, initialize WebRTC here
    initializeLiveSession();
  }, [classId]);

  useEffect(() => {
    // Update session duration every second
    const interval = setInterval(() => {
      if (isSessionActive) {
        // Force re-render to update duration
        setSessionStartTime(new Date(sessionStartTime));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isSessionActive, sessionStartTime]);

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`/api/teacher/classes/${classId}`);
      if (response.ok) {
        const data = await response.json();
        setClassDetails(data.class);
      }
    } catch (error) {
      console.error("Error fetching class details:", error);
    }
  };

  const initializeLiveSession = async () => {
    // Mock implementation - in real app, this would:
    // 1. Create/join a video room using WebRTC or a service like Twilio/Agora
    // 2. Set up peer connections
    // 3. Handle signaling
    
    setIsSessionActive(true);
    
    // Mock adding teacher as first participant
    const teacher: Participant = {
      id: "teacher-1",
      name: "You",
      role: "teacher",
      isVideoOn: true,
      isAudioOn: true,
      isHandRaised: false,
      isSpeaking: false,
      joinedAt: new Date(),
    };
    setParticipants([teacher]);

    // Mock some students joining
    setTimeout(() => {
      const mockStudents: Participant[] = [
        {
          id: "student-1",
          name: "Sarah Chen",
          role: "student",
          isVideoOn: true,
          isAudioOn: false,
          isHandRaised: false,
          isSpeaking: false,
          joinedAt: new Date(),
        },
        {
          id: "student-2",
          name: "John Smith",
          role: "student",
          isVideoOn: false,
          isAudioOn: true,
          isHandRaised: true,
          isSpeaking: false,
          joinedAt: new Date(),
        },
      ];
      setParticipants(prev => [...prev, ...mockStudents]);
    }, 2000);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // In real implementation, toggle local video stream
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    // In real implementation, toggle local audio stream
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        // In real implementation, use navigator.mediaDevices.getDisplayMedia()
        setIsScreenSharing(true);
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    } else {
      setIsScreenSharing(false);
      // In real implementation, stop screen share stream
    }
  };

  const endSession = () => {
    if (confirm("Are you sure you want to end the live session?")) {
      // In real implementation, disconnect from video room
      router.push(`/teacher/classes/${classId}`);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: "teacher-1",
      userName: "You",
      message: newMessage,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage("");
    
    // In real implementation, send message through WebSocket/WebRTC data channel
  };

  const muteParticipant = (participantId: string) => {
    // In real implementation, send mute request to participant
    setParticipants(prev =>
      prev.map(p =>
        p.id === participantId ? { ...p, isAudioOn: false } : p
      )
    );
  };

  const getSessionDuration = () => {
    const now = new Date();
    const diff = now.getTime() - sessionStartTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!classDetails) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-500">Loading class details...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/teacher/classes/${classId}`)}
            className="text-gray-300 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="text-white">
            <h1 className="font-semibold">{classDetails.name}</h1>
            <p className="text-sm text-gray-400">{classDetails.subject.name}</p>
          </div>
          <Badge className="bg-red-600 text-white">
            <Clock className="w-3 h-3 mr-1" />
            {getSessionDuration()}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === "speaker" ? "grid" : "speaker")}
            className="text-gray-300 hover:text-white"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-gray-300 hover:text-white"
          >
            <Maximize className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={endSession}
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            End Session
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Main Video */}
          <div className="flex-1 relative bg-black">
            {viewMode === "speaker" ? (
              <div className="w-full h-full flex items-center justify-center">
                {isScreenSharing ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={screenShareRef}
                      className="w-full h-full object-contain"
                      autoPlay
                    />
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
                      <video
                        ref={localVideoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                      />
                    </div>
                  </div>
                ) : (
                  <video
                    ref={localVideoRef}
                    className="w-full h-full object-contain"
                    autoPlay
                    muted
                  />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4">
                {/* Teacher video */}
                <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                  <video
                    ref={localVideoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                  />
                  <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                    You
                  </div>
                </div>
                
                {/* Student videos */}
                {participants.filter(p => p.role === "student").map((participant) => (
                  <div key={participant.id} className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    {participant.isVideoOn ? (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <Users className="w-12 h-12 text-gray-500" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <div className="text-white text-2xl font-semibold">
                          {participant.name.charAt(0)}
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                      {participant.name}
                    </div>
                    {participant.isHandRaised && (
                      <div className="absolute top-2 right-2">
                        <Hand className="w-5 h-5 text-yellow-400" />
                      </div>
                    )}
                    {!participant.isAudioOn && (
                      <div className="absolute top-2 left-2">
                        <MicOff className="w-4 h-4 text-red-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-gray-800 px-4 py-3">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isVideoOn ? "secondary" : "destructive"}
                size="sm"
                onClick={toggleVideo}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
              <Button
                variant={isAudioOn ? "secondary" : "destructive"}
                size="sm"
                onClick={toggleAudio}
              >
                {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button
                variant={isScreenSharing ? "destructive" : "secondary"}
                size="sm"
                onClick={toggleScreenShare}
              >
                {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              </Button>
              <Button
                variant="secondary"
                size="sm"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3 rounded-none">
              <TabsTrigger value="participants">
                <Users className="w-4 h-4 mr-1" />
                {participants.length}
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="w-4 h-4 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="materials">
                <FileText className="w-4 h-4 mr-1" />
                Materials
              </TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="flex-1 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
                          {participant.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm">{participant.name}</p>
                          <p className="text-gray-400 text-xs">{participant.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {participant.isHandRaised && (
                          <Hand className="w-4 h-4 text-yellow-400" />
                        )}
                        {!participant.isVideoOn && (
                          <VideoOff className="w-4 h-4 text-gray-400" />
                        )}
                        {!participant.isAudioOn && (
                          <MicOff className="w-4 h-4 text-gray-400" />
                        )}
                        {participant.role === "student" && participant.isAudioOn && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => muteParticipant(participant.id)}
                            className="text-gray-400 hover:text-white"
                          >
                            <MicOff className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 flex flex-col p-4">
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-2">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <p className="text-gray-400">
                        <span className="font-medium text-white">{msg.userName}</span>
                        <span className="ml-2 text-xs">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </p>
                      <p className="text-gray-200">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 border-gray-600 text-white"
                />
                <Button type="submit" size="sm">Send</Button>
              </form>
            </TabsContent>

            <TabsContent value="materials" className="flex-1 p-4">
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Share Lesson Materials
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Screen
                </Button>
                <div className="pt-4">
                  <p className="text-sm text-gray-400 mb-2">Shared Materials:</p>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No materials shared yet
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}