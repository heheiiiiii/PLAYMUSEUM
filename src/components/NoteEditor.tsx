import { useEffect, useId, useState } from 'react';
import type { ScriptKey } from '../content';
import { NOTE_MAX, useApp } from '../state/AppState';

const dateTime = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

// 나의 감상평. 글이 있으면 읽기 상태로 보여 주고, ‘수정’을 누르면 입력 상태가 된다.
export function NoteEditor({
  artifactId,
  lens,
  placeholder = '이 작품 앞에서 든 생각, 마음에 남은 장면을 적어 보세요.',
}: {
  artifactId: string;
  lens: ScriptKey;
  placeholder?: string;
}) {
  const { saved, saveNote, storageOk } = useApp();
  const item = saved.find((s) => s.id === artifactId);
  const note = item?.note ?? '';
  const [editing, setEditing] = useState(!note);
  const [draft, setDraft] = useState(note);
  const [flash, setFlash] = useState<string | null>(null);
  const fieldId = useId();

  useEffect(() => {
    if (!editing) setDraft(note);
  }, [note, editing]);

  const submit = () => {
    const text = draft.trim();
    if (!text && !note) return;
    saveNote(artifactId, text, lens);
    setFlash(text ? (item ? '감상평을 저장했어요.' : '감상평과 함께 작품을 관람 기록에 담았어요.') : '감상평을 지웠어요.');
    setEditing(!text);
  };

  if (!editing && note) {
    return (
      <div className="note is-read">
        <p className="note-text">{note}</p>
        <div className="note-foot">
          <span className="meta">{dateTime(item?.noteUpdatedAt)}</span>
          <button
            type="button"
            className="btn btn-text btn-small"
            onClick={() => {
              setDraft(note);
              setEditing(true);
              setFlash(null);
            }}
          >
            수정
          </button>
        </div>
        {flash && (
          <p className="meta" aria-live="polite">
            {flash}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      className="note"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label htmlFor={fieldId} className="visually-hidden">
        나의 감상평
      </label>
      <textarea
        id={fieldId}
        value={draft}
        maxLength={NOTE_MAX}
        rows={4}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
      />
      <div className="note-foot">
        <span className="meta note-count">
          {draft.length} / {NOTE_MAX}
        </span>
        <div className="actions">
          {note && (
            <button
              type="button"
              className="btn btn-text btn-small"
              onClick={() => {
                setDraft(note);
                setEditing(false);
              }}
            >
              취소
            </button>
          )}
          <button type="submit" className="btn btn-primary btn-small" disabled={!draft.trim() && !note}>
            {note && !draft.trim() ? '감상평 지우기' : '감상 저장'}
          </button>
        </div>
      </div>
      <p className="meta" aria-live="polite">
        {!storageOk ? '이 브라우저에서는 기록을 저장할 수 없어요.' : flash}
      </p>
    </form>
  );
}
