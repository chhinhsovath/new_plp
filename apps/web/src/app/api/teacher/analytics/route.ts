import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@plp/database";
import { subDays, startOfWeek, startOfMonth, startOfYear } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { id: true, role: true },
    });

    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "month";

    // Determine date range based on period
    let startDate: Date;
    switch (period) {
      case "week":
        startDate = startOfWeek(new Date());
        break;
      case "month":
        startDate = startOfMonth(new Date());
        break;
      case "year":
        startDate = startOfYear(new Date());
        break;
      default:
        startDate = subDays(new Date(), 30);
    }

    // Get all teacher's classes
    const classes = await prisma.class.findMany({
      where: {
        teacherId: user.id,
        status: "ACTIVE",
      },
      include: {
        enrollments: {
          where: {
            status: "ACTIVE",
          },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
        assignments: {
          include: {
            submissions: {
              where: {
                gradedAt: {
                  gte: startDate,
                },
              },
              select: {
                id: true,
                score: true,
                studentId: true,
                submittedAt: true,
                gradedAt: true,
              },
            },
          },
        },
      },
    });

    // Calculate overview statistics
    const totalStudents = new Set(
      classes.flatMap(c => c.enrollments.map(e => e.studentId))
    ).size;

    const allSubmissions = classes.flatMap(c => 
      c.assignments.flatMap(a => a.submissions)
    );

    const averageGrade = allSubmissions.length > 0
      ? Math.round(
          allSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / 
          allSubmissions.length
        )
      : 0;

    const totalAssignments = classes.reduce((sum, c) => sum + c.assignments.length, 0);
    const totalExpectedSubmissions = classes.reduce(
      (sum, c) => sum + (c.assignments.length * c.enrollments.length), 
      0
    );
    const assignmentCompletionRate = totalExpectedSubmissions > 0
      ? Math.round((allSubmissions.length / totalExpectedSubmissions) * 100)
      : 0;

    // Mock attendance rate (in real app, would calculate from attendance records)
    const classAttendanceRate = 85;

    // Mock performance trends
    const performanceTrends = [
      { month: "Jan", average: 75 },
      { month: "Feb", average: 78 },
      { month: "Mar", average: 82 },
      { month: "Apr", average: 80 },
      { month: "May", average: 85 },
      { month: "Jun", average: 87 },
    ];

    // Calculate subject performance
    const subjectPerformance = classes.reduce((acc, cls) => {
      const subjectName = cls.subject.name;
      const submissions = cls.assignments.flatMap(a => a.submissions);
      
      if (!acc[subjectName]) {
        acc[subjectName] = {
          subject: subjectName,
          totalScore: 0,
          count: 0,
          students: cls.enrollments.length,
        };
      }
      
      submissions.forEach(s => {
        if (s.score !== null) {
          acc[subjectName].totalScore += s.score;
          acc[subjectName].count++;
        }
      });
      
      return acc;
    }, {} as Record<string, any>);

    const subjectPerformanceArray = Object.values(subjectPerformance).map(sp => ({
      subject: sp.subject,
      average: sp.count > 0 ? Math.round(sp.totalScore / sp.count) : 0,
      students: sp.students,
    }));

    // Calculate student performance
    const studentPerformance = new Map<string, { 
      name: string; 
      totalScore: number; 
      count: number; 
      missedAssignments: number;
    }>();

    classes.forEach(cls => {
      cls.enrollments.forEach(enrollment => {
        const studentId = enrollment.studentId;
        const studentName = `${enrollment.student.firstName} ${enrollment.student.lastName}`;
        
        if (!studentPerformance.has(studentId)) {
          studentPerformance.set(studentId, {
            name: studentName,
            totalScore: 0,
            count: 0,
            missedAssignments: 0,
          });
        }
        
        const student = studentPerformance.get(studentId)!;
        
        cls.assignments.forEach(assignment => {
          const submission = assignment.submissions.find(s => s.studentId === studentId);
          if (submission && submission.score !== null) {
            student.totalScore += submission.score;
            student.count++;
          } else {
            student.missedAssignments++;
          }
        });
      });
    });

    const studentPerformanceArray = Array.from(studentPerformance.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      average: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
      missedAssignments: data.missedAssignments,
    }));

    // Top performers
    const topPerformers = studentPerformanceArray
      .filter(s => s.average > 0)
      .sort((a, b) => b.average - a.average)
      .slice(0, 5)
      .map(s => ({
        ...s,
        trend: s.average >= 80 ? "up" as const : s.average >= 60 ? "stable" as const : "down" as const,
      }));

    // Struggling students
    const strugglingStudents = studentPerformanceArray
      .filter(s => s.average < 60 || s.missedAssignments > 2)
      .sort((a, b) => a.average - b.average)
      .slice(0, 5);

    // Assignment statistics
    const assignmentStats = classes.flatMap(cls => 
      cls.assignments.map(assignment => {
        const submissions = assignment.submissions;
        const expectedSubmissions = cls.enrollments.length;
        const onTimeSubmissions = submissions.filter(s => 
          s.submittedAt && new Date(s.submittedAt) <= new Date(assignment.dueDate)
        ).length;
        
        return {
          id: assignment.id,
          title: assignment.title,
          averageScore: submissions.length > 0
            ? Math.round(
                submissions.reduce((sum, s) => sum + (s.score || 0), 0) / 
                submissions.length
              )
            : 0,
          submissionRate: expectedSubmissions > 0
            ? Math.round((submissions.length / expectedSubmissions) * 100)
            : 0,
          onTimeRate: submissions.length > 0
            ? Math.round((onTimeSubmissions / submissions.length) * 100)
            : 0,
        };
      })
    ).slice(0, 10); // Top 10 assignments

    return NextResponse.json({
      overview: {
        totalStudents,
        averageGrade,
        assignmentCompletionRate,
        classAttendanceRate,
      },
      performanceTrends,
      subjectPerformance: subjectPerformanceArray,
      topPerformers,
      strugglingStudents,
      assignmentStats,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}