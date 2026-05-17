interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-on-surface"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-on-surface-variant hover:text-on-surface"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
