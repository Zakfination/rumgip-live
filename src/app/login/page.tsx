import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from './LoginForm';

function LoginRoute() {
  const searchParams = useSearchParams();
  return <LoginForm next={searchParams.get('next') || '/checkout'} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#050608] text-sm text-white/40">Loading…</main>}>
      <LoginRoute />
    </Suspense>
  );
}
