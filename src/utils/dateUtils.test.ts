import { describe, it, expect } from 'vitest';
import { calculateRelativeDeadline } from './dateUtils';
import { parseISO, formatISO } from 'date-fns';

describe('Date Utilities - calculateRelativeDeadline', () => {
  it('calculates the deadline correctly for next class, 1 day before', () => {
    // A weekly class on Mondays
    const rruleStr = 'FREQ=WEEKLY;BYDAY=MO';
    //const startDateStr = '2026-05-04'; // A Monday
    const baseDate = parseISO('2026-05-03T12:00:00Z'); // A Sunday

    // 1 class later = the Monday class on May 4
    // 1 day before = Sunday May 3
    const deadline = calculateRelativeDeadline(rruleStr, baseDate, 1, 1);

    expect(formatISO(deadline, { representation: 'date' })).toBe('2026-05-03');
  });

  it('calculates the deadline correctly for 2 classes later, 2 days before', () => {
    const rruleStr = 'FREQ=WEEKLY;BYDAY=MO';
    //const startDateStr = '2026-05-04';
    const baseDate = parseISO('2026-05-04T12:00:00Z'); // Today is Monday (class day)

    // 2 classes later = next Monday (May 11)
    // 2 days before = Saturday May 9
    const deadline = calculateRelativeDeadline(rruleStr, baseDate, 2, 2);

    expect(formatISO(deadline, { representation: 'date' })).toBe('2026-05-09');
  });
});
