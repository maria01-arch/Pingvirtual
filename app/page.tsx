import Link from "next/link";
import { MessageSquare, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
      <img src="/icon-192.png" alt="PingVirtual" className="mb-6 h-16 w-16 rounded-2xl shadow-lg" />
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        PingVirtual
      </h1>
      <p className="mt-4 max-w-xl text-lg text-slate-600">
        Rent a virtual phone number in seconds and receive your SMS
        verification code instantly. Cheap, fast, no contracts.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand-dark"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Log In
        </Link>
      </div>

      <div className="mt-20 grid gap-8 sm:grid-cols-3">
        <Feature
          icon={<Zap size={22} />}
          title="Instant Numbers"
          text="Get a working number in under a minute."
        />
        <Feature
          icon={<ShieldCheck size={22} />}
          title="Reliable Delivery"
          text="Automatic backup provider if one runs out of stock."
        />
        <Feature
          icon={<MessageSquare size={22} />}
          title="Pay As You Go"
          text="Top up your wallet, only pay for numbers you use."
        />
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}
