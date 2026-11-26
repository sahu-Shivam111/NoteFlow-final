import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/auth.api";
import PasswordInput from "../../components/PasswordInput";
import { validateSignUpFields } from "../../utils/validators";
import AuthShell from "./AuthShell";
import FormField from "./FormField";
import { getInputClassName } from "./fieldStyles";
import { useAuthForm } from "./useAuthForm";

export default function SignUpPage() {
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
    initialValues: { firstName: "", lastName: "", email: "", password: "" },
    validate: validateSignUpFields,
    onSubmit: async (formValues, applyServerError) => {
      const data = await registerUser({
        firstName: formValues.firstName.trim(),
        lastName: formValues.lastName.trim(),
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
      eyebrow="Get started"
      title="Create your account"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="signup-first" label="First name" error={fieldErrors.firstName}>
            <input
              id="signup-first"
              type="text"
              placeholder="Ada"
              className={getInputClassName(Boolean(fieldErrors.firstName))}
              value={values.firstName}
              onChange={handleChange("firstName")}
              onBlur={handleBlur("firstName")}
              autoComplete="given-name"
              aria-invalid={Boolean(fieldErrors.firstName)}
              aria-describedby={fieldErrors.firstName ? "signup-first-error" : undefined}
            />
          </FormField>

          <FormField id="signup-last" label="Last name" error={fieldErrors.lastName}>
            <input
              id="signup-last"
              type="text"
              placeholder="Lovelace"
              className={getInputClassName(Boolean(fieldErrors.lastName))}
              value={values.lastName}
              onChange={handleChange("lastName")}
              onBlur={handleBlur("lastName")}
              autoComplete="family-name"
              aria-invalid={Boolean(fieldErrors.lastName)}
              aria-describedby={fieldErrors.lastName ? "signup-last-error" : undefined}
            />
          </FormField>
        </div>

        <FormField id="signup-email" label="Email" error={fieldErrors.email}>
          <input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            className={getInputClassName(Boolean(fieldErrors.email))}
            value={values.email}
            onChange={handleChange("email")}
            onBlur={handleBlur("email")}
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
          />
        </FormField>

        <FormField id="signup-password" label="Password" error={fieldErrors.password}>
          <PasswordInput
            id="signup-password"
            password={values.password}
            onChange={handleChange("password")}
            onBlur={handleBlur("password")}
            autoComplete="new-password"
            hasError={Boolean(fieldErrors.password)}
            ariaDescribedBy={fieldErrors.password ? "signup-password-error" : undefined}
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
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
