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
  Hand,
  PhoneOff,
  Maximize,
  Grid,
  Users,
  MessageSquare,
  FileText,
  Clock,
  ChevronLeft,
  Volume2,
  VolumeX,
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
}

interface Participant {
  id: string;
  name: string;
  role: "teacher" | "student";
  isVideoOn: boolean;
  isAudioOn: boolean;
  isHandRaised: boolean;
  isSpeaking: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

interface SharedMaterial {
  id: string;
  name: string;
  type: "document" | "link" | "screen";
  url?: string;
  sharedAt: Date;
}

export default function StudentLiveClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sharedMaterials, setSharedMaterials] = useState<SharedMaterial[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("class");
  const [viewMode, setViewMode] = useState<"speaker" | "grid">("speaker");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const teacherVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchClassDetails();
    joinLiveSession();
  }, [classId]);

  useEffect(() => {
    // Update session duration every second
    const interval = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`/api/student/classes/${classId}`);
      if (response.ok) {
        const data = await response.json();
        setClassDetails(data.class);
      }
    } catch (error) {
      console.error("Error fetching class details:", error);
    }
  };

  const joinLiveSession = async () => {
    // Mock implementation - in real app, this would:
    // 1. Join video room using WebRTC or service like Twilio/Agora
    // 2. Set up peer connections
    // 3. Handle signaling
    
    // Mock participants
    const mockParticipants: Participant[] = [
      {
        id: "teacher-1",
        name: "Ms. Johnson",
        role: "teacher",
        isVideoOn: true,
        isAudioOn: true,
        isHandRaised: false,
        isSpeaking: true,
      },
      {
        id: "student-self",
        name: "You",
        role: "student",
        isVideoOn: false,
        isAudioOn: false,
        isHandRaised: false,
        isSpeaking: false,
      },
      {
        id: "student-2",
        name: "Alex Kim",
        role: "student",
        isVideoOn: true,
        isAudioOn: false,
        isHandRaised: false,
        isSpeaking: false,
      },
      {
        id: "student-3",
        name: "Emma Davis",
        role: "student",
        isVideoOn: false,
        isAudioOn: true,
        isHandRaised: true,
        isSpeaking: false,
      },
    ];
    setParticipants(mockParticipants);

    // Mock chat messages
    const mockMessages: ChatMessage[] = [
      {
        id: "1",
        userId: "teacher-1",
        userName: "Ms. Johnson",
        message: "Welcome to today's class! We'll be covering Chapter 5.",
        timestamp: new Date(Date.now() - 5 * 60000),
      },
      {
        id: "2",
        userId: "student-3",
        userName: "Emma Davis",
        message: "Can we review the homework first?",
        timestamp: new Date(Date.now() - 3 * 60000),
      },
    ];
    setChatMessages(mockMessages);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // In real implementation, toggle local video stream
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    // In real implementation, toggle local audio stream
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    // In real implementation, notify teacher
  };

  const leaveSession = () => {
    if (confirm("Are you sure you want to leave the class?")) {
      // In real implementation, disconnect from video room
      router.push("/dashboard");
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: "student-self",
      userName: "You",
      message: newMessage,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage("");
    
    // In real implementation, send message through WebSocket/WebRTC data channel
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!classDetails) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-500">Loading class...</p>
      </div>
    );
  }

  const teacher = participants.find(p => p.role === "teacher");
  const students = participants.filter(p => p.role === "student");

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-white">
            <h1 className="font-semibold">{classDetails.name}</h1>
            <p className="text-sm text-gray-400">
              {classDetails.subject.name} • {classDetails.teacher.firstName} {classDetails.teacher.lastName}
            </p>
          </div>
          <Badge className="bg-red-600 text-white">
            <Clock className="w-3 h-3 mr-1" />
            {formatDuration(sessionDuration)}
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
            onClick={leaveSession}
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave
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
                {/* Teacher's video/screen */}
                <div className="relative w-full h-full">
                  <video
                    ref={teacherVideoRef}
                    className="w-full h-full object-contain"
                    autoPlay
                  />
                  {/* Small self video */}
                  {isVideoOn && (
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
                      <video
                        ref={localVideoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4">
                {/* All participants in grid */}
                {participants.map((participant) => (
                  <div key={participant.id} className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    {participant.isVideoOn ? (
                      <video
                        ref={participant.id === "student-self" ? localVideoRef : undefined}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted={participant.id === "student-self"}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <div className="text-white text-2xl font-semibold">
                          {participant.name.charAt(0)}
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded flex items-center gap-1">
                      {participant.name}
                      {participant.role === "teacher" && (
                        <Badge className="text-xs px-1">Host</Badge>
                      )}
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
                    {participant.isSpeaking && (
                      <div className="absolute inset-0 border-2 border-green-400 rounded-lg pointer-events-none" />
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
                variant={isHandRaised ? "default" : "secondary"}
                size="sm"
                onClick={toggleHandRaise}
              >
                <Hand className="w-4 h-4" />
              </Button>
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3 rounded-none">
              <TabsTrigger value="class">
                <Users className="w-4 h-4 mr-1" />
                Class
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

            <TabsContent value="class" className="flex-1 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {/* Teacher */}
                  {teacher && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Teacher</p>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                            {teacher.name.charAt(0)}
                          </div>
                          <p className="text-white text-sm">{teacher.name}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!teacher.isVideoOn && (
                            <VideoOff className="w-4 h-4 text-gray-400" />
                          )}
                          {!teacher.isAudioOn && (
                            <MicOff className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Students */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Students ({students.length})
                    </p>
                    <div className="space-y-1">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-700"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
                              {student.name.charAt(0)}
                            </div>
                            <p className="text-white text-sm">
                              {student.name}
                              {student.id === "student-self" && " (You)"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {student.isHandRaised && (
                              <Hand className="w-4 h-4 text-yellow-400" />
                            )}
                            {!student.isVideoOn && (
                              <VideoOff className="w-4 h-4 text-gray-400" />
                            )}
                            {!student.isAudioOn && (
                              <MicOff className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 flex flex-col p-4">
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-2">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <p className="text-gray-400">
                        <span className={cn(
                          "font-medium",
                          msg.userId === "teacher-1" ? "text-blue-400" : "text-white"
                        )}>
                          {msg.userName}
                        </span>
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
                {sharedMaterials.length === 0 ? (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      No materials shared yet. The teacher will share materials during the class.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    {sharedMaterials.map((material) => (
                      <Card key={material.id} className="bg-gray-700 border-gray-600">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <div className="flex-1">
                              <p className="text-white text-sm">{material.name}</p>
                              <p className="text-gray-400 text-xs">
                                Shared {new Date(material.sharedAt).toLocaleTimeString()}
                              </p>
                            </div>
                            {material.url && (
                              <Button size="sm" variant="secondary" asChild>
                                <a href={material.url} target="_blank" rel="noopener noreferrer">
                                  Open
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}