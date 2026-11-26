export const validEmail = (email) => {
  const regex = /.+@.+\..+/;
  return regex.test(String(email || "").trim());
};

export const getInitials = (name) => {
  if (!name) return "";

  const nameArray = name.trim().split(/\s+/);
  if (nameArray.length === 1) return nameArray[0][0].toUpperCase();
  return (nameArray[0][0] + nameArray[1][0]).toUpperCase();
};

export function validateLoginFields({ email, password }) {
  const errors = {};
  const trimmedEmail = String(email || "").trim();

  if (!trimmedEmail) {
    errors.email = "Email is required.";
  } else if (!validEmail(trimmedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function validateSignUpFields({ firstName, lastName, email, password }) {
  const errors = {};
  const trimmedEmail = String(email || "").trim();

  if (!String(firstName || "").trim()) {
    errors.firstName = "First name is required.";
  }

  if (!String(lastName || "").trim()) {
    errors.lastName = "Last name is required.";
  }

  if (!trimmedEmail) {
    errors.email = "Email is required.";
  } else if (!validEmail(trimmedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

export function mapAuthServerError(message) {
  const text = String(message || "");
  const lower = text.toLowerCase();

  if (lower.includes("user already exists") || lower.includes("user does not exist")) {
    return { field: "email", message: text };
  }
  if (lower.includes("invalid credentials")) {
    return { field: "password", message: text };
  }
  if (lower.includes("firstname") || lower.includes("first name")) {
    return { field: "firstName", message: text };
  }
  if (lower.includes("lastname") || lower.includes("last name")) {
    return { field: "lastName", message: text };
  }
  if (lower.includes("email")) {
    return { field: "email", message: text };
  }
  if (lower.includes("password")) {
    return { field: "password", message: text };
  }

  return { field: null, message: text };
}
