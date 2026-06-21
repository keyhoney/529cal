import {
  CREDIT_SEM1,
  CREDIT_SEM2,
  DEFAULT_CREDIT,
  SEMESTER1_DATA,
  SEMESTER2_DATA,
} from '../data/conversion-table';

export {
  CREDITS_PER_SEMESTER,
  CREDIT_SEM1,
  CREDIT_SEM2,
  DEFAULT_CREDIT,
  DEFAULT_SEMESTER_ID,
  SEMESTER_OPTIONS,
  getSemesterOption,
  type SemesterOption,
  type SemesterOptionId,
} from '../data/conversion-table';

export interface ConversionResult {
  grade5: number;
  grade9: number;
  percentile: number;
  classRank: number;
  classSize: number;
  isExtrapolated: boolean;
}

type DataPoint = { grade5: number; grade9: number; percentile: number };

function interpolateTable(table: readonly DataPoint[], grade5: number): { grade9: number; percentile: number } {
  const first = table[0];
  const last = table[table.length - 1];

  if (grade5 <= first.grade5) {
    return { grade9: first.grade9, percentile: first.percentile };
  }
  if (grade5 >= last.grade5) {
    const prev = table[table.length - 2];
    const t = (grade5 - prev.grade5) / (last.grade5 - prev.grade5);
    return {
      grade9: prev.grade9 + t * (last.grade9 - prev.grade9),
      percentile: prev.percentile + t * (last.percentile - prev.percentile),
    };
  }

  for (let i = 0; i < table.length - 1; i++) {
    const lo = table[i];
    const hi = table[i + 1];
    if (grade5 >= lo.grade5 && grade5 <= hi.grade5) {
      const t = (grade5 - lo.grade5) / (hi.grade5 - lo.grade5);
      return {
        grade9: lo.grade9 + t * (hi.grade9 - lo.grade9),
        percentile: lo.percentile + t * (hi.percentile - lo.percentile),
      };
    }
  }

  return { grade9: last.grade9, percentile: last.percentile };
}

function clampNine(value: number): number {
  return Math.min(9, Math.max(1, value));
}

function clampPercentile(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function round(n: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
}

export function calcClassRank(percentile: number, classSize = 25): number {
  const rank = Math.ceil((percentile / 100) * classSize);
  return Math.max(1, Math.min(classSize, rank));
}

export function fromGrade5(grade5: number, totalCredits = DEFAULT_CREDIT, classSize = 25): ConversionResult | null {
  if (!Number.isFinite(grade5) || grade5 < 1 || grade5 > 5) return null;
  if (!Number.isFinite(totalCredits) || totalCredits <= 0) return null;

  const sem1 = interpolateTable(SEMESTER1_DATA, grade5);
  const sem2 = interpolateTable(SEMESTER2_DATA, grade5);
  const outOfMeasuredRange = grade5 > 2.5;

  let grade9: number;
  let percentile: number;
  let isExtrapolated = outOfMeasuredRange;

  if (totalCredits <= CREDIT_SEM1) {
    grade9 = sem1.grade9;
    percentile = sem1.percentile;
  } else if (totalCredits <= CREDIT_SEM2) {
    const blend = (totalCredits - CREDIT_SEM1) / (CREDIT_SEM2 - CREDIT_SEM1);
    grade9 = sem1.grade9 + blend * (sem2.grade9 - sem1.grade9);
    percentile = sem1.percentile + blend * (sem2.percentile - sem1.percentile);
  } else {
    grade9 = sem2.grade9;
    percentile = sem2.percentile;

    const sem1Offset = sem1.grade9 - 1;
    const sem2Offset = sem2.grade9 - 1;
    if (sem1Offset > 1e-6 && sem2Offset > 1e-6 && sem2Offset < sem1Offset) {
      let exponent = Math.log(sem2Offset / sem1Offset) / Math.log(0.5);
      exponent = Math.max(0.05, Math.min(3, 1.5 * exponent));
      grade9 = 1 + sem2Offset * (CREDIT_SEM2 / totalCredits) ** exponent;
    }

    if (sem1.percentile > 1e-6 && sem2.percentile > 1e-6 && sem2.percentile < sem1.percentile) {
      let exponent = Math.log(sem2.percentile / sem1.percentile) / Math.log(0.5);
      exponent = Math.max(0.05, Math.min(3, 1.85 * exponent));
      percentile = sem2.percentile * (CREDIT_SEM2 / totalCredits) ** exponent;
    }

    isExtrapolated = true;
  }

  const clampedNine = clampNine(grade9);
  const clampedPercentile = clampPercentile(percentile);

  return {
    grade5,
    grade9: round(clampedNine, 3),
    percentile: round(clampedPercentile, 2),
    classRank: calcClassRank(clampedPercentile, classSize),
    classSize,
    isExtrapolated,
  };
}

export function fromGrade9(grade9: number, totalCredits = DEFAULT_CREDIT, classSize = 25): ConversionResult | null {
  if (!Number.isFinite(grade9) || grade9 < 1 || grade9 > 9) return null;
  if (!Number.isFinite(totalCredits) || totalCredits <= 0) return null;

  let prevFive = 1;
  let prevNine = fromGrade5(1, totalCredits, classSize)?.grade9 ?? 1;

  if (grade9 <= prevNine) {
    const result = fromGrade5(1, totalCredits, classSize);
    return result ? { ...result, grade5: 1, grade9 } : null;
  }

  for (let candidate = 1.01; candidate <= 5 + 1e-9; candidate += 0.01) {
    const five = round(candidate, 2);
    const current = fromGrade5(five, totalCredits, classSize);
    if (!current) continue;

    if (grade9 <= current.grade9) {
      const blendedFive =
        prevFive + ((grade9 - prevNine) / (current.grade9 - prevNine || 1)) * (five - prevFive);
      const result = fromGrade5(blendedFive, totalCredits, classSize);
      return result ? { ...result, grade5: blendedFive, grade9 } : null;
    }

    prevFive = five;
    prevNine = current.grade9;
  }

  const result = fromGrade5(5, totalCredits, classSize);
  return result ? { ...result, grade5: 5, grade9 } : null;
}
