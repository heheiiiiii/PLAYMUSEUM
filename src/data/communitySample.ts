import type { ScriptKey, TasteKey } from '../content';

// 커뮤니티 예시 데이터 (시연용)
// 서버가 없어서 다른 관람객의 실제 기록을 모을 수 없다. 화면에는 반드시 ‘예시’로 표시한다.
// 감상평은 해설 원고에 있는 내용 안에서 느낀 점만 쓰고, 새로운 역사적 사실을 만들지 않는다.

/** 취향별 예시 관람객 수 */
export const sampleVisitors: Record<TasteKey, number> = {
  people: 14,
  history: 11,
  craft: 12,
  mystery: 13,
  daily: 10,
  music: 8,
};

/** 취향별로 각 유물을 저장한 예시 관람객 수 */
export const sampleSaves: Record<TasteKey, Record<string, number>> = {
  people: { A01: 9, A02: 8, A03: 4, A06: 3, A07: 7, A08: 6, A04: 2, A05: 6 },
  history: { A01: 9, A02: 7, A03: 5, A06: 3, A07: 2, A08: 2, A04: 4, A05: 3 },
  craft: { A01: 3, A02: 5, A03: 9, A06: 6, A07: 3, A08: 2, A04: 10, A05: 8 },
  mystery: { A01: 10, A02: 9, A03: 11, A06: 6, A07: 2, A08: 3, A04: 4, A05: 3 },
  daily: { A01: 2, A02: 3, A03: 2, A06: 8, A07: 7, A08: 8, A04: 5, A05: 4 },
  music: { A01: 3, A02: 2, A03: 6, A06: 2, A07: 7, A08: 1, A04: 4, A05: 6 },
};

export interface SampleReview {
  id: string;
  artifactId: string;
  taste: TasteKey;
  nickname: string;
  lens: ScriptKey;
  text: string;
}

export const sampleReviews: SampleReview[] = [
  { id: 'r01', artifactId: 'A01', taste: 'mystery', nickname: '퇴근길관람', lens: 'mystery', text: '기단에서 손오공 일행을 찾느라 한참 서 있었어요. 소설보다 탑이 먼저라는 게 계속 머리에 남네요.' },
  { id: 'r02', artifactId: 'A01', taste: 'people', nickname: '주말산책자', lens: 'people', text: '일본으로 실려 갔다가 돌아온 탑이라니. 그걸 알린 외국인들 이야기를 듣고 나니 탑이 달라 보였어요.' },
  { id: 'r03', artifactId: 'A01', taste: 'daily', nickname: '고궁덕후', lens: 'daily', text: '어릴 때 경복궁에서 본 것 같은데, 그게 이 탑이었을지도 모르겠어요.' },
  { id: 'r04', artifactId: 'A02', taste: 'people', nickname: '사극매니아', lens: 'people', text: '왕비의 관이 왕보다 화려하다는 대목에서 멈췄어요. 정답이 없다는 게 오히려 좋았어요.' },
  { id: 'r05', artifactId: 'A02', taste: 'mystery', nickname: '질문수집', lens: 'mystery', text: '살아서 쓴 관인지 장례용인지, 두 주장을 들으니 금관을 보는 눈이 바뀌었어요.' },
  { id: 'r06', artifactId: 'A03', taste: 'music', nickname: '느린관람', lens: 'base', text: '사유의 방에서는 사운드를 아주 작게 켜고 오래 앉아 있었어요. 생각이 정리되는 느낌.' },
  { id: 'r07', artifactId: 'A03', taste: 'craft', nickname: '금속공예전공', lens: 'craft', text: '두 상의 두께가 4mm와 10mm라는 걸 알고 다시 보니 날렵함과 묵직함이 확실히 다르네요.' },
  { id: 'r08', artifactId: 'A03', taste: 'mystery', nickname: '질문수집', lens: 'mystery', text: '‘미륵’이라는 이름조차 확정이 아니라는 게 제일 놀라웠어요.' },
  { id: 'r09', artifactId: 'A06', taste: 'daily', nickname: '동네구경꾼', lens: 'daily', text: '구경꾼들 앉은 자세가 너무 생생해서 저도 그 원 안에 끼어 앉은 기분이었어요.' },
  { id: 'r10', artifactId: 'A06', taste: 'craft', nickname: '드로잉하는사람', lens: 'craft', text: '배경 없이 사람만으로 긴장감을 만든 구도. 도장이 어디 있는지 찾는 재미도 있었어요.' },
  { id: 'r11', artifactId: 'A07', taste: 'music', nickname: '국악입문', lens: 'craft', text: '그림 속 여섯 악기를 하나씩 찾고 나서 사운드를 켜니까 그림에서 소리가 나는 것 같았어요.' },
  { id: 'r12', artifactId: 'A07', taste: 'people', nickname: '사극매니아', lens: 'people', text: '춤추는 아이의 이름을 알 수 없다는 문장이 오래 남았어요.' },
  { id: 'r13', artifactId: 'A08', taste: 'daily', nickname: '초등교사', lens: 'daily', text: '우는 아이, 웃는 친구들, 난처한 훈장. 지금 교실이랑 똑같아서 웃었어요.' },
  { id: 'r14', artifactId: 'A04', taste: 'craft', nickname: '도예공방', lens: 'craft', text: '작은 향로 하나에 기법이 다 들어 있다는 설명을 듣고 한 바퀴 돌며 하나씩 찾아봤어요.' },
  { id: 'r15', artifactId: 'A04', taste: 'mystery', nickname: '퇴근길관람', lens: 'mystery', text: '받침의 토끼 세 마리, 처음엔 귀엽기만 했는데 이유를 듣고 나니 다르게 보였어요.' },
  { id: 'r16', artifactId: 'A05', taste: 'craft', nickname: '도예공방', lens: 'craft', text: '완벽한 원이 아니라서 편안하다는 말에 공감해요. 좌우 선을 오래 따라가 봤어요.' },
  { id: 'r17', artifactId: 'A05', taste: 'music', nickname: '느린관람', lens: 'base', text: '작은 방에서 달항아리만 보고 있으니 시간이 천천히 가요. 제 최애 공간.' },
  { id: 'r18', artifactId: 'A05', taste: 'people', nickname: '주말산책자', lens: 'people', text: '김환기와 최순우, 두 친구가 이 항아리를 아꼈다는 이야기가 좋았어요.' },
];
