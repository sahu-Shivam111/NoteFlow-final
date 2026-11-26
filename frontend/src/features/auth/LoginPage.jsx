import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../api/auth.api";
import PasswordInput from "../../components/PasswordInput";
import { validateLoginFields } from "../../utils/validators";
import AuthShell from "./AuthShell";
import FormField from "./FormField";
import { getInputClassName } from "./fieldStyles";
import { useAuthForm } from "./useAuthForm";

export default function LoginPage() {
  const navigate = useNavigate();

  const {
    values,
    fieldErrors,
    formError,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useAuthForm({
    initialValues: { email: "", password: "" },
    validate: validateLoginFields,
    onSubmit: async (formValues, applyServerError) => {
      const data = await loginUser({
        email: formValues.email.trim(),
        password: formValues.password,
      });

      if (data.error) {
        applyServerError(data.message);
        return;
      }

      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        navigate("/dashboard");
      }
    },
  });

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your notes"
      footer={
        <>
          New here?{" "}
          <Link
            to="/signup"
            className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormField id="login-email" label="Email" error={fieldErrors.email}>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            className={getInputClassName(Boolean(fieldErrors.email))}
            value={values.email}
            onChange={handleChange("email")}
            onBlur={handleBlur("email")}
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
          />
        </FormField>

        <FormField id="login-password" label="Password" error={fieldErrors.password}>
          <PasswordInput
            id="login-password"
            password={values.password}
            onChange={handleChange("password")}
            onBlur={handleBlur("password")}
            hasError={Boolean(fieldErrors.password)}
            ariaDescribedBy={fieldErrors.password ? "login-password-error" : undefined}
            wrapperClassName="mt-2"
          />
        </FormField>

        {formError && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600 dark:bg-red-950/40 dark:text-red-300"
          >
            {formError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary mt-1 text-base">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
