"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    // Signed up through the browser client (not a server action) so
    // AuthProvider's onAuthStateChange listener picks up an immediate
    // session (when email confirmation is off) without needing a reload.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({ id: data.user.id, email, name });
    }

    // No session back means Supabase is waiting on email confirmation
    // before the account can actually sign in - tell the user that instead
    // of silently dropping them on the home page as if they were logged in.
    if (!data.session) {
      setConfirmEmailSent(true);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (confirmEmailSent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Check your email</h1>
          <p className="text-gray-600">
            We sent a confirmation link to your email address. Click it to activate your
            account, then sign in.
          </p>
          <Link href="/login" className="inline-block text-gray-900 font-medium hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-2 text-gray-600">Join WaterlooBudget to save spots and create teams</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email/Password Form */}
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-gray-900 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
