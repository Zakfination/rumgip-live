'use server';

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/src/lib/auth';
import { createCheckoutOrder, type CheckoutPlan } from '@/src/lib/checkout';

function isPlan(value: FormDataEntryValue | null): value is CheckoutPlan {
  return value === 'daily' || value === 'full';
}

export async function startCheckout(formData: FormData) {
  const planValue = formData.get('plan');
  const plan = isPlan(planValue) ? planValue : 'daily';
  const next = `/checkout?plan=${encodeURIComponent(plan)}`;

  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);

  try {
    const checkout = await createCheckoutOrder(user, plan);
    redirect(checkout.redirectUrl);
  } catch (error) {
    console.error('Checkout action failed', { plan, error });
    redirect(`${next}&error=payment`);
  }
}
