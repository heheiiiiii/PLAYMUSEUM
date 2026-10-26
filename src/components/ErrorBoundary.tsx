import { Component, type ReactNode } from 'react';
import { clearAll } from '../logic/storage';

interface State {
  error: Error | null;
}

// 화면 오류가 나도 빈 화면 대신 돌아갈 길을 보여 준다.
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="page narrow error-page">
        <h1>화면을 여는 중에 문제가 생겼어요</h1>
        <p>잠시 후 다시 시도하거나 처음 화면으로 돌아가 주세요. 계속 같은 문제가 생기면 이 브라우저에 저장된 기록을 지우고 다시 시작할 수 있어요.</p>
        <div className="actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              window.location.hash = '#/';
              this.setState({ error: null });
            }}
          >
            처음 화면으로
          </button>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => {
              clearAll();
              window.location.hash = '#/';
              window.location.reload();
            }}
          >
            저장된 기록 지우고 다시 시작
          </button>
        </div>
      </main>
    );
  }
}
