import React from 'react';
import { CalendarCheck2, Users, HeartHandshake, ShieldCheck } from 'lucide-react';

export default function TrustStrip() {
  const TRUST_ITEMS = [
    {
      icon: CalendarCheck2,
      title: "Pre-Book Delivery Slots",
      subtitle: "Lock guaranteed delivery or pickup for your special celebration date"
    },
    {
      icon: Users,
      title: "100% Local Home Creators",
      subtitle: "Direct support to home bakers, independent artists & neighborhood makers"
    },
    {
      icon: HeartHandshake,
      title: "Custom Inscription & Photos",
      subtitle: "Add custom messages, weight choices, and reference photos to your order"
    },
    {
      icon: ShieldCheck,
      title: "Safe Payments & Tracking",
      subtitle: "Secured checkout architecture with live status tracking"
    }
  ];

  return (
    <section className="trust-strip-section" aria-label="Marketplace Trust Guarantees">
      <div className="container">
        <div className="trust-strip-grid">
          {TRUST_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="trust-card">
                <div className="trust-icon-box">
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className="trust-title">{item.title}</h4>
                  <p className="trust-subtitle">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
