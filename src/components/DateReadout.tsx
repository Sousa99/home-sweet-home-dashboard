import { useEffect, useState } from 'react';

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
});

export function useDate(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function DateReadout() {
  const now = useDate();
  return (
    <time dateTime={now.toISOString()} className="text-sm font-medium text-slate-500">
      {DATE_FORMAT.format(now)}
    </time>
  );
}
