const venueDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatUpdatedAt(updatedAt: number) {
  return venueDateFormatter.format(updatedAt);
}
