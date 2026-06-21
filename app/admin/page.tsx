import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="login-wrap">
        <div className="login-box">
          <h1>Backend belum disambung</h1>
          <p>
            Panel admin perlukan Supabase. Tetapkan{" "}
            <code>NEXT_PUBLIC_SUPABASE_URL</code> dan{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dalam fail{" "}
            <code>.env.local</code>, kemudian mula semula pelayan.
          </p>
          <Link href="/" className="btn btn-ghost btn-sm">← Kembali ke laman</Link>
        </div>
      </div>
    );
  }

  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");

  return <AdminDashboard userEmail={user.email ?? ""} />;
}
