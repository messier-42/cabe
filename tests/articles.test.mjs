import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatArticleDate, newestFirst } from '../src/utils/articles.mjs';

test('publication date takes precedence over filename and legacy order', () => {
  const entries = [
    { id: 'a-old', data: { publishedAt: '2026-10-28', order: 0 } },
    { id: 'z-new', data: { publishedAt: '2026-11-02', order: 100 } },
    { id: 'middle', data: { publishedAt: '2026-10-30', order: 1 } },
  ];
  assert.deepEqual(entries.sort(newestFirst).map(entry => entry.id), ['z-new', 'middle', 'a-old']);
});

test('equal publication dates have a deterministic order', () => {
  const entries = ['z', 'a'].map(id => ({ id, data: { publishedAt: '2026-09-29' } }));
  assert.deepEqual(entries.sort(newestFirst).map(entry => entry.id), ['a', 'z']);
});

test('calendar dates do not shift with the build timezone', () => {
  const original = process.env.TZ;
  try {
    for (const zone of ['America/Los_Angeles', 'Pacific/Kiritimati', 'UTC']) {
      process.env.TZ = zone;
      assert.equal(formatArticleDate('2026-10-30'), '30 October 2026');
      assert.equal(formatArticleDate('2026-11-02'), '2 November 2026');
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});
