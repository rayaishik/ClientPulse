---
name: Azure Flux
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#bacac5'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#859490'
  outline-variant: '#3c4a46'
  surface-tint: '#3cddc7'
  primary: '#57f1db'
  on-primary: '#003731'
  primary-container: '#2dd4bf'
  on-primary-container: '#00574d'
  inverse-primary: '#006b5f'
  secondary: '#bcc7de'
  on-secondary: '#263143'
  secondary-container: '#3e495d'
  on-secondary-container: '#aeb9d0'
  tertiary: '#afe0ff'
  on-tertiary: '#00354a'
  tertiary-container: '#5ec9ff'
  on-tertiary-container: '#005371'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#62fae3'
  primary-fixed-dim: '#3cddc7'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 40px
  gutter: 20px
---

## Brand & Style
The design system is built for a high-performance internal CRM, prioritizing clarity and a sophisticated "Glassmorphism" aesthetic. The brand personality is professional, polished, and efficient, designed to reduce cognitive load while providing a cutting-edge interface for data-heavy workflows.

The style utilizes deep layering, translucent surfaces, and vibrant background blurs to create a sense of depth and hierarchy. It balances the futuristic feel of frosted glass with the structural reliability of a modern SaaS dashboard. High-contrast typography and precise line work ensure that the decorative elements never compromise functional utility.

## Colors
The palette is rooted in a deep Dark Navy background (#1a2744) to provide a stable, low-strain environment for extended use. 
- **Primary:** Teal (#2DD4BF) is used for calls to action, active states, and success indicators, providing a sharp, high-energy contrast against the navy.
- **Accents:** Subtle gradients are formed using the secondary and tertiary colors to give life to stat cards and interactive elements.
- **Neutrals:** Grays are utilized strictly for subtle borders and secondary text levels, maintaining a clear visual hierarchy without cluttering the interface.
- **Glass Effect:** Translucent layers are created using white or primary tints at 5-10% opacity with a high background blur.

## Typography
This design system utilizes a pairing of **Geist** for headlines and labels to evoke a technical, precise feel, and **Inter** for body copy to ensure maximum readability in dense CRM data environments. 

Headlines use tight letter-spacing and bold weights to command attention. Body text is prioritized for legibility with generous line-heights. Labels are often set in uppercase with slight tracking to differentiate them from interactive text components. For mobile views, large display sizes scale down to maintain a balanced visual weight.

## Layout & Spacing
The layout follows a **Fluid Grid** philosophy using a 12-column system. 
- **Desktop:** 12 columns, 24px gutters, and 40px outer margins.
- **Tablet:** 8 columns, 20px gutters, and 24px margins.
- **Mobile:** 4 columns, 16px gutters, and 16px margins.

Spacing is based on a 4px baseline grid to ensure mathematical consistency. Generous whitespace is a core tenet of this design system, used to separate complex CRM modules (like Lead Pipelines from Activity Feeds) without the need for heavy physical dividers. Glass containers should have a minimum internal padding of 24px (lg) to maintain the airy, modern aesthetic.

## Elevation & Depth
Depth is achieved through **Glassmorphism** and soft layered shadows rather than solid tonal shifts. 
- **The Base:** The deep navy background remains static.
- **Layer 1 (Cards/Panels):** Surface-level containers use a 10% white tint with a 20px backdrop blur and a 1px border of 15% white to catch "light."
- **Layer 2 (Modals/Popovers):** Higher elevation elements use a 15% white tint, 40px backdrop blur, and a soft, diffused shadow (0px 20px 50px rgba(0,0,0,0.3)).
- **Shadows:** Use large blur radii and low opacity. Avoid pitch-black shadows; instead, use a darker tint of the background navy to maintain a natural, "ambient" light feel.

## Shapes
The shape language is smooth and approachable. All primary UI containers and cards utilize a `12px` (rounded-lg) or `16px` (rounded-xl) radius. 

Small interactive elements like buttons and input fields follow the `8px` (rounded) standard. This consistency in roundedness reinforces the "soft" feel of the glass aesthetic. Circles are reserved exclusively for avatars and status indicators to provide a distinct visual contrast to the structural grid.

## Components
- **Buttons:** Primary buttons feature a subtle teal-to-dark-teal gradient. Ghost buttons use a 1px teal border with a semi-transparent hover fill.
- **Input Fields:** Backgrounds are slightly darker than the card surface (5% opacity) with a 1px border that glows teal on focus. 
- **Cards (Stat Cards):** Feature a soft background blur and a subtle 10% teal gradient "wash" in the corner to highlight key metrics.
- **Lists & Tables:** Rows use a hover state that lightens the background (glass effect) rather than changing the color, maintaining the transparency theme.
- **Chips:** Used for CRM tags, these have a high-transparency background with high-contrast text and no border to keep the UI clean.
- **Icons:** Minimal line icons with a 1.5px or 2px stroke width, using the neutral gray color for inactive states and teal for active interaction.