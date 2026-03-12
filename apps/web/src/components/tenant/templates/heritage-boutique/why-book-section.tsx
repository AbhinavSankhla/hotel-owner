'use client';

/**
 * Heritage Boutique Template — Why Book Direct Section
 * Warm, narrative-driven value proposition with heritage aesthetics.
 */

import { Shield, Award, Heart } from 'lucide-react';
import { sanitizeColor } from '@/lib/security/sanitize';
import type { WhyBookSectionProps } from '../types';

const VALUE_PROPS = [
  {
    icon: Shield,
    title: 'Best Rate Promise',
    desc: 'Our direct booking always offers the most favourable rate — a promise honoured with every reservation.',
  },
  {
    icon: Award,
    title: 'Authentic Experience',
    desc: 'Immerse yourself in local heritage with curated cultural experiences only available when you book with us.',
  },
  {
    icon: Heart,
    title: 'Personal Attention',
    desc: 'From arrival to departure, our team is dedicated to crafting your stay with warmth and care.',
  },
];

export function HeritageBoutiqueWhyBook({ theme }: WhyBookSectionProps) {
  const accent = sanitizeColor(theme.accentColor, '#b45309');

  return (
    <section className="py-20 bg-amber-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-px" style={{ backgroundColor: accent }} />
            <div className="w-2 h-2 rotate-45 border" style={{ borderColor: accent }} />
            <div className="w-12 h-px" style={{ backgroundColor: accent }} />
          </div>
          <h2
            className="text-3xl text-stone-800 mb-3"
            style={{ fontFamily: "'Playfair Display', 'Lora', serif", fontWeight: 400 }}
          >
            Why Book Direct
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {VALUE_PROPS.map((item, i) => (
            <div key={i} className="text-center p-8 bg-white border border-stone-100 hover:shadow-md transition-shadow">
              <div
                className="w-14 h-14 rounded-full border-2 flex items-center justify-center mx-auto mb-5"
                style={{ borderColor: `${accent}50`, color: accent }}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <h3
                className="text-lg text-stone-800 mb-3"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
              >
                {item.title}
              </h3>
              <p
                className="text-sm text-stone-500 leading-relaxed"
                style={{ fontFamily: "'Lora', serif" }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
