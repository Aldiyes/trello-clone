import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
  if (auth().userId && isPublicRoute(request)) {
    let path = "/select-org";

    if (auth().orgId) {
      path = `/organization/${auth().orgId}`;
    }

    return NextResponse.redirect(new URL(path, request.url));
  }

  if (
    auth().userId &&
    !auth().orgId &&
    request.nextUrl.pathname !== "/select-org"
  ) {
    return NextResponse.redirect(new URL(new URL("/select-org", request.url)));
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
