# WebreqSniffer Technology Stack

This document defines the main libraries, frameworks, and tools used in the development of the "WebreqSniffer" Chrome extension.

## Overview

This project uses TypeScript as the primary language and adopts a modern, productivity-focused development ecosystem centered around Vite. The UI is built with React and Tailwind CSS. The architecture emphasizes type safety, testability, and maintainability through class-based design with dependency injection.

## Core Technology Stack

| Role              | Library / Tool            | Reason for Adoption                                                                             |
| ----------------- | ------------------------- | ----------------------------------------------------------------------------------------------- |
| Build Environment | Vite + CRXJS Vite Plugin  | Excellent development experience with fast HMR, simple configuration, native TypeScript support |
| Code Quality      | ESLint + Prettier + Husky | Unify code style and catch potential bugs early with automatic fixes                            |
| UI Framework      | React 19                  | Efficient UI construction with component-based approach and rich ecosystem                      |
| UI/CSS            | Tailwind CSS + shadcn/ui  | Modern and efficient UI styling and component construction                                      |
| State Management  | Custom StateManager       | Simple state management with chrome.storage integration and caching (5s TTL)                    |
| Data Validation   | Zod                       | Easy implementation of type-safe data validation                                                |
| Type Definitions  | @types/chrome             | Essential for code completion and type safety for Chrome extension APIs                         |
| Unit Testing      | Vitest                    | Excellent compatibility with Vite, easy configuration. 201 tests currently passing              |
| E2E Testing       | Puppeteer                 | Automated testing of extension behavior in actual browser environment                           |

## Technology Details

### 1. Development & Build Environment

#### Vite (vite)

**Role**: Build tool that transforms TypeScript and React code into browser-executable JavaScript, HTML, and CSS.

**Reason for Adoption**: Dramatically faster HMR (Hot Module Replacement) and development server startup/updates compared to traditional tools like Webpack.

#### CRXJS Vite Plugin (@crxjs/vite-plugin)

**Role**: Plugin that specializes Vite for Chrome extension development.

**Reason for Adoption**: Automates extension-specific configurations such as manifest.json generation, allowing developers to focus on logic development.

### 2. Code Quality and Formatting

#### ESLint

**Role**: Code static analysis tool (linter).

**Reason for Adoption**: Detects problematic patterns in code (unused variables, React Hooks misuse, etc.) and maintains code quality.

#### Prettier

**Role**: Code formatter.

**Reason for Adoption**: Automatically unifies code style on save. This eliminates the need for developers to worry about formatting, and reviews can focus on essential logic.

#### husky + lint-staged

**Role**: Git integration tools.

**Reason for Adoption**: Automatically runs ESLint and Prettier just before Git commits, preventing low-quality code from entering the repository.

### 3. UI Framework

#### React (react, react-dom)

**Role**: Builds UI for popup and options pages.

**Reason for Adoption**: Component-based declarative UI construction allows clear development even with complex UIs.

#### Tailwind CSS

**Role**: Utility-first CSS framework.

**Reason for Adoption**: Directly write utility classes in HTML, enabling rapid UI development without switching between HTML and CSS files. Built-in responsive design and dark mode support.

#### shadcn/ui

**Role**: React component collection.

**Reason for Adoption**: Beautiful, accessible components based on Radix UI. Unlike traditional component libraries, code is copied into the project, allowing free customization.

### 4. State Management

#### Custom StateManager

**Role**: Application state management with caching.

**Reason for Adoption**:

- Direct integration with chrome.storage API
- 5-second cache TTL reduces storage reads
- Simple, focused implementation without external dependencies
- Adapter pattern enables easy testing with MockStorageAdapter

**Previous Consideration**: Zustand was initially considered but removed as the custom StateManager is sufficient and better integrated with Chrome extension requirements.

### 5. Data Validation

#### Zod

**Role**: Schema validation library.

**Reason for Adoption**:

- Type-safe runtime validation
- Automatic TypeScript type inference from schemas
- Clear error messages
- Used for validating all settings and log data structures

### 6. Testing

#### Vitest

**Role**: Unit testing framework.

**Reason for Adoption**:

- Excellent compatibility with Vite ecosystem
- Fast test execution
- Native TypeScript support
- Compatible API with Jest
- Currently running 201 tests with 100% pass rate

#### Puppeteer

**Role**: E2E (End-to-End) testing framework.

**Reason for Adoption**: Controls headless Chrome programmatically to test extension behavior in actual browser environment.

### 7. Browser API

#### @types/chrome

**Role**: Type definitions for Chrome extension APIs.

**Reason for Adoption**: Essential for TypeScript development. Provides code completion, type checking, and documentation for Chrome APIs.

## Architecture Decisions

### Class-Based Design with Dependency Injection

The background service worker uses a class-based architecture with dependency injection:

```
RequestProcessor
    ├── StateManager (injected)
    ├── RequestFilter (injected)
    └── RequestLogger (injected)
        └── StateManager (injected)
```

**Benefits**:

- **Testability**: Easy to mock dependencies in unit tests
- **Separation of Concerns**: Each class has a single, clear responsibility
- **Maintainability**: Changes to one component don't ripple through the codebase
- **Type Safety**: Full TypeScript support with interfaces and generics

### Type-Safe Messages with Discriminated Unions

Messages between popup/options and background use TypeScript discriminated unions:

```typescript
export type Message =
  | { type: 'start-monitoring'; payload: { scope: 'activeTab' | 'allTabs'; activeTabId?: number } }
  | { type: 'stop-monitoring'; payload?: never }
  | { type: 'get-status'; payload?: never };
// ...
```

**Benefits**:

- Compile-time type checking of message payloads
- Exhaustiveness checking in switch statements
- No type assertions needed
- Eliminates entire classes of runtime errors

### Centralized Constants

All magic numbers and strings are centralized in `src/lib/constants.ts`:

```typescript
export const STORAGE = {
  CACHE_TTL: 5000,
  DEFAULT_MAX_ENTRIES: 3000,
} as const;

export const EXPORT = {
  DEFAULT_FILENAME_TEMPLATE: 'netlog_{date}_{domain}.{ext}',
  EXTENSIONS: { ... },
} as const;
```

**Benefits**:

- Single source of truth for configuration
- Easy to adjust values across the entire codebase
- Type-safe with `as const` assertions

## Dependencies Not Used

The following libraries were considered but are **NOT** used in this project:

### ❌ State Management Libraries (Zustand, Redux, etc.)

**Reason**: Custom StateManager is sufficient and better integrated with chrome.storage API. Additional abstraction is unnecessary.

### ❌ IndexedDB Libraries (Dexie)

**Reason**: chrome.storage.local is sufficient for current requirements. Simplicity is preferred.

### ❌ Internationalization (i18next, react-i18next)

**Reason**: Not required for current scope. Can be added later if needed.

### ❌ Utility Libraries (Lodash)

**Reason**: Native JavaScript/TypeScript features are sufficient. Modern JS provides most utilities that were previously needed from Lodash.

### ❌ Date Libraries (date-fns, dayjs, moment)

**Reason**: Native Date API is sufficient for current use cases. If needed in the future, date-fns would be preferred over moment (which is now in maintenance mode).

### ❌ Logging Libraries (winston, pino, etc.)

**Reason**: Chrome DevTools is sufficient for development. Native console.log/error works well for this use case without the overhead.

## Summary

The current dependency set is **lean and appropriate**. The architecture is:

- ✅ **Type-safe** with TypeScript and Zod validation
- ✅ **Well-tested** with 201 Vitest unit tests
- ✅ **Maintainable** with class-based design and dependency injection
- ✅ **Modern** with React 19, Vite, and Tailwind CSS
- ✅ **Lightweight** without unnecessary dependencies

This stack provides a solid foundation for building a robust, performant Chrome extension.
