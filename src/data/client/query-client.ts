import { MutationCache, QueryCache, QueryClient } from 'react-query';
import { i18n } from 'next-i18next';
import { toast } from 'react-toastify';
import {
  getApiErrorMessage,
  getApiErrorStatus,
  Translate,
} from '@/utils/api-error';

// react-query v3 keeps per-call options (mutate(vars, { onError })) on the
// mutation's observers, which its typings mark as private.
type MutationLike = {
  options: { onError?: unknown };
  observers?: { mutateOptions?: { onError?: unknown } }[];
};

function hasLocalErrorHandler(mutation: MutationLike) {
  if (mutation.options.onError) return true;
  return Boolean(
    mutation.observers?.some((observer) => observer.mutateOptions?.onError),
  );
}

// Uses the app's active i18n instance (current locale) at the time of the error.
const translate: Translate = (key, options) =>
  i18n ? i18n.t(key, options) : options?.defaultValue ?? key;

function showError(error: unknown) {
  // 401 means the session is gone; the http client logs the user out.
  if (getApiErrorStatus(error) === 401) return;
  const message = getApiErrorMessage(error, translate);
  toast.error(message, { toastId: message });
}

// Errors bubble up here when no hook or component handled them.
// - Mutations: toast unless the hook or the mutate() call has its own onError.
// - Queries: pages render their own error state on first load, so only toast
//   when a background refetch fails while stale data is still on screen.
export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.data === undefined) return;
        showError(error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (hasLocalErrorHandler(mutation as unknown as MutationLike)) return;
        showError(error);
      },
    }),
  });
}
