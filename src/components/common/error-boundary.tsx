import { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslation } from 'next-i18next';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';

export const ErrorFallback = () => {
  const { t } = useTranslation('common');

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-4 sm:p-8">
      <h3 className="text-center text-xl font-bold text-sub-heading md:text-2xl">
        {t('PICKBAZAR_ERROR.SOMETHING_WENT_WRONG')}
      </h3>
      <Link
        href={Routes.dashboard}
        className="mt-4 text-sm text-accent transition-colors hover:text-accent-hover"
      >
        {t('text-back-to-home')}
      </Link>
    </div>
  );
};

interface Props {
  // Clears the error when it changes (e.g. the route), without remounting children.
  resetKey?: unknown;
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

// Catches render errors below it so one broken page doesn't blank the app.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return <ErrorFallback />;
    return this.props.children;
  }
}
