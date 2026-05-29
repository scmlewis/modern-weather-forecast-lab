export type TemperatureUnit = 'c' | 'f';
export type TimeMode = 'location' | 'device';

const toFahrenheit = (value: number) => (value * 9) / 5 + 32;

export const convertTemp = (value: number, unit: TemperatureUnit) =>
  unit === 'f' ? toFahrenheit(value) : value;

export const roundTemp = (value: number, unit: TemperatureUnit = 'c') =>
  `${Math.round(convertTemp(value, unit))}\u00b0`;

export const formatTempLabel = (value: number, unit: TemperatureUnit) =>
  `${Math.round(convertTemp(value, unit))}\u00b0${unit.toUpperCase()}`;

export const formatSpeed = (value: number) => `${value.toFixed(1)} m/s`;

const formatLocalIsoTime = (dateTime: string) => {
  const [, time = '00:00'] = dateTime.split('T');
  const [hourText = '0', minute = '00'] = time.split(':');
  const hour = Number(hourText);
  const period = hour >= 12 ? 'PM' : 'AM';
  const twelveHour = hour % 12 || 12;

  return `${twelveHour}:${minute.padStart(2, '0')} ${period}`;
};

const parseIsoLocalDateTime = (dateTime: string) => {
  const [datePart, timePart = '00:00'] = dateTime.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hourText = '0', minuteText = '0', secondText = '0'] = timePart.split(':');

  return {
    year,
    month,
    day,
    hour: Number(hourText),
    minute: Number(minuteText),
    second: Number(secondText),
  };
};

const getTimeZoneOffset = (timeZone: string, date: Date) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const utcTime = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return (utcTime - date.getTime()) / 60000;
};

const getUtcDateFromZoneTime = (dateTime: string, timeZone: string) => {
  const { year, month, day, hour, minute, second } = parseIsoLocalDateTime(dateTime);
  const localMillis = Date.UTC(year, month - 1, day, hour, minute, second);
  const offsetMinutes = getTimeZoneOffset(timeZone, new Date(localMillis));

  return new Date(localMillis - offsetMinutes * 60000);
};

const formatDeviceTime = (date: Date, withMinutes: boolean) =>
  new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: withMinutes ? '2-digit' : undefined,
  }).format(date);

const formatTimeWithMode = (dateTime: string, timeZone: string | undefined, mode: TimeMode) => {
  if (mode === 'device' && timeZone) {
    const utcDate = getUtcDateFromZoneTime(dateTime, timeZone);
    return formatDeviceTime(utcDate, true);
  }

  return formatLocalIsoTime(dateTime);
};

export const formatTime = (
  dateTime: string,
  options?: { timeZone?: string; mode?: TimeMode },
) => formatTimeWithMode(dateTime, options?.timeZone, options?.mode ?? 'location');

export const formatDay = (date: string) =>
  new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T12:00:00`));

export const formatHour = (
  dateTime: string,
  options?: { timeZone?: string; mode?: TimeMode },
) => formatTimeWithMode(dateTime, options?.timeZone, options?.mode ?? 'location').replace(':00', '');

export const titleCase = (value: string) =>
  value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
