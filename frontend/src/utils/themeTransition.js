import { flushSync } from 'react-dom';

const REVEAL_DURATION_MS = 520;
const LIGHT_BG = '#F5F5F5';
const DARK_BG = '#030712';

function getEndRadius(x, y) {
  return Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function animateCircularReveal(origin, onDone) {
  const { x, y } = origin;
  const endRadius = getEndRadius(x, y);

  return document.documentElement.animate(
    {
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ],
    },
    {
      duration: REVEAL_DURATION_MS,
      easing: 'ease-in-out',
      pseudoElement: '::view-transition-new(root)',
    },
  ).finished.then(onDone);
}

function revealWithViewTransition(origin, onApply) {
  const transition = document.startViewTransition(() => {
    flushSync(onApply);
  });

  return transition.ready
    .then(() => animateCircularReveal(origin, () => {}))
    .catch(onApply);
}

function revealWithOverlay(theme, origin, onApply) {
  const { x, y } = origin;
  const endRadius = getEndRadius(x, y);
  const bg = theme === 'dark' ? DARK_BG : LIGHT_BG;

  const overlay = document.createElement('div');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 99999;
    pointer-events: none;
    background: ${bg};
    clip-path: circle(0px at ${x}px ${y}px);
  `;
  document.body.appendChild(overlay);

  return overlay
    .animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      { duration: REVEAL_DURATION_MS, easing: 'ease-in-out', fill: 'forwards' },
    )
    .finished.then(() => {
      onApply();
      overlay.remove();
    });
}

export function revealThemeChange({ theme, origin, onApply }) {
  if (typeof document === 'undefined') {
    onApply();
    return;
  }

  if (!origin || prefersReducedMotion()) {
    onApply();
    return;
  }

  if (document.startViewTransition) {
    revealWithViewTransition(origin, onApply);
    return;
  }

  revealWithOverlay(theme, origin, onApply);
}
