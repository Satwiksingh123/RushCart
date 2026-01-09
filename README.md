<div align="center">
  <h1>🛒 RushCart</h1>
  <p><strong>Skip the Queue. Scan. Pay. Go.</strong></p>
  <p>A revolutionary smart shopping platform that transforms retail experiences by enabling instant product scanning and seamless checkout.</p>

  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
</div>

---

## 📖 About

**RushCart** is a modern, fast, and user-friendly shopping platform designed to eliminate long billing queues at malls and festivals. Simply scan products using your smartphone camera, add them to your cart, and complete the purchase—all in under 30 seconds.

### 🎯 Key Highlights

- 📱 **Mobile-First Design**: Optimized for smartphones with intuitive touch interfaces
- 📷 **Smart Barcode Scanning**: Real-time barcode detection using device camera
- 🔒 **Secure Checkout**: One-time QR codes for verified exits
- ⚡ **Instant Processing**: Zero wait time at billing counters
- 📊 **Real-Time Cart**: See total spending update live as you shop
- 🧾 **Digital Receipts**: Paperless bills accessible anytime

---

## ✨ Features

### 🛍️ Shopping Experience
- **Universal Barcode Support**: Works with EAN, UPC, Code 128, and more
- **Manual Input Option**: Enter barcodes manually if needed
- **Image Barcode Scanner**: Upload product images to scan barcodes
- **Live Cart Updates**: Track items and prices in real-time

### 💳 Checkout & Payments
- **One-Click Checkout**: Complete purchases instantly
- **Multiple Payment Methods**: Support for various payment options
- **Secure QR Exit Pass**: Unique verification codes for store exit
- **Order History**: View past purchases anytime

### 👤 User Management
- **Authentication**: Secure login with Supabase Auth
- **User Profiles**: Manage personal information
- **Order Tracking**: Monitor current and past orders

---

## 🚀 Tech Stack

### Frontend
- **[React 18](https://react.dev/)** - Modern UI library with hooks
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool
- **[React Router](https://reactrouter.com/)** - Client-side routing

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon set

### Backend & Services
- **[Supabase](https://supabase.com/)** - PostgreSQL database, Auth & Storage
- **[TanStack Query](https://tanstack.com/query)** - Powerful data fetching

### Barcode Processing
- **[Quagga2](https://github.com/ericblade/quagga2)** - Advanced barcode scanner library

---

## 📦 Installation

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **bun** package manager
- **Supabase Account** - [Sign up free](https://supabase.com/)

### Local Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd RushCart

# Install dependencies
npm install
# or using bun
bun install

# Set up environment variables
# Create a .env file in the root directory
# Add your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Run database migrations
# Follow Supabase setup instructions

# Start development server
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173`

---

## 🛠️ Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

---

## 📁 Project Structure

```
RushCart/
├── public/              # Static assets
│   ├── images/         # Image assets
│   └── products/       # Product images
├── src/
│   ├── components/     # React components
│   │   ├── ui/        # shadcn/ui components
│   │   └── landing/   # Landing page sections
│   ├── hooks/         # Custom React hooks
│   ├── integrations/  # Third-party integrations
│   │   └── supabase/  # Supabase client & types
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components
│   └── assets/        # App assets
├── supabase/          # Supabase configuration
│   └── migrations/    # Database migrations
└── ...config files
```

---

## 🎨 Key Components

- **BarcodeScanner**: Real-time camera-based barcode scanning
- **ImageBarcodeScanner**: Upload and scan barcode images
- **ManualBarcodeInput**: Manual barcode entry fallback
- **CartItemCard**: Individual cart item display
- **ProductCard**: Product showcase component
- **BottomNav**: Mobile navigation bar

---

## 🔒 Security

- Supabase Row Level Security (RLS) enabled
- Secure authentication flow
- One-time QR codes for transaction verification
- Environment variables for sensitive data

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Development

### Working Locally

You can work locally using your preferred IDE (VS Code, WebStorm, etc.).

### GitHub Codespaces

1. Navigate to the main page of the repository
2. Click the "Code" button
3. Select the "Codespaces" tab
4. Click "New codespace" to launch the environment

---

## 📞 Support

For issues, questions, or suggestions:
- Open an [issue](../../issues)
- Submit a [pull request](../../pulls)

---

<div align="center">
  <p>Made with ❤️ for seamless shopping experiences</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>

## How can I deploy this project?

You can deploy this project to platforms like:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

Simply run `npm run build` to create a production build, then deploy the `dist` folder.
