import { logoutAction } from "@/lib/auth/actions";

export function Topbar({
  name,
  role,
  initials,
}: {
  name: string;
  role: string;
  initials: string;
}) {
  return (
    <header className="topbar">
      <form className="search" role="search" action="/assets" method="get">
        <span aria-hidden="true">🔎</span>
        <input
          type="search"
          name="q"
          placeholder="Search assets, serial number..."
          aria-label="Search assets, serial number"
        />
      </form>
      <div className="user">
        <div>
          <b>{name}</b>
          <br />
          <small>{role}</small>
        </div>
        <div className="avatar" aria-hidden="true">
          {initials}
        </div>
        <form action={logoutAction}>
          <button className="btn btn-ghost" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
