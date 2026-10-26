import { audio, images } from 'virtual:media-manifest';

// 이미지·음원 파일은 public/media/images, public/media/audio 에 콘텐츠 JSON의 파일명 그대로 넣는다.
// 빌드할 때 있는 파일만 목록에 잡히므로, 없는 파일을 요청해 404가 나는 일이 없다.
// 주소는 문서 기준 상대 경로라 GitHub Pages와 Claude 아티팩트 양쪽에서 같은 파일 구조로 동작한다.

const imageSet = new Set(images);
const audioSet = new Set(audio);
const base = import.meta.env.BASE_URL;

export const imageUrl = (file: string): string | undefined =>
  imageSet.has(file) ? `${base}media/images/${file}` : undefined;
export const audioUrl = (file: string): string | undefined =>
  audioSet.has(file) ? `${base}media/audio/${file}` : undefined;
