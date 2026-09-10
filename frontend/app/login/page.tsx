import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12">
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          Login
        </h1>

        <p className="mt-2 text-slate-500">
          Login to your AI Executive Decision Agent account.
        </p>

        <form className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500"
          >
            Login
          </button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
          <Link
            href="/"
            className="text-slate-600 hover:text-blue-600"
          >
            Back to Home
          </Link>

          <Link
            href="/signup"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}