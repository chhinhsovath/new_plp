import { prisma } from "@plp/database";
import { NotificationType } from "@prisma/client";

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

export class NotificationService {
  static async create(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data || {},
        },
      });

      // Check user preferences and send appropriate notifications
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId: data.userId },
      });

      if (!preferences || preferences.inAppAll) {
        // Send real-time notification via WebSocket
        await this.sendRealtimeNotification(data.userId, notification);
      }

      // Handle email notifications based on type and preferences
      if (preferences) {
        if (
          (data.type === NotificationType.ASSIGNMENT_CREATED && preferences.emailAssignments) ||
          (data.type === NotificationType.ASSIGNMENT_GRADED && preferences.emailGrades) ||
          (data.type === NotificationType.CLASS_ANNOUNCEMENT && preferences.emailAnnouncements)
        ) {
          await this.sendEmailNotification(data.userId, notification);
        }
      }

      // Handle push notifications
      if (preferences) {
        if (
          (data.type === NotificationType.ASSIGNMENT_CREATED && preferences.pushAssignments) ||
          (data.type === NotificationType.ASSIGNMENT_GRADED && preferences.pushGrades) ||
          (data.type === NotificationType.LIVE_CLASS_STARTING && preferences.pushLiveClasses)
        ) {
          await this.sendPushNotification(data.userId, notification);
        }
      }

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  static async createBulk(userIds: string[], data: Omit<CreateNotificationData, "userId">) {
    const notifications = await Promise.all(
      userIds.map((userId) => this.create({ ...data, userId }))
    );
    return notifications;
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.update({
      where: {
        id: notificationId,
        userId, // Ensure user owns the notification
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  static async getUserNotifications(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    }
  ) {
    const { limit = 20, offset = 0, unreadOnly = false } = options || {};

    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });
  }

  // Send real-time notification via WebSocket
  private static async sendRealtimeNotification(userId: string, notification: any) {
    try {
      // Send to API server which will emit via Socket.io
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/realtime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.INTERNAL_API_KEY}`,
        },
        body: JSON.stringify({
          userId,
          notification,
        }),
      });
    } catch (error) {
      console.error("Error sending realtime notification:", error);
    }
  }

  // Placeholder for email implementation
  private static async sendEmailNotification(userId: string, notification: any) {
    // This will be implemented with email service (SendGrid, etc.)
    console.log("Sending email notification to user:", userId);
  }

  // Placeholder for push notification implementation
  private static async sendPushNotification(userId: string, notification: any) {
    // This will be implemented with push notification service (FCM, etc.)
    console.log("Sending push notification to user:", userId);
  }
}

// Notification triggers for various events
export const NotificationTriggers = {
  // Assignment related
  async assignmentCreated(classId: string, assignmentId: string, assignmentTitle: string) {
    const enrollments = await prisma.classEnrollment.findMany({
      where: { classId, status: "ACTIVE" },
      select: { studentId: true },
    });

    const studentIds = enrollments.map((e) => e.studentId);

    await NotificationService.createBulk(studentIds, {
      type: NotificationType.ASSIGNMENT_CREATED,
      title: "New Assignment",
      message: `New assignment "${assignmentTitle}" has been posted`,
      data: { classId, assignmentId },
    });
  },

  async assignmentDueSoon(assignmentId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: {
          include: {
            enrollments: {
              where: { status: "ACTIVE" },
              select: { studentId: true },
            },
          },
        },
        submissions: {
          select: { studentId: true },
        },
      },
    });

    if (!assignment) return;

    // Find students who haven't submitted
    const submittedStudentIds = assignment.submissions.map((s) => s.studentId);
    const unsubmittedStudents = assignment.class.enrollments.filter(
      (e) => !submittedStudentIds.includes(e.studentId)
    );

    await NotificationService.createBulk(
      unsubmittedStudents.map((e) => e.studentId),
      {
        type: NotificationType.ASSIGNMENT_DUE_SOON,
        title: "Assignment Due Soon",
        message: `"${assignment.title}" is due in 24 hours`,
        data: { assignmentId, classId: assignment.classId },
      }
    );
  },

  async assignmentGraded(submissionId: string) {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
      },
    });

    if (!submission) return;

    await NotificationService.create({
      userId: submission.studentId,
      type: NotificationType.ASSIGNMENT_GRADED,
      title: "Assignment Graded",
      message: `Your submission for "${submission.assignment.title}" has been graded`,
      data: {
        assignmentId: submission.assignmentId,
        submissionId,
        score: submission.score,
      },
    });
  },

  // Class related
  async classAnnouncement(classId: string, announcementTitle: string) {
    const enrollments = await prisma.classEnrollment.findMany({
      where: { classId, status: "ACTIVE" },
      select: { studentId: true },
    });

    const studentIds = enrollments.map((e) => e.studentId);

    await NotificationService.createBulk(studentIds, {
      type: NotificationType.CLASS_ANNOUNCEMENT,
      title: "New Announcement",
      message: announcementTitle,
      data: { classId },
    });
  },

  async liveClassStarting(classId: string, liveClassId: string, title: string) {
    const enrollments = await prisma.classEnrollment.findMany({
      where: { classId, status: "ACTIVE" },
      select: { studentId: true },
    });

    const studentIds = enrollments.map((e) => e.studentId);

    await NotificationService.createBulk(studentIds, {
      type: NotificationType.LIVE_CLASS_STARTING,
      title: "Live Class Starting",
      message: `"${title}" is starting in 5 minutes`,
      data: { classId, liveClassId },
    });
  },

  // Achievement related
  async achievementEarned(userId: string, achievementName: string) {
    await NotificationService.create({
      userId,
      type: NotificationType.ACHIEVEMENT_EARNED,
      title: "Achievement Unlocked!",
      message: `You've earned the "${achievementName}" achievement`,
      data: { achievementName },
    });
  },
};