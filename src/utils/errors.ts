export const getErrorMessage = (error: unknown, fallback = 'Something went wrong while loading weather data.') => {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
