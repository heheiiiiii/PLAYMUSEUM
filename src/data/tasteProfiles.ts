import type { SentenceLabel, TasteKey } from '../content';

// 결과 화면 문구. 성격 진단이 아니라 콘텐츠 추천용 분류이므로
// "~일 수 있어요"처럼 선택을 설명하는 말투로 쓴다.

export interface TasteProfile {
  key: TasteKey;
  persona: string;
  /** 결과 화면 한 줄 설명 */
  fit: string;
  /** 추천 관람 방식 */
  howTo: string[];
}

export const tasteProfiles: Record<TasteKey, TasteProfile> = {
  people: {
    key: 'people',
    persona: '뒷이야기 수집가',
    fit: '유물 곁에 있던 사람들, 그들의 관계와 갈등을 따라가며 보는 방식이 잘 맞을 수 있어요.',
    howTo: [
      '기본 해설을 들은 뒤 ‘인물·관계’ 해설로 넘어가 보세요.',
      '기록으로 확인된 이야기와 전해지는 이야기를 구분해 표시해 두었어요.',
    ],
  },
  history: {
    key: 'history',
    persona: '시대 추적자',
    fit: '유물이 지나온 시대와 사건을 함께 놓고 보는 방식이 잘 맞을 수 있어요.',
    howTo: [
      '‘역사’ 해설에서 유물이 만들어진 때의 사회 분위기를 확인해 보세요.',
      '시대 여행 코스는 시대순이라 층을 오가며 관람해요.',
    ],
  },
  craft: {
    key: 'craft',
    persona: '미감 탐닉자',
    fit: '색과 형태, 재료와 만든 솜씨를 오래 들여다보는 방식이 잘 맞을 수 있어요.',
    howTo: [
      '‘미감·기술’ 해설이 알려 주는 부분을 실제 유물에서 찾아보세요.',
      '정면만 보지 말고 옆과 뒤로 돌아가 보는 것도 좋아요.',
    ],
  },
  mystery: {
    key: 'mystery',
    persona: '미스터리 탐험가',
    fit: '숨겨진 의미와 아직 풀리지 않은 질문을 중심으로 감상하는 방식이 잘 맞을 수 있어요.',
    howTo: [
      '‘미스터리’ 해설은 학설이 갈리는 부분을 추정·해석 표시와 함께 보여 줘요.',
      '정답보다 질문을 하나씩 모아 가는 관람을 추천해요.',
    ],
  },
  daily: {
    key: 'daily',
    persona: '생활 공감가',
    fit: '그 시절 사람들이 이 물건을 어떻게 쓰고 느꼈을지 떠올리며 보는 방식이 잘 맞을 수 있어요.',
    howTo: [
      '‘일상’ 해설에서 당시 사람들의 하루를 상상해 보세요.',
      '그림 속 인물의 옷차림과 손동작도 눈여겨보세요.',
    ],
  },
  music: {
    key: 'music',
    persona: '감각 몰입가',
    fit: '음악과 소리, 공간의 분위기와 함께 천천히 감상하는 방식이 잘 맞을 수 있어요.',
    howTo: [
      '이어폰을 끼고 유물마다 사운드를 켜 보세요. 한 번 켜면 다음 유물에서도 이어져요.',
      '해설은 ‘미감·기술’ 관점을 먼저 보여 드려요.',
    ],
  },
};

// 문장 라벨 안내 (콘텐츠 데이터 명세의 '의미' 열)
export const labelMeanings: Record<SentenceLabel, string> = {
  fact: '기록·발굴·분석으로 확인된 내용',
  interpretation: '학계나 박물관의 해석',
  conjecture: '학설이 갈리거나 확정되지 않은 내용',
  legend: '전해지는 말, 출처를 확인할 수 없는 일화',
};
