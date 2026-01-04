type NavProps = {
  username: string;
};

export default function Nav({ username }: NavProps) {
  return (
    <nav className="nav">
      <div>
        <strong>Hello, {username}</strong>
      </div>
      <div className="nav-links">
        <a className="pill" href="/entries">
          Journal
        </a>
        <a className="pill" href="/summary">
          Monthly Summary
        </a>
        <a className="pill primary" href="/entries/new">
          New Entry
        </a>
        <form action="/api/auth/logout" method="post">
          <button className="pill" type="submit">
            Log out
          </button>
        </form>
      </div>
    </nav>
  );
}
