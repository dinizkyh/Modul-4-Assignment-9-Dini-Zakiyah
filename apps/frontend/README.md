# Task Management Frontend

A modern React frontend application for the Task Management API, built with TypeScript, Tailwind CSS, and Vite.

## Features

- ⚡️ **Vite** - Fast build tool and dev server
- ⚛️ **React 18** - Latest React with TypeScript
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🌙 **Dark Mode** - Built-in dark/light theme toggle
- 📱 **Responsive** - Mobile-first responsive design
- 🔧 **ESLint & Prettier** - Code linting and formatting
- 🔄 **Hot Reload** - Instant feedback during development

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd apps/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit: `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API services
├── hooks/              # Custom React hooks
├── context/            # React Context providers
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main App component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Development Features

- **Hot Reload**: Automatic page refresh on file changes
- **TypeScript**: Full type safety and IntelliSense
- **Tailwind CSS**: Utility-first styling with dark mode support
- **ESLint**: Code quality and consistency
- **Prettier**: Automatic code formatting
- **Vite Proxy**: API calls proxied to backend server

## API Integration

The frontend is configured to proxy API calls to the backend server running on `http://localhost:3000`. All API endpoints are available under `/api/*`.

## Theme Support

The application includes built-in dark/light theme switching with:
- System preference detection
- Local storage persistence
- Smooth transitions between themes
- Tailwind CSS dark mode utilities

## Contributing

1. Follow the existing code style
2. Run linting and formatting before committing
3. Ensure all components are responsive
4. Test both light and dark themes
