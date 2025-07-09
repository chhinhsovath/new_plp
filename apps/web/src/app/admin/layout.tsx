import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@plp/database";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect("/sign-in");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}