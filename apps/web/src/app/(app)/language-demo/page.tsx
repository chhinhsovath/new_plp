"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualText, BilingualHeading } from "@/components/ui/bilingual-text";
import { FormattedNumber } from "@/components/ui/formatted-number";
import { FormattedDate } from "@/components/ui/formatted-date";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  Clock,
  DollarSign,
  GraduationCap,
  Hash,
  Percent,
  Timer,
  TrendingUp 
} from "lucide-react";

export default function LanguageDemoPage() {
  const { language, t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState("numbers");

  const demoData = {
    score: 85.5,
    grade: 5,
    rank: 3,
    duration: 125, // minutes
    currency: 50000, // KHR
    date: new Date(),
    pastDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <BilingualHeading
          en="Language & Localization Demo"
          km="ការបង្ហាញភាសា និងការធ្វើមូលដ្ឋានីយកម្ម"
          level={1}
          className="mb-4"
        />
        <BilingualText
          en="This page demonstrates the bilingual capabilities of the platform"
          km="ទំព័រនេះបង្ហាញពីសមត្ថភាពពីរភាសារបស់វេទិកា"
          as="p"
          className="text-lg text-muted-foreground"
        />
      </div>

      {/* Language Info Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <BilingualText
              en="Current Language"
              km="ភាសាបច្ចុប្បន្ន"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {language === "en" ? "English 🇬🇧" : "ភាសាខ្មែរ 🇰🇭"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {t("common.search")} • {t("common.filter")} • {t("common.save")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Demo Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="numbers">
            <BilingualText en="Numbers" km="លេខ" />
          </TabsTrigger>
          <TabsTrigger value="dates">
            <BilingualText en="Dates" km="កាលបរិច្ឆេទ" />
          </TabsTrigger>
          <TabsTrigger value="navigation">
            <BilingualText en="Navigation" km="រុករក" />
          </TabsTrigger>
          <TabsTrigger value="forms">
            <BilingualText en="Forms" km="ទម្រង់" />
          </TabsTrigger>
        </TabsList>

        {/* Numbers Tab */}
        <TabsContent value="numbers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  <BilingualText en="Percentages" km="ភាគរយ" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>{t("dashboard.averageScore")}</span>
                  <Badge variant="secondary">
                    <FormattedNumber value={demoData.score} type="percentage" decimals={1} />
                  </Badge>
                </div>
                <Progress value={demoData.score} className="h-3" />
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <FormattedNumber value={25} type="percentage" className="text-lg font-semibold" />
                    <p className="text-xs text-muted-foreground">{t("subjects.notStarted")}</p>
                  </div>
                  <div>
                    <FormattedNumber value={50} type="percentage" className="text-lg font-semibold" />
                    <p className="text-xs text-muted-foreground">{t("subjects.inProgress")}</p>
                  </div>
                  <div>
                    <FormattedNumber value={100} type="percentage" className="text-lg font-semibold" />
                    <p className="text-xs text-muted-foreground">{t("subjects.completed")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  <BilingualText en="Grades & Rankings" km="ថ្នាក់ និងចំណាត់ថ្នាក់" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>{t("subjects.grade")}</span>
                  <Badge>
                    <FormattedNumber value={demoData.grade} type="grade" />
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <BilingualText en="Rank" km="លំដាប់" />
                  <Badge variant="outline">
                    <FormattedNumber value={demoData.rank} type="ordinal" />
                  </Badge>
                </div>
                <div className="space-y-2">
                  <BilingualText en="All Grades:" km="ថ្នាក់ទាំងអស់៖" className="text-sm font-medium" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6].map(grade => (
                      <Badge key={grade} variant="secondary">
                        <FormattedNumber value={grade} type="grade" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  <BilingualText en="Duration" km="រយៈពេល" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <BilingualText en="Study Time:" km="ពេលវេលាសិក្សា៖" className="text-sm" />
                  <div className="text-2xl font-semibold">
                    <FormattedNumber value={demoData.duration} type="duration" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <FormattedNumber value={30} type="duration" className="font-medium" />
                    <p className="text-xs text-muted-foreground mt-1">
                      <BilingualText en="Short Session" km="វគ្គខ្លី" />
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <FormattedNumber value={240} type="duration" className="font-medium" />
                    <p className="text-xs text-muted-foreground mt-1">
                      <BilingualText en="Long Session" km="វគ្គវែង" />
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <BilingualText en="Currency" km="រូបិយប័ណ្ណ" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>KHR</span>
                    <span className="text-xl font-semibold">
                      <FormattedNumber value={demoData.currency} type="currency" currency="KHR" />
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>USD</span>
                    <span className="text-xl font-semibold">
                      <FormattedNumber value={12.50} type="currency" currency="USD" />
                    </span>
                  </div>
                </div>
                <div className="pt-2 space-y-2">
                  <BilingualText en="Common Amounts:" km="ចំនួនទូទៅ៖" className="text-sm font-medium" />
                  <div className="grid grid-cols-2 gap-2">
                    {[1000, 5000, 10000, 20000].map(amount => (
                      <Badge key={amount} variant="outline">
                        <FormattedNumber value={amount} type="currency" currency="KHR" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dates Tab */}
        <TabsContent value="dates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <BilingualText en="Date Formats" km="ទម្រង់កាលបរិច្ឆេទ" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Short</p>
                    <p className="text-lg"><FormattedDate date={demoData.date} format="short" /></p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Long</p>
                    <p className="text-lg"><FormattedDate date={demoData.date} format="long" /></p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Full</p>
                    <p className="text-lg"><FormattedDate date={demoData.date} format="full" /></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <BilingualText en="Time & Relative" km="ពេលវេលា និងទាក់ទង" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Time</p>
                    <p className="text-lg"><FormattedDate date={demoData.date} format="time" /></p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date + Time</p>
                    <p className="text-lg"><FormattedDate date={demoData.date} format="short" showTime /></p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Relative</p>
                    <p className="text-lg"><FormattedDate date={demoData.pastDate} format="relative" /></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Navigation Tab */}
        <TabsContent value="navigation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <BilingualText en="Navigation Items" km="ធាតុរុករក" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(translations)
                  .filter(([key]) => key.startsWith("nav."))
                  .map(([key, trans]) => (
                    <div key={key} className="p-3 border rounded-lg">
                      <p className="font-medium">{trans[language]}</p>
                      <p className="text-xs text-muted-foreground">{key}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <BilingualText en="Form Labels & Actions" km="ស្លាកទម្រង់ និងសកម្មភាព" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button>{t("common.save")}</Button>
                <Button variant="outline">{t("common.cancel")}</Button>
                <Button variant="secondary">{t("common.continue")}</Button>
                <Button variant="destructive">{t("action.delete")}</Button>
              </div>
              
              <div className="pt-4">
                <BilingualText 
                  en="Common Actions:" 
                  km="សកម្មភាពទូទៅ៖" 
                  className="text-sm font-medium mb-3" 
                />
                <div className="flex flex-wrap gap-2">
                  {["start", "stop", "pause", "resume", "retry", "download", "upload", "share", "edit"].map(action => (
                    <Badge key={action} variant="secondary">
                      {t(`action.${action}`)}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bilingual Display Example */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            <BilingualText en="Bilingual Display Mode" km="របៀបបង្ហាញពីរភាសា" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <BilingualHeading
                en="Welcome to Primary Learning Platform"
                km="សូមស្វាគមន៍មកកាន់វេទិកាសិក្សាបឋមសិក្សា"
                level={3}
                showBoth={true}
              />
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <BilingualText
                en="This platform provides interactive educational content for primary school students in Cambodia."
                km="វេទិកានេះផ្តល់នូវមាតិកាអប់រំអន្តរកម្មសម្រាប់សិស្សបឋមសិក្សានៅកម្ពុជា។"
                as="p"
                showBoth={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Import translations type to ensure all keys are valid
const translations = {
  "nav.dashboard": { en: "Dashboard", km: "ផ្ទាំងគ្រប់គ្រង" },
} as const;