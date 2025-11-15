# Testing Guide

This document provides detailed examples and patterns for writing unit tests in the fbc-dashboard application.

## Overview

-   **Framework**: Jest
-   **Test Location**: `__tests__/` directory at project root
-   **Mock Location**: `__mocks__/` directory at project root
-   **Language**: TypeScript only (`.test.ts` or `.test.tsx`)

## Test Types

### What to Test

✅ **Domain** (`__tests__/core/domain/*.test.ts`) - Business rules and pure logic
✅ **Usecases** (`__tests__/core/usecases/*.test.ts`) - Business logic orchestration
✅ **Reusable UI Components** (`__tests__/presentation/components/ui/*.test.tsx`) - UI component tests

### What NOT to Test

❌ Page components (`app/**/*.tsx`)
❌ Page-specific components (`presentation/components/*.tsx`)
❌ Hooks (`presentation/hooks/*.ts`) - Test usecases instead
❌ Stores (`presentation/stores/*.ts`)
❌ Infrastructure (`infrastructure/**/*.ts`) - Test through usecases

---

## 1. Simple Mocks

### 1.1. Mock Repository Interface

**Location**: `__mocks__/core/ports/productRepository.ts`

```typescript
import type { ProductRepository } from "@/core/ports/productRepository";
import type { Product } from "@/core/domain/product";

/**
 * Mock implementation of ProductRepository for testing.
 * Provides controllable mock methods that can be configured in tests.
 */
export const mockProductRepository: ProductRepository = {
    list: jest.fn<Promise<Product[]>, []>(),
    findById: jest.fn<Promise<Product | null>, [string]>(),
    create: jest.fn<Promise<Product>, [Omit<Product, "id">]>(),
    update: jest.fn<Promise<Product>, [string, Partial<Product>]>(),
    delete: jest.fn<Promise<void>, [string]>(),
};

// Helper function to reset all mocks
export const resetMockProductRepository = (): void => {
    jest.clearAllMocks();
};
```

### 1.2. Mock Domain Data

**Location**: `__mocks__/core/domain/product.ts`

```typescript
import type { Product } from "@/core/domain/product";

/**
 * Factory function to create test product data.
 * Provides default values that can be overridden in tests.
 */
export const createMockProduct = (overrides?: Partial<Product>): Product => ({
    id: "product-1",
    name: "Test Product",
    description: "Test description",
    price: 29.99,
    stock: 10,
    category: "electronics",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
});

/**
 * Pre-configured mock products for common test scenarios.
 */
export const mockProducts: Product[] = [
    createMockProduct({ id: "product-1", name: "Product 1", stock: 10 }),
    createMockProduct({ id: "product-2", name: "Product 2", stock: 5 }),
    createMockProduct({ id: "product-3", name: "Product 3", stock: 0 }),
];
```

### 1.3. Mock Supabase Client

**Location**: `__mocks__/infrastructure/supabase/client.ts`

```typescript
/**
 * Mock Supabase client for testing.
 * Simulates Supabase API without real database connections.
 */
export const mockSupabaseClient = {
    from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        then: jest.fn((onResolve) => {
            onResolve({ data: null, error: null });
        }),
    })),
};

jest.mock("@/infrastructure/supabase/client", () => ({
    supabaseClient: mockSupabaseClient,
}));
```

---

## 2. Simple Tests

### 2.1. Domain Test - Pure Business Logic

**Source**: `src/core/domain/product.ts`
**Test**: `__tests__/core/domain/product.test.ts`

```typescript
import { isLowStock, calculateTotalValue } from "@/core/domain/product";
import type { Product } from "@/core/domain/product";

describe("Product Domain Functions", () => {
    describe("isLowStock", () => {
        it("should return true when stock is below threshold", () => {
            // Arrange
            const product: Product = {
                id: "1",
                name: "Test",
                stock: 5,
                price: 10,
                // ... other required fields
            };

            // Act
            const result = isLowStock(product, 10);

            // Assert
            expect(result).toBe(true);
        });

        it("should return false when stock is above threshold", () => {
            // Arrange
            const product: Product = {
                id: "1",
                name: "Test",
                stock: 15,
                price: 10,
                // ... other required fields
            };

            // Act
            const result = isLowStock(product, 10);

            // Assert
            expect(result).toBe(false);
        });

        it("should return true when stock is exactly at threshold", () => {
            // Arrange
            const product: Product = {
                id: "1",
                name: "Test",
                stock: 10,
                price: 10,
                // ... other required fields
            };

            // Act
            const result = isLowStock(product, 10);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("calculateTotalValue", () => {
        it("should calculate total value correctly", () => {
            // Arrange
            const products: Product[] = [
                { id: "1", name: "Product 1", stock: 5, price: 10 /* ... */ },
                { id: "2", name: "Product 2", stock: 3, price: 20 /* ... */ },
            ];

            // Act
            const total = calculateTotalValue(products);

            // Assert
            expect(total).toBe(110); // (5 * 10) + (3 * 20)
        });

        it("should return 0 for empty array", () => {
            // Arrange
            const products: Product[] = [];

            // Act
            const total = calculateTotalValue(products);

            // Assert
            expect(total).toBe(0);
        });
    });
});
```

### 2.2. Usecase Test - With Mock Repository

**Source**: `src/core/usecases/product.ts`
**Test**: `__tests__/core/usecases/product.test.ts`

```typescript
import { listProducts, createProduct } from "@/core/usecases/product";
import { mockProductRepository, resetMockProductRepository } from "__mocks__/core/ports/productRepository";
import { mockProducts, createMockProduct } from "__mocks__/core/domain/product";

// Mock the repository
jest.mock("@/infrastructure/supabase/productRepositorySupabase", () => ({
    productRepositorySupabase: mockProductRepository,
}));

describe("Product Usecases", () => {
    beforeEach(() => {
        resetMockProductRepository();
    });

    describe("listProducts", () => {
        it("should return list of products from repository", async () => {
            // Arrange
            mockProductRepository.list.mockResolvedValue(mockProducts);

            // Act
            const result = await listProducts(mockProductRepository);

            // Assert
            expect(result).toEqual(mockProducts);
            expect(mockProductRepository.list).toHaveBeenCalledTimes(1);
            expect(mockProductRepository.list).toHaveBeenCalledWith();
        });

        it("should return empty array when repository returns empty", async () => {
            // Arrange
            mockProductRepository.list.mockResolvedValue([]);

            // Act
            const result = await listProducts(mockProductRepository);

            // Assert
            expect(result).toEqual([]);
            expect(mockProductRepository.list).toHaveBeenCalledTimes(1);
        });
    });

    describe("createProduct", () => {
        it("should create product via repository", async () => {
            // Arrange
            const newProduct = {
                name: "New Product",
                price: 29.99,
                stock: 10,
                // ... other fields
            };
            const createdProduct = createMockProduct({ ...newProduct, id: "new-id" });
            mockProductRepository.create.mockResolvedValue(createdProduct);

            // Act
            const result = await createProduct(mockProductRepository, newProduct);

            // Assert
            expect(result).toEqual(createdProduct);
            expect(mockProductRepository.create).toHaveBeenCalledTimes(1);
            expect(mockProductRepository.create).toHaveBeenCalledWith(newProduct);
        });
    });
});
```

### 2.3. UI Component Test - Reusable Component

**Source**: `src/presentation/components/ui/Button.tsx`
**Test**: `__tests__/presentation/components/ui/Button.test.tsx`

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/presentation/components/ui/Button";

describe("Button Component", () => {
    it("should render button with label", () => {
        // Arrange & Act
        render(<Button label="Click me" onClick={() => {}} />);

        // Assert
        const button = screen.getByRole("button", { name: /click me/i });
        expect(button).toBeInTheDocument();
    });

    it("should call onClick when clicked", () => {
        // Arrange
        const handleClick = jest.fn();
        render(<Button label="Click me" onClick={handleClick} />);

        // Act
        const button = screen.getByRole("button");
        fireEvent.click(button);

        // Assert
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should be disabled when disabled prop is true", () => {
        // Arrange & Act
        render(<Button label="Click me" onClick={() => {}} disabled />);

        // Assert
        const button = screen.getByRole("button");
        expect(button).toBeDisabled();
    });

    it("should not call onClick when disabled", () => {
        // Arrange
        const handleClick = jest.fn();
        render(<Button label="Click me" onClick={handleClick} disabled />);

        // Act
        const button = screen.getByRole("button");
        fireEvent.click(button);

        // Assert
        expect(handleClick).not.toHaveBeenCalled();
    });
});
```

---

## 3. Nested Tests (describe > describe > it)

### 3.1. Domain Test with Nested Structure

**Test**: `__tests__/core/domain/stockMovement.test.ts`

```typescript
import { validateStockMovement, calculateStockAfterMovement } from "@/core/domain/stockMovement";
import type { StockMovement, MovementType } from "@/core/domain/stockMovement";

describe("StockMovement Domain", () => {
    describe("validateStockMovement", () => {
        describe("when movement type is IN", () => {
            it("should return true for valid positive quantity", () => {
                // Arrange
                const movement: StockMovement = {
                    id: "1",
                    productId: "product-1",
                    type: "IN" as MovementType,
                    quantity: 10,
                    // ... other fields
                };

                // Act
                const isValid = validateStockMovement(movement);

                // Assert
                expect(isValid).toBe(true);
            });

            it("should return false for negative quantity", () => {
                // Arrange
                const movement: StockMovement = {
                    id: "1",
                    productId: "product-1",
                    type: "IN" as MovementType,
                    quantity: -5,
                    // ... other fields
                };

                // Act
                const isValid = validateStockMovement(movement);

                // Assert
                expect(isValid).toBe(false);
            });

            it("should return false for zero quantity", () => {
                // Arrange
                const movement: StockMovement = {
                    id: "1",
                    productId: "product-1",
                    type: "IN" as MovementType,
                    quantity: 0,
                    // ... other fields
                };

                // Act
                const isValid = validateStockMovement(movement);

                // Assert
                expect(isValid).toBe(false);
            });
        });

        describe("when movement type is OUT", () => {
            it("should return true for valid positive quantity", () => {
                // Arrange
                const movement: StockMovement = {
                    id: "1",
                    productId: "product-1",
                    type: "OUT" as MovementType,
                    quantity: 5,
                    // ... other fields
                };

                // Act
                const isValid = validateStockMovement(movement);

                // Assert
                expect(isValid).toBe(true);
            });

            it("should return false for negative quantity", () => {
                // Arrange
                const movement: StockMovement = {
                    id: "1",
                    productId: "product-1",
                    type: "OUT" as MovementType,
                    quantity: -5,
                    // ... other fields
                };

                // Act
                const isValid = validateStockMovement(movement);

                // Assert
                expect(isValid).toBe(false);
            });
        });
    });

    describe("calculateStockAfterMovement", () => {
        describe("when current stock is sufficient", () => {
            it("should decrease stock for OUT movement", () => {
                // Arrange
                const currentStock = 20;
                const movement: StockMovement = {
                    id: "1",
                    productId: "product-1",
                    type: "OUT" as MovementType,
                    quantity: 5,
                    // ... other fields
                };

                // Act
                const newStock = calculateStockAfterMovement(currentStock, movement);

                // Assert
                expect(newStock).toBe(15);
            });

            it("should increase stock for IN movement", () => {
                // Arrange
                const currentStock = 20;
                const movement: StockMovement = {
                    id: "1",
                    productId: "product-1",
                    type: "IN" as MovementType,
                    quantity: 10,
                    // ... other fields
                };

                // Act
                const newStock = calculateStockAfterMovement(currentStock, movement);

                // Assert
                expect(newStock).toBe(30);
            });
        });

        describe("when current stock would become negative", () => {
            it("should throw error for OUT movement exceeding stock", () => {
                // Arrange
                const currentStock = 5;
                const movement: StockMovement = {
                    id: "1",
                    productId: "product-1",
                    type: "OUT" as MovementType,
                    quantity: 10,
                    // ... other fields
                };

                // Act & Assert
                expect(() => {
                    calculateStockAfterMovement(currentStock, movement);
                }).toThrow("Insufficient stock");
            });
        });
    });
});
```

### 3.2. Usecase Test with Nested Structure

**Test**: `__tests__/core/usecases/productManagement.test.ts`

```typescript
import { updateProductStock, getLowStockProducts } from "@/core/usecases/productManagement";
import { mockProductRepository, resetMockProductRepository } from "__mocks__/core/ports/productRepository";
import { mockProducts, createMockProduct } from "__mocks__/core/domain/product";

jest.mock("@/infrastructure/supabase/productRepositorySupabase", () => ({
    productRepositorySupabase: mockProductRepository,
}));

describe("Product Management Usecases", () => {
    beforeEach(() => {
        resetMockProductRepository();
    });

    describe("updateProductStock", () => {
        describe("when product exists", () => {
            it("should update stock and save to repository", async () => {
                // Arrange
                const productId = "product-1";
                const existingProduct = createMockProduct({ id: productId, stock: 10 });
                const updatedProduct = createMockProduct({ id: productId, stock: 15 });

                mockProductRepository.findById.mockResolvedValue(existingProduct);
                mockProductRepository.update.mockResolvedValue(updatedProduct);

                // Act
                const result = await updateProductStock(mockProductRepository, productId, 15);

                // Assert
                expect(result).toEqual(updatedProduct);
                expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
                expect(mockProductRepository.update).toHaveBeenCalledWith(productId, { stock: 15 });
            });

            it("should handle stock update to zero", async () => {
                // Arrange
                const productId = "product-1";
                const existingProduct = createMockProduct({ id: productId, stock: 5 });
                const updatedProduct = createMockProduct({ id: productId, stock: 0 });

                mockProductRepository.findById.mockResolvedValue(existingProduct);
                mockProductRepository.update.mockResolvedValue(updatedProduct);

                // Act
                const result = await updateProductStock(mockProductRepository, productId, 0);

                // Assert
                expect(result).toEqual(updatedProduct);
                expect(mockProductRepository.update).toHaveBeenCalledWith(productId, { stock: 0 });
            });
        });

        describe("when product does not exist", () => {
            it("should throw error", async () => {
                // Arrange
                const productId = "non-existent";
                mockProductRepository.findById.mockResolvedValue(null);

                // Act & Assert
                await expect(updateProductStock(mockProductRepository, productId, 10)).rejects.toThrow("Product not found");
                expect(mockProductRepository.update).not.toHaveBeenCalled();
            });
        });

        describe("when repository fails", () => {
            it("should propagate error", async () => {
                // Arrange
                const productId = "product-1";
                const error = new Error("Database error");
                mockProductRepository.findById.mockRejectedValue(error);

                // Act & Assert
                await expect(updateProductStock(mockProductRepository, productId, 10)).rejects.toThrow("Database error");
            });
        });
    });

    describe("getLowStockProducts", () => {
        describe("when products exist", () => {
            it("should return only products with stock below threshold", async () => {
                // Arrange
                const allProducts = [
                    createMockProduct({ id: "1", stock: 5 }), // Low stock
                    createMockProduct({ id: "2", stock: 15 }), // Normal stock
                    createMockProduct({ id: "3", stock: 2 }), // Low stock
                ];
                mockProductRepository.list.mockResolvedValue(allProducts);

                // Act
                const result = await getLowStockProducts(mockProductRepository, 10);

                // Assert
                expect(result).toHaveLength(2);
                expect(result[0].id).toBe("1");
                expect(result[1].id).toBe("3");
            });

            it("should return empty array when no low stock products", async () => {
                // Arrange
                const allProducts = [createMockProduct({ id: "1", stock: 15 }), createMockProduct({ id: "2", stock: 20 })];
                mockProductRepository.list.mockResolvedValue(allProducts);

                // Act
                const result = await getLowStockProducts(mockProductRepository, 10);

                // Assert
                expect(result).toEqual([]);
            });
        });

        describe("when no products exist", () => {
            it("should return empty array", async () => {
                // Arrange
                mockProductRepository.list.mockResolvedValue([]);

                // Act
                const result = await getLowStockProducts(mockProductRepository, 10);

                // Assert
                expect(result).toEqual([]);
            });
        });
    });
});
```

### 3.3. UI Component Test with Nested Structure

**Test**: `__tests__/presentation/components/ui/ProductCard.test.tsx`

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import ProductCard from "@/presentation/components/ui/ProductCard";
import type { Product } from "@/core/domain/product";

describe("ProductCard Component", () => {
    const mockProduct: Product = {
        id: "1",
        name: "Test Product",
        description: "Test description",
        price: 29.99,
        stock: 10,
        category: "electronics",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    describe("when product has stock", () => {
        it("should display product name", () => {
            // Arrange & Act
            render(<ProductCard product={mockProduct} onEdit={() => {}} />);

            // Assert
            expect(screen.getByText("Test Product")).toBeInTheDocument();
        });

        it("should display price correctly", () => {
            // Arrange & Act
            render(<ProductCard product={mockProduct} onEdit={() => {}} />);

            // Assert
            expect(screen.getByText(/29.99/)).toBeInTheDocument();
        });

        it("should display stock quantity", () => {
            // Arrange & Act
            render(<ProductCard product={mockProduct} onEdit={() => {}} />);

            // Assert
            expect(screen.getByText(/10/)).toBeInTheDocument();
        });

        it("should call onEdit when edit button is clicked", () => {
            // Arrange
            const handleEdit = jest.fn();
            render(<ProductCard product={mockProduct} onEdit={handleEdit} />);

            // Act
            const editButton = screen.getByRole("button", { name: /edit/i });
            fireEvent.click(editButton);

            // Assert
            expect(handleEdit).toHaveBeenCalledWith(mockProduct.id);
        });
    });

    describe("when product has low stock", () => {
        it("should display low stock warning", () => {
            // Arrange
            const lowStockProduct = { ...mockProduct, stock: 2 };

            // Act
            render(<ProductCard product={lowStockProduct} onEdit={() => {}} />);

            // Assert
            expect(screen.getByText(/low stock/i)).toBeInTheDocument();
        });

        it("should apply low stock styling", () => {
            // Arrange
            const lowStockProduct = { ...mockProduct, stock: 2 };

            // Act
            const { container } = render(<ProductCard product={lowStockProduct} onEdit={() => {}} />);

            // Assert
            const card = container.querySelector(".product-card--low-stock");
            expect(card).toBeInTheDocument();
        });
    });

    describe("when product is out of stock", () => {
        it("should display out of stock message", () => {
            // Arrange
            const outOfStockProduct = { ...mockProduct, stock: 0 };

            // Act
            render(<ProductCard product={outOfStockProduct} onEdit={() => {}} />);

            // Assert
            expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
        });

        it("should disable edit button", () => {
            // Arrange
            const outOfStockProduct = { ...mockProduct, stock: 0 };

            // Act
            render(<ProductCard product={outOfStockProduct} onEdit={() => {}} />);

            // Assert
            const editButton = screen.getByRole("button", { name: /edit/i });
            expect(editButton).toBeDisabled();
        });
    });
});
```

---

## Best Practices

### 1. Arrange-Act-Assert Pattern

Always structure tests in three clear sections:

```typescript
it("should do something", () => {
    // Arrange: Set up test data and mocks
    const input = "test";

    // Act: Execute the code being tested
    const result = functionUnderTest(input);

    // Assert: Verify the expected outcome
    expect(result).toBe("expected");
});
```

### 2. Descriptive Test Names

Use clear, descriptive test names that explain what is being tested:

✅ **Good**: `"should return true when stock is below threshold"`
❌ **Bad**: `"test 1"` or `"works correctly"`

### 3. One Assertion Per Test (when possible)

Focus each test on a single behavior:

```typescript
// ✅ Good - Single assertion
it("should return true for low stock", () => {
    expect(isLowStock(product, 10)).toBe(true);
});

// ❌ Avoid - Multiple unrelated assertions
it("should handle stock calculations", () => {
    expect(isLowStock(product, 10)).toBe(true);
    expect(calculateTotal([product])).toBe(100);
});
```

### 4. Mock Reset

Always reset mocks between tests:

```typescript
beforeEach(() => {
    jest.clearAllMocks();
});
```

### 5. Type Safety

Always type your mocks and test data:

```typescript
// ✅ Good
const mockProduct: Product = {
    /* ... */
};

// ❌ Avoid
const mockProduct = {
    /* ... */
}; // No type annotation
```

---

## Testing Checklist

Before submitting tests, verify:

✅ Test file is in `__tests__/` directory
✅ Test mirrors source file structure
✅ All external dependencies are mocked
✅ Tests follow Arrange-Act-Assert pattern
✅ Test names are descriptive
✅ Edge cases are covered
✅ Error paths are tested
✅ Mocks are reset in `beforeEach`
✅ TypeScript types are used throughout
✅ No React/Next.js imports in domain/usecase tests
