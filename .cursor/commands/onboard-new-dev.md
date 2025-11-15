# Onboard New Developer

## Overview

Comprehensive onboarding process to get a new developer up and running quickly with the fbc-dashboard Next.js application.

## Prerequisites

### Required Software

-   **Node.js**: Version >= 20 (check with `node --version`)
-   **Yarn**: Latest version (or npm)
-   **Git**: Latest version with SSH keys configured
-   **Code Editor**: Cursor or VS Code (recommended)

## Step 1: Environment Setup

### 1.1 Install Node.js and Yarn

```bash
# Install Node.js (use nvm recommended)
nvm install 20
nvm use 20

# Verify installation
node --version  # Should be >= 20
yarn --version  # Should be installed
```

### 1.2 Configure Git and SSH Keys

```bash
# Configure Git (if not already done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Generate SSH key for GitHub (if needed)
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"

# Add SSH key to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa

# Add public key to GitHub account settings
cat ~/.ssh/id_rsa.pub
```

### 1.3 Configure Supabase Access

The project uses Supabase for database and authentication. Ensure you have:

1. Access to the Supabase project
2. Environment variables configured (see Step 2.4)
3. Supabase CLI installed (optional, for local development):

```bash
# Install Supabase CLI
npm install -g supabase
```

### 1.6 Configure IDE (Cursor/VS Code)

#### Recommended Extensions

-   **ESLint**: Code linting
-   **Prettier**: Code formatting
-   **TypeScript**: TypeScript support
-   **React Native Tools**: React Native development
-   **React Native Snippet**: Code snippets
-   **GitLens**: Git integration

#### IDE Settings

Create `.vscode/settings.json` (if using VS Code):

```json
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
    "typescript.tsdk": "node_modules/typescript/lib",
    "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Step 2: Project Setup

### 2.1 Clone Repository

```bash
# Clone the repository
git clone git@github.com:mc6ril/fbc-dashboard.git
cd fbc-dashboard

# Verify you're on the correct branch
git checkout main
git pull origin main
```

### 2.2 Install Dependencies

```bash
# Install Node.js dependencies
yarn install

# Or with npm
npm install
```

### 2.3 Configure Environment Variables

1. **Request `.env.local` file** from team lead or DevOps
2. Create `.env.local` file in project root with required variables:

```bash
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
```

**Note**: Never commit `.env.local` file to git. It contains sensitive configuration.

### 2.4 Configure Supabase

1. Ensure you have access to the Supabase project
2. Copy the Supabase URL and anon key from the Supabase dashboard
3. Add them to `.env.local` (see Step 2.3)

## Step 3: Verify Installation

### 3.1 Run Tests

```bash
# Run all unit tests
yarn test

# Or with npm
npm test
```

### 3.2 Start Development Server

```bash
# Start Next.js development server
yarn dev

# Or with npm
npm run dev
```

The application will be available at `http://localhost:3000`

### 3.3 Build for Production

```bash
# Build the application
yarn build

# Start production server
yarn start
```

## Step 4: Project Architecture Overview

### 4.1 Architecture Patterns

The application follows **Clean Architecture** with strict layer separation:

1. **Domain Layer** (`core/domain`): Pure business logic and types (no external dependencies)
2. **Usecases Layer** (`core/usecases`): Business logic orchestration (uses ports/repositories)
3. **Infrastructure Layer** (`infrastructure/`): Supabase implementations of repositories
4. **Presentation Layer** (`presentation/`): Next.js UI, React Query hooks, Zustand stores
5. **Data Flow**: UI → Hooks → Usecases → Repositories → Supabase

**Key Rule**: Never call Supabase directly from UI. Always use hooks → usecases → repositories.

### 4.2 Project Structure

```
src/
├── app/                    # Next.js pages (App Router)
│   ├── layout.tsx
│   ├── page.tsx
│   └── [routes]/
│
├── core/                   # Business core (independent)
│   ├── domain/            # Business entities and pure logic
│   ├── usecases/          # Use cases (business orchestration)
│   └── ports/             # Repository interfaces
│
├── infrastructure/         # Concrete implementations
│   └── supabase/          # Supabase repository implementations
│
├── presentation/           # Presentation layer
│   ├── components/        # UI components
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # React Query hooks
│   ├── stores/           # Zustand stores (UI state only)
│   ├── layouts/          # Layout components
│   └── providers/        # React providers
│
├── shared/                # Shared code across layers
│   └── a11y/             # Accessibility utilities
│
└── styles/                # Global SCSS styles
    ├── variables/        # SCSS variables (colors, spacing, typography)
    └── components/       # Component styles
```

### 4.3 Key Layers

-   **Domain** (`core/domain`): Product, StockMovement types and business rules
-   **Usecases** (`core/usecases`): `listProducts()`, `createProduct()`, etc.
-   **Repositories** (`infrastructure/supabase/`): `productRepositorySupabase`, etc.
-   **Hooks** (`presentation/hooks/`): React Query hooks like `useProducts()`
-   **Stores** (`presentation/stores/`): Zustand stores for UI state (filters, modals)

### 4.4 Data Flow

```
UI (Page Next.js)
    ↓
Hook React Query (useProducts)
    ↓
Usecase (listProducts)
    ↓
Repository (productRepositorySupabase)
    ↓
Supabase (infrastructure)
```

**Important**: Always follow this unidirectional flow. Never reverse it (e.g., Infrastructure → Presentation).

## Step 5: Development Workflow

### 5.1 Code Style and Conventions

-   **TypeScript**: Strict mode enabled
-   **Components**: Functional components with hooks (arrow functions with export default)
-   **Props**: Use `type` (not `interface`) for component props
-   **State**: Use Zustand for UI state (filters, modals), React Query for server state
-   **Styling**: Use SCSS variables from `styles/variables/*`, no hardcoded values
-   **Accessibility**: Always include accessibility IDs and roles using `shared/a11y/`
-   **Data Fetching**: Always use React Query hooks from `presentation/hooks/`
-   **Business Logic**: Only in `core/domain` and `core/usecases`, never in UI

### 5.2 Common Development Tasks

#### Running the App

```bash
# Start Next.js development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

#### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run specific test file
yarn test SessionHelper
```

#### Linting and Type Checking

```bash
# Run ESLint
yarn lint

# Fix linting issues
yarn lint:fix

# Check TypeScript types
npx tsc --noEmit
```

#### Code Quality Checks

```bash
# Run all audits
yarn check:all

# Check TypeScript types
npx tsc --noEmit
```

### 5.3 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### 5.4 Debugging

#### Next.js Debugging

1. Use Chrome DevTools with Next.js development server
2. Set breakpoints in browser DevTools or VS Code
3. Use React DevTools extension for React component inspection
4. Use React Query DevTools for data fetching debugging

#### Logging

-   Use `console.log()`, `console.error()`, `console.warn()` in development
-   Use proper logging service in production (configure as needed)
-   Never log sensitive data (passwords, tokens, personal info)

## Step 6: Key Concepts and Domain Knowledge

### 6.1 Dashboard Domain

-   **Products**: Product management with stock tracking
-   **Stock Movements**: Inventory movements (IN/OUT) for stock tracking
-   **Categories**: Product categorization
-   **Low Stock Alerts**: Automatic alerts when stock is below threshold

### 6.2 Clean Architecture

-   **Domain Layer**: Pure business logic and types (no external dependencies)
-   **Usecases Layer**: Business logic orchestration using repositories
-   **Infrastructure Layer**: Supabase repository implementations
-   **Presentation Layer**: Next.js UI, React Query hooks, Zustand stores

### 6.3 Styling System

-   **SCSS Variables**: Use variables from `styles/variables/*` (colors, spacing, typography)
-   **Components**: Reusable UI components in `presentation/components/ui/`
-   **No Hardcoded Values**: Always use variables from `styles/variables/*`
-   **BEM Methodology**: Use kebab-case classes with `__` for elements and `--` for modifiers

## Step 7: Troubleshooting

### 7.1 Common Issues

#### Next.js Build Issues

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
yarn build
```

#### Node Modules Issues

```bash
# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install
```

#### TypeScript Issues

```bash
# Check TypeScript types
npx tsc --noEmit

# If issues persist, clear TypeScript cache
rm -rf .next tsconfig.tsbuildinfo
```

### 7.2 Environment Variable Issues

-   Ensure `.env.local` file exists in project root
-   Verify all required variables are set (Supabase URL and anon key)
-   Check that environment variables are correctly loaded
-   Never commit `.env.local` file to git

### 7.3 Supabase Connection Issues

-   Verify Supabase URL and anon key are correct in `.env.local`
-   Check Supabase project dashboard for service status
-   Ensure database tables are properly configured
-   Check browser console for Supabase errors

### 7.4 Testing Issues

```bash
# Clear Jest cache
yarn test --clearCache

# Run tests with verbose output
yarn test --verbose

# Run specific test file
yarn test product.test.ts
```

## Step 8: Resources and Documentation

### 8.1 Internal Documentation

-   **Architecture**: `.cursor/docs/architecture.md`
-   **Testing**: `.cursor/docs/testing.md`
-   **Libraries**: `.cursor/docs/libraries.md`
-   **Code Conventions**: `.cursor/rules/code-quality/code-convention.mdc`
-   **Clean Architecture**: `.cursor/rules/architecture/clean_architecture.mdc`
-   **Project Rules**: `.cursor/rules/` directory

### 8.2 External Resources

-   **Next.js**: https://nextjs.org/docs
-   **React Query**: https://tanstack.com/query/latest
-   **Zustand**: https://docs.pmnd.rs/zustand
-   **Supabase**: https://supabase.com/docs
-   **TypeScript**: https://www.typescriptlang.org/docs
-   **SCSS**: https://sass-lang.com/documentation

### 8.3 Team Contacts

-   **Team Lead**: [Contact information]
-   **DevOps**: [Contact information]

## Onboarding Checklist

### Environment Setup

-   [ ] Node.js >= 20 installed
-   [ ] Yarn (or npm) configured
-   [ ] Git configured with SSH keys
-   [ ] Supabase access configured
-   [ ] IDE extensions installed

### Project Setup

-   [ ] Repository cloned
-   [ ] Dependencies installed (`yarn install`)
-   [ ] `.env.local` file configured with Supabase credentials
-   [ ] Supabase connection verified

### Verification

-   [ ] All tests passing (`yarn test`)
-   [ ] Development server starts successfully (`yarn dev`)
-   [ ] Application accessible at `http://localhost:3000`
-   [ ] Linting passes (`yarn lint`)
-   [ ] Type checking passes (`npx tsc --noEmit`)

### Knowledge

-   [ ] Read architecture documentation
-   [ ] Understand Clean Architecture structure
-   [ ] Familiar with Domain, Usecases, Infrastructure, Presentation layers
-   [ ] Understand React Query hooks usage
-   [ ] Understand Zustand stores for UI state
-   [ ] Familiar with SCSS variables system
-   [ ] Understand dashboard domain concepts (products, stock movements)

### Development

-   [ ] Can create feature branch
-   [ ] Can make code changes following Clean Architecture
-   [ ] Can run tests locally
-   [ ] Can debug using Next.js DevTools
-   [ ] Understand git workflow
-   [ ] First PR submitted and reviewed

## Next Steps

1. **Review Architecture**: Read `.cursor/docs/architecture.md` for detailed architecture
2. **Read Code Conventions**: Review `.cursor/rules/` for coding standards
3. **Explore Codebase**: Start with `app/page.tsx` and trace through data flow
4. **Pick First Task**: Choose a simple bug fix or feature to get familiar with the codebase
5. **Ask Questions**: Don't hesitate to ask team members for clarification

## Support

If you encounter issues during onboarding:

1. Check this documentation first
2. Review troubleshooting section
3. Search existing issues/PRs
4. Ask in team communication channel
5. Contact team lead if needed

Welcome to the fbc-dashboard team! 🎉

--- End Command ---
