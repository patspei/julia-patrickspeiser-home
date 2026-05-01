import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';

type TimeParts = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const zeroTimeParts: TimeParts = {
  years: 0,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly destroyRef = inject(DestroyRef);

  private readonly now = signal(new Date());

  readonly sinceDate = new Date(2023, 8, 13, 9, 0, 0);
  readonly targetDate = new Date(2026, 9, 2, 14, 30, 0);

  readonly elapsed = computed(() => diffCalendarParts(this.sinceDate, this.now()));
  readonly remaining = computed(() => diffCalendarParts(this.now(), this.targetDate));

  constructor() {
    const intervalId = window.setInterval(() => {
      this.now.set(new Date());
    }, 1000);

    this.destroyRef.onDestroy(() => {
      window.clearInterval(intervalId);
    });
  }
}

function diffCalendarParts(from: Date, to: Date): TimeParts {
  if (to.getTime() <= from.getTime()) {
    return zeroTimeParts;
  }

  let cursor = new Date(from);
  let years = 0;
  let months = 0;

  while (addYears(cursor, 1).getTime() <= to.getTime()) {
    cursor = addYears(cursor, 1);
    years++;
  }

  while (addMonths(cursor, 1).getTime() <= to.getTime()) {
    cursor = addMonths(cursor, 1);
    months++;
  }

  let remainingMs = to.getTime() - cursor.getTime();

  const days = Math.floor(remainingMs / msPerDay);
  remainingMs -= days * msPerDay;

  const hours = Math.floor(remainingMs / msPerHour);
  remainingMs -= hours * msPerHour;

  const minutes = Math.floor(remainingMs / msPerMinute);
  remainingMs -= minutes * msPerMinute;

  const seconds = Math.floor(remainingMs / msPerSecond);

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
  };
}

function addYears(date: Date, years: number): Date {
  return addCalendarMonths(date, years * 12);
}

function addMonths(date: Date, months: number): Date {
  return addCalendarMonths(date, months);
}

function addCalendarMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const originalDay = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + months);

  const lastDayOfTargetMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();

  result.setDate(Math.min(originalDay, lastDayOfTargetMonth));

  return result;
}

const msPerSecond = 1000;
const msPerMinute = 60 * msPerSecond;
const msPerHour = 60 * msPerMinute;
const msPerDay = 24 * msPerHour;
