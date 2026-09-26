export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}