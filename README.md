# FileFind Frontend

React and Next.js frontend for the FileFind project.

## Overview

This frontend is built with Next.js 16, React 19, and shadcn/ui components. It provides a dashboard-style interface for searching indexed files, managing folders, and interacting with the FileFind backend.

## Related Projects

- Backend (FastAPI): [fileFind-BE](https://github.com/Hussen-ghadban/fileFind-BE)

## Features

- File search UI
- Folder navigation
- Responsive dashboard layout
- Theme toggle support
- API integration with the FileFind backend
- Semantic content search powered by backend vector embeddings

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open `http://localhost:3000` in your browser.

## Build

Create a production build:
```bash
npm run build
```

Start the production server:
```bash
npm run start
```

## Notes

- The frontend uses `@tanstack/react-query` and `axios` for data fetching.
- UI components are organized under `app/components` and `app/components/ui`.
- The dashboard entry point is `app/dashboard/page.tsx`.
- If the backend is running locally, point API requests to the backend base URL from the frontend configuration.
