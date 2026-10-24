import axios from 'axios';

export type Translate = (
  key: string,
  options?: { defaultValue?: string },
) => string;

const FALLBACK_MESSAGE_KEY = 'common:PICKBAZAR_ERROR.SOMETHING_WENT_WRONG';

export function getApiErrorStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

// Turns any thrown error into a user-facing, translated message.
// Known error codes (e.g. PICKBAZAR_ERROR.*) are translated, plain API messages
// are shown as-is, and anything without a usable message (network errors,
// timeouts, non-API exceptions) falls back to a generic message.
export function getApiErrorMessage(error: unknown, t: Translate) {
  const fallback = t(FALLBACK_MESSAGE_KEY);
  if (!axios.isAxiosError(error)) return fallback;

  const raw = error.response?.data?.message;
  // NestJS validation errors return an array of messages.
  const message = Array.isArray(raw) ? raw.filter(Boolean).join(', ') : raw;
  if (typeof message !== 'string' || !message) return fallback;

  return t(`common:${message}`, { defaultValue: message });
}
