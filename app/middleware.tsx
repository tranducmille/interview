import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Paths that don't require authentication
  const publicPaths = ["/"];
  const isPublicPath = publicPaths.includes(path);
  
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Redirect to home page if not authenticated and trying to access a protected route
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/categories/:path*",
    "/api/categories/:path*",
    "/api/questions/:path*",
  ],
};