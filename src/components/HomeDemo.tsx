import { useState } from 'react';
import { content, getArtifact, getTaste, lensName, type TasteKey } from '../content';
import { tasteProfiles } from '../data/tasteProfiles';
import { href } from '../router';
import { ArtifactImage } from './ArtifactImage';
import { Character } from './Character';
import { ScriptView } from './ScriptView';

// 홈 첫 화면의 체험 데모: 캐릭터를 고르면 같은 유물의 해설이 그 자리에서 바뀐다.
const DEMO_IDS = ['A02', 'A01', 'A05'];

export function HomeDemo({ initial }: { initial: TasteKey | null }) {
  const demo = DEMO_IDS.map(getArtifact).filter((a) => !!a);
  const [index, setIndex] = useState(0);
  const [taste, setTaste] = useState<TasteKey>(initial ?? 'people');
  const a = demo[index % demo.length]!;
  const p = tasteProfiles[taste];
  const lens = getTaste(taste)!.maps_to.lens;
  const lensInfo = content.lenses.find((l) => l.key === lens)!;

  return (
    <section className="demo" aria-labelledby="demo-title">
      <div className="demo-artifact">
        <ArtifactImage artifact={a} variant="thumb" />
        <div>
          <p className="eyebrow" id="demo-title">
            같은 유물, 다른 이야기
          </p>
          <p className="demo-name">{a.name}</p>
          <p className="meta">{a.era}</p>
        </div>
        <button type="button" className="btn btn-text btn-small demo-next" onClick={() => setIndex(index + 1)}>
          다른 유물
        </button>
      </div>

      <div className="demo-picker" role="radiogroup" aria-label="누구의 눈으로 볼까요?">
        {content.tastes.map((t) => (
          <button
            key={t.key}
            type="button"
            role="radio"
            aria-checked={taste === t.key}
            className={taste === t.key ? 'is-on' : ''}
            onClick={() => setTaste(t.key)}
          >
            <Character taste={t.key} size={48} decorative />
            <span>{tasteProfiles[t.key].character}</span>
          </button>
        ))}
      </div>

      <div className="demo-story" key={`${a.id}-${taste}`} aria-live="polite">
        <p className="demo-who">
          <strong>{p.persona}</strong> {p.character}에게는 이렇게 들려줘요
        </p>
        <h3 className="demo-q">
          <span className="demo-lens">{lensInfo.name}</span>
          {lensInfo.question}
        </h3>
        <ScriptView script={a.lenses[lens]} limit={2} />
        {taste === 'music' && <p className="meta">사운드와 함께 · {a.sound.mood.join(' · ')}</p>}
        <a className="btn-link" href={href(`/artifact/${a.id}?lens=${lens}`)}>
          ‘{lensName(lens)}’ 해설 이어서 읽기
        </a>
      </div>
      <p className="fineprint">기본 해설은 모두에게 같고, 그다음 이야기가 취향에 따라 달라져요.</p>
    </section>
  );
}
