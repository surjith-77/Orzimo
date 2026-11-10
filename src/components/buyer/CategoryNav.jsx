import React, { useState } from 'react';
import { 
  Cake, 
  Gift, 
  Sparkles, 
  UtensilsCrossed, 
  Gem, 
  Scissors, 
  Flame, 
  Palette, 
  PartyPopper, 
  Store,
  ChevronRight,
  Layers,
  Cpu,
  Wrench,
  Home,
  Package
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

const ICON_MAP = {
  Cake,
  Gift,
  Sparkles,
  UtensilsCrossed,
  Gem,
  Scissors,
  Flame,
  Palette,
  PartyPopper,
  Store,
  Cpu,
  Wrench,
  Home,
  Package
};

export default function CategoryNav({ selectedCategory, onSelectCategory }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  return (
    <div 
      className="category-nav-wrapper"
      onMouseLeave={() => setHoveredCategory(null)}
    >
      <div className="container">
        <nav className="category-scroll-container" aria-label="Product Categories">
          {/* All Categories Option */}
          <button
            type="button"
            className={`category-pill-item ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => onSelectCategory('all')}
            onMouseEnter={() => setHoveredCategory(null)}
          >
            <div 
              className="category-icon-box"
              style={{ background: 'linear-gradient(135deg, #174EA6 0%, #2874F0 100%)' }}
            >
              <Layers size={22} />
            </div>
            <span className="category-name-text">All Categories</span>
          </button>

          {/* 10 Required Marketplace Categories */}
          {CATEGORIES.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Store;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                type="button"
                key={cat.id}
                className={`category-pill-item ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
                onMouseEnter={() => setHoveredCategory(cat)}
              >
                <div 
                  className="category-icon-box"
                  style={{ background: cat.gradient }}
                >
                  <IconComponent size={22} />
                </div>
                <span className="category-name-text">{cat.shortName}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Subcategory Preview Flyout when hovering over a category */}
      {hoveredCategory && (
        <div className="category-flyout">
          <div className="container">
            <div className="flyout-grid">
              <div>
                <h4 className="flyout-title">
                  <span style={{ color: 'var(--color-primary)' }}>•</span>
                  {hoveredCategory.name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 12 }}>
                  {hoveredCategory.description}
                </p>
                <button
                  onClick={() => {
                    onSelectCategory(hoveredCategory.id);
                    setHoveredCategory(null);
                  }}
                  className="btn btn-outline btn-sm"
                >
                  View All in {hoveredCategory.shortName} <ChevronRight size={14} />
                </button>
              </div>

              <div>
                <h4 className="flyout-title">Popular Sub-Categories</h4>
                <ul className="flyout-links">
                  {hoveredCategory.subcategories.slice(0, 4).map((sub, idx) => (
                    <li 
                      key={idx} 
                      className="flyout-link-item"
                      onClick={() => {
                        onSelectCategory(hoveredCategory.id);
                        setHoveredCategory(null);
                      }}
                    >
                      {sub}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="flyout-title">Orzimo Creator Perks</h4>
                <ul className="flyout-links">
                  <li className="flyout-link-item">Guaranteed Slot Booking</li>
                  <li className="flyout-link-item">Custom Inscriptions & Notes</li>
                  <li className="flyout-link-item">Reference Photo Uploads</li>
                  <li className="flyout-link-item">100% Certified Creators</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
