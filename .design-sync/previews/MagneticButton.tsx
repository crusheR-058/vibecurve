import { MagneticButton } from "vibecurve";

// Primary = the signature warm violet→peach gradient CTA.
export const Primary = () => (
  <MagneticButton onClick={() => {}}>Find my people →</MagneticButton>
);

export const Ghost = () => <MagneticButton variant="ghost">Maybe later</MagneticButton>;

export const Soft = () => <MagneticButton variant="soft">Skip for now</MagneticButton>;
