export const roundTemp = (value: number) => `${Math.round(value)}\u00b0`;

export const formatSpeed = (value: number) => `${value.toFixed(1)} m/s`;

const formatLocalIsoTime = (dateTime: string) => {
  const [, time = '00:00'] = dateTime.split('T');
  const [hourText = '0', minute = '00'] = time.split(':');
  const hour = Number(hourText);
  const period = hour >= 12 ? 'PM' : 'AM';
  const twelveHour = hour % 12 || 12;

  return `${twelveHour}:${minute.padStart(2, '0')} ${period}`;
};

export const formatTime = (dateTime: string) => formatLocalIsoTime(dateTime);

export const formatDay = (date: string) =>
  new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T12:00:00`));

export const formatHour = (dateTime: string) =>
  formatLocalIsoTime(dateTime).replace(':00', '');

export const titleCase = (value: string) =>
  value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
