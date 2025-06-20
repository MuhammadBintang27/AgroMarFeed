# AgroMarFeed Frontend

Frontend untuk aplikasi AgroMarFeed dengan fitur cart, checkout, shipping, dan payment integration.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Buat file `.env.local` di root folder frontend dengan konfigurasi berikut:

```env
# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Midtrans Client Key (for frontend)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Run Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## Features

### Cart Management
- Add to cart functionality
- Cart page with item management
- Quantity updates
- Remove items
- Persistent cart data

### Checkout Process
- Shipping address form
- Province and city selection
- Shipping method selection
- Payment method selection
- Order summary

### Shipping Integration
- RajaOngkir Komerce integration
- Real-time shipping cost calculation
- Multiple courier options
- Estimated delivery time

### Payment Integration
- Midtrans integration
- Multiple payment methods:
  - Bank Transfer
  - GoPay
  - ShopeePay
  - QRIS
- Payment status tracking

### User Authentication
- Login/Register pages
- User context management
- Protected routes
- Session management

## Pages

### Main Pages
- `/` - Homepage
- `/katalog` - Product catalog
- `/detail/[slug]` - Product detail
- `/keranjang` - Shopping cart
- `/pembayaran` - Checkout & payment
- `/riwayatBelanja` - Order history
- `/profile` - User profile

### Authentication Pages
- `/auth/login` - Login page
- `/auth/register` - Register page

### Other Pages
- `/aboutus` - About us
- `/artikel` - Blog articles
- `/konsultasi` - Consultation

## Components

### UI Components
- `Button` - Reusable button component
- `Card` - Product card component
- `SearchBar` - Search functionality
- `AddToCartButton` - Add to cart button

### Layout Components
- `Header` - Navigation header
- `Footer` - Site footer
- `ChatbotWidget` - Chat widget

### Page Components
- `Hero` - Homepage hero section
- `BestSeller` - Best seller products
- `LatestBlog` - Latest blog posts
- `SpecialOffer` - Special offers

## API Integration

### Backend API Routes
- `/api/auth/*` - Authentication endpoints
- `/api/cart` - Cart management
- `/api/products` - Product data
- `/api/shipping/*` - Shipping calculation
- `/api/orders` - Order management

### External APIs
- RajaOngkir Komerce - Shipping calculation
- Midtrans - Payment processing

## State Management

### User Context
- User authentication state
- User profile data
- Login/logout functionality

### Cart State
- Cart items
- Cart totals
- Cart operations

## Styling

### CSS Framework
- Tailwind CSS for styling
- Custom CSS variables for theming
- Responsive design

### Icons & Images
- SVG icons
- Optimized images
- Next.js Image component

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### File Structure
```
app/
├── (main)/          # Main pages
├── auth/            # Authentication pages
├── api/             # API routes
└── globals.css      # Global styles

components/
├── ui/              # UI components
├── header/          # Header components
├── footer/          # Footer components
└── pages/           # Page-specific components

lib/
├── api/             # API utilities
├── auth.ts          # Authentication utilities
└── utils.ts         # Utility functions

public/
└── images/          # Static images
```
