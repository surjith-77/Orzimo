import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Slide-Over Sidebar Drawer
 * Used uniformly for Cart, Orders, and Wishlist sidebars in ORZIMO.
 */
export default function SidebarDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  badge,
  headerExtra,
  children,
  footer,
  ariaLabel,
  width = 440
}) {
  const [isClosing, setIsClosing] = useState(false);
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Handle smooth closing animation before unmounting
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 240);
  }, [isClosing, onClose]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen || isClosing) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClosing, handleClose]);

  // Disable background scrolling when open & restore on close
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`sidebar-drawer-backdrop ${isClosing ? 'is-closing' : ''}`}
      onClick={handleClose}
      aria-hidden={!isOpen}
    >
      <div
        ref={drawerRef}
        className={`sidebar-drawer ${isClosing ? 'is-closing' : ''}`}
        style={{ maxWidth: `${width}px` }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title || 'Sidebar Drawer'}
      >
        {/* Drawer Header */}
        <div className="sidebar-drawer-header">
          <div className="sidebar-drawer-header-left">
            {icon && (
              <div className="sidebar-drawer-icon-box" aria-hidden="true">
                {icon}
              </div>
            )}
            <div className="sidebar-drawer-text">
              <div className="sidebar-drawer-title-row">
                <h2 className="sidebar-drawer-title">{title}</h2>
                {badge && <span className="sidebar-drawer-badge">{badge}</span>}
              </div>
              {subtitle && <p className="sidebar-drawer-subtitle">{subtitle}</p>}
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="sidebar-drawer-close-btn"
            onClick={handleClose}
            aria-label={`Close ${title || 'sidebar'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Optional Sub-Header / Location Bar */}
        {headerExtra && (
          <div className="sidebar-drawer-extra">
            {headerExtra}
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="sidebar-drawer-body">
          {children}
        </div>

        {/* Optional Fixed Footer */}
        {footer && (
          <div className="sidebar-drawer-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
