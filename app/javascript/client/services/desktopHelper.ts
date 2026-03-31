// NOTE window.desktopHelper is defined in the desktop codebase (Electron).
// If it exists, it provides desktop-specific functionality.
// Otherwise, we use a stub that returns false for all checks.

declare global {
  interface Window {
    desktopHelper?: any;
  }
}

const desktopHelper = (window as any).desktopHelper || {
  isDesktop: function () { return false; },
  isRelativeFilepath: function () { return false; },
};

export default desktopHelper;
