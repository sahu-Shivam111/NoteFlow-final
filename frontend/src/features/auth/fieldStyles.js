export function getInputClassName(hasError) {
  return `input-box !mb-0 mt-2 ${
    hasError
      ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500/15 dark:!border-red-500/80"
      : ""
  }`;
}
