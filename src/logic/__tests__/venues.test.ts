import { afterEach, describe, expect, it } from 'vitest';
import { content, DEFAULT_VENUE, getArtifact, openVenues, selectVenue, venue, venues } from '../../content';

afterEach(() => void selectVenue(DEFAULT_VENUE));

describe('venues', () => {
  it('has unique ids and at least one open venue with content', () => {
    expect(new Set(venues.map((v) => v.id)).size).toBe(venues.length);
    expect(openVenues.length).toBeGreaterThan(0);
  });
  it('refuses venues without content', () => {
    const soon = venues.find((v) => v.status === 'soon');
    if (!soon) return;
    expect(selectVenue(soon.id)).toBe(false);
    expect(venue.id).toBe(DEFAULT_VENUE);
  });
  it('switches content and lookups together', () => {
    expect(selectVenue(DEFAULT_VENUE)).toBe(true);
    expect(getArtifact(content.artifacts[0].id)).toBe(content.artifacts[0]);
  });
});
