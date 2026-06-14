export type TemperatureUnit = 'c' | 'f';
export type TimeMode = 'location' | 'device';
export type WindSpeedUnit = 'ms' | 'kmh' | 'mph';

const toFahrenheit = (value: number) => (value * 9) / 5 + 32;

export const convertTemp = (value: number, unit: TemperatureUnit) =>
  unit === 'f' ? toFahrenheit(value) : value;

export const roundTemp = (value: number, unit: TemperatureUnit = 'c') =>
  `${Math.round(convertTemp(value, unit))}\u00b0`;

export const formatTempLabel = (value: number, unit: TemperatureUnit) =>
  `${Math.round(convertTemp(value, unit))}\u00b0${unit.toUpperCase()}`;

export const formatSpeed = (value: number, unit: WindSpeedUnit = 'ms'): string => {
  const converted = unit === 'kmh' ? value * 3.6 : unit === 'mph' ? value * 2.237 : value;
  const label = unit === 'ms' ? 'm/s' : unit === 'kmh' ? 'km/h' : 'mph';
  return `${converted.toFixed(1)} ${label}`;
};

const CARDINAL_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

export const formatWindDirection = (degrees: number): string => {
  const index = Math.round(degrees / 45) % 8;
  return `${Math.round(degrees)}\u00b0 ${CARDINAL_DIRECTIONS[index]}`;
};

export const formatUvIndex = (value: number | null): string =>
  value == null ? 'n/a' : `${Math.round(value)}`;

export const getUvLevel = (value: number): { label: string; color: string } => {
  if (value <= 2) return { label: 'Low', color: 'text-green-600 dark:text-green-400' };
  if (value <= 5) return { label: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400' };
  if (value <= 7) return { label: 'High', color: 'text-orange-600 dark:text-orange-400' };
  if (value <= 10) return { label: 'Very High', color: 'text-red-600 dark:text-red-400' };
  return { label: 'Extreme', color: 'text-purple-600 dark:text-purple-400' };
};

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

const hasExplicitTimeZone = (dateTime: string) => /(?:Z|[+-]\d{2}:\d{2})$/i.test(dateTime);

const formatTimeInTimeZone = (dateTime: string, timeZone: string) =>
  new Intl.DateTimeFormat('en', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateTime));

const formatTimeWithMode = (dateTime: string, timeZone: string | undefined, mode: TimeMode) => {
  if (mode === 'device' && timeZone) {
    const utcDate = getUtcDateFromZoneTime(dateTime, timeZone);
    return formatDeviceTime(utcDate, true);
  }

  if (timeZone && hasExplicitTimeZone(dateTime)) {
    return formatTimeInTimeZone(dateTime, timeZone);
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
