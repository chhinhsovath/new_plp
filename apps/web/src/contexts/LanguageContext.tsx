"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@clerk/nextjs";

type Language = "en" | "km";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  isKhmer: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<string, Record<Language, string>> = {
  // Navigation
  "nav.dashboard": { en: "Dashboard", km: "ផ្ទាំងគ្រប់គ្រង" },
  "nav.subjects": { en: "Subjects", km: "មុខវិជ្ជា" },
  "nav.progress": { en: "Progress", km: "វឌ្ឍនភាព" },
  "nav.videos": { en: "Videos", km: "វីដេអូ" },
  "nav.library": { en: "Library", km: "បណ្ណាល័យ" },
  "nav.forum": { en: "Forum", km: "វេទិកា" },
  "nav.assessments": { en: "Tests", km: "ការធ្វើតេស្ត" },
  "nav.teacherDashboard": { en: "Teacher", km: "គ្រូ" },
  "nav.parentDashboard": { en: "Parent", km: "មាតាបិតា" },
  "nav.practice": { en: "Practice", km: "លំហាត់" },
  "nav.achievements": { en: "Achievements", km: "សមិទ្ធិផល" },
  "nav.profile": { en: "Profile", km: "ប្រវត្តិរូប" },
  "nav.settings": { en: "Settings", km: "ការកំណត់" },
  "nav.logout": { en: "Logout", km: "ចាកចេញ" },

  // Common
  "common.welcome": { en: "Welcome", km: "សូមស្វាគមន៍" },
  "common.loading": { en: "Loading...", km: "កំពុងផ្ទុក..." },
  "common.error": { en: "Error", km: "កំហុស" },
  "common.success": { en: "Success", km: "ជោគជ័យ" },
  "common.save": { en: "Save", km: "រក្សាទុក" },
  "common.cancel": { en: "Cancel", km: "បោះបង់" },
  "common.continue": { en: "Continue", km: "បន្ត" },
  "common.submit": { en: "Submit", km: "ដាក់ស្នើ" },
  "common.next": { en: "Next", km: "បន្ទាប់" },
  "common.previous": { en: "Previous", km: "មុន" },
  "common.back": { en: "Back", km: "ត្រឡប់ក្រោយ" },
  "common.close": { en: "Close", km: "បិទ" },
  "common.search": { en: "Search", km: "ស្វែងរក" },
  "common.filter": { en: "Filter", km: "តម្រង" },
  "common.all": { en: "All", km: "ទាំងអស់" },
  "common.none": { en: "None", km: "គ្មាន" },
  "common.yes": { en: "Yes", km: "បាទ/ចាស" },
  "common.no": { en: "No", km: "ទេ" },
  "common.monday": { en: "Mon", km: "ច័ន្ទ" },
  "common.tuesday": { en: "Tue", km: "អង្គារ" },
  "common.wednesday": { en: "Wed", km: "ពុធ" },
  "common.thursday": { en: "Thu", km: "ព្រហស្បតិ៍" },
  "common.friday": { en: "Fri", km: "សុក្រ" },
  "common.saturday": { en: "Sat", km: "សៅរ៍" },
  "common.sunday": { en: "Sun", km: "អាទិត្យ" },

  // Dashboard
  "dashboard.title": { en: "Welcome back", km: "សូមស្វាគមន៍ការត្រឡប់មកវិញ" },
  "dashboard.todayGoal": { en: "Today's Goal", km: "គោលដៅថ្ងៃនេះ" },
  "dashboard.streak": { en: "day streak", km: "ថ្ងៃជាប់គ្នា" },
  "dashboard.points": { en: "Points", km: "ពិន្ទុ" },
  "dashboard.level": { en: "Level", km: "កម្រិត" },
  "dashboard.totalLessons": { en: "Total Lessons", km: "មេរៀនសរុប" },
  "dashboard.exercisesDone": { en: "Exercises Done", km: "លំហាត់ដែលបានធ្វើ" },
  "dashboard.averageScore": { en: "Average Score", km: "ពិន្ទុមធ្យម" },
  "dashboard.timeStudied": { en: "Time Studied", km: "ពេលវេលាសិក្សា" },
  "dashboard.recentActivity": { en: "Recent Activity", km: "សកម្មភាពថ្មីៗ" },
  "dashboard.continueLesson": { en: "Continue Lesson", km: "បន្តមេរៀន" },
  "dashboard.viewAll": { en: "View All", km: "មើលទាំងអស់" },

  // Subjects
  "subjects.title": { en: "Subjects", km: "មុខវិជ្ជា" },
  "subjects.math": { en: "Mathematics", km: "គណិតវិទ្យា" },
  "subjects.khmer": { en: "Khmer", km: "ភាសាខ្មែរ" },
  "subjects.english": { en: "English", km: "ភាសាអង់គ្លេស" },
  "subjects.science": { en: "Science", km: "វិទ្យាសាស្ត្រ" },
  "subjects.socialStudies": { en: "Social Studies", km: "សិក្សាសង្គម" },
  "subjects.calm": { en: "CALM", km: "ចរិយា សិល្បៈ ជីវិត និងតន្ត្រី" },
  "subjects.grade": { en: "Grade", km: "ថ្នាក់ទី" },
  "subjects.lesson": { en: "Lesson", km: "មេរៀន" },
  "subjects.lessons": { en: "Lessons", km: "មេរៀន" },
  "subjects.completed": { en: "Completed", km: "បានបញ្ចប់" },
  "subjects.inProgress": { en: "In Progress", km: "កំពុងដំណើរការ" },
  "subjects.notStarted": { en: "Not Started", km: "មិនទាន់ចាប់ផ្តើម" },

  // Exercises
  "exercise.instructions": { en: "Instructions", km: "សេចក្តីណែនាំ" },
  "exercise.submit": { en: "Submit Answer", km: "ដាក់ចម្លើយ" },
  "exercise.correct": { en: "Correct!", km: "ត្រឹមត្រូវ!" },
  "exercise.incorrect": { en: "Try Again", km: "សូមព្យាយាមម្តងទៀត" },
  "exercise.showHint": { en: "Show Hint", km: "បង្ហាញគន្លឹះ" },
  "exercise.points": { en: "points", km: "ពិន្ទុ" },
  "exercise.difficulty.easy": { en: "Easy", km: "ងាយ" },
  "exercise.difficulty.medium": { en: "Medium", km: "មធ្យម" },
  "exercise.difficulty.hard": { en: "Hard", km: "ពិបាក" },
  "exercise.multipleChoice": { en: "Multiple Choice", km: "ពហុជម្រើស" },
  "exercise.fillInBlanks": { en: "Fill in the Blanks", km: "បំពេញចន្លោះ" },
  "exercise.trueFalse": { en: "True or False", km: "ពិត ឬ មិនពិត" },
  "exercise.matching": { en: "Matching", km: "ផ្គូផ្គង" },

  // Progress
  "progress.title": { en: "Your Progress", km: "វឌ្ឍនភាពរបស់អ្នក" },
  "progress.overall": { en: "Overall Progress", km: "វឌ្ឍនភាពរួម" },
  "progress.weekly": { en: "Weekly Activity", km: "សកម្មភាពប្រចាំសប្តាហ៍" },
  "progress.monthly": { en: "Monthly Progress", km: "វឌ្ឍនភាពប្រចាំខែ" },
  "progress.achievements": { en: "Achievements", km: "សមិទ្ធិផល" },
  "progress.unlocked": { en: "Unlocked", km: "បានដោះសោ" },
  "progress.locked": { en: "Locked", km: "ចាក់សោ" },

  // Time
  "time.today": { en: "Today", km: "ថ្ងៃនេះ" },
  "time.yesterday": { en: "Yesterday", km: "ម្សិលមិញ" },
  "time.thisWeek": { en: "This Week", km: "សប្តាហ៍នេះ" },
  "time.lastWeek": { en: "Last Week", km: "សប្តាហ៍មុន" },
  "time.thisMonth": { en: "This Month", km: "ខែនេះ" },
  "time.lastMonth": { en: "Last Month", km: "ខែមុន" },
  "time.minutes": { en: "minutes", km: "នាទី" },
  "time.hours": { en: "hours", km: "ម៉ោង" },
  "time.days": { en: "days", km: "ថ្ងៃ" },
  "time.weeks": { en: "weeks", km: "សប្តាហ៍" },
  "time.months": { en: "months", km: "ខែ" },

  // Messages
  "message.welcome": { en: "Welcome to Primary Learning Platform", km: "សូមស្វាគមន៍មកកាន់វេទិកាសិក្សាបឋមសិក្សា" },
  "message.loginSuccess": { en: "Login successful", km: "ចូលដោយជោគជ័យ" },
  "message.logoutSuccess": { en: "Logout successful", km: "ចាកចេញដោយជោគជ័យ" },
  "message.saveSuccess": { en: "Saved successfully", km: "រក្សាទុកដោយជោគជ័យ" },
  "message.errorOccurred": { en: "An error occurred", km: "កំហុសបានកើតឡើង" },
  "message.tryAgainLater": { en: "Please try again later", km: "សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ" },
  "message.noDataFound": { en: "No data found", km: "រកមិនឃើញទិន្នន័យ" },
  "message.comingSoon": { en: "Coming Soon", km: "មកដល់ឆាប់ៗ" },

  // Actions
  "action.start": { en: "Start", km: "ចាប់ផ្តើម" },
  "action.stop": { en: "Stop", km: "ឈប់" },
  "action.pause": { en: "Pause", km: "ផ្អាក" },
  "action.resume": { en: "Resume", km: "បន្ត" },
  "action.retry": { en: "Retry", km: "ព្យាយាមម្តងទៀត" },
  "action.download": { en: "Download", km: "ទាញយក" },
  "action.upload": { en: "Upload", km: "ផ្ទុកឡើង" },
  "action.share": { en: "Share", km: "ចែករំលែក" },
  "action.edit": { en: "Edit", km: "កែសម្រួល" },
  "action.delete": { en: "Delete", km: "លុប" },
  "action.viewMore": { en: "View More", km: "មើលបន្ថែម" },
  "action.learnMore": { en: "Learn More", km: "ស្វែងយល់បន្ថែម" },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Only run when user data is loaded
    if (!isLoaded) return;

    // Load saved language preference
    const savedLang = localStorage.getItem("preferred-language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "km")) {
      setLanguageState(savedLang);
    } else if (user?.publicMetadata?.language) {
      setLanguageState(user.publicMetadata.language as Language);
    }
  }, [user, isLoaded]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferred-language", lang);
    
    // Optionally update user metadata
    if (user) {
      // This would require an API call to update user metadata
      // api.put("/users/me", { language: lang });
    }
  }, [user]);

  const t = useCallback((key: string, fallback?: string): string => {
    const translation = translations[key];
    if (translation && translation[language]) {
      return translation[language];
    }
    return fallback || key;
  }, [language]);

  const value: LanguageContextType = useMemo(() => ({
    language,
    setLanguage,
    t,
    isKhmer: language === "km",
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}