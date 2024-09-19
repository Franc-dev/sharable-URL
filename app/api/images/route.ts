// app/api/images/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}