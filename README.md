
# WorkMint Hub - Factory Management SaaS

A comprehensive mobile-first SaaS web application for factory management with multi-tenant architecture. Built with modern React stack and designed for industrial workflows.

## 🎯 Project Overview

WorkMint Hub is a factory management system that streamlines industrial operations through role-based interfaces, task management, and comprehensive reporting. The platform supports multiple factories (tenants) with isolated data and customizable workflows.

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling with custom design system
- **shadcn/ui** component library
- **Zustand** for state management
- **React Query** for data fetching and caching
- **React Router** for navigation
- **React Hook Form** with Zod validation

### Backend Integration
- **Production Ready**: Complete API service layer for MongoDB + JWT
- **React Query Integration**: Optimized data fetching and caching
- **Offline Support**: Full offline capabilities with sync
- **Mock Data Layer**: Comprehensive development environment

## 👥 User Roles & Features

### Super Admin
- **Tenant Management**: Approve/reject new factory applications
- **System Oversight**: Monitor all tenants and global settings
- **Audit Controls**: System-wide configuration and policies

### Factory Admin
- **Product Management**: Create products with multi-stage processes
- **User Management**: Invite team members, assign roles
- **Factory Settings**: Branding, holidays, notification preferences
- **Reporting**: Factory-wide analytics and insights

### Supervisor
- **Task Assignment**: Create and assign tasks to employees
- **Team Oversight**: Monitor team progress and productivity
- **Task Review**: Confirm/reject completed work
- **Workflow Management**: Calendar and list views for task tracking

### Employee
- **Task Execution**: View and update assigned tasks
- **Progress Tracking**: Real-time completion status
- **Mobile Workflow**: Optimized for shop floor use
- **Offline Support**: Work offline with sync capabilities

## 🎨 Design System

### Color Palette
- **Primary**: Royal Blue (#2563EB) - Professional and trustworthy
- **Accent**: Light Blue accents for interactive elements
- **Status Colors**: 
  - Success: Emerald green
  - Warning/Error: Red
  - Pending: Slate gray
  - Active: Royal Blue

### Mobile-First Approach
- Card-based layouts for easy mobile interaction
- Minimum 48dp touch targets
- Bottom navigation for primary actions
- Responsive breakpoints for tablet/desktop

## 🛠 Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd workmint-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📱 Key Features

### Authentication & Onboarding
- Multi-step factory registration
- Role-based authentication
- Tenant approval workflow
- Password reset functionality

### Task Management
- Week-based task assignment
- Progress tracking with visual indicators
- Bulk task operations
- Escalation for overdue items

### Process Management
- Multi-stage product workflows
- Reorderable process stages
- Quantity tracking and validation
- Quality control checkpoints

### Reporting & Analytics
- Real-time productivity metrics
- Completion rate tracking
- Team performance insights
- Export capabilities (CSV/PDF)

## 🏗 Architecture

### Component Structure
```
src/
├── components/
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   └── ui/            # Reusable UI components
├── pages/             # Route components
├── stores/            # State management
├── types/             # TypeScript definitions
└── utils/             # Utility functions
```

### State Management
- **Zustand** for global state (auth, user data)
- **React Query** for server state and caching
- Local state for component-specific data

### Styling Approach
- **TailwindCSS** with custom design tokens
- Component-scoped styles when needed
- Consistent spacing and typography scale
- Dark mode support ready

## 🔐 Security Features

- Tenant data isolation
- Role-based access control
- Secure authentication flow
- Data validation with Zod schemas

## 📊 Performance Optimizations

- Code splitting by routes
- Lazy loading for heavy components
- Optimized bundle size
- Progressive Web App features ready

## 🚀 Deployment

The application is ready for deployment on modern hosting platforms:
- Netlify
- Vercel  
- Traditional web servers

Build assets are generated in the `dist/` directory after running `npm run build`.

## 🤝 Contributing

1. Follow the established code style
2. Use TypeScript for type safety
3. Maintain mobile-first responsive design
4. Test across different screen sizes
5. Follow the component naming conventions

## 📞 Support

For technical support or feature requests, please refer to the project documentation or contact the development team.

---

**WorkMint Hub** - Streamlining factory operations with modern web technology.
