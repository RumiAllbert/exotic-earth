import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hiringDraft } from '../src/lib/hiring-draft.ts';

test('hiring action opens a draft addressed to micro1 with portfolio attribution', () => {
  const draft = new URL(hiringDraft);
  assert.equal(draft.protocol, 'mailto:');
  assert.equal(draft.pathname, 'rumi@micro1.ai');
  assert.match(draft.searchParams.get('subject')!, /hiring.*rumicalles.com/);
  assert.match(draft.searchParams.get('body')!, /https:\/\/rumicalles.com\//);
  assert.match(draft.searchParams.get('body')!, /\[role\].*\[company\]/);
  assert.match(draft.searchParams.get('body')!, /\r\n/);
});
