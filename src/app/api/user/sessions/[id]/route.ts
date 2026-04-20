import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tokenId } = await params;
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Ensure the token belongs to the user
    const result = await Token.deleteOne({
      _id: tokenId,
      userId: session.userId,
      type: 'refresh'
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Revoke session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
