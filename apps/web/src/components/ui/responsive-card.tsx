import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveCard({ children, className }: ResponsiveCardProps) {
  return (
    <Card className={cn("transition-all", className)}>
      {children}
    </Card>
  );
}

interface ResponsiveCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveCardHeader({ children, className }: ResponsiveCardHeaderProps) {
  return (
    <CardHeader className={cn("p-4 sm:p-6", className)}>
      {children}
    </CardHeader>
  );
}

interface ResponsiveCardContentProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveCardContent({ children, className }: ResponsiveCardContentProps) {
  return (
    <CardContent className={cn("p-4 sm:p-6", className)}>
      {children}
    </CardContent>
  );
}

interface ResponsiveCardTitleProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveCardTitle({ children, className }: ResponsiveCardTitleProps) {
  return (
    <CardTitle className={cn("text-lg sm:text-xl lg:text-2xl", className)}>
      {children}
    </CardTitle>
  );
}

interface ResponsiveCardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveCardDescription({ children, className }: ResponsiveCardDescriptionProps) {
  return (
    <CardDescription className={cn("text-sm sm:text-base", className)}>
      {children}
    </CardDescription>
  );
}