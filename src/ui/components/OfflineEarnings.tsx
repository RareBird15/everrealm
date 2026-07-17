// src/ui/components/OfflineEarnings.tsx

interface Props {
  readonly amount: number;
  readonly onDismiss: () => void;
}

export function OfflineEarnings({ amount, onDismiss }: Props) {
  return (
    <div className="offline-earnings" role="status">
      <p>
        While you were away, your realm earned {amount} Cacao.
      </p>
      <button type="button" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}