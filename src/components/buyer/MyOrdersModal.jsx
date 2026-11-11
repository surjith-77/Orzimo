import React from 'react';
import OrdersSidebar from './OrdersSidebar';

/**
 * Backward compatibility wrapper.
 * Orders now open in the slide-over OrdersSidebar drawer.
 */
export default function MyOrdersModal({ isOpen, onClose }) {
  return <OrdersSidebar isOpen={isOpen} onClose={onClose} />;
}
