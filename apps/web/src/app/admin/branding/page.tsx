'use client';

/**
 * Admin Branding & Theme Page - Hotel Manager
 * Customize hotel white-label appearance: colors, fonts, header style
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/lib/auth/auth-context';
import { GET_HOTEL_BY_ID } from '@/lib/graphql/queries/hotels';
import { UPDATE_HOTEL } from '@/lib/graphql/queries/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Palette,
  Loader2,
  AlertCircle,
  CheckCircle,
  Save,
  Type,
  Layout,
  Eye,
  LayoutTemplate,
  Check,
} from 'lucide-react';
import { TEMPLATE_CATALOG, type TemplateMeta } from '@/components/tenant/templates/registry';
import type { HotelTemplateName } from '@/lib/tenant/tenant-context';

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerStyle: 'light' | 'dark' | 'transparent';
  heroStyle: 'full' | 'split' | 'minimal';
}

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  accentColor: '#f59e0b',
  fontFamily: 'Inter',
  headerStyle: 'transparent',
  heroStyle: 'full',
};

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegant)' },
  { value: 'Poppins', label: 'Poppins (Clean)' },
  { value: 'Lora', label: 'Lora (Classic)' },
  { value: 'Montserrat', label: 'Montserrat (Bold)' },
  { value: 'Merriweather', label: 'Merriweather (Traditional)' },
];

const PRESET_THEMES = [
  { name: 'Hotel Manager Default', primary: '#2563eb', secondary: '#1e40af', accent: '#f59e0b' },
  { name: 'Emerald Resort', primary: '#059669', secondary: '#047857', accent: '#fbbf24' },
  { name: 'Royal Purple', primary: '#7c3aed', secondary: '#6d28d9', accent: '#f97316' },
  { name: 'Crimson Luxury', primary: '#dc2626', secondary: '#b91c1c', accent: '#eab308' },
  { name: 'Ocean Teal', primary: '#0891b2', secondary: '#0e7490', accent: '#f59e0b' },
  { name: 'Midnight Gold', primary: '#1f2937', secondary: '#111827', accent: '#d97706' },
];

export default function AdminBrandingPage() {
  const { user } = useAuth();
  const hotelId = user?.hotelId;
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [selectedTemplate, setSelectedTemplate] = useState<HotelTemplateName>('STARTER');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: hotelData, loading } = useQuery<any>(GET_HOTEL_BY_ID, {
    variables: { id: hotelId },
    skip: !hotelId,
  });

  const [updateHotel, { loading: saving }] = useMutation(UPDATE_HOTEL, {
    onCompleted: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  useEffect(() => {
    if (hotelData?.hotel?.themeConfig) {
      setTheme({ ...DEFAULT_THEME, ...hotelData.hotel.themeConfig });
    }
    if (hotelData?.hotel?.template) {
      setSelectedTemplate(hotelData.hotel.template);
    }
  }, [hotelData]);

  const handleSave = async () => {
    await updateHotel({
      variables: {
        input: {
          hotelId,
          themeConfig: theme,
          template: selectedTemplate,
        },
      },
    });
  };

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setTheme((prev) => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    }));
  };

  if (!hotelId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">No Hotel Assigned</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branding & Theme</h1>
          <p className="text-gray-500 mt-1">Customize your hotel&apos;s white-label appearance</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Saved
            </div>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Theme
          </Button>
        </div>
      </div>

      {/* ======= TEMPLATE SELECTOR ======= */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-brand-600" />
            Website Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Choose a design template for your hotel website. Each template has a distinct layout and visual identity.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATE_CATALOG.map((tpl: TemplateMeta) => {
              const isSelected = selectedTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {/* Gradient preview swatch */}
                  <div className={`h-20 rounded-lg mb-3 bg-gradient-to-br ${tpl.preview}`} />
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{tpl.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-2">{tpl.description}</p>
                  <span className="text-xs text-gray-400">Font: {tpl.fontHint}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4 text-brand-600" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border border-gray-200">
            {selectedTemplate === 'MODERN_MINIMAL' ? (
              /* Modern Minimal — clean split layout with dark nav */
              <>
                <div className="px-6 py-3 bg-white flex items-center justify-between border-b border-gray-100">
                  <span className="text-sm font-light tracking-widest uppercase text-gray-900" style={{ fontFamily: 'Inter' }}>
                    {hotelData?.hotel?.name || 'Your Hotel'}
                  </span>
                  <div className="flex gap-5 text-xs tracking-wide text-gray-500 uppercase">
                    <span>Rooms</span><span>Experience</span><span>Contact</span>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/2 bg-gray-100 py-10 px-6 flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Welcome to</p>
                    <h2 className="text-xl font-light text-gray-900 mb-3" style={{ fontFamily: 'Inter' }}>
                      {hotelData?.hotel?.name || 'Your Hotel'}
                    </h2>
                    <button className="self-start px-5 py-2 bg-gray-900 text-white text-xs uppercase tracking-wider rounded-none hover:bg-gray-800">
                      Book Now
                    </button>
                  </div>
                  <div className="w-1/2 bg-gradient-to-br from-gray-300 to-gray-400 py-16 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Hero Image</span>
                  </div>
                </div>
              </>
            ) : selectedTemplate === 'LUXURY_RESORT' ? (
              /* Luxury Resort — cinematic dark full-width */
              <>
                <div className="px-6 py-3 bg-stone-900 flex items-center justify-between">
                  <span className="text-sm font-semibold text-amber-200 tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {hotelData?.hotel?.name || 'Your Hotel'}
                  </span>
                  <div className="flex gap-5 text-xs tracking-wide text-stone-400">
                    <span>Suites</span><span>Dining</span><span>Spa</span>
                  </div>
                </div>
                <div
                  className="px-6 py-14 text-center"
                  style={{ background: 'linear-gradient(135deg, #1c1917ee, #78350fee)' }}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70 mb-3">An Exquisite Escape</p>
                  <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {hotelData?.hotel?.name || 'Your Hotel'}
                  </h2>
                  <button className="px-6 py-2 border border-amber-400 text-amber-200 text-xs uppercase tracking-widest hover:bg-amber-400/10">
                    Reserve Your Suite
                  </button>
                </div>
              </>
            ) : selectedTemplate === 'HERITAGE_BOUTIQUE' ? (
              /* Heritage Boutique — warm sepia tones with ornamental style */
              <>
                <div className="px-6 py-3 flex items-center justify-between" style={{ backgroundColor: '#f5f0e8' }}>
                  <span className="text-sm font-semibold text-amber-900" style={{ fontFamily: 'Lora, serif' }}>
                    ◇ {hotelData?.hotel?.name || 'Your Hotel'} ◇
                  </span>
                  <div className="flex gap-5 text-xs text-amber-800/70">
                    <span>Heritage</span><span>Rooms</span><span>Stories</span>
                  </div>
                </div>
                <div
                  className="px-6 py-14 text-center"
                  style={{ background: 'linear-gradient(135deg, #92400eee, #78716cee)' }}
                >
                  <div className="text-amber-200/50 text-xs mb-2">◈ ◇ ◈</div>
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70 mb-2">Est. Since 1920</p>
                  <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {hotelData?.hotel?.name || 'Your Hotel'}
                  </h2>
                  <button className="px-6 py-2 bg-amber-800 text-amber-100 text-xs uppercase tracking-wider rounded-sm hover:bg-amber-700">
                    Explore Our Heritage
                  </button>
                </div>
              </>
            ) : (
              /* STARTER — default Hotel Manager classic layout */
              <>
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{
                    backgroundColor: theme.headerStyle === 'dark' ? theme.primaryColor :
                                     theme.headerStyle === 'light' ? '#ffffff' : 'transparent',
                    background: theme.headerStyle === 'transparent'
                      ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                      : undefined,
                  }}
                >
                  <span
                    className="font-bold text-lg"
                    style={{
                      color: theme.headerStyle === 'light' ? theme.primaryColor : '#ffffff',
                      fontFamily: theme.fontFamily,
                    }}
                  >
                    {hotelData?.hotel?.name || 'Your Hotel'}
                  </span>
                  <div className="flex gap-4 text-sm" style={{ color: theme.headerStyle === 'light' ? '#6b7280' : '#ffffffcc' }}>
                    <span>Rooms</span><span>Gallery</span><span>Contact</span>
                  </div>
                </div>
                <div
                  className="px-6 py-12 text-center"
                  style={{ background: `linear-gradient(135deg, ${theme.primaryColor}ee, ${theme.secondaryColor}ee)` }}
                >
                  <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: theme.fontFamily }}>
                    Welcome to {hotelData?.hotel?.name || 'Your Hotel'}
                  </h2>
                  <p className="text-white/80 mb-4" style={{ fontFamily: theme.fontFamily }}>Your perfect stay awaits</p>
                  <button className="px-6 py-2 rounded-lg font-medium text-sm" style={{ backgroundColor: theme.accentColor, color: '#ffffff' }}>
                    Book Now
                  </button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preset Themes */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-4 h-4 text-brand-600" />
            Theme Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PRESET_THEMES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="text-left p-3 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors group"
              >
                <div className="flex gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primary }} />
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.secondary }} />
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.accent }} />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Colors */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-4 h-4 text-brand-600" />
            Custom Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                  placeholder="#2563eb"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.secondaryColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={theme.secondaryColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                  placeholder="#1e40af"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, accentColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={theme.accentColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, accentColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                  placeholder="#f59e0b"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="w-4 h-4 text-brand-600" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Font Family</label>
          <select
            value={theme.fontFamily}
            onChange={(e) => setTheme((prev) => ({ ...prev, fontFamily: e.target.value }))}
            className="w-full md:w-1/2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Applied to headings and navigation on your hotel website.
          </p>
        </CardContent>
      </Card>

      {/* Layout Options */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Layout className="w-4 h-4 text-brand-600" />
            Layout Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Header Style</label>
            <div className="flex gap-3">
              {(['transparent', 'dark', 'light'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setTheme((prev) => ({ ...prev, headerStyle: style }))}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    theme.headerStyle === style
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Section Style</label>
            <div className="flex gap-3">
              {(['full', 'split', 'minimal'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setTheme((prev) => ({ ...prev, heroStyle: style }))}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    theme.heroStyle === style
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
