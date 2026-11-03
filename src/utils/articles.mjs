/** Sort ISO calendar publication dates newest first, with a stable tie-break. */
export function newestFirst(a, b) {
  return b.data.publishedAt.localeCompare(a.data.publishedAt) || a.id.localeCompare(b.id);
}

export function formatArticleDate(value) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}
