# Onboard New Developer

## Overview

Comprehensive onboarding process to get a new developer up and running quickly with the Perifit Pump React Native application.

## Prerequisites

### Required Software

- **Node.js**: Version >= 22 (check with `node --version`)
- **Yarn**: Version 3.6.4 (managed via corepack)
- **Ruby**: Version >= 2.6.10 (for CocoaPods on iOS)
- **Java Development Kit (JDK)**: Version 17 or higher (for Android)
- **Android Studio**: Latest stable version with Android SDK
- **Xcode**: Latest stable version (macOS only, for iOS development)
- **CocoaPods**: Version 1.15.2 (for iOS dependencies)
- **Git**: Latest version with SSH keys configured
- **Watchman**: For file watching (recommended)

### Platform-Specific Requirements

#### macOS (for iOS development)
- Xcode Command Line Tools: `xcode-select --install`
- CocoaPods: `sudo gem install cocoapods -v 1.15.2`
- Ruby version manager (rbenv or rvm) recommended

#### Windows/Linux (Android only)
- Android Studio with Android SDK
- Android SDK Platform Tools
- Android Emulator or physical device

## Step 1: Environment Setup

### 1.1 Install Node.js and Yarn

```bash
# Install Node.js (use nvm recommended)
nvm install 22
nvm use 22

# Enable corepack (required for Yarn 3.6.4)
corepack enable

# Verify installation
node --version  # Should be >= 22
yarn --version  # Should be 3.6.4
```

### 1.2 Configure Git and SSH Keys

```bash
# Configure Git (if not already done)
git config --global user.name "Your Name"
git config --global user.email "your.email@perifit.com"

# Generate SSH key for Bitbucket (if needed)
ssh-keygen -t rsa -b 4096 -C "your.email@perifit.com"

# Add SSH key to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa

# Add public key to Bitbucket account settings
cat ~/.ssh/id_rsa.pub
```

### 1.3 Install Android Development Tools (Android)

1. Install Android Studio from https://developer.android.com/studio
2. Install Android SDK (API Level 26+)
3. Set up Android environment variables:

```bash
# Add to ~/.zshrc or ~/.bashrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

4. Install Android Virtual Device (AVD) or connect physical device
5. Enable USB debugging on physical device (if using)

### 1.4 Install iOS Development Tools (macOS only)

1. Install Xcode from App Store
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Install CocoaPods:
   ```bash
   sudo gem install cocoapods -v 1.15.2
   ```
4. Install Ruby dependencies (if using rbenv/rvm):
   ```bash
   # If using rbenv
   rbenv install 2.6.10
   rbenv local 2.6.10
   
   # Install bundler
   gem install bundler
   ```

### 1.5 Install Watchman (Recommended)

```bash
# macOS
brew install watchman

# Linux
# Follow instructions at https://facebook.github.io/watchman/docs/install
```

### 1.6 Configure IDE (Cursor/VS Code)

#### Recommended Extensions

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: TypeScript support
- **React Native Tools**: React Native development
- **React Native Snippet**: Code snippets
- **GitLens**: Git integration

#### IDE Settings

Create `.vscode/settings.json` (if using VS Code):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Step 2: Project Setup

### 2.1 Clone Repository

```bash
# Clone the repository
git clone git@bitbucket.org:perifitapp/perifitpump.git
cd perifitpump

# Verify you're on the correct branch
git checkout main
git pull origin main
```

### 2.2 Install Dependencies

```bash
# Install Node.js dependencies
sh run install

# This command:
# - Removes existing node_modules
# - Installs dependencies with Yarn
# - Copies custom modules
# - Applies patches with patch-package
```

### 2.3 Install iOS Dependencies (macOS only)

```bash
# Install CocoaPods dependencies
sh run pod-install

# Or manually:
cd ios
bundle install  # Install Ruby gems (if Gemfile exists)
pod install
cd ..
```

### 2.4 Configure Environment Variables

1. **Request `.env` file** from team lead or DevOps
2. Create `.env` file in project root with required variables:

```bash
# Required environment variables (encrypted values)
CSK=<encryption_key>
BACKEND_URL=<encrypted_backend_url>
ANALYTIC_URL=<encrypted_analytic_url>
PROD_PERIFIT_URL=<encrypted_prod_url>
BASEROW_URL=<encrypted_baserow_url>
ANALYTIC_BACKEND_URL=<encrypted_analytic_backend_url>
BUGFENDER_APP_KEY=<encrypted_bugfender_key>
MIXPANEL_KEY=<encrypted_mixpanel_key>
PROD_PERIFIT_IO=<encrypted_prod_token>
```

**Note**: Never commit `.env` file to git. It contains sensitive encrypted configuration.

### 2.5 Configure Firebase (Optional for local development)

Firebase configuration files are already in the repository:
- iOS: `ios/GoogleService-Info.plist`
- Android: `android/app/google-services.json`

These are typically committed and don't need local setup for basic development.

### 2.6 Set up Design System Access

The project uses `@perifit/app-design-system` from a private Bitbucket repository. Access should be automatically configured via SSH keys. If you encounter issues:

```bash
# Test SSH access to Bitbucket
ssh -T git@bitbucket.org

# If access is denied, verify SSH key is added to Bitbucket account
```

## Step 3: Verify Installation

### 3.1 Run Tests

```bash
# Run all unit tests
sh run test

# Or with Yarn
yarn test
```

### 3.2 Start Metro Bundler

```bash
# Start React Native Metro bundler
yarn start

# Or with cache reset
yarn start --reset-cache
```

### 3.3 Run on Android

```bash
# Ensure Android device/emulator is connected
adb devices

# Run on Android
sh run android

# Or with Yarn
yarn android
```

### 3.4 Run on iOS (macOS only)

```bash
# Open project in Xcode
open ios/perifitpump.xcworkspace

# Or run from command line
yarn ios

# Select device/simulator when prompted
```

## Step 4: Project Architecture Overview

### 4.1 Architecture Patterns

The application follows these key patterns:

1. **Dependency Injection**: Services and helpers are injected via `ServiceProvider` and `HelperProvider`
2. **Service Layer**: All external interactions (BLE, API, analytics) are handled by services
3. **Helper Layer**: Business logic is contained in helpers (stateless, pure functions when possible)
4. **Redux State Management**: Global state managed via Redux Toolkit
5. **Event-Driven Communication**: Inter-service communication via `EventService`

### 4.2 Project Structure

```
src/
├── assets/          # Images, fonts, animations
├── components/      # Reusable UI components
├── configs/         # Configuration files (encrypted)
├── contexts/        # React contexts
├── helpers/         # Business logic helpers
├── hooks/           # Custom React hooks
├── models/          # Data models
├── modules/         # Feature modules (settings, etc.)
├── navigation/      # Navigation configuration
├── redux/           # Redux store, reducers, actions
├── screens/         # Screen components
├── services/        # Service classes (BLE, API, etc.)
├── themes/          # Theme configuration
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

### 4.3 Key Services

- **BluetoothService**: BLE device communication
- **EventService**: Event bus (240+ event types)
- **BackendService**: REST API communication
- **AccountService**: User account management
- **HistoryService**: Session history persistence
- **SegmentService**: Analytics (Mixpanel, Firebase, Sentry)

### 4.4 Key Helpers

- **SessionHelper**: Pumping session management
- **PumpDeviceHelper**: Device-specific operations
- **CalibrationHelper**: Calibration algorithms
- **ConnectionHelper**: Bluetooth connection workflow
- **MilkSessionDataHelper**: Real-time milk measurement

### 4.5 Redux Store Structure

- `appReducer`: Global app state
- `pumpReducer`: Pump device states (Left/Right)
- `sessionReducer`: Active session data
- `userAccountReducer`: Authentication state
- `connectionReducer`: Bluetooth connection state
- `modalReducer`: Modal management
- `leakReducer`: Air leak detection
- `onboardingReducer`: Onboarding progress
- `settingsReducer`: App configuration
- `historyReducer`: Session history

### 4.6 BLE Data Flow

```
BLE Device → Handlers → EventService → Helpers → Redux → UI
```

**Important**: All BLE data processing must flow through the event system. Never process BLE data directly in components.

## Step 5: Development Workflow

### 5.1 Code Style and Conventions

- **TypeScript**: Strict mode enabled
- **Components**: Functional components with hooks
- **Props**: Use `type` (not `interface`) for component props
- **Services**: Access via `ServiceProvider.get*Service()`
- **Helpers**: Access via `HelperProvider.get*Helper()`
- **State**: Use Redux for global state, local state for UI-only concerns
- **Styling**: Use design system tokens, no hardcoded values
- **Accessibility**: Always include accessibility IDs and roles

### 5.2 Common Development Tasks

#### Running the App

```bash
# Start Metro bundler
yarn start

# Run on Android (in separate terminal)
sh run android

# Run on iOS (in separate terminal)
yarn ios
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

# Check design system compliance
yarn check:design

# Check color usage
yarn check:color

# Check text/accessibility
yarn check:text
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

# Create Pull Request on Bitbucket
```

### 5.4 Debugging

#### React Native Debugger

1. Enable remote debugging in app (shake device or `Cmd+D` on simulator)
2. Open Chrome DevTools or React Native Debugger
3. Set breakpoints and inspect state

#### Reactotron (Redux Debugging)

Reactotron is configured for Redux state inspection. Ensure it's running:

```bash
# Install Reactotron (if not installed)
# Download from https://github.com/infinitered/reactotron/releases

# App automatically connects in development mode
```

#### Logging

- Use `Logger.logInfo()`, `Logger.logWarning()`, `Logger.logError()`
- Logs are sent to Bugfender in production
- Never log sensitive data (passwords, tokens, personal info)

## Step 6: Key Concepts and Domain Knowledge

### 6.1 Pumping Domain

- **Session**: A pumping session with start/end time, volume collected
- **Program**: Pumping program (Classic, PowerPump, Varying Intensity, Mix Mode)
- **Pattern**: Suction pattern (Classic, SlowGentle, etc.)
- **Calibration**: Device calibration for accurate milk measurement
- **TOF (Time of Flight)**: Sensor for milk level detection
- **Air Leak Detection**: ML model for detecting air leaks in pump

### 6.2 BLE Communication

- **Dual Pump Support**: Left and Right pump support
- **Characteristics**: BLE characteristics for data exchange
- **Commands**: BLE commands for device control (see README.md)
- **Connection Workflow**: Scan → Connect → Discover → Subscribe → Communicate

### 6.3 Design System

- **Components**: Use `@perifit/app-design-system` components only
- **Tokens**: Use design system tokens for spacing, colors, typography
- **Themes**: Use `useTheme()` hook for theme access
- **No Custom UI**: Never create custom UI components that duplicate design system

## Step 7: Troubleshooting

### 7.1 Common Issues

#### Metro Bundler Cache Issues

```bash
# Reset Metro cache
sh run reset-cache

# Or manually
watchman watch-del-all
yarn start --reset-cache
```

#### iOS Pod Installation Issues

```bash
# Clean and reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

#### Android Build Issues

```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Rebuild
sh run android
```

#### Node Modules Issues

```bash
# Reinstall dependencies
rm -rf node_modules yarn.lock
sh run install
```

#### Design System Access Issues

```bash
# Verify SSH access
ssh -T git@bitbucket.org

# Clear Yarn cache
yarn cache clean

# Reinstall dependencies
sh run install
```

### 7.2 Environment Variable Issues

- Ensure `.env` file exists in project root
- Verify all required variables are set
- Check that `CSK` (encryption key) is correct
- Never commit `.env` file to git

### 7.3 BLE Connection Issues

- Verify Bluetooth is enabled on device/emulator
- Check device permissions (location, Bluetooth)
- Ensure device is in range and powered on
- Check logs for BLE error messages

### 7.4 Testing Issues

```bash
# Clear Jest cache
yarn test --clearCache

# Run tests with verbose output
yarn test --verbose

# Run specific test file
yarn test SessionHelper.test.js
```

## Step 8: Resources and Documentation

### 8.1 Internal Documentation

- **Architecture**: `.cursor/docs/architecture.md`
- **Code Conventions**: `.cursor/rules/10-code-convention.mdc`
- **BLE Commands**: `README.md` (BLE commands section)
- **Project Rules**: `.cursor/rules/` directory

### 8.2 External Resources

- **React Native**: https://reactnative.dev/docs/getting-started
- **React Navigation**: https://reactnavigation.org/docs/getting-started
- **Redux Toolkit**: https://redux-toolkit.js.org/introduction/getting-started
- **React Native BLE PLX**: https://github.com/dotintent/react-native-ble-plx

### 8.3 Team Contacts

- **Team Lead**: [Contact information]
- **DevOps**: [Contact information]
- **Design System Team**: [Contact information]

## Onboarding Checklist

### Environment Setup
- [ ] Node.js >= 22 installed
- [ ] Yarn 3.6.4 configured (corepack enabled)
- [ ] Git configured with SSH keys
- [ ] Android Studio installed (Android development)
- [ ] Xcode installed (iOS development, macOS only)
- [ ] CocoaPods installed (iOS development, macOS only)
- [ ] Watchman installed (recommended)
- [ ] IDE extensions installed

### Project Setup
- [ ] Repository cloned
- [ ] Dependencies installed (`sh run install`)
- [ ] iOS dependencies installed (`sh run pod-install`, macOS only)
- [ ] `.env` file configured
- [ ] Design system access verified
- [ ] Firebase configuration verified

### Verification
- [ ] All tests passing (`yarn test`)
- [ ] Metro bundler starts successfully (`yarn start`)
- [ ] App runs on Android (`sh run android`)
- [ ] App runs on iOS (`yarn ios`, macOS only)
- [ ] Linting passes (`yarn lint`)
- [ ] Type checking passes (`npx tsc --noEmit`)

### Knowledge
- [ ] Read architecture documentation
- [ ] Understand project structure
- [ ] Familiar with key services and helpers
- [ ] Understand Redux store structure
- [ ] Understand BLE data flow
- [ ] Familiar with design system usage
- [ ] Understand pumping domain concepts

### Development
- [ ] Can create feature branch
- [ ] Can make code changes
- [ ] Can run tests locally
- [ ] Can debug using React Native Debugger
- [ ] Can use Reactotron for Redux debugging
- [ ] Understand git workflow
- [ ] First PR submitted and reviewed

## Next Steps

1. **Review Architecture**: Read `.cursor/docs/architecture.md` for detailed architecture
2. **Read Code Conventions**: Review `.cursor/rules/` for coding standards
3. **Explore Codebase**: Start with `App.tsx` and trace through service initialization
4. **Pick First Task**: Choose a simple bug fix or feature to get familiar with the codebase
5. **Ask Questions**: Don't hesitate to ask team members for clarification

## Support

If you encounter issues during onboarding:

1. Check this documentation first
2. Review troubleshooting section
3. Search existing issues/PRs
4. Ask in team Slack channel
5. Contact team lead if needed

Welcome to the Perifit Pump team! 🎉

--- End Command ---
