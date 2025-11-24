// app/api/users/routes.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User, { IUser } from '@/models/User';

// GET /api/users - Récupérer tous les utilisateurs
export async function GET() {
  try {
    await dbConnect();
    const users: IUser[] = await User.find({});
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST /api/users - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body: Partial<IUser> = await request.json();
    const user: IUser = await User.create(body);
    return NextResponse.json(
      { success: true, data: user },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}