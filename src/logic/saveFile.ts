// 만든 파일을 이용자에게 건넨다.
// - Claude 아티팩트 안: downloads 기능(이용자가 확인 창에서 허락해야 저장)
// - 그 밖의 브라우저: 일반 다운로드 링크

export type SaveOutcome = 'saved' | 'declined' | 'failed';

let downloadsApi: ReturnType<NonNullable<Window['claude']>['use']> | null = null;

/** 아티팩트의 downloads 기능을 미리 불러 둔다(없으면 null) */
export function prepareDownloads() {
  if (!downloadsApi && window.claude?.use) downloadsApi = window.claude.use('downloads');
  return downloadsApi;
}

export async function saveBlob(blob: Blob, filename: string): Promise<SaveOutcome> {
  const api = await (prepareDownloads() ?? Promise.resolve(null)).catch(() => null);
  if (api) {
    try {
      await api.save({ filename, data: blob });
      return 'saved';
    } catch (e) {
      const code = (e as { code?: string })?.code;
      return code === 'declined' ? 'declined' : 'failed';
    }
  }
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return 'saved';
  } catch {
    return 'failed';
  }
}

/** 휴대폰 공유 시트로 이미지 보내기. 지원하지 않으면 false */
export function canShareFile(file: File) {
  try {
    return !!navigator.canShare?.({ files: [file] });
  } catch {
    return false;
  }
}

export async function shareFile(file: File, text: string): Promise<SaveOutcome> {
  try {
    await navigator.share({ files: [file], text });
    return 'saved';
  } catch (e) {
    return (e as DOMException)?.name === 'AbortError' ? 'declined' : 'failed';
  }
}
