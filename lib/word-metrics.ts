export function getAccuracy(timesPracticed: number, timesCorrect: number): number {
  if (timesPracticed === 0) {
    return 0;
  }

  return Number(((timesCorrect / timesPracticed) * 100).toFixed(1));
}

export function needsPractice(timesPracticed: number, timesCorrect: number): boolean {
  if (timesPracticed === 0) {
    return true;
  }
  if (timesPracticed < 3) {
    return true;
  }
  return getAccuracy(timesPracticed, timesCorrect) < 70;
}

export function practicePriority(timesPracticed: number, timesCorrect: number): number {
  if (timesPracticed === 0) {
    return 3;
  }
  if (timesPracticed < 3) {
    return 2;
  }
  if (getAccuracy(timesPracticed, timesCorrect) < 70) {
    return 1;
  }
  return 0;
}
