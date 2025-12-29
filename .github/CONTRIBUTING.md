# Contributing to Tarkov Task Tracker

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Local Development Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/task-tracker.git
   cd task-tracker
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173)

## How to Contribute

### Reporting Bugs

Before submitting a bug report:

- Check existing [issues](https://github.com/Wilsman/task-tracker/issues) to avoid duplicates
- Use the bug report template when creating a new issue
- Include browser info, steps to reproduce, and screenshots if applicable

### Suggesting Features

- Use the feature request template
- Explain the use case and why it would benefit users
- Be open to discussion about implementation approaches

### Submitting Code

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes following our coding standards
3. Run linting and tests:

   ```bash
   npm run lint
   npm run test:run
   ```

4. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `refactor:` - Code changes that neither fix bugs nor add features
   - `test:` - Adding or updating tests
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `chore:` - Maintenance tasks
5. Push and open a Pull Request

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Prefer interfaces over types
- Avoid enums; use maps instead
- Use functional components with TypeScript interfaces

### React

- Use functional and declarative programming patterns
- Minimize `use client`, `useEffect`, and `useState`
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`)

### Styling

- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Use Shadcn UI and Radix for components

### File Organization

- Components: `PascalCase.tsx`
- Hooks: `useX.ts`
- Utilities: `camelCase.ts`
- Use the `@/` import alias for `src/` imports

## Testing

- Write tests for new features in `services/` and `utils/`
- Place tests in `__tests__/` directories or co-locate as `*.spec.ts(x)`
- Mock network calls with `vi.fn()`
- Run tests: `npm run test:run`

## Project Structure

```text
src/
├── components/          # React components
│   ├── ui/              # Shadcn UI components
│   └── storyline-map/   # Storyline decision map components
├── data/                # Static data
├── hooks/               # Custom React hooks
├── services/            # API clients
├── types/               # TypeScript definitions
├── utils/               # Utility functions
└── lib/                 # Helper functions
```

## Questions?

- Open a [Discussion](https://github.com/Wilsman/task-tracker/discussions)
- Join our [Discord](https://discord.gg/X6v7RVQAC8)

Thank you for contributing!
