import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/"]);
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware((auth, request) => {
  if (isAuthRoute(request) || isPublicRoute(request)) {
    if (auth().userId) {
      if (auth().orgId) {
        return NextResponse.redirect(
          new URL(`/organization/${auth().orgId}`, request.nextUrl),
        );
      }
      return NextResponse.redirect(new URL("/select-org", request.nextUrl));
    }
    return NextResponse.next();
  }

  if (isApiRoute(request) && auth().userId) {
    return NextResponse.next();
  }

  if (auth().userId && !isPublicRoute(request)) {
    return NextResponse.next();
  }

  if (!auth().userId && !isPublicRoute(request)) {
    auth().protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
