import { NextResponse } from 'next/server';
import { getSessionUser } from '@/src/lib/auth';
import { createCheckoutOrder, type CheckoutPlan } from '@/src/lib/checkout';

function isPlan(value: unknown): value is CheckoutPlan {
  return value === 'daily' || value === 'full';
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const plan = (body as { plan?: unknown })?.plan;
  if (!isPlan(plan)) {
    return NextResponse.json({ error: 'Invalid pass' }, { status: 400 });
  }

  try {
    const checkout = await createCheckoutOrder(user, plan);
    return NextResponse.json(checkout);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create payment. Please try again.';
    const status = message === 'Pass is not configured' ? 409 : 502;

    console.error('Checkout API failed', { plan, error });
    return NextResponse.json({ error: message }, { status });
  }
}
