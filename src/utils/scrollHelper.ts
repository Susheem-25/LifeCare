/**
 * Smooth fast-scrolls to an element by ID, accounting for sticky navbar height.
 */
export const fastScrollTo = (elementId: string, offset = 85): void => {
  const el = document.getElementById(elementId);
  if (!el) return;

  const elementPosition = el.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
};

