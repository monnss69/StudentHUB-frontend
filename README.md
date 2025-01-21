# StudentHub - Frontend

A modern web application built with React, Vite, and TypeScript for managing student posts and interactions.

## 🚀 Features

- User authentication and profile management
- Post creation and management across different categories
- Real-time search functionality
- Responsive design with Tailwind CSS
- Image upload support with Cloudinary
- Tag management system
- Comment system
- Pagination support

## 🛠️ Prerequisites

Before you begin, ensure you have installed:
- Node.js (v18 or higher)
- npm (v8 or higher)
- Git

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/monnss69/StudentHUB-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_API_URL='http://localhost:8080'  # Replace with your backend API URL
   ```

## 🔧 Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🛠️ Tech Stack

- React 19
- Vite 6
- TypeScript
- Tailwind CSS
- React Query
- React Router DOM
- Framer Motion
- Cloudinary
- Axios
- JWT Authentication

## 📝 Notes

- Ensure your backend server is running before starting the frontend application
- The application uses Cloudinary for image uploads. Make sure your backend is configured with proper Cloudinary credentials
- The application includes automatic token refresh and request retry mechanisms

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration can be found in:
- `tailwind.config.js`
- `postcss.config.js`

Custom animations and styles are defined in `src/index.css`
