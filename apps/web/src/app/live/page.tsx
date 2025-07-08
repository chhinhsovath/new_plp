"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Video,
  Calendar,
  Clock,
  Users,
  MapPin,
  Play,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";

interface ClassSchedule {
  id: string;
  class: {
    id: string;
    name: string;
    subject: {
      name: string;
    };
    teacher: {
      firstName: string;
      lastName: string;
    };
  };
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
}

interface LiveSession {
  id: string;
  classId: string;
  className: string;
  subject: string;
  teacher: string;
  startTime: Date;
  endTime: Date;
  status: "live" | "upcoming" | "ended";
  participantCount?: number;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StudentLiveClassesPage() {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
    fetchLiveSessions();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch("/api/student/schedules");
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveSessions = async () => {
    // Mock live sessions - in real implementation, fetch from API
    const mockSessions: LiveSession[] = [
      {
        id: "session-1",
        classId: "class-1",
        className: "Mathematics Grade 7A",
        subject: "Mathematics",
        teacher: "Ms. Johnson",
        startTime: new Date(new Date().setHours(9, 0, 0, 0)),
        endTime: new Date(new Date().setHours(10, 0, 0, 0)),
        status: "live",
        participantCount: 25,
      },
      {
        id: "session-2",
        classId: "class-2",
        className: "English Grade 7A",
        subject: "English",
        teacher: "Mr. Smith",
        startTime: new Date(new Date().setHours(14, 0, 0, 0)),
        endTime: new Date(new Date().setHours(15, 0, 0, 0)),
        status: "upcoming",
      },
    ];
    setLiveSessions(mockSessions);
  };

  const joinLiveClass = (classId: string) => {
    window.location.href = `/live/${classId}`;
  };

  const getTodaySchedules = () => {
    const today = new Date().getDay();
    return schedules.filter(schedule => schedule.dayOfWeek === today);
  };

  const getUpcomingSchedules = () => {
    const today = new Date().getDay();
    return schedules.filter(schedule => schedule.dayOfWeek > today || schedule.dayOfWeek === 0);
  };

  const isClassLive = (schedule: ClassSchedule) => {
    const now = new Date();
    const currentTime = format(now, "HH:mm");
    return currentTime >= schedule.startTime && currentTime <= schedule.endTime;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Live Classes</h1>
        <p className="text-gray-600">
          Join your live classes and interact with teachers in real-time
        </p>
      </div>

      {/* Live Now */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          Live Now
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveSessions.filter(s => s.status === "live").length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No live classes at the moment</p>
              </CardContent>
            </Card>
          ) : (
            liveSessions
              .filter(s => s.status === "live")
              .map((session) => (
                <Card key={session.id} className="border-red-200 bg-red-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{session.className}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{session.teacher}</p>
                      </div>
                      <Badge className="bg-red-600 text-white">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
                        Live
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Started {format(session.startTime, "h:mm a")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{session.participantCount} students online</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={() => joinLiveClass(session.classId)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Join Live Class
                    </Button>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Today's Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getTodaySchedules().length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No classes scheduled for today</p>
              </CardContent>
            </Card>
          ) : (
            getTodaySchedules().map((schedule) => {
              const isLive = isClassLive(schedule);
              const isPastClass = !isLive && schedule.endTime < format(new Date(), "HH:mm");
              
              return (
                <Card key={schedule.id} className={isLive ? "border-green-200" : ""}>
                  <CardHeader>
                    <CardTitle className="text-lg">{schedule.class.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {schedule.class.teacher.firstName} {schedule.class.teacher.lastName}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{schedule.room}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span>{schedule.class.subject.name}</span>
                      </div>
                    </div>
                    {isLive ? (
                      <Button 
                        className="w-full"
                        variant="default"
                        onClick={() => joinLiveClass(schedule.class.id)}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Now
                      </Button>
                    ) : isPastClass ? (
                      <Button className="w-full" variant="outline" disabled>
                        Class Ended
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline" disabled>
                        <Clock className="w-4 h-4 mr-2" />
                        Starts at {schedule.startTime}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Day</th>
                  <th className="text-left p-2">Class</th>
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Room</th>
                  <th className="text-left p-2">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No classes scheduled
                    </td>
                  </tr>
                ) : (
                  schedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{DAYS_OF_WEEK[schedule.dayOfWeek]}</td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{schedule.class.name}</p>
                          <p className="text-sm text-gray-600">{schedule.class.subject.name}</p>
                        </div>
                      </td>
                      <td className="p-2 text-sm">
                        {schedule.startTime} - {schedule.endTime}
                      </td>
                      <td className="p-2 text-sm">{schedule.room}</td>
                      <td className="p-2 text-sm">
                        {schedule.class.teacher.firstName} {schedule.class.teacher.lastName}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Tips for Live Classes:</strong>
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li>Ensure you have a stable internet connection</li>
            <li>Use headphones for better audio quality</li>
            <li>Find a quiet place to minimize distractions</li>
            <li>Join classes a few minutes early to test your setup</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}