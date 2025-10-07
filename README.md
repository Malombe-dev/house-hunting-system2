# 🏠 House Hunting & Property Management System
## Complete Project Structure & Styling Guide

---

## 📁 Root Project Structure

```
house-hunting-system/
├── client/                     # React.js Frontend
├── server/                     # Node.js/Express Backend
├── shared/                     # Shared utilities/types
├── docs/                       # Documentation
├── docker-compose.yml          # Docker setup
├── .gitignore
├── README.md
└── package.json               # Root package.json for scripts
```

---

## 🎨 Frontend Structure (React + Tailwind)

```
client/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── common/            # Global components
│   │   │   ├── Header.jsx #done
│   │   │   ├── Footer.jsx  #done
│   │   │   ├── Sidebar.jsx
│   │   │   ├── LoadingSpinner.jsx # done
│   │   │   ├── Modal.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── ConfirmDialog.jsx
|   |   |   └── ProtectedRoute.jsx # done
│   │   ├── forms/             # Form components
│   │   │   ├── PropertyForm.jsx
│   │   │   ├── TenantForm.jsx
│   │   │   ├── LoginForm.jsx 
│   │   │   └── RegisterForm.jsx
│   │   ├── cards/             # Card components
│   │   │   ├── PropertyCard.jsx
│   │   │   ├── TenantCard.jsx
│   │   │   ├── PaymentCard.jsx
│   │   │   └── MaintenanceCard.jsx
│   │   ├── filters/           # Search & filter components
│   │   │   ├── SearchBar.jsx
│   │   │   ├── PropertyFilters.jsx
│   │   │   └── SortOptions.jsx
│   │   └── charts/            # Analytics components
│   │       ├── RevenueChart.jsx
│   │       ├── OccupancyChart.jsx
│   │       └── PaymentChart.jsx
│   ├── pages/                 # Page components
│   │   ├── auth/
│   │   │   ├── Login.jsx #Done
│   │   │   ├── Register.jsx #done
│   │   │   └── ForgotPassword.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── PropertyApprovals.jsx
│   │   │   ├── DisputeManagement.jsx
│   │   │   └── PlatformAnalytics.jsx
│   │   ├── agent/
│   │   │   ├── AgentDashboard.jsx
│   │   │   ├── PropertyManagement.jsx
│   │   │   ├── TenantManagement.jsx
│   │   │   ├── PaymentTracking.jsx
│   │   │   ├── MaintenanceRequests.jsx
│   │   │   └── AgentAnalytics.jsx
│   │   ├── tenant/
│   │   │   ├── TenantDashboard.jsx
│   │   │   ├── RentPayments.jsx
│   │   │   ├── MaintenanceRequests.jsx
│   │   │   ├── LeaseAgreements.jsx
│   │   │   └── PaymentHistory.jsx
│   │   ├── seeker/
│   │   │   ├── PropertySearch.jsx
│   │   │   ├── PropertyDetails.jsx
│   │   │   ├── SavedProperties.jsx
│   │   │   └── Applications.jsx
│   │   └── shared/
│   │   |    ├── Profile.jsx
│   │   |    ├── Settings.jsx
│   │   |    └── NotFound.jsx
|   |   └── public/
│   │       ├── Home.jsx #done
│   │       ├── 
│   │       └── 
│   ├── layouts/               # Layout components
│   │   ├── AdminLayout.jsx
│   │   ├── AgentLayout.jsx
│   │   ├── TenantLayout.jsx
│   │   └── PublicLayout.jsx #done
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useProperties.js
│   │   ├── usePayments.js
│   │   ├── useTenants.js
│   │   └── useNotifications.js
│   ├── context/               # React Context
│   │   ├── AuthContext.js #done
│   │   ├── ThemeContext.js
│   │   └── NotificationContext.js #done
│   ├── services/              # API services
│   │   ├── api.js      #done       # Axios instance
│   │   ├── authService.js #done
│   │   ├── propertyService.js
│   │   ├── tenantService.js
│   │   ├── paymentService.js
│   │   └── maintenanceService.js
|   |   └── maintenanceService.js #done
│   ├── utils/                 # Utility functions
│   │   ├── formatters.js     # Date, currency formatters
│   │   ├── validators.js     # Form validation
│   │   ├── constants.js  #done    # App constants
│   │   └── helpers.js        # Helper functions
│   ├── styles/                # Global styles
│   │   ├── globals.css       # Global CSS + Tailwind imports
│   │   └── components.css    # Custom component styles
│   ├── assets/                # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── App.jsx       #done        # Main App component
│   ├── App.css        #done       # App-specific styles
│   ├── index.js       #done       # Entry point
│   └── index.css      #done       # Root styles
├── tailwind.config.js     #done    # Tailwind configuration
├── postcss.config.js       #done   # PostCSS configuration
├── package.json 
└── .env                       # Environment variables
```

---

## 🔧 Backend Structure (Node.js + Express)

```
server/
├── src/
│   ├── config/                # Configuration files
│   │   ├── database.js   #done    # MongoDB connection
│   │   ├── cloudinary.js     # Image upload config
│   │   ├── payment.js        # Payment gateway config
│   │   └── email.js          # Email service config
│   ├── models/                # MongoDB schemas
│   │   ├── User.js      #done     # User model (admin, agent, tenant, seeker)
│   │   ├── Property.js   #done    # Property model
│   │   ├── Tenant.js      #done   # Tenant details model
│   │   ├── Lease.js      #done    # Lease agreement model
│   │   ├── Payment.js    #done    # Payment records model
│   │   ├── Receipt.js             # Receipt model
│   │   ├── Maintenance.js  #done  # Maintenance request model
│   │   ├── Review.js    #done     # Reviews & ratings model
│   │   └── Notification.js  #done # Notification model
│   ├── controllers/           # Route controllers
│   │   ├── authController.js #done
│   │   ├── userController.js
│   │   ├── propertyController.js #done
│   │   ├── tenantController.js
│   │   ├── paymentController.js
│   │   ├── maintenanceController.js
│   │   ├── reviewController.js
│   │   └── analyticsController.js
│   ├── routes/                # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── properties.js
│   │   ├── tenants.js
│   │   ├── payments.js
│   │   ├── maintenance.js
│   │   ├── reviews.js
│   │   └── analytics.js
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js       #done    # JWT authentication
│   │   ├── roleAuth.js   #done    # Role-based access control
│   │   ├── upload.js    #done     # File upload middleware
│   │   ├── validation.js  #done   # Request validation
│   │   └── errorHandler.js   #done # Error handling
│   ├── services/              # Business logic services
│   │   ├── emailService.js   # Email notifications
│   │   ├── smsService.js     # SMS notifications
│   │   ├── paymentService.js # Payment processing
│   │   ├── receiptService.js # Receipt generation
│   │   └── notificationService.js
│   ├── utils/                 # Utility functions
│   │   ├── jwt.js            # JWT helpers
│   │   ├── bcrypt.js         # Password hashing
│   │   ├── pdf.js            # PDF generation
│   │   ├── validators.js     # Data validation
│   │   └── constants.js      # App constants
│   ├── jobs/                  # Background jobs
│   │   ├── rentReminders.js  # Rent reminder job
│   │   ├── receiptGeneration.js
│   │   └── maintenanceFollowup.js
│   └── app.js                # Express app setup
├── uploads/                   # File uploads directory
├── logs/                      # Application logs
├── package.json
├── .env                       # Environment variables
└── server.js  #done                 # Server entry point
```

---

## 🎨 Tailwind CSS Design System

### Color Palette
```css
/* Primary Colors */
primary-50: #eff6ff
primary-500: #3b82f6  /* Main brand color */
primary-600: #2563eb
primary-700: #1d4ed8

/* Secondary Colors */
secondary-50: #f0fdf4
secondary-500: #10b981  /* Success green */
secondary-600: #059669

/* Accent Colors */
accent-500: #f59e0b     /* Warning amber */
danger-500: #ef4444     /* Error red */

/* Neutral Colors */
gray-50: #f9fafb
gray-100: #f3f4f6
gray-500: #6b7280
gray-900: #111827
```

### Typography Scale
```css
/* Headings */
text-xs: 12px
text-sm: 14px
text-base: 16px
text-lg: 18px
text-xl: 20px
text-2xl: 24px
text-3xl: 30px
text-4xl: 36px

/* Font Weights */
font-light: 300
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
```

### Spacing System
```css
/* Margins & Padding */
0: 0px
1: 4px
2: 8px
3: 12px
4: 16px
6: 24px
8: 32px
12: 48px
16: 64px
20: 80px
24: 96px
```

---

## 📱 Component Styling Guidelines

### Card Components
```css
/* Base Card */
.card-base: bg-white rounded-lg shadow-md border border-gray-200 p-6

/* Property Card */
.property-card: hover:shadow-lg transition-shadow duration-300 cursor-pointer

/* Dashboard Cards */
.dashboard-card: bg-gradient-to-br from-primary-500 to-primary-600 text-white
```

### Form Styling
```css
/* Input Fields */
.input-base: w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent

/* Buttons */
.btn-primary: bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors
.btn-secondary: bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors
.btn-danger: bg-danger-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors
```

### Layout Classes
```css
/* Container */
.container-base: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8

/* Grid Layouts */
.grid-properties: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
.grid-dashboard: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6

/* Flexbox Utilities */
.flex-between: flex justify-between items-center
.flex-center: flex justify-center items-center
```

---

## 📂 File Creation Checklist

### Essential Configuration Files

1. **Frontend Setup**
   - `client/package.json` - React dependencies + Tailwind
   - `client/tailwind.config.js` - Tailwind configuration
   - `client/postcss.config.js` - PostCSS setup
   - `client/src/index.css` - Tailwind imports
   - `client/src/styles/globals.css` - Global styles

2. **Backend Setup**
   - `server/package.json` - Node.js dependencies
   - `server/.env` - Environment variables
   - `server/src/config/database.js` - MongoDB connection
   - `server/src/app.js` - Express app setup

3. **Root Level**
   - `package.json` - Workspace scripts
   - `docker-compose.yml` - Development environment
   - `.gitignore` - Git ignore rules

### Priority Components to Build First

1. **Authentication System**
   - Login/Register forms
   - JWT middleware
   - Role-based routing

2. **Property Management**
   - Property listing/creation
   - Search and filters
   - Property details

3. **User Dashboards**
   - Admin dashboard
   - Agent dashboard
   - Tenant dashboard

4. **Payment System**
   - Payment tracking
   - Receipt generation
   - Payment history

