export class RangeValidator {
  private maxConsecutiveRepeats: number;

  constructor(maxConsecutiveRepeats: number) {
    this.maxConsecutiveRepeats = maxConsecutiveRepeats;
  }

  isValidRange(key: string): boolean {
    let last = key[0];
    let count = 1;

    for (let i = 1; i < key.length; i++) {
      if (key[i] === last) {
        count++;
        if (count > this.maxConsecutiveRepeats) {
          return false;
        }
      } else {
        count = 1;
        last = key[i];
      }
    }

    return true;
  }
}

