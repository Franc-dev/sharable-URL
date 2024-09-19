import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export async function DELETE(req: Request) {
    try {
      const { id } = await req.json();
      await prisma.image.delete({ where: { id } });
      return NextResponse.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Error deleting image:", error);
      return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }
  }