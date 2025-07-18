# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Focusable** is a Next.js 15.1 application for ADHD assessment and cognitive training games. It combines professional screening tools with gamified executive function training based on scientific research.

## Key Architecture

### Core Structure
- **Frontend**: Next.js 15.1 with App Router, React 19, TypeScript
- **Authentication**: Firebase Auth with email/password and guest access
- **Database**: Firebase Realtime Database
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Vercel

### Game System Architecture
The application features two distinct game systems:

1. **Classic Games** (`/games/[gameId]/`)
   - Located in `/src/app/games/[gameId]/page.tsx`
   - Use shared game configuration from `/src/data/game-config.ts`
   - Simple attention/reaction training games

2. **Enhanced Games** (`/games/enhanced/[gameId]/`)
   - Individual components in `/src/components/games/`
   - Each game has its own route in `/src/app/games/enhanced/[gameId]/page.tsx`
   - Based on executive function research (inhibition, working memory, cognitive flexibility)
   - Game metadata in `/src/data/enhanced-games.ts`

### Authentication Flow
- Context-based auth state management in `/src/contexts/auth-context.tsx`
- Protected routes using `RequireAuth` wrapper
- Guest access for demos, full features require account

## Development Commands

### Essential Commands
```bash
# Development
npm run dev --turbopack    # Start dev server with Turbopack
npm run build             # Production build
npm run start             # Start production server

# Quality
npm run lint              # ESLint checking
npm run type-check        # TypeScript type checking
```

### Firebase Setup
```bash
# Firebase CLI (if not installed)
npm install -g firebase-tools

# Initialize Firebase (if needed)
firebase login
firebase init
```

## Game Development

### Adding Enhanced Games
1. Create game component in `/src/components/games/[GameName]Game.tsx`
2. Add route in `/src/app/games/enhanced/[game-id]/page.tsx`
3. Update game metadata in `/src/data/enhanced-games.ts`
4. Follow executive function categories: inhibition, working-memory, cognitive-flexibility

### Canvas Game Requirements
All canvas-based games must implement:
- Dynamic canvas sizing with proper aspect ratio
- Canvas coordinate system matching CSS display size
- Proper click/touch event handling with coordinate translation
- React state management (avoid useRef for game state)

### Common Game Issues
- **Canvas clicks not working**: Ensure canvas.width/height matches CSS dimensions
- **State not updating**: Use useState instead of useRef for reactive state
- **Memory leaks**: Clean up intervals/timeouts in useEffect cleanup
- **Performance**: Use useCallback for expensive operations

## Data Structure

### Game Results
```typescript
interface GameResult {
  gameId: string;
  category: string;
  score: number;
  accuracy: number;
  reactionTime: number;
  difficulty: string;
  completedAt: string;
}
```

### Enhanced Game Schema
```typescript
interface EnhancedGame {
  id: string;
  title: string;
  description: string;
  category: 'inhibition' | 'working-memory' | 'cognitive-flexibility';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  instructions: string[];
  cognitiveConnection: string;
  designPrinciples: string[];
  gameData: object;
}
```

## Screening System

### ADHD Screening Flow
1. **Setup** (`/screening/setup`): Basic information and consent
2. **Assessment** (`/screening/[type]`): Interactive questionnaire
3. **Results** (`/screening/result`): Scoring and recommendations
4. **Professional** (`/screening/professional`): Detailed clinical assessment

### Scoring Algorithm
- Located in `/src/data/screening-data.ts`
- Evidence-based scoring from clinical research
- Separate adult/child/teen questionnaires
- Risk-based result interpretation

## Firebase Integration

### Authentication
```typescript
// Current user context
const { user, loading } = useAuth();

// Protected component
<RequireAuth>
  <ProtectedContent />
</RequireAuth>
```

### Database Structure
```
users/
  {userId}/
    profile: { name, email, createdAt }
    gameResults/
      {gameId}/
        {timestamp}: GameResult
    screeningResults/
      {screeningId}: ScreeningResult
```

## UI Components

### Design System
- **Components**: shadcn/ui with Tailwind CSS
- **Icons**: Lucide React
- **Typography**: System fonts with Tailwind classes
- **Theme**: Light mode with blue/gray palette

### Key Components
- `RequireAuth`: Authentication wrapper
- `Button`, `Card`, `Badge`: UI primitives from shadcn/ui
- Game-specific components in `/src/components/games/`

## Performance Considerations

### Canvas Games
- Use 30 FPS render loops (`1000/30` ms intervals)
- Implement proper cleanup in useEffect
- Use requestAnimationFrame for smooth animations
- Optimize collision detection algorithms

### State Management
- Use React Context for global state (auth, theme)
- Local state with useState for component-specific data
- Avoid unnecessary re-renders with useCallback/useMemo

## Testing & Deployment

### Build Process
- Next.js static generation for most pages
- Dynamic routes for game pages
- Automatic deployment via Vercel on git push

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Common Issues

### Canvas Coordinate Problems
```typescript
// Correct implementation
const rect = canvas.getBoundingClientRect();
const clickX = event.clientX - rect.left;
const clickY = event.clientY - rect.top;

// Ensure canvas dimensions match
canvas.width = actualWidth;
canvas.height = actualHeight;
canvas.style.width = actualWidth + 'px';
canvas.style.height = actualHeight + 'px';
```

### State Management in Games
```typescript
// Correct: Use useState for reactive state
const [gameState, setGameState] = useState('ready');

// Avoid: useRef for game state (causes stale closures)
const gameStateRef = useRef('ready');
```

### Memory Leaks
```typescript
// Always clean up intervals
useEffect(() => {
  const interval = setInterval(() => {
    // game loop
  }, 1000/30);
  
  return () => clearInterval(interval);
}, [dependencies]);
```

## Key File Locations

- **Game Components**: `/src/components/games/`
- **Game Data**: `/src/data/enhanced-games.ts`, `/src/data/game-config.ts`
- **Screening Data**: `/src/data/screening-data.ts`
- **Auth Context**: `/src/contexts/auth-context.tsx`
- **Firebase Config**: `/src/lib/firebase.ts`
- **UI Components**: `/src/components/ui/`
- **Game Routes**: `/src/app/games/` and `/src/app/games/enhanced/`