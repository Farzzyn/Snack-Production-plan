# Snack-Production-plan

A modern, full-featured **Snack Production Planning and Scheduling Application** tailored for artisanal snack production, batch planning, recipe Bill of Materials (BOM), packaging BOMs, machine capacity allocation, and staff management.

## 🌟 Key Features

- **Dynamic Production Planning**: Generate optimized daily, weekly, and monthly production schedules across multiple snack lines.
- **Recipe & Packaging BOM Engines**: Automatically calculate raw material requirements, packaging material requirements, and batch proportions.
- **Machine Capacity & Constraints**: Balance load across fryers, mixers, extruders, and packing lines with shift-based capacity limits.
- **Real-Time Staff Allocation**: Assign chefs, supervisors, and packing teams with automated workload balancing.
- **Artisanal Theme & Dashboard UI**: Minimalist, warm Kerala artisanal aesthetic with real-time KPI metrics, export capabilities, and interactive charts.
- **Database & Sync**: Backed by Supabase schema with full seed data and offline-resilient calculation engines.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Farzzyn/Snack-Production-plan.git
   cd Snack-Production-plan
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional for local mock data mode):
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Lucide Icons, Modern Vanilla CSS Design System
- **State & Logic**: Pure calculation engines for BOMs, capacities, and scheduling
- **Backend / Database**: Supabase (PostgreSQL with RLS & Stored Procedures)

## 📄 License

MIT
