import { getUserFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";

const errorMessages: Record<string, string> = {
  missing: "Please enter a username and password.",
  exists: "That username is already taken."
};

export default async function RegisterPage({
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
    ? errorMessages[error] ?? "Registration failed."
    : "";

  return (
    <div className="auth-shell">
      <h1 className="auth-title">Create your journal</h1>
      <p className="meta">Pick a username and password to keep it private.</p>
      <form
        className="form-card form-grid"
        action="/api/auth/register"
        method="post"
      >
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
            Create account
          </button>
          <a className="pill" href="/login">
            Back to login
          </a>
        </div>
      </form>
    </div>
  );
}
