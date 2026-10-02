"use client";

import { FormNotice } from "@/components/FormNotice";
import { SubmitButton } from "@/components/SubmitButton";
import { useFormAction } from "@/components/useFormAction";
import { loginAction } from "@/app/login/actions";

export function LoginForm() {
  const { state, formAction } = useFormAction(loginAction);

  return (
    <form action={formAction} className="formgrid">
      <div className="full">
        <FormNotice state={state} />
      </div>
      <div className="field full">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          aria-invalid={state.fieldErrors.email !== undefined}
        />
        {state.fieldErrors.email ? (
          <small className="field-error" role="alert">
            {state.fieldErrors.email}
          </small>
        ) : null}
      </div>
      <div className="field full">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.fieldErrors.password !== undefined}
        />
        {state.fieldErrors.password ? (
          <small className="field-error" role="alert">
            {state.fieldErrors.password}
          </small>
        ) : null}
      </div>
      <div className="full">
        <SubmitButton>Sign In</SubmitButton>
      </div>
    </form>
  );
}
