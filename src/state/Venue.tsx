import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { DEFAULT_VENUE, selectVenue, venue } from '../content';
import { readJSON, writeJSON } from '../logic/storage';

// 지금 고른 관람지. 바꾸면 그 아래 상태(저장 목록, 사운드 등)를 모두 새로 만든다.

interface VenueState {
  venueId: string;
  switchVenue: (id: string) => boolean;
}

const Ctx = createContext<VenueState | null>(null);

const isString = (v: unknown): v is string => typeof v === 'string';

// 첫 화면을 그리기 전에 지난번 관람지를 고른다
if (!selectVenue(readJSON('venue', DEFAULT_VENUE, isString))) selectVenue(DEFAULT_VENUE);

export function VenueProvider({ children }: { children: (venueId: string) => ReactNode }) {
  const [venueId, setVenueId] = useState(venue.id);
  const switchVenue = useCallback((id: string) => {
    if (!selectVenue(id)) return false;
    writeJSON('venue', id);
    setVenueId(id);
    return true;
  }, []);
  return <Ctx.Provider value={{ venueId, switchVenue }}>{children(venueId)}</Ctx.Provider>;
}

export function useVenue() {
  const v = useContext(Ctx);
  if (!v) throw new Error('VenueProvider missing');
  return v;
}
