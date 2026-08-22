import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050608] text-white">
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_30%,rgba(255,255,255,.13),transparent_30%),radial-gradient(circle_at_15%_85%,rgba(40,75,255,.16),transparent_34%)]" />
        <div className="relative mx-auto w-full max-w-6xl">
          <nav className="flex items-center justify-between border-b border-white/10 pb-6">
            <span className="text-sm font-semibold tracking-[0.25em]">RUMGIP LIVE</span>
            <Link href="/login" className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] transition hover:bg-white hover:text-black">Sign in</Link>
          </nav>

          <div className="grid gap-14 py-20 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:py-28">
            <div>
              <p className="mb-5 text-xs uppercase tracking-[0.3em] text-white/40">Rumgip Championship V.4 · More Than A Game</p>
              <h1 className="max-w-4xl text-6xl font-semibold leading-[.9] tracking-[-0.065em] sm:text-7xl lg:text-[104px]">The game.<br /><span className="text-white/35">Live.</span></h1>
              <p className="mt-8 max-w-xl text-base leading-7 text-white/55 sm:text-lg">Watch the championship from anywhere. Purchase your pass, sign in securely, and enter the protected live room.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/checkout" className="rounded-2xl bg-white px-7 py-4 text-center text-sm font-semibold text-black transition hover:bg-white/90">Get your live pass</Link>
                <Link href="/login" className="rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 text-center text-sm font-semibold transition hover:bg-white/[0.08]">I already have a pass</Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl sm:p-8">
              <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                <div className="flex h-full items-center justify-center text-center">
                  <div><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/5">▶</div><p className="text-sm text-white/50">Protected live stream</p></div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-white/35">Access</p><p className="mt-1 font-medium">Paid pass</p></div>
                <div><p className="text-white/35">Platform</p><p className="mt-1 font-medium">Web + mobile</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
