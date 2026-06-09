import { describe, expect, it } from 'vitest';
import { JtiReplaySet } from './replay';

describe('JtiReplaySet', () => {
  it('reports unseen jti as not replayed', () => {
    const set = new JtiReplaySet();
    expect(set.has('abc')).toBe(false);
  });

  it('marks added jti as replayed', () => {
    const set = new JtiReplaySet();
    set.add('abc', Math.floor(Date.now() / 1000) + 60);
    expect(set.has('abc')).toBe(true);
  });

  it('prunes expired entries', () => {
    const set = new JtiReplaySet();
    set.add('expired', Math.floor(Date.now() / 1000) - 60);
    set.prune();
    expect(set.has('expired')).toBe(false);
  });

  it('respects maxSize by evicting oldest', () => {
    const set = new JtiReplaySet(2);
    const future = Math.floor(Date.now() / 1000) + 60;
    set.add('a', future);
    set.add('b', future);
    set.add('c', future);
    expect(set.size()).toBe(2);
    expect(set.has('a')).toBe(false);
    expect(set.has('c')).toBe(true);
  });
});
