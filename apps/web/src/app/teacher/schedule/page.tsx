"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar as CalendarIcon,
  Clock,
  Video,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface ClassSchedule {
  id: string;
  class: {
    id: string;
    name: string;
    subject: {
      name: string;
    };
    _count: {
      enrollments: number;
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
  startTime: Date;
  endTime: Date;
  status: "scheduled" | "live" | "ended";
  participantCount?: number;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherSchedulePage() {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
    fetchLiveSessions();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch("/api/teacher/schedules");
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
        className: "Mathematics 7A",
        subject: "Mathematics",
        startTime: new Date(new Date().setHours(9, 0, 0, 0)),
        endTime: new Date(new Date().setHours(10, 0, 0, 0)),
        status: isToday(new Date()) ? "live" : "scheduled",
        participantCount: 15,
      },
      {
        id: "session-2",
        classId: "class-2",
        className: "Science 8B",
        subject: "Science",
        startTime: new Date(new Date().setHours(11, 0, 0, 0)),
        endTime: new Date(new Date().setHours(12, 0, 0, 0)),
        status: "scheduled",
      },
    ];
    setLiveSessions(mockSessions);
  };

  const startLiveSession = (classId: string) => {
    window.location.href = `/teacher/live/${classId}`;
  };

  const getSessionsForDay = (date: Date) => {
    return liveSessions.filter(session => isSameDay(session.startTime, date));
  };

  const getSchedulesForDay = (dayOfWeek: number) => {
    return schedules.filter(schedule => schedule.dayOfWeek === dayOfWeek);
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const daySchedules = getSchedulesForDay(index);
          const daySessions = getSessionsForDay(day);
          const isCurrentDay = isToday(day);

          return (
            <div key={index} className="min-h-[200px]">
              <div className={cn(
                "text-center p-2 rounded-t-lg",
                isCurrentDay ? "bg-blue-600 text-white" : "bg-gray-100"
              )}>
                <p className="text-sm font-medium">{DAYS_OF_WEEK[index]}</p>
                <p className={cn(
                  "text-2xl font-bold",
                  isCurrentDay ? "text-white" : "text-gray-700"
                )}>
                  {format(day, "d")}
                </p>
              </div>
              <Card className="rounded-t-none min-h-[150px]">
                <CardContent className="p-2">
                  <div className="space-y-2">
                    {daySchedules.map((schedule) => {
                      const session = daySessions.find(s => s.classId === schedule.class.id);
                      
                      return (
                        <div
                          key={schedule.id}
                          className={cn(
                            "p-2 rounded-lg text-xs",
                            session?.status === "live" 
                              ? "bg-red-100 border border-red-300"
                              : "bg-gray-50 hover:bg-gray-100"
                          )}
                        >
                          <p className="font-medium truncate">{schedule.class.name}</p>
                          <p className="text-gray-600">
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                          <p className="text-gray-500 truncate">{schedule.room}</p>
                          {session?.status === "live" && (
                            <Badge className="mt-1 text-xs bg-red-600">
                              <Video className="w-3 h-3 mr-1" />
                              Live
                            </Badge>
                          )}
                          {isCurrentDay && (
                            <Button
                              size="sm"
                              className="w-full mt-2 text-xs"
                              variant={session?.status === "live" ? "destructive" : "default"}
                              onClick={() => startLiveSession(schedule.class.id)}
                            >
                              {session?.status === "live" ? "Join" : "Start"}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const daySchedules = getSchedulesForDay(selectedDate.getDay());
    const daySessions = getSessionsForDay(selectedDate);
    const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {hours.map((hour) => {
              const hourSchedules = daySchedules.filter(schedule => {
                const startHour = parseInt(schedule.startTime.split(":")[0]);
                return startHour === hour;
              });

              return (
                <div key={hour} className="flex gap-4 border-b pb-2">
                  <div className="w-20 text-sm text-gray-600">
                    {format(new Date().setHours(hour, 0), "h:mm a")}
                  </div>
                  <div className="flex-1 space-y-2">
                    {hourSchedules.map((schedule) => {
                      const session = daySessions.find(s => s.classId === schedule.class.id);
                      
                      return (
                        <Card key={schedule.id} className={cn(
                          session?.status === "live" && "border-red-500"
                        )}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{schedule.class.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {schedule.class.subject.name}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {schedule.startTime} - {schedule.endTime}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {schedule.room}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {schedule.class._count.enrollments} students
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                {session?.status === "live" && (
                                  <Badge className="bg-red-600">
                                    <Video className="w-3 h-3 mr-1" />
                                    Live Now
                                  </Badge>
                                )}
                                <Button
                                  size="sm"
                                  variant={session?.status === "live" ? "destructive" : "default"}
                                  onClick={() => startLiveSession(schedule.class.id)}
                                >
                                  <Video className="w-4 h-4 mr-2" />
                                  {session?.status === "live" ? "Join Session" : "Start Live"}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Class Schedule</h1>
            <p className="text-gray-600">
              Manage your class schedule and live sessions
            </p>
          </div>
          <Button asChild>
            <Link href="/teacher/classes">
              <Plus className="w-4 h-4 mr-2" />
              Manage Classes
            </Link>
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="text-lg font-medium">
              {format(selectedDate, "MMMM yyyy")}
            </span>
          </div>
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="day">Day View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Schedule View */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading schedule...</p>
        </div>
      ) : (
        <>
          {viewMode === "week" ? renderWeekView() : renderDayView()}
        </>
      )}

      {/* Live Sessions Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Today's Live Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getSessionsForDay(new Date()).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No live sessions scheduled for today</p>
            ) : (
              getSessionsForDay(new Date()).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{session.className}</p>
                    <p className="text-sm text-gray-600">
                      {format(session.startTime, "h:mm a")} - {format(session.endTime, "h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.status === "live" && (
                      <>
                        <Badge className="bg-red-600">
                          <Video className="w-3 h-3 mr-1" />
                          Live • {session.participantCount} participants
                        </Badge>
                        <Button size="sm" variant="destructive" onClick={() => startLiveSession(session.classId)}>
                          Join Now
                        </Button>
                      </>
                    )}
                    {session.status === "scheduled" && (
                      <Button size="sm" onClick={() => startLiveSession(session.classId)}>
                        Start Session
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}