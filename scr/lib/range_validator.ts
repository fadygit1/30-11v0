export class RangeValidator {
  constructor(private maxConsecutiveRepeats: number) {}

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

  generateValidSubranges(start: string, end: string, fixedPrefixLength: number): Array<[string, string]> {
    const ranges: Array<[string, string]> = [];
    let current = start;

    while (current <= end) {
      if (this.isValidRange(current)) {
        let rangeEnd = current;
        for (let i = current.length - 1; i >= fixedPrefixLength; i--) {
          if (rangeEnd[i] !== 'f') {
            const charCode = rangeEnd.charCodeAt(i) + 1;
            rangeEnd = rangeEnd.slice(0, i) + 
                      String.fromCharCode(charCode) +
                      rangeEnd.slice(i + 1);
            break;
          }
          rangeEnd = rangeEnd.slice(0, i) + '0' + rangeEnd.slice(i + 1);
        }
        
        if (rangeEnd > end) rangeEnd = end;
        ranges.push([current, rangeEnd]);
        
        // Move to next range
        current = rangeEnd;
        for (let i = current.length - 1; i >= 0; i--) {
          if (current[i] !== 'f') {
            const charCode = current.charCodeAt(i) + 1;
            current = current.slice(0, i) + 
                     String.fromCharCode(charCode) +
                     current.slice(i + 1);
            break;
          }
          current = current.slice(0, i) + '0' + current.slice(i + 1);
        }
      } else {
        // Skip invalid range
        for (let i = current.length - 1; i >= fixedPrefixLength; i--) {
          if (current[i] !== 'f') {
            const charCode = current.charCodeAt(i) + 1;
            current = current.slice(0, i) + 
                     String.fromCharCode(charCode) +
                     current.slice(i + 1);
            break;
          }
          current = current.slice(0, i) + '0' + current.slice(i + 1);
        }
      }
    }

    return ranges;
  }
}

