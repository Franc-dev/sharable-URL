import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()
export async function PUT(req: Request) {
  try {
    const { id, isArchived } = await req.json();
    const updatedImage = await prisma.image.update({
      where: { id },
      data: { isArchived },
    });
    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error("Error updating archive status:", error);
    return NextResponse.json({ error: "Failed to update archive status" }, { status: 500 });
  }
}