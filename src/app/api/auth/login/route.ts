import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    // Compare against a dummy hash even when the user doesn't exist, so the
    // response time doesn't leak whether the email is registered.
    const passwordMatches = await verifyPassword(
      password,
      user?.password ?? '$2a$12$invalidsaltinvalidsaltinvalidsaOu'
    );

    if (!user || !passwordMatches) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    await setSessionCookie(user.id);

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
