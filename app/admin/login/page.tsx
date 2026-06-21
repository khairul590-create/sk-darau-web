"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    try {
      const sb = createSupabaseBrowser();
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/admin");
      router.refresh();
    } catch {
      setErr("E-mel atau kata laluan salah.");
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo">SK</div>
        <h1>Log Masuk Admin</h1>
        <p>Panel pengurusan Laman SK Darau</p>
        {!isSupabaseConfigured && (
          <div className="form-msg err">
            Backend belum disambung. Sila tetapkan kunci Supabase dahulu.
          </div>
        )}
        {err && <div className="form-msg err">{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">E-mel</label>
            <input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Kata Laluan</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-submit"
            disabled={loading || !isSupabaseConfigured}
          >
            {loading ? "Memproses..." : "Log Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
