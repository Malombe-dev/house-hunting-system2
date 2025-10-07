#!/bin/bash

# ===============================
# Project Scaffolding Script
# ===============================

# Function to create directory if not exists
create_dir() {
  if [ ! -d "$1" ]; then
    mkdir -p "$1"
    echo "✅ Created directory: $1"
  else
    echo "⚡ Directory exists, skipped: $1"
  fi
}

# Function to create file if not exists
create_file() {
  dir=$(dirname "$1")
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
    echo "✅ Created directory (auto): $dir"
  fi
  if [ ! -f "$1" ]; then
    touch "$1"
    echo "📄 Created file: $1"
  else
    echo "⚡ File exists, skipped: $1"
  fi
}

# ===============================
# CLIENT SIDE
# ===============================
create_dir client/public
create_file client/public/index.html
create_file client/public/favicon.ico
create_file client/public/manifest.json

create_dir client/src
create_file client/src/index.js
create_file client/src/App.js
create_file client/src/App.css

create_dir client/src/components/common
create_file client/src/components/common/Header.jsx
create_file client/src/components/common/Footer.jsx

create_dir client/src/components/forms
create_file client/src/components/forms/PropertyForm.jsx
create_file client/src/components/forms/TenantForm.jsx

create_dir client/src/components/cards
create_file client/src/components/cards/PropertyCard.jsx
create_file client/src/components/cards/TenantCard.jsx

create_dir client/src/components/filters
create_file client/src/components/filters/PropertyFilter.jsx

create_dir client/src/pages/admin
create_file client/src/pages/admin/AdminDashboard.jsx
create_file client/src/pages/admin/ManageProperties.jsx
create_file client/src/pages/admin/ManageTenants.jsx

create_dir client/src/pages/agent
create_file client/src/pages/agent/AgentDashboard.jsx

create_dir client/src/pages/tenant
create_file client/src/pages/tenant/TenantDashboard.jsx

create_dir client/src/pages/auth
create_file client/src/pages/auth/Login.jsx
create_file client/src/pages/auth/Register.jsx

create_dir client/src/pages
create_file client/src/pages/Home.jsx
create_file client/src/pages/NotFound.jsx

create_dir client/src/context
create_file client/src/context/AuthContext.js

create_dir client/src/services
create_file client/src/services/api.js

create_dir client/src/utils
create_file client/src/utils/helpers.js

create_file client/src/styles/global.css

# ===============================
# SERVER SIDE
# ===============================
create_dir server/src/config
create_file server/src/config/db.js

create_dir server/src/models
create_file server/src/models/User.js
create_file server/src/models/Property.js
create_file server/src/models/Tenant.js
create_file server/src/models/Payment.js
create_file server/src/models/Lease.js
create_file server/src/models/Message.js

create_dir server/src/controllers
create_file server/src/controllers/authController.js
create_file server/src/controllers/propertyController.js
create_file server/src/controllers/tenantController.js
create_file server/src/controllers/paymentController.js
create_file server/src/controllers/leaseController.js
create_file server/src/controllers/messageController.js

create_dir server/src/routes
create_file server/src/routes/auth.js
create_file server/src/routes/properties.js
create_file server/src/routes/tenants.js
create_file server/src/routes/payments.js
create_file server/src/routes/leases.js
create_file server/src/routes/messages.js

create_dir server/src/middleware
create_file server/src/middleware/auth.js
create_file server/src/middleware/errorHandler.js

create_dir server/src/services
create_file server/src/services/emailService.js
create_file server/src/services/paymentService.js

create_dir server/src/utils
create_file server/src/utils/jwt.js
create_file server/src/utils/logger.js

create_dir server/src/jobs
create_file server/src/jobs/rentReminders.js

create_file server/src/app.js
create_file server/server.js

# ===============================
# SHARED + ROOT FILES
# ===============================
create_dir shared
create_file shared/types.js
create_file shared/constants.js

create_dir docs
create_file docs/README.md

create_file docker-compose.yml
create_file .gitignore
create_file README.md
create_file package.json
