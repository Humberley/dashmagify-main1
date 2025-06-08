# AI Development Rules for Magify Finance

This document outlines the technology stack and specific library usage guidelines for the Magify Finance application. Adhering to these rules will ensure consistency and maintainability of the codebase.

## Tech Stack

The application is built using the following core technologies:

*   **Framework/Library**: React
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS
*   **UI Components**: shadcn/ui (built on Radix UI)
*   **Routing**: React Router (`react-router-dom`)
*   **Data Fetching & Server State**: TanStack Query (`@tanstack/react-query`)
*   **Forms**: React Hook Form (`react-hook-form`) with Zod for validation
*   **Icons**: Lucide Icons (`lucide-react`)
*   **Charts**: Recharts
*   **Date Utilities**: `date-fns`
*   **Backend & Database**: Supabase (`@supabase/supabase-js`)

## Library Usage Rules

### 1. UI Components
*   **Primary**: Always prefer using components from the **shadcn/ui** library. These are pre-built, accessible, and styled with Tailwind CSS.
*   **Underlying Primitives**: If a specific component or functionality is not available in shadcn/ui, you may use primitives from **Radix UI** directly, as shadcn/ui is built upon it.
*   **Custom Components**: Create new components in `src/components/` for any UI elements not covered by shadcn/ui or Radix UI. Ensure they are styled with Tailwind CSS and follow React best practices.

### 2. Styling
*   **Exclusively use Tailwind CSS** for all styling purposes.
*   Define custom theme configurations (colors, fonts, spacing) in `tailwind.config.ts`.
*   Global styles or base layer modifications should be placed in `src/index.css`.

### 3. Routing
*   Use **React Router (`react-router-dom`)** for all client-side routing.
*   Define all routes within the `src/App.tsx` file.
*   Page components should be located in the `src/pages/` directory.

### 4. State Management
*   **Server State & Asynchronous Operations**: Use **TanStack Query (`@tanstack/react-query`)** for managing server state, caching, and handling asynchronous data fetching.
*   **Local Component State**: Use React's built-in hooks (`useState`, `useReducer`) for managing local component state.
*   **Global Client State**: For simple global state needs (e.g., theme, mobile sidebar state), React Context API can be used. Avoid complex global state managers unless absolutely necessary.

### 5. Forms
*   Use **React Hook Form (`react-hook-form`)** for all form creation and management.
*   Use **Zod** for schema definition and validation in conjunction with React Hook Form.
*   Form-related components (e.g., custom input fields) should leverage shadcn/ui components.

### 6. Icons
*   Use icons from the **`lucide-react`** library.

### 7. Charts and Data Visualization
*   Use **Recharts** for creating charts and data visualizations.

### 8. Date and Time Utilities
*   Use **`date-fns`** for all date and time manipulations and formatting. Ensure consistent locale usage (e.g., `pt-BR`).

### 9. Backend and Database
*   All backend operations, authentication, and database interactions should be handled through **Supabase**.
*   Use the Supabase client (`@supabase/supabase-js`) initialized in `src/integrations/supabase/client.ts`.
*   Database types should be managed via `src/integrations/supabase/types.ts`.

### 10. TypeScript
*   Write all new code in **TypeScript**.
*   Strive for strong typing and leverage TypeScript's features to improve code quality and catch errors early.
*   Define custom types in relevant files or in a dedicated `src/types/` directory if they are shared across multiple modules.

### 11. Code Structure
*   **Pages**: `src/pages/`
*   **Reusable UI Components**: `src/components/`
    *   Dashboard-specific components: `src/components/dashboard/`
    *   Form-specific components: `src/components/forms/`
    *   Sidebar components: `src/components/sidebar/`
*   **shadcn/ui components**: `src/components/ui/` (These are generally not to be modified directly).
*   **Hooks**: `src/hooks/`
*   **Utilities/Libraries**: `src/lib/`
*   **Integrations (e.g., Supabase client)**: `src/integrations/`

By following these guidelines, we can maintain a clean, consistent, and efficient development process.