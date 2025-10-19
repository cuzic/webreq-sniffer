# Dev Container for WebreqSniffer

This directory contains the configuration for VS Code Dev Containers.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## Quick Start

1. Open VS Code
2. Install the "Dev Containers" extension
3. Press `F1` and select "Dev Containers: Reopen in Container"
4. Wait for the container to build (first time takes a few minutes)
5. Start developing!

## What's Included

### Base Image

- Node.js 24 (Debian Bookworm)
- npm, npx
- Git

### Features

- Git
- GitHub CLI (`gh`)

### VS Code Extensions

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **Pretty TypeScript Errors** - Better error messages
- **Code Spell Checker** - Spelling checker
- **Vitest Explorer** - Test runner UI

### Ports

- `5173` - Vite development server (auto-forwarded)

## Post-Create Setup

The container automatically runs `npm install` after creation.

## Development Workflow

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build extension
npm run build

# Package extension
npm run package
```

## Git Configuration

Your local Git config is automatically mounted into the container, so commits will use your configured name and email.

## Troubleshooting

### Container won't start

- Make sure Docker Desktop is running
- Try "Dev Containers: Rebuild Container" from the command palette

### Extensions not working

- Reload the window: `Ctrl/Cmd + Shift + P` → "Developer: Reload Window"

### Port forwarding issues

- Check Docker Desktop's port forwarding settings
- Manually forward port 5173 if needed

## Customization

Edit `.devcontainer/devcontainer.json` to:

- Add more VS Code extensions
- Install additional tools
- Change Node.js version
- Add environment variables
