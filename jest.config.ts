import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    // Add more setup options before each test is run
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    moduleNameMapper: {
        // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    testMatch: [
        "**/__tests__/**/*.test.[jt]s?(x)",
        "**/?(*.)+(spec|test).[jt]s?(x)",
    ],
    collectCoverageFrom: [
        // Domain layer - business rules and pure logic
        "src/core/domain/**/*.{js,jsx,ts,tsx}",
        // Usecases layer - business logic orchestration
        "src/core/usecases/**/*.{js,jsx,ts,tsx}",
        // Reusable UI components only (not page-specific components)
        "src/presentation/components/ui/**/*.{js,jsx,ts,tsx}",
        // Exclusions
        "!src/**/*.d.ts",
        "!src/**/*.stories.{js,jsx,ts,tsx}",
        "!src/**/__tests__/**",
    ],
    // Ignore patterns
    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
    // Transform files
    transform: {
        "^.+\\.(ts|tsx)$": [
            "ts-jest",
            {
                tsconfig: {
                    jsx: "react-jsx",
                },
                useESM: false,
            },
        ],
    },
    // Module file extensions
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};

export default config;

