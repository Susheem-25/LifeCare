/**
 * Smooth fast-scrolls to an element by ID, accounting for sticky navbar height,
 * with double-frame layout verification and a temporary visual pulse ring.
 */
export const fastScrollTo = (elementId: string, offset = 85): void => {
  const performScroll = () => {
    const el = document.getElementById(elementId);
    if (!el) return false;

    const currentScrollY = window.scrollY || document.documentElement.scrollTop;
    const rect = el.getBoundingClientRect();
    const targetTop = rect.top + currentScrollY - offset;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth'
    });

    // Add a temporary glowing feedback pulse ring
    el.classList.add('transition-all', 'duration-500', 'ring-4', 'ring-rose-500/50', 'ring-offset-2');
    setTimeout(() => {
      el.classList.remove('ring-4', 'ring-rose-500/50', 'ring-offset-2');
    }, 1800);

    return true;
  };

  // Immediate attempt
  performScroll();

  // Second pass after 150ms to account for dynamic DOM height changes (e.g. React state renders)
  setTimeout(() => {
    performScroll();
  }, 150);
};

