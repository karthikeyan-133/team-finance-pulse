# SlickerConnect - Multi-Portal Business Management System

A comprehensive React-based web application for managing delivery business operations across multiple user roles.

## 🚀 Features

### Admin Panel
- Complete system oversight and analytics
- Order tracking & management
- Shop and product management
- Delivery boy management
- Financial analytics

### Customer Portal
- Chat-based ordering experience
- Category-based product browsing
- Real-time order tracking

### Shop Portal
- Business dashboard for shop owners
- Order management
- Sales analytics

### Delivery Portal
- Delivery management interface
- Real-time assignment updates
- Route optimization

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **State Management**: React Query
- **Routing**: React Router DOM

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:8080](http://localhost:8080) in your browser

## 📱 Portal Access

| Portal | Route | Demo Credentials |
|--------|-------|------------------|
| Admin Panel | `/login` | admin@slickerconnect.com / admin123 |
| Customer Portal | `/customer-portal` | Phone-based registration |
| Shop Portal | `/shop-login` | Access code: `shop123` |
| Delivery Portal | `/delivery-boy-login` | Phone-based authentication |

## 📁 Project Structure

```
src/                    # Main application
├── components/         # Reusable UI components
├── pages/             # Page components
├── hooks/             # Custom React hooks
├── context/           # React context providers
├── types/             # TypeScript definitions
└── integrations/      # Supabase integration

admin-panel/           # Admin dashboard
customer-portal/       # Customer interface
delivery-portal/       # Delivery management
shop-portal/          # Shop owner interface
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Deployment

Deploy easily via [Lovable](https://lovable.dev/projects/7acb16e4-faa9-40c5-a598-ca38e8d6a9cd):
1. Click Share → Publish
2. Connect custom domain (optional)

## 🗄️ Database

Uses Supabase for:
- Real-time data synchronization
- User authentication
- File storage
- Backend logic

## 📝 License

MIT License
