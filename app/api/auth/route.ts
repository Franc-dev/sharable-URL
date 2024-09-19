import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
export const dynamic = "force-dynamic"
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, action } = await req.json();

    if (action === "register") {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ message: "User already exists", status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword },
      });

      return NextResponse.json({
        message: "User registered successfully",
        status: 200,
        user: { id: user.id, email: user.email },
      });
    } else if (action === "login") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ message: "User not found", status: 404 });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ message: "Invalid password", status: 401 });
      }

      return NextResponse.json({
        message: "Login successful",
        status: 200,
        user: { id: user.id, email: user.email },
      });
    }
    return NextResponse.json({ message: "Invalid action", status: 400 });
  } catch (error: unknown) {
    console.error("Authentication error:", error);
    return NextResponse.json({
      message: "An error occurred during authentication",
      status: 500,
    });
  }
}