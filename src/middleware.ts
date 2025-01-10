import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  try {
    const authUserCookie = request.cookies.get("auth-user")?.value;
    const authUser = authUserCookie ? JSON.parse(decodeURIComponent(authUserCookie)) : null;
    const isPublicPath = ["/login", "/register", "/password"].includes(
      request.nextUrl.pathname
    );
    const isDashboardPath = request.nextUrl.pathname.startsWith("/dashboard");
    const isRootPath = request.nextUrl.pathname === "/";

    // 已登录用户访问根路径，重定向到 dashboard
    if ((isRootPath || isPublicPath) && authUser?.id) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 未登录用户访问受保护路径
    if ((isDashboardPath || isRootPath) && !authUser?.id) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth-user");
    return response;
  }
}

export const config = {
  // 需要中间件处理的路由
  matcher: [
    /*
     * 匹配需要验证的路径:
     * - 主页 "/"
     * - 登录相关页面
     * - 仪表板所有页面
     */
    "/",
    "/login",
    "/register",
    "/password",
    "/dashboard/:path*",
  ],
};
