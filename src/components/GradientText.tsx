import type { CSSProperties, ReactNode } from 'react';
import './GradientText.css';

// Adapted from React Bits Gradient Text (TypeScript + CSS).
// The inline gradient is static so the graph is the hero's only motion.
export default function GradientText({ children, colors }: {
  children: ReactNode;
  colors: [string, string, ...string[]];
}) {
  const style = {
    '--gt-gradient': `linear-gradient(115deg, ${colors.join(', ')})`,
  } as CSSProperties;

  return (
    <span className="gradient-text" style={style}>
      <span className="gradient-text__inner">
        <span className="gradient-text__content">{children}</span>
      </span>
    </span>
  );
}
