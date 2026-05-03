import { RRule } from 'rrule';
import { subDays, startOfDay, isBefore, isSameDay } from 'date-fns';

export function calculateRelativeDeadline(
  rruleStr: string,
  //startDateStr: string,
  baseDate: Date,
  classesLater: number,
  daysBeforeClass: number
): Date {
  const rrule = RRule.fromString(`RRULE:${rruleStr}`);

  // RRule works with Date objects, but we need to ensure timezones are handled if necessary.
  // For simplicity, we assume local time.
  const allOccurrences = rrule.all();

  // Find occurrences after baseDate
  const futureOccurrences = allOccurrences.filter(d =>
    isBefore(baseDate, d) || isSameDay(baseDate, d)
  ).sort((a, b) => a.getTime() - b.getTime());

  if (futureOccurrences.length < classesLater) {
    throw new Error('Not enough future classes found based on the recurrence rule.');
  }

  // Target class is 1-indexed (e.g. 1 class later = next class = index 0)
  const targetClassDate = futureOccurrences[classesLater - 1];

  const deadlineDate = subDays(targetClassDate, daysBeforeClass);
  return startOfDay(deadlineDate);
}

export function formatTime(timeStr: string) {
  // Simple HH:mm to HH:mm, or any formatting needed
  return timeStr;
}
