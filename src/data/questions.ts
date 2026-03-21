export interface Question {
  id: string;
  text: string;
  options: { key: string; label: string }[];
}

export const questions: Question[] = [
  {
    id: "q1",
    text: "내가 제일 좋아하는 음식은?",
    options: [
      { key: "A", label: "한식" },
      { key: "B", label: "양식" },
      { key: "C", label: "중식" },
      { key: "D", label: "일식" },
    ],
  },
  {
    id: "q2",
    text: "주말에 나는?",
    options: [
      { key: "A", label: "집에서 쉬기" },
      { key: "B", label: "밖에 나가기" },
    ],
  },
  {
    id: "q3",
    text: "내 MBTI에서 E vs I?",
    options: [
      { key: "A", label: "E (외향)" },
      { key: "B", label: "I (내향)" },
    ],
  },
  {
    id: "q4",
    text: "영화 볼 때?",
    options: [
      { key: "A", label: "액션/SF" },
      { key: "B", label: "로맨스/드라마" },
      { key: "C", label: "코미디" },
      { key: "D", label: "공포" },
    ],
  },
  {
    id: "q5",
    text: "여행 스타일?",
    options: [
      { key: "A", label: "계획형" },
      { key: "B", label: "즉흥형" },
    ],
  },
  {
    id: "q6",
    text: "아침형 vs 저녁형?",
    options: [
      { key: "A", label: "아침형" },
      { key: "B", label: "저녁형" },
    ],
  },
  {
    id: "q7",
    text: "강아지 vs 고양이?",
    options: [
      { key: "A", label: "강아지" },
      { key: "B", label: "고양이" },
    ],
  },
  {
    id: "q8",
    text: "짜장 vs 짬뽕?",
    options: [
      { key: "A", label: "짜장" },
      { key: "B", label: "짬뽕" },
    ],
  },
  {
    id: "q9",
    text: "카페에서?",
    options: [
      { key: "A", label: "아메리카노" },
      { key: "B", label: "라떼/달달한 거" },
    ],
  },
  {
    id: "q10",
    text: "스트레스 풀 때?",
    options: [
      { key: "A", label: "먹기" },
      { key: "B", label: "자기" },
      { key: "C", label: "운동" },
      { key: "D", label: "쇼핑" },
    ],
  },
];
