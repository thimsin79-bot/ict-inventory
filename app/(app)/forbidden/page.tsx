import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Not permitted</h2>
      </div>
      <div className="panel-body">
        <p>Your role does not include access to this area.</p>
        <p>
          Ask an Administrator if you believe you should have access.{" "}
          <Link className="btn btn-primary" href="/dashboard">
            Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
