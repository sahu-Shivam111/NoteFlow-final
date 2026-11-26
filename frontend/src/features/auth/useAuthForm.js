import { useState } from "react";
import { apiMessage } from "../../api/client";
import { mapAuthServerError } from "../../utils/validators";

/**
 * Manage field-level validation, blur/change state, and server error mapping for auth forms.
 */
export function useAuthForm({ initialValues, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    const nextValues = { ...values, [field]: event.target.value };
    setValues(nextValues);
    setFormError("");

    if (touched[field] || fieldErrors[field]) {
      const nextErrors = validate(nextValues);
      setFieldErrors((prev) => ({ ...prev, [field]: nextErrors[field] }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const nextErrors = validate(values);
    setFieldErrors((prev) => ({ ...prev, [field]: nextErrors[field] }));
  };

  const applyServerError = (message) => {
    const mapped = mapAuthServerError(message);
    if (mapped.field) {
      setFieldErrors((prev) => ({ ...prev, [mapped.field]: mapped.message }));
    } else {
      setFormError(mapped.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validate(values);
    const allTouched = Object.keys(initialValues).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});

    setTouched(allTouched);
    setFieldErrors(errors);
    setFormError("");

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values, applyServerError);
    } catch (error) {
      applyServerError(apiMessage(error, "Something went wrong. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    fieldErrors,
    formError,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
