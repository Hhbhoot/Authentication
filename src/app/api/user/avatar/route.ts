import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration (Users should set these in .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image } = await req.json(); // base64 image
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // If Cloudinary keys are missing, we'll store the base64 as a fallback 
    // (Note: In production you MUST use a storage service)
    let imageUrl = image;

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'avatars',
        transformation: [{ width: 250, height: 250, crop: 'fill' }],
      });
      imageUrl = uploadResponse.secure_url;
    }

    await connectDB();
    await User.findByIdAndUpdate(session.userId, { avatarUrl: imageUrl });

    return NextResponse.json({ 
      message: 'Avatar updated successfully',
      avatarUrl: imageUrl 
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
