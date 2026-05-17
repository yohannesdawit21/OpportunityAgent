import { Icon } from '../ui/Icon';

interface OnboardingMobileBarProps {
  canAnalyze: boolean;
  submitting: boolean;
  onAnalyze: () => void;
}

/** Sticky primary action for small screens (above safe area). */
export function OnboardingMobileBar({
  canAnalyze,
  submitting,
  onAnalyze,
}: OnboardingMobileBarProps) {
  return (
    <div
      className="fixed bottom-0 left-0 z-40 w-full border-t border-white/10 bg-background/95 px-4 pt-3 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {!canAnalyze && (
        <p className="mb-2 text-center text-xs text-on-surface-variant">
          Upload a resume <span className="text-primary">or</span> add GitHub to
          continue
        </p>
      )}
      <button
        type="button"
        disabled={!canAnalyze || submitting}
        onClick={onAnalyze}
        className="btn-glow flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container py-3.5 text-sm font-semibold text-on-primary-container transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? 'Starting analysis…' : 'Analyze Profile'}
        <Icon name="arrow_forward" />
      </button>
    </div>
  );
}
