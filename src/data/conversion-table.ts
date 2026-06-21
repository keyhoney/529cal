/** 학기당 예상 이수 학점 */
export const CREDITS_PER_SEMESTER = 34;

/** 1학기 누적 학점 (실측 기준) */
export const CREDIT_SEM1 = CREDITS_PER_SEMESTER;
/** 1~2학기 누적 학점 (실측 기준) */
export const CREDIT_SEM2 = CREDITS_PER_SEMESTER * 2;
export const DEFAULT_CREDIT = CREDIT_SEM2;

export type SemesterOptionId = 'g1s1' | 'g1s2' | 'g2s1' | 'g2s2' | 'g3s1' | 'g3s2';

export interface SemesterOption {
  id: SemesterOptionId;
  label: string;
  semesters: number;
  credits: number;
}

export const SEMESTER_OPTIONS: SemesterOption[] = [
  { id: 'g1s1', label: '고1 1학기', semesters: 1, credits: 34 },
  { id: 'g1s2', label: '고1 2학기', semesters: 2, credits: 68 },
  { id: 'g2s1', label: '고2 1학기', semesters: 3, credits: 102 },
  { id: 'g2s2', label: '고2 2학기', semesters: 4, credits: 136 },
  { id: 'g3s1', label: '고3 1학기', semesters: 5, credits: 170 },
  { id: 'g3s2', label: '고3 2학기', semesters: 6, credits: 192 },
];

export const DEFAULT_SEMESTER_ID: SemesterOptionId = 'g1s2';

export function getSemesterOption(id: SemesterOptionId): SemesterOption {
  return SEMESTER_OPTIONS.find((o) => o.id === id) ?? SEMESTER_OPTIONS[1];
}

export const SEMESTER1_DATA = [
  { grade5: 1.0, grade9: 1.591889144544799, percentile: 1.8935935299975961 },
  { grade5: 1.167, grade9: 1.84, percentile: 3.58 },
  { grade5: 1.333, grade9: 2.14, percentile: 6.4 },
  { grade5: 1.5, grade9: 2.48, percentile: 9.5 },
  { grade5: 2.0, grade9: 3.44, percentile: 22 },
  { grade5: 2.5, grade9: 4.22, percentile: 36 },
] as const;

export const SEMESTER2_DATA = [
  { grade5: 1.0, grade9: (1.39 * 16110 + 20779.95) / 30441, percentile: 1.2470779540750963 },
  { grade5: 1.083, grade9: 1.53, percentile: 1.95 },
  { grade5: 1.167, grade9: 1.73, percentile: 3.09 },
  { grade5: 1.333, grade9: 1.95, percentile: 5.15 },
  { grade5: 1.417, grade9: 2.18, percentile: 6.38 },
  { grade5: 1.5, grade9: 2.45, percentile: 7.3 },
  { grade5: 1.583, grade9: 2.45, percentile: 9.06 },
  { grade5: 1.667, grade9: 2.7, percentile: 12.01 },
  { grade5: 2.0, grade9: 3.3976298413324133, percentile: (299484.9 + 17.42 * 14331) / 30441 },
  { grade5: 2.5, grade9: (67984.2 + 4.2 * 14331) / 30441, percentile: 31.64402582043954 },
] as const;

export const GYEONGGI_WEIGHT = 16110;
export const BUSAN_WEIGHT = 14331;
