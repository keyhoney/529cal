export type WizardStep = 1 | 2 | 3 | 4;

import { SITE_URL } from '../config/site';

export { SITE_URL };

const STEP_LABELS = ['이수 학기', '등급 입력', '환산 결과', '입결 조회'] as const;

export function getStepLabel(step: WizardStep): string {
  return STEP_LABELS[step - 1];
}

export function parseWizardState(search: string): {
  step: WizardStep | null;
  semester: string | null;
  grade5: string | null;
  grade9: string | null;
} {
  const params = new URLSearchParams(search);
  const stepRaw = parseInt(params.get('step') ?? '', 10);
  const step = stepRaw >= 1 && stepRaw <= 4 ? (stepRaw as WizardStep) : null;
  return {
    step,
    semester: params.get('sem'),
    grade5: params.get('g5'),
    grade9: params.get('g9'),
  };
}

export function buildShareUrl(data: {
  step?: WizardStep;
  semester: string;
  grade5: string;
  grade9: string;
}): string {
  const params = new URLSearchParams();
  params.set('sem', data.semester);
  params.set('g5', data.grade5);
  params.set('g9', data.grade9);
  if (data.step) params.set('step', String(data.step));
  return `${SITE_URL}?${params.toString()}`;
}

export async function shareSite(): Promise<'shared' | 'unsupported' | 'cancelled'> {
  if (!navigator.share) return 'unsupported';

  try {
    await navigator.share({
      title: '529Cal · 내신 환산 · 입결 조회',
      text: '5등급제·9등급제 내신 환산과 대학별 입결을 확인해 보세요!',
      url: SITE_URL,
    });
    return 'shared';
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    throw err;
  }
}

export function buildShareText(data: {
  semesterLabel: string;
  grade5: string;
  grade9: string;
  percentile: string;
  tier: string;
}): string {
  return [
    '📊 내 내신 환산 결과',
    `${data.semesterLabel}`,
    `5등급 ${data.grade5} · 9등급 ${data.grade9}`,
    `누적 백분위 상위 ${data.percentile}% (${data.tier})`,
    '529Cal에서 입결도 확인해 보세요!',
  ].join('\n');
}
