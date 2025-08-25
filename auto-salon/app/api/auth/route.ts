import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // In a real application, you would validate credentials against a database
    // For demo purposes, we'll accept any login with a valid email format
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email,
        name: email.split("@")[0], // Just for demo
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

