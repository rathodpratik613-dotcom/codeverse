import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken, findUserByEmail } from '@/lib/auth';
import { z } from 'zod';

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotSchema.parse(body);

    // Always return the same response to avoid user enumeration
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists for that email, a reset link has been sent.',
      });
    }

    const token = await createPasswordResetToken(email);

    // TODO: send email with reset link when an email provider is configured.
    // Until then, expose the token only outside production so the flow is testable.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[password-reset] Reset token for ${email}: ${token}`);
      return NextResponse.json({
        success: true,
        message: 'If an account exists for that email, a reset link has been sent.',
        devResetToken: token,
      });
    }

    console.log(`[password-reset] Reset token generated for user ${user.id}`);
    return NextResponse.json({
      success: true,
      message: 'If an account exists for that email, a reset link has been sent.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
