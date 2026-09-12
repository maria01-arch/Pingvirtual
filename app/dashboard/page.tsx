import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Step 1 only shows that auth works. Wallet balance and order history
  // get wired in once the `profiles` and `orders` tables exist (next steps).
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>
      <p className="mt-4 text-slate-600">
        Logged in as <span className="font-medium">{user.email}</span>
      </p>
      <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
        Wallet balance and number purchase flow will appear here once the
        database schema and provider integration are wired in.
      </div>
    </main>
  );
}
