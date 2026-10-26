import type { TasteKey } from '../content';

// 취향 테스트 문항 (초안)
// 콘텐츠 명세에 따라 문항 자체는 UX 담당이 확정한다. 아래는 시연용 초안이며,
// 이 파일만 고치면 테스트 화면과 점수 계산에 그대로 반영된다.
//
// 규칙
// - 질문마다 선택지 하나를 고른다.
// - 선택지의 points는 취향 키별 점수다. 한 선택지가 여러 취향에 점수를 줄 수 있다.
// - 취향 키는 content.tastes[].key 와 같아야 한다.

export interface QuizOption {
  id: string;
  text: string;
  points: Partial<Record<TasteKey, number>>;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  hint?: string;
  options: QuizOption[];
}

export const quiz: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: '전시실에서 한 작품 앞에 오래 머문다면, 주로 어떤 이유일까요?',
    options: [
      { id: 'q1a', text: '이걸 둘러싼 사람들의 사연이 궁금해서', points: { people: 2 } },
      { id: 'q1b', text: '이 작품이 만들어진 시대가 어떤 때였는지 알고 싶어서', points: { history: 2 } },
      { id: 'q1c', text: '색과 형태, 만든 솜씨에 눈길이 가서', points: { craft: 2 } },
      { id: 'q1d', text: '설명이 잘 안 되는 이상한 부분이 보여서', points: { mystery: 2 } },
      { id: 'q1e', text: '그 시절 사람들이 이걸 어떻게 썼을지 떠올라서', points: { daily: 2 } },
      { id: 'q1f', text: '작품 주변의 분위기와 느낌에 빠져서', points: { music: 2 } },
    ],
  },
  {
    id: 'q2',
    prompt: '주말에 다큐멘터리 한 편을 고른다면?',
    options: [
      { id: 'q2a', text: '인물들의 관계와 권력 다툼을 따라가는 이야기', points: { people: 2 } },
      { id: 'q2b', text: '한 시대가 어떻게 바뀌었는지 정리해 주는 역사 다큐', points: { history: 2 } },
      { id: 'q2c', text: '장인이 무언가를 만드는 과정을 가까이 보여 주는 다큐', points: { craft: 2 } },
      { id: 'q2d', text: '아직 풀리지 않은 고고학 수수께끼를 다룬 다큐', points: { mystery: 2 } },
      { id: 'q2e', text: '옛사람들의 음식, 옷, 집을 다룬 생활사 다큐', points: { daily: 2 } },
      { id: 'q2f', text: '음악과 영상미가 좋아서 틀어 두고 싶은 다큐', points: { music: 2 } },
    ],
  },
  {
    id: 'q3',
    prompt: '여행지에서 가장 오래 기억에 남는 순간은?',
    options: [
      { id: 'q3a', text: '그 동네 사람에게 들은 옛날이야기', points: { people: 1, daily: 1 } },
      { id: 'q3b', text: '유적 안내판에서 알게 된 그곳의 역사', points: { history: 2 } },
      { id: 'q3c', text: '건축물의 장식을 가까이 들여다본 순간', points: { craft: 2 } },
      { id: 'q3d', text: '아무도 정확한 답을 모른다는 유적의 수수께끼', points: { mystery: 2 } },
      { id: 'q3e', text: '시장 골목에서 본 사람들의 하루', points: { daily: 2 } },
      { id: 'q3f', text: '해 질 녘 그곳의 소리와 공기', points: { music: 2 } },
    ],
  },
  {
    id: 'q4',
    prompt: '오디오 가이드에서 이런 문장이 들리면 귀가 번쩍 뜨이나요?',
    options: [
      { id: 'q4a', text: '“이 물건의 주인은 사실…”', points: { people: 2 } },
      { id: 'q4b', text: '“이 무렵 나라 안팎에서는…”', points: { history: 2 } },
      { id: 'q4c', text: '“여기 이 부분을 가까이 보세요.”', points: { craft: 2 } },
      { id: 'q4d', text: '“아직 학자들도 답을 찾지 못했습니다.”', points: { mystery: 2 } },
      { id: 'q4e', text: '“당시 사람들은 이것을 날마다…”', points: { daily: 2 } },
      { id: 'q4f', text: '말보다 음악이 흐르는 순간이 더 좋다', points: { music: 2 } },
    ],
  },
  {
    id: 'q5',
    prompt: '오늘 관람에서 하나만 얻어 간다면?',
    hint: '가장 가까운 것 하나를 골라 주세요.',
    options: [
      { id: 'q5a', text: '누군가의 삶에 공감한 순간', points: { people: 2 } },
      { id: 'q5b', text: '시대의 흐름이 머릿속에 정리되는 느낌', points: { history: 2 } },
      { id: 'q5c', text: '아름답다고 느낀 장면 하나', points: { craft: 2 } },
      { id: 'q5d', text: '집에 가서 더 찾아보고 싶은 질문 하나', points: { mystery: 2 } },
      { id: 'q5e', text: '옛사람들도 우리와 비슷했구나 하는 발견', points: { daily: 2 } },
      { id: 'q5f', text: '오래 남는 분위기와 여운', points: { music: 2 } },
    ],
  },
];
