# ELCOMDAIS Website

Welcome to the ELCOMDAIS Website codebase. This is a modern, responsive web application built using **React**, **Vite**, and **Tailwind CSS/Vanilla CSS** that features a local-first architecture using a hybrid storage model (LocalStorage + IndexedDB + Supabase integration).

The website includes a dynamic calendar, event detail views, a photo gallery with lightbox, an about page, and a fully featured admin control panel.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18.x or later recommended).

### 2. Installation
Clone the repository and install the project dependencies:
```bash
# Clone the repository
git clone https://github.com/elcomdiasece-dev/ELCOMDAIS-WEBSITE.git
cd ELCOMDAIS-WEBSITE

# Install dependencies
npm install
```

### 3. Running the Project Locally
Start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
The application will be running locally at `http://localhost:5173`.

---

## 🛠️ Run & Build Commands

Here are all the scripts defined in `package.json`:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Builds the production-ready optimized bundles to the `/dist` directory |
| `npm run preview` | Serves the built production build locally for verification |
| `npm run lint` | Runs the Oxlint linter to detect code quality issues |

---

## 🔐 Database & Authentication Setup

The project is designed with a **local-first fallback system**. It will run completely out of the box using `localStorage` and `IndexedDB` for media/blobs, meaning **Supabase is optional for local development**.

### Option A: Local Storage Mode (Out-of-the-Box)
No database credentials needed. Simply run `npm run dev`.
* **Default Admin Credentials**:
  * **Username**: `admin`
  * **Password**: `password123`

### Option B: Supabase Mode (Production/Shared DB)
To connect the application to a cloud database, create a `.env.local` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Supabase Database Schema
If you use Supabase, configure the following tables in your Supabase SQL Editor:

1. **`events`**
   * `id` (text, primary key)
   * `title` (text)
   * `slug` (text)
   * `description` (text)
   * `coverImage` (text)
   * `startDate` (timestamp with time zone)
   * `endDate` (timestamp with time zone)
   * `location` (text)
   * `createdAt` (timestamp with time zone)
   * `updatedAt` (timestamp with time zone)

2. **`registrations`**
   * `id` (text, primary key)
   * `eventId` (text, foreign key referencing `events.id` on delete cascade)
   * `data` (text, JSON-stringified form responses)
   * `registeredAt` (timestamp with time zone)

3. **`albums`**
   * `id` (text, primary key)
   * `title` (text)
   * `description` (text)
   * `coverImage` (text)
   * `createdAt` (timestamp with time zone)

4. **`images`**
   * `id` (bigint, primary key generated always as identity)
   * `albumId` (text, foreign key referencing `albums.id` on delete cascade)
   * `url` (text)
   * `caption` (text)

5. **`settings`**
   * `key` (text, primary key)
   * `value` (text, JSON-stringified settings content)
   * `updatedAt` (timestamp with time zone)

#### Supabase Auth Setup
* Go to the **Authentication** tab in your Supabase dashboard.
* Enable **Email/Password** provider under sign-in providers.
* Once enabled, you can register new admin accounts through the application's `/admin/register` page, or sign in using your existing Supabase auth credentials on the `/admin/login` page.
