import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"



export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    const image = await prisma.image.findUnique({
      where: {
        id,
      },
    });
    const shareUrl = image?.url;
    return NextResponse.json({ shareUrl });
  } catch (error) {
    console.error("Error sharing image:", error);
    return NextResponse.json({ error: "Failed to share image" }, { status: 500 });
  }
}
