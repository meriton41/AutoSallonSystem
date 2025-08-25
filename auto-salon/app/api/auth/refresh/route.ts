import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/account/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        cookie: request.headers.get("cookie") || "",
        authorization: request.headers.get("authorization") || "",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ message: "Failed to refresh token" }, { status: 401 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
