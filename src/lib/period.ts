export type Period = {
  start: Date; // inclusive
  end: Date;   // exclusive
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

export function getPeriodForDate(today: Date, monthStartDay: number): Period {
  const d = startOfDay(today);

  // Determine the period start
  // If today day >= monthStartDay → start is this month at monthStartDay
  // else → start is previous month at monthStartDay
  const startThisMonth = new Date(d.getFullYear(), d.getMonth(), monthStartDay);

  const start =
    d.getDate() >= monthStartDay
      ? startThisMonth
      : addMonths(startThisMonth, -1);

  const end = addMonths(start, 1); // exclusive end

  return { start, end };
}

export function toISODate(date: Date) {
  // YYYY-MM-DD
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
