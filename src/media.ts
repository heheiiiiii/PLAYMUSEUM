// 이미지·음원 파일은 src/media/images, src/media/audio 에 콘텐츠 JSON의 파일명 그대로 넣는다.
// 빌드할 때 있는 파일만 목록에 잡히므로, 없는 파일을 요청해 404가 나는 일이 없다.

const images = import.meta.glob('./media/images/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const audio = import.meta.glob('./media/audio/*.{mp3,m4a,ogg,wav}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export const imageUrl = (file: string): string | undefined => images[`./media/images/${file}`];
export const audioUrl = (file: string): string | undefined => audio[`./media/audio/${file}`];
