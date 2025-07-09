import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs";

const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/api/webhook/clerk",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};