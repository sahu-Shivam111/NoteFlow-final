export default function FormField({ id, label, error, children }) {
  return (
    <div className="mb-4">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
