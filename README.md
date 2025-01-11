# StudentHUB Frontend

## Project Structure

The project follows a modular and maintainable structure:

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components across features
│   ├── auth/            # Authentication-related components
│   ├── post/            # Post-related components
│   └── profile/         # Profile-related components
├── containers/          # Smart components that manage state
├── hooks/               # Custom React hooks
├── services/            # API calls and external services
├── utils/               # Helper functions and utilities
├── types/               # TypeScript interfaces and types
├── constants/           # App-wide constants
├── context/            # React Context providers
├── assets/             # Images, fonts, etc.
└── styles/             # Global styles and themes
```

## Conventions and Best Practices

### Component Structure
- Components are organized following atomic design principles
- Each component has its own directory with index.ts for clean exports
- Components are split between presentational (components/) and container (containers/) components

### TypeScript
- Strict type checking enabled
- Interfaces and types are centralized in the types/ directory
- Props are properly typed for all components

### Code Style
- Components follow single responsibility principle
- Consistent naming conventions:
  - PascalCase for components
  - camelCase for functions and variables
  - UPPER_SNAKE_CASE for constants
- Error boundaries implemented for robust error handling

### Imports
- Clean imports using index files
- Absolute imports configured for better readability
- Proper import organization (React, third-party, internal)

### State Management
- Context API used for global state
- Local state managed with hooks
- Props drilling avoided through proper component composition

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```
