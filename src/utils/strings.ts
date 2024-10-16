export function isNumber(str: string): boolean {
  // Check if the string is not empty and is not just white spaces
  if (str.trim() === ``) {
    return false;
  }

  // Try to parse the string to a number
  const num = Number(str);

  // Check if the parsed number is not NaN (Not-a-Number)
  return !isNaN(num);
}
