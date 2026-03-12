'use client';

/**
 * Modern Minimal Template — Why Book Direct Section
 * Three-column with number accents.
 */

import { Shield, Award, Heart } from 'lucide-react';
import { sanitizeColor } from '@/lib/security/sanitize';
import type { WhyBookSectionProps } from '../types';

const VALUE_PROPS = [
  {
    icon: Shield,
    title: 'Best Price Guarantee',
    desc: 'Book directly for the lowest rate — no middlemen, no hidden fees.',
  },
  {
    icon: Award,
    title: 'No Hidden Charges',
    desc: 'Transparent pricing. What you see is exactly what you pay.',
  },
  {
    icon: Heart,
    title: 'Personalized Service',
    desc: 'Direct communication with our team for special requests.',
  },
];

export function ModernMinimalWhyBook({ theme }: WhyBookSectionProps) {
  const primary = sanitizeColor(theme.primaryColor, '#2563eb');

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: primary }}>
            Why Direct
          </p>
          <h2
            className="text-3xl font-light text-gray-900 tracking-tight"
            style={{ fontFamily: theme.fontFamily }}
          >
            Book with confidence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {VALUE_PROPS.map((item, i) => (
            <div key={i}>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${primary}10`, color: primary }}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 font-light leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
