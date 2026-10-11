/** Picks the light or dark source of a themed media element. */
export function themedSrc(el: HTMLElement): string {
  const dark = document.documentElement.dataset.theme === "dark";
  return (dark ? el.dataset.srcDark : el.dataset.srcLight) ?? "";
}

export function reducedMotion(): boolean {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}
