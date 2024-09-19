import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from 'cloudinary';
export const dynamic = "force-dynamic"
const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const userId = formData.get('userId') as string;

    if (!file || !title || !userId) {
      return NextResponse.json({
        message: "Missing required fields",
        status: 400,
      });
    }

    // Upload image to Cloudinary
    const buffer = await file.arrayBuffer();
    const base64File = Buffer.from(buffer).toString('base64');
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(`data:${file.type};base64,${base64File}`, {
        folder: 'user_uploads',
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    // Save image data to database
    const image = await prisma.image.create({
      data: {
        title,
        description,
        url: (uploadResponse as { secure_url: string }).secure_url,
        publicId: (uploadResponse as { public_id: string }).public_id,
        userId,
      },
    });

    return NextResponse.json({
      message: "Image uploaded successfully",
      status: 200,
      image,
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json({
      message: "An error occurred during upload",
      status: 500,
    });
  }
}