# Epic Threadz Storefront Template

This is the Epic Threadz template used for generating merchant storefronts. It's a fully-featured, production-ready e-commerce storefront built with React, Vite, and Tailwind CSS.

## Template Variables

When this template is generated, the following variables are replaced:

### Basic Information
- `test -test` - Store display name (e.g., "Fashion Hub")
- `test-test` - URL-safe store name (e.g., "fashion-hub")
- `Welcome to Epic Threadz` - Store tagline/description

### Theme & Branding
- `modern` - Selected theme: `modern`, `playful`, `luxury`, or `organic`
- `USD` - Currency code (e.g., "USD", "INR")

### API Configuration
- `pk_live_f5722a3df0142d1dbb3f6a660431627e` - Merchant's EpicMerch API key
- `https://api.epicmerch.com/api` - API base URL

### Contact Information
- `owner@epicthreadz.com` - Support email
- `` - Support phone number

### Social Media
- `` - Instagram URL
- `` - Twitter URL
- `` - Facebook URL

### Metadata
- `2026-01-03T14:03:16.053Z` - Generation timestamp

## Files Modified During Generation

Only these files contain template variables:
- `package.json` - Project name
- `index.html` - Page title and meta description
- `src/site.config.js` - All branding and configuration
- `.env.example` - API credentials template

## Files That NEVER Change

These are reusable across all generated stores:
- `src/lib/ecommerce.js` - Universal SDK wrapper
- `src/lib/themes.js` - 4 pre-defined theme colors
- `src/components/*` - All UI components
- `src/pages/*` - All page templates
- `tailwind.config.js` - Tailwind configuration

## Themes

The template supports 4 built-in themes via CSS variables:

### 1. Modern (Default)
- **Primary**: Amber/Orange (`#F5A623`)
- **Accent**: Indigo (`#6366F1`)
- **Style**: Bold, energetic streetwear aesthetic

### 2. Playful
- **Primary**: Pink (`#EC4899`)
- **Accent**: Yellow (`#D97706`)
- **Style**: Fun, vibrant, youth-focused

### 3. Luxury
- **Primary**: Black/Dark Gray (`#111827`)
- **Accent**: Gold (`#D4AF37`)
- **Style**: Premium, elegant, sophisticated

### 4. Organic
- **Primary**: Emerald Green (`#10B981`)
- **Accent**: Lime (`#65A30D`)
- **Style**: Natural, eco-friendly, sustainable

## Features Included

✅ **Authentication**: OTP-based login (Phone/Email) + Google OAuth
✅ **Product Browsing**: Grid layout with search and filtering
✅ **Shopping Cart**: Slide-out cart with quantity controls
✅ **Checkout**: Full checkout flow with address management
✅ **Profile Management**: Orders, addresses, payment methods
✅ **Payment Integration**: Saved cards, UPI, COD support
✅ **Order Tracking**: Real-time order status updates
✅ **Responsive Design**: Mobile-first, works on all devices
✅ **Dynamic Theming**: Change colors with one config change
✅ **Performance**: Fast loading with Vite and optimized builds

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS 3 + Custom Theme System
- **Routing**: React Router DOM 6
- **Icons**: Lucide React
- **Backend SDK**: EpicMerch SDK
- **Authentication**: Firebase (optional)
- **Build Tool**: Vite 5

## Deployment

Generated storefronts can be deployed to:
- Vercel (Recommended)
- Netlify
- Cloudflare Pages
- Any static hosting service

## Customization

Merchants can customize:
1. **Branding**: Store name, logo, description
2. **Theme**: Choose from 4 pre-built themes
3. **Contact**: Email, phone, social links
4. **Products**: Managed through EpicMerch admin
5. **Logo**: Upload custom logo (replaces `/public/logo.png`)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file (or copy from `.env.example`):

```env
VITE_EPIC_MERCH_API_KEY=your_api_key_here
VITE_EPIC_MERCH_API_URL=https://api.epicmerch.com/api
```

## Support

For issues or questions about this template:
- Documentation: https://docs.epicmerch.com
- Support: support@epicmerch.com

