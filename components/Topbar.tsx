import { CURRENT_USER } from "@/lib/navigation";

export function Topbar() {
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
          <b>{CURRENT_USER.name}</b>
          <br />
          <small>{CURRENT_USER.role}</small>
        </div>
        <div className="avatar" aria-hidden="true">
          {CURRENT_USER.initials}
        </div>
      </div>
    </header>
  );
}
