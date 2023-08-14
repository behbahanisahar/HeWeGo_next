export function isFormValid<T extends Record<string, string | number>>(
  formData: T
): boolean {
  for (const key in formData) {
    const value = formData[key];

    if (typeof value === "string" && value.trim() === "") {
      return false; // Found an empty field
    }
  }

  return true; // All fields are non-empty
}
export function isEmailValid(email: string): boolean {
  // Regular expression to match email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(email);
}
