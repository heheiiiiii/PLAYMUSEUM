import { useCallback, useState } from 'react';
import { venue } from '../content';
import { readScoped, writeScoped } from '../logic/storage';

// 라운지에서 내가 누른 좋아요와 내가 단 댓글. 관람지마다 이 브라우저에만 저장한다.

export interface MyComment {
  id: string;
  text: string;
  at: string;
}

export const COMMENT_MAX = 200;

const isIds = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const isComments = (v: unknown): v is Record<string, MyComment[]> =>
  !!v && typeof v === 'object' && !Array.isArray(v) && Object.values(v).every((l) => Array.isArray(l));

export function useSocial() {
  const [venueId] = useState(venue.id);
  const [likes, setLikes] = useState<string[]>(() => readScoped('likes', venueId, [], isIds));
  const [comments, setComments] = useState<Record<string, MyComment[]>>(() =>
    readScoped('comments', venueId, {}, isComments),
  );

  const toggleLike = useCallback(
    (postId: string) =>
      setLikes((prev) => {
        const next = prev.includes(postId) ? prev.filter((x) => x !== postId) : [...prev, postId];
        writeScoped('likes', venueId, next);
        return next;
      }),
    [venueId],
  );

  const addComment = useCallback(
    (postId: string, text: string) => {
      const t = text.trim().slice(0, COMMENT_MAX);
      if (!t) return;
      setComments((prev) => {
        const item = { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, text: t, at: new Date().toISOString() };
        const next = { ...prev, [postId]: [...(prev[postId] ?? []), item] };
        writeScoped('comments', venueId, next);
        return next;
      });
    },
    [venueId],
  );

  const removeComment = useCallback(
    (postId: string, id: string) =>
      setComments((prev) => {
        const next = { ...prev, [postId]: (prev[postId] ?? []).filter((c) => c.id !== id) };
        writeScoped('comments', venueId, next);
        return next;
      }),
    [venueId],
  );

  return { likes, isLiked: (id: string) => likes.includes(id), toggleLike, comments, addComment, removeComment };
}
