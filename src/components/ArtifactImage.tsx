import { useState } from 'react';
import type { Artifact } from '../content';
import { imageUrl } from '../media';

// 이미지 파일이 없거나 불러오지 못하면 자리표시자(유물 이름)를 보여 준다.
export function ArtifactImage({ artifact, variant = 'card' }: { artifact: Artifact; variant?: 'card' | 'hero' | 'thumb' }) {
  const url = imageUrl(artifact.image.file);
  const [failed, setFailed] = useState(false);
  if (url && !failed) {
    return (
      <div className={`art-image art-${variant}`}>
        <img src={url} alt={artifact.name} loading="lazy" onError={() => setFailed(true)} />
      </div>
    );
  }
  return (
    <div className={`art-image art-${variant} is-placeholder`} role="img" aria-label={`${artifact.name} (이미지 준비 중)`}>
      <span className="ph-id">{artifact.id}</span>
      {variant !== 'thumb' && <span className="ph-name">{artifact.name}</span>}
      {variant === 'hero' && <span className="ph-note">이미지 준비 중 · 이용 조건 확인 후 게재</span>}
    </div>
  );
}
