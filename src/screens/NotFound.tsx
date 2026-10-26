import { href } from '../router';

export function NotFound() {
  return (
    <main className="page narrow empty">
      <h1>찾는 화면이 없어요</h1>
      <p>주소가 바뀌었거나 없는 유물일 수 있어요.</p>
      <div className="actions">
        <a className="btn btn-primary" href={href('/')}>
          처음 화면으로
        </a>
        <a className="btn btn-quiet" href={href('/artifacts')}>
          전체 유물 보기
        </a>
      </div>
    </main>
  );
}
