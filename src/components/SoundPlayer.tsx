import type { Artifact } from '../content';
import { useSound } from '../state/Sound';
import { getArtifact } from '../content';
import { href } from '../router';

const statusText = {
  stopped: '정지됨',
  loading: '불러오는 중',
  playing: '재생 중',
  error: '재생할 수 없음',
} as const;

export function SoundPlayer({ artifact, courseHint }: { artifact: Artifact; courseHint?: boolean }) {
  const sound = useSound();
  const s = artifact.sound;
  const source = sound.sourceFor(artifact);
  const isThis = sound.artifactId === artifact.id;
  const status = isThis ? sound.status : 'stopped';
  const playing = status === 'playing' || status === 'loading';
  const disabled = source === 'none';
  const title = `${artifact.name} · ${s.mood.join(' · ')}`;

  return (
    <section className={`sound ${playing ? 'is-playing' : ''}`} aria-labelledby={`sound-${artifact.id}`}>
      <div className="sound-head">
        <div className="sound-title">
          <span className="eyebrow">
            사운드 · {s.tag}
            {source === 'demo' && <span className="demo-tag">데모</span>}
          </span>
          <h3 id={`sound-${artifact.id}`}>{title}</h3>
        </div>
        <button
          type="button"
          className="sound-toggle"
          onClick={() => (playing ? sound.stop() : sound.play(artifact))}
          disabled={disabled}
          aria-pressed={playing}
          aria-label={playing ? '사운드 정지' : '사운드 재생'}
        >
          <span aria-hidden="true" className={playing ? 'icon-stop' : 'icon-play'} />
        </button>
      </div>
      <p className="sound-status" aria-live="polite">
        <span className={`dot dot-${status}`} aria-hidden="true" />
        {disabled ? '음원 준비 중' : statusText[status]}
        {isThis && sound.message && <span className="sound-msg"> · {sound.message}</span>}
      </p>
      <p className="sound-concept">{s.concept}</p>
      <p className="sound-materials">재료: {s.materials.join(', ')}</p>
      {source === 'demo' && (
        <p className="sound-note">
          실제 음원({s.file})은 제작 중입니다. 지금 나오는 소리는 재생 기능을 확인하기 위해 브라우저에서 만든 임시 합성음이며,
          작품이나 위 설명과는 관계가 없습니다.
        </p>
      )}
      {s.tag === '창작 사운드' && (
        <p className="sound-note">신라·고려 음악을 복원한 것이 아니라 새로 만든 사운드입니다. 이어폰 사용을 권해요.</p>
      )}
      {courseHint && (
        <p className="sound-note is-hint">소리 코스는 사운드와 함께 보도록 구성했어요. 한 번 켜면 다음 유물로 넘어가도 이어집니다.</p>
      )}
      {s.credit && <p className="sound-materials">음원: {s.credit}</p>}
    </section>
  );
}

// 다른 화면에서도 재생 상태를 보고 멈출 수 있는 작은 막대
export function MiniPlayer() {
  const sound = useSound();
  if (sound.status !== 'playing' && sound.status !== 'loading') return null;
  const a = sound.artifactId ? getArtifact(sound.artifactId) : undefined;
  if (!a) return null;
  return (
    <div className="mini-player" role="region" aria-label="재생 중인 사운드">
      <span className="dot dot-playing" aria-hidden="true" />
      <a href={href(`/artifact/${a.id}`)} className="mini-title">
        {a.name}
        <small>{sound.source === 'demo' ? '데모 사운드 재생 중' : '사운드 재생 중'}</small>
      </a>
      <button type="button" className="btn btn-quiet btn-small" onClick={sound.stop}>
        정지
      </button>
    </div>
  );
}
