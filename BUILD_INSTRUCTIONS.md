# Build & Deployment Instructions

This project uses **Vite** for bundling and **Terser** for minification. This pipeline ensures the game is optimized, obfuscated, and ready for web distribution on platforms like itch.io and CrazyGames.

## Prerequisites

*   [Node.js](https://nodejs.org/) (Version 16 or higher recommended)

## 1. Setup

If this is your first time running the project after downloading the source, install the dependencies:

```bash
npm install
```

## 2. Development

To work on the game with hot-reloading (updates instantly as you save files):

```bash
npm run dev
```

*   This starts a local server (usually at `http://localhost:5173`).
*   Open this URL in your browser to play.

## 3. Building for Production

To create the final version of the game for the public:

```bash
npm run build
```

*   This command cleans the `dist/` folder and generates a fresh build.
*   **Output:** A `dist/` folder containing:
    *   `index.html` (The entry point)
    *   `assets/` (Optimized JavaScript and CSS files)
*   **Features:**
    *   Code is minified (variables renamed, whitespace removed).
    *   `console.log` statements are stripped out.
    *   Relative paths (`./`) are used so the game works in any subfolder.

## 4. Testing the Build

Before uploading, verify that the production build works locally:

```bash
npm run preview
```

*   This spins up a local server hosting the `dist/` folder.
*   If it works here, it will work on the web.

## 5. Deployment

### itch.io / CrazyGames / Newgrounds

1.  Run `npm run build`.
2.  Navigate to the `dist/` folder.
3.  **Select all files** inside `dist/` (`index.html` and the `assets` folder).
4.  Right-click and choose **"Send to" -> "Compressed (zipped) folder"**.
5.  Upload this `.zip` file to the platform.
    *   **itch.io:** Set "Kind of project" to "HTML".    

**Important:** Do NOT zip the entire project folder or the `src/` folder. Only zip the *contents* of `dist/`.
