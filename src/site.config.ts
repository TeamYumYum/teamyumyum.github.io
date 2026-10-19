export const SITE = {
  url: 'https://teamyumyum.github.io',
  title: '꾸기 테크',
  team: 'TeamYumYum',
  description:
    'AI 건강 코치 꾸기를 만드는 TeamYumYum의 기술 블로그. 기술, 트러블슈팅, 팀 문화를 기록합니다.',
  // 홈 첫 화면의 선언문. 줄바꿈은 Hero가 pre-line으로 그대로 살린다.
  statement: '기록은 꾸기가 준비하고,\n당신은 확인만 하면 돼요',
  lead: '꾸기를 만들며 배운 기술과 부딪힌 문제, 일하는 방식을 솔직하게 나눠요.',
  links: {
    github: 'https://github.com/TeamYumYum',
    product: 'https://github.com/TeamYumYum/kkugi',
  },
  // giscus.app에서 발급한 뒤 채운다. repoId나 categoryId가 비어 있으면 댓글을 그리지 않는다.
  giscus: {
    repo: 'TeamYumYum/teamyumyum.github.io',
    repoId: '',
    category: 'Announcements',
    categoryId: '',
  },
} as const;

/**
 * layout: 'doc'  → 넓은 본문 + 목차 (기술·트러블슈팅)
 * layout: 'read' → 좁은 본문 + 목차 없음 (문화·소식)
 */
export const CATEGORIES = [
  { id: 'tech', name: '기술', layout: 'doc', description: '설계와 구현, 실험의 기록' },
  { id: 'troubleshooting', name: '트러블슈팅', layout: 'doc', description: '부딪힌 문제와 원인, 해결 과정' },
  { id: 'culture', name: '문화', layout: 'read', description: '리뷰데이, 회고, 팀이 일하는 방식' },
  { id: 'news', name: '소식', layout: 'read', description: '꾸기와 팀의 새 소식' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export function getCategory(id: string) {
  const found = CATEGORIES.find((c) => c.id === id);
  if (!found) throw new Error(`알 수 없는 카테고리: ${id}`);
  return found;
}

/**
 * 팀 페이지의 도메인 소개. 각 도메인은 담당자 한 명이 폰 화면부터 서버, DB까지 세로로 맡는다.
 * 담당자는 authors.json의 context 값으로 연결된다.
 */
export const CONTEXTS = [
  { id: 'Member', name: '회원', summary: '소셜 로그인, 온보딩, 신체 정보와 건강 목표가 담긴 프로필' },
  { id: 'Meal', name: '식단', summary: '사진 한 장으로 남기는 식사 기록, 음식 인식 결과와 회원이 고친 값' },
  { id: 'Workout', name: '운동', summary: '루틴과 운동 세션, 세트 기록, 소모 칼로리와 볼륨' },
  { id: 'Coaching', name: '코칭', summary: '목표 칼로리와 영양 비율, 하루·주간 달성 판정, 주간 리포트' },
  { id: 'Growth', name: '성장', summary: '함께 자라는 캐릭터 꾸기, 스트릭, 마일스톤과 뱃지' },
  { id: 'Admin', name: '검수', summary: 'AI 예측과 회원 수정 결과를 검수해 모델 학습으로 되돌리는 루프' },
] as const;
