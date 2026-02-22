import type { Route } from "./+types/signup";
import { Form, Link, redirect, useNavigation } from "react-router";
import { signup, getUser } from "~/server/auth.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign up | Givem" },
    {
      name: "description",
      content: "Create your Givem account to continue surfing Givem!",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  return signup(request);
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (user) throw redirect("/home");
  return null;
}

export default function SignupPage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-pink-50 to-amber-100 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
            Givem
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Spread the love, one kudo at a time.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-white p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Create your account ✨
          </h2>

          {actionData?.error && (
            <div
              className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
              aria-live="polite"
            >
              <span>⚠️</span> {actionData.error}
            </div>
          )}

          <Form method="post" className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >
                Your name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-violet-400 transition-colors"
                placeholder="Ada Lovelace"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-violet-400 transition-colors"
                placeholder="ada@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-violet-400 transition-colors"
                placeholder="At least 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                      className="opacity-75"
                    />
                  </svg>
                  Creating account…
                </>
              ) : (
                "Get started →"
              )}
            </button>
          </Form>

          <p className="text-sm text-gray-400 mt-6 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-600 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
