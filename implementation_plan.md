# CRM Internal Tool Prototype - Implementation Plan

This document outlines the design and implementation plan for building the college DBMS CRM prototype. The system consists of a React frontend matching the provided Tailwind CSS-styled templates, a Node.js + Express backend, and an SQLite database with triggers and seed data.

## User Review Required

> [!IMPORTANT]
> - **Cascade Deletions & SQLite constraints**: By default, SQLite has foreign keys disabled. We will run `PRAGMA foreign_keys = ON;` immediately on database connection setup to ensure that cascading deletes work correctly when deleting a customer or order.
> - **Seeding Mathematical Consistency**: In the provided seed data, the order totals and order detail quantities/product prices are aligned (e.g. C001, O001 total is ₹55,000, which matches 1 Laptop at ₹55,000). For Mouse (O006, ₹800) and Webcam (O007, ₹2,500), we will seed quantities as `qty 1` to maintain mathematical consistency with the product prices (Mouse = ₹800, Webcam = ₹2,500).

## Proposed Changes

We will create a full-stack project structure in `d:\CRM_v1` containing:
- **Backend API**: Node.js/Express app running on port 5000.
- **Frontend App**: Vite/React app running on port 5173 (using Tailwind CSS configured to match the "Azure Flux" color palette).
- **SQLite Database**: Single-file database `crm.db` stored in the workspace directory.

```
d:\CRM_v1\
  ├── package.json           # Root package.json to run frontend & backend in parallel
  ├── backend\
  │    ├── package.json      # Express, sqlite3, cors, and other packages
  │    ├── server.js         # REST API server & database setup
  │    └── crm.db            # SQLite database file (created automatically)
  └── frontend\
       ├── package.json      # Vite, React, React Router, Tailwind, Lucide React (for icons)
       ├── index.html        # App wrapper
       ├── vite.config.js    # Dev proxy config to route /api/ to backend
       ├── tailwind.config.js# Custom Azure Flux theme colors and styling definitions
       ├── src\
       │    ├── main.jsx     # App mounting
       │    ├── index.css    # Custom styles & glassmorphism utilities
       │    ├── App.jsx       # Routing (React Router) & Navigation shell
       │    ├── components\
       │    │    ├── Layout.jsx           # Main navigation layout (with TopNav and SideNav)
       │    │    └── UniversalSearch.jsx  # Universal search bar dropdown component
       │    └── pages\
       │         ├── Login.jsx            # Login page (Admin/Employee quick links)
       │         ├── Dashboard.jsx        # General widgets and summaries
       │         ├── Customers.jsx        # Customer list, filtering, add/edit/delete
       │         ├── CustomerProfile.jsx  # Detail page for a specific customer
       │         ├── Products.jsx         # Product inventory & stock adjustments
       │         ├── Orders.jsx           # Create order & list orders
       │         ├── OrderDetails.jsx     # Detailed order receipt with feedback
       │         ├── Payments.jsx         # Record payments & history list (Admin only)
       │         ├── SupportTickets.jsx   # Create/Update/Status workflow for support
       │         ├── Feedback.jsx         # Feedback list
       │         ├── Employees.jsx        # Employee list, roles, and tickets count (Admin only)
       │         ├── ActivityLog.jsx      # Deletion logs from Customer_Audit (Admin only)
       │         └── Reports.jsx          # KPI metrics & aggregate DBMS stats
```

---

### Backend API (`backend/`)

#### [NEW] [server.js](file:///d:/CRM_v1/backend/server.js)
1. Initialize the SQLite database and enable `PRAGMA foreign_keys = ON;`.
2. Create tables (`Customer`, `Employee`, `Product`, `Orders`, `OrderDetails`, `Payment`, `Feedback`, `SupportTicket`, `Customer_Audit`) matching the schema exactly.
3. Add a SQLite trigger to copy deleted customers into `Customer_Audit`:
   ```sql
   CREATE TRIGGER IF NOT EXISTS log_customer_deletion
   AFTER DELETE ON Customer
   BEGIN
       INSERT INTO Customer_Audit (CID, Name, Deleted_Date)
       VALUES (OLD.CID, OLD.Name, DATE('now'));
   END;
   ```
4. Seed the database with the exact requested 7 customers, 7 employees, 7 products, 7 orders, order details, payments, support tickets, and feedbacks.
5. Expose REST endpoints:
   - `GET /api/dashboard`: Aggregated stats (totals, widget data, recent items).
   - `GET/POST/PUT/DELETE /api/customers`: CRUD for Customers. Also `GET /api/customers/:id` for profiles (returns orders, payments, feedback, tickets).
   - `GET/POST/PUT/DELETE /api/products`: CRUD for Products, including updating stock.
   - `GET/POST /api/orders`: Create orders, get orders, and `GET /api/orders/:id` for details (includes products list, payments, specific feedback).
   - `GET/POST /api/payments`: Record a payment, retrieve history.
   - `GET/POST/PUT /api/tickets`: Tickets list, log new ticket, update status.
   - `GET/POST /api/feedback`: Fetch feedback list.
   - `GET/POST/PUT/DELETE /api/employees`: Manage employees, calculate assigned tickets count.
   - `GET /api/activity-log`: Fetch records from `Customer_Audit`.
   - `GET /api/reports`: DBMS reports (Total revenue, monthly orders, most sold, average satisfaction, open ticket counts).
   - `GET /api/search?q=...`: Universal search querying across Customers, Products, and Orders.

---

### Frontend App (`frontend/`)

We will configure Vite and Tailwind CSS to implement the "Azure Flux" design system:
- **Tailwind configuration**: Setup theme extending the exact color hexes (`surface`, `surface-container`, `primary: #57f1db`, `secondary: #bcc7de`, etc.), typography (Geist + Inter font families), and border radiuses.
- **Glassmorphic styles**: Custom utility classes in `index.css` for `.glass-panel` and `.input-glass` mimicking the design templates exactly.

#### [NEW] [vite.config.js](file:///d:/CRM_v1/frontend/vite.config.js)
Setup a reverse proxy so that frontend fetches to `/api` are forwarded to the Express server on port 5000.

#### [NEW] [App.jsx](file:///d:/CRM_v1/frontend/src/App.jsx)
Sets up client-side routing using `react-router-dom` with the following routes:
- `/login`: The landing login screen.
- `/`: Protected layout with sidebar navigation, showing `Dashboard`.
- `/customers`: Customers directory list.
- `/customers/:id`: Customer detail profile.
- `/products`: Inventory management.
- `/orders`: Orders list & creation form.
- `/orders/:id`: Order detail receipt.
- `/payments`: Payment recording and logging (Admin only).
- `/tickets`: Customer service support tickets.
- `/feedback`: Customer feedback reviews.
- `/employees`: Employee management directory (Admin only).
- `/activity-log`: Activity deletion audit table (Admin only).
- `/reports`: DBMS analytical graphs and summaries (Admin only).

#### Layout & Navigation:
- **Sidebar (`SideNav`)**: Responsive menu. Adapts dynamically to role: if `Employee`, hides Payments, Employees, Reports, and Activity Log.
- **Topbar (`TopNav`)**: Displays the page title, user profile (Admin or Employee avatar), and the **Universal Search Bar**.
- **Universal Search Dropdown**: Listens to input and displays categorized search results (Customers, Products, Orders). Clicking a search result routes the user directly to the relevant details page.

---

## Verification Plan

### Automated Verification
We will run:
- A lint/build test on both backend and frontend.
- API testing via curl/fetch to verify endpoints are working correctly.

### Manual Verification using Browser Subagent
We will run a browser subagent that:
1. Navigates to `/login`, signs in as Admin, and verifies the Dashboard metrics load.
2. Creates a new order (C001 buys a Keyboard and Webcam) and verifies that:
   - Order history updates on the customer profile.
   - Dashboard total orders and total revenue values increase.
3. Deletes a customer (e.g. C007) and verifies that:
   - The deletion log shows up in the Activity Log (`Customer_Audit`).
   - Cascade deletion works (e.g., related orders or tickets are removed).
4. Navigates to `/orders/O001` and confirms it displays exactly the feedback tied to O001 (and not other C001 feedback).
5. Verifies that the Reports numbers match standard SQL aggregation (seeded revenue = ₹99,800).
6. Logs out, logs in as Employee, and confirms restricted pages (like Payments, Employees, Reports, Activity Log) are inaccessible and links are hidden.
7. Takes screenshots of the Dashboard, Customer Profile, and Order Details pages.
