import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const adminSecret = process.env.ADMIN_SECRET_TOKEN;

    if (!adminSecret) {
      return NextResponse.json(
        { error: "Admin authentication is not configured." },
        { status: 500 }
      );
    }

    if (!password || password !== adminSecret) {
      return NextResponse.json(
        { error: "Invalid admin password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: adminSecret,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}