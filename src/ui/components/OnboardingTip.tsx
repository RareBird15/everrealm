interface Props {
  readonly tip: string;
}

export function OnboardingTip({ tip }: Props) {
  return (
    <section aria-label="Tip" className="onboarding-tip">
      <p>{tip}</p>
    </section>
  );
}