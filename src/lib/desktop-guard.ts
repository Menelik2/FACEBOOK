/** Injected at the start of every generated script — blocks mobile browsers */
export function getDesktopOnlyGuard(): string {
  return `
  (function desktopOnlyGuard() {
    var ua = navigator.userAgent || '';
    var host = (window.location.hostname || '');
    var isMobile = host.startsWith('m.') || host.indexOf('m.facebook') !== -1 ||
      /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
      ('ontouchstart' in window && window.innerWidth < 900);
    if (isMobile) {
      alert('FB Unfollow Studio is Desktop only.\\n\\nPlease open Facebook on a computer (Chrome, Edge, Firefox, or Safari) and use the desktop site.');
      throw new Error('Desktop only');
    }
  })();
`;
}
