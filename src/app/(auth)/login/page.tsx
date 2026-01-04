import { getUserFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";

const errorMessages: Record<string, string> = {
  missing: "Please enter a username and password.",
  invalid: "That username or password did not match."
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getUserFromCookies();
  if (session) {
    redirect("/entries");
  }

  const { error } = await searchParams;
  const errorMessage = error
    ? errorMessages[error] ?? "Login failed."
    : "";

  return (
    <div className="auth-shell">
      <h1 className="auth-title">Welcome back</h1>
      <p className="meta">Log in to keep your journal private.</p>
      <form className="form-card form-grid" action="/api/auth/login" method="post">
        <div className="form-grid">
          <div>
            <label htmlFor="username">Username</label>
            <input id="username" name="username" required />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required />
          </div>
        </div>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <div className="form-actions">
          <button className="pill primary" type="submit">
            Log in
          </button>
          <a className="pill" href="/register">
            Create an account
          </a>
        </div>
      </form>
    </div>
  );
}
