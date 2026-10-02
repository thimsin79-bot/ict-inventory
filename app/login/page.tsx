import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo" aria-hidden="true">
            📦
          </span>
          <div>
            <h1>ICT Inventory</h1>
            <p>Sign in to manage the asset register</p>
          </div>
        </div>

        <LoginForm />

        <div className="auth-demo">
          <p>
            <b>Demo accounts</b>
          </p>
          <p>
            <code>admin@example.com</code> / <code>Admin@123</code> — Administrator
          </p>
          <p>
            <code>sokha.chea@example.com</code> / <code>Staff@123</code> — ICT Staff
          </p>
          <p>
            <code>sreyneang.pich@example.com</code> / <code>Staff@123</code> — Viewer
          </p>
        </div>
      </section>
    </main>
  );
}
