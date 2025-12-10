# Escape from Tarkov Quest Tracker

A comprehensive quest and progression tracker for Escape from Tarkov, featuring interactive visualizations, multiple profile support, and real-time data from the tarkov.dev API.

## Features

### Quest Tracking

- **Checklist View** - Track all quests with trader/map grouping and filtering
- **Dependency Visualization** - See quest prerequisites and unlock paths
- **Smart Search** - Search quests with URL sync for shareable links
- **Level Filtering** - Filter quests by your current PMC level

### 1.0 Storyline

- **Storyline Quests** - Track objectives for the 1.0 storyline questline
- **Decision Map** - Interactive flowchart showing storyline branches and choices
- **Path Highlighting** - Visualize your route through storyline decisions

### Progression Tracking

- **Prestige System** - Track prestige requirements with bulk completion
- **Collector Items** - Track Found-in-Raid items for the Collector quest
- **Achievements** - Monitor in-game achievement progress
- **Hideout Requirements** - Track hideout upgrade prerequisites

### Data Management

- **Multiple Profiles** - Support for multiple characters/accounts
- **Export/Import** - Backup and restore your progress
- **Live API Data** - Toggle between static data and live tarkov.dev API
- **Offline Support** - All data stored locally in IndexedDB

## Tarkov.dev API

Data is fetched from [tarkov.dev](https://tarkov.dev/) GraphQL API in a single combined query:

```graphql
{
  tasks(lang: en) {
    id
    minPlayerLevel
    kappaRequired
    lightkeeperRequired
    map { name }
    taskRequirements { task { id name } }
    trader { name imageLink }
    wikiLink
    name
    startRewards { items { item { name iconLink } count } }
    finishRewards { items { item { name iconLink } count } }
    objectives {
      maps { name }
      description
      ... on TaskObjectiveItem { items { id name iconLink } count }
      ... on TaskObjectivePlayerLevel { playerLevel }
    }
  }
  task(id: "5c51aac186f77432ea65c552") {
    objectives { ... on TaskObjectiveItem { items { id name iconLink } } }
  }
  achievements {
    id
    imageLink
    name
    description
    hidden
    playersCompletedPercent
    side
    rarity
  }
  hideoutStations {
    name
    imageLink
    levels {
      level
      skillRequirements { name skill { name } level }
      stationLevelRequirements { station { name } level }
      itemRequirements { count item { name iconLink } }
    }
  }
}
```

API responses are cached in localStorage for 30 minutes.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Shadcn UI / Radix** - UI components
- **React Flow** - Interactive flowcharts and decision maps
- **IndexedDB** - Local data persistence
- **nuqs** - URL state management
- **Vitest** - Testing framework

## Getting Started

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## Project Structure

```text
src/
├── components/          # React components
│   ├── ui/              # Shadcn UI components
│   └── storyline-map/   # Storyline decision map components
├── data/                # Static data (traders, storyline quests)
├── hooks/               # Custom React hooks
├── services/            # API clients (tarkovApi.ts)
├── types/               # TypeScript type definitions
├── utils/               # Utilities (indexedDB, profile, prestige)
└── lib/                 # Helper functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Generate coverage report

## Data Storage

All user data is stored locally in the browser using IndexedDB:

- Quest completion status
- Collector item progress
- Prestige requirements
- Storyline objectives
- User preferences and notes

Profile metadata is stored in localStorage for quick access during initialization.

## License

MIT - see [LICENSE](LICENSE) for details
