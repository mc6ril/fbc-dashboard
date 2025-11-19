import { renderHook, act } from "@testing-library/react";
import { useGlobalLoadingStore } from "@/presentation/stores/useGlobalLoadingStore";

describe("useGlobalLoadingStore", () => {
    beforeEach(() => {
        // Reset store to initial state before each test
        const state = useGlobalLoadingStore.getState();
        state.setLoading(false);
        // Reset counter to ensure clean state
        useGlobalLoadingStore.setState({ activeOperationsCount: 0, isLoading: false });
    });

    describe("initial state", () => {
        it("should have isLoading as false initially", () => {
            const state = useGlobalLoadingStore.getState();
            expect(state.isLoading).toBe(false);
        });
    });

    describe("setLoading", () => {
        it("should set loading to true", () => {
            const { result } = renderHook(() => useGlobalLoadingStore());
            
            act(() => {
                result.current.setLoading(true);
            });

            expect(result.current.isLoading).toBe(true);
            expect(useGlobalLoadingStore.getState().isLoading).toBe(true);
        });

        it("should set loading to false", () => {
            const { result } = renderHook(() => useGlobalLoadingStore());
            
            act(() => {
                result.current.setLoading(true);
            });
            expect(result.current.isLoading).toBe(true);

            act(() => {
                result.current.setLoading(false);
            });

            expect(result.current.isLoading).toBe(false);
            expect(useGlobalLoadingStore.getState().isLoading).toBe(false);
        });

        it("should set counter to 1 when true, not increment (deprecated behavior)", () => {
            const { result } = renderHook(() => useGlobalLoadingStore());
            
            // Start with ref-counting
            act(() => {
                result.current.startLoading();
                result.current.startLoading();
            });
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(2);

            // setLoading(true) should reset counter to 1, not increment to 3
            act(() => {
                result.current.setLoading(true);
            });
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(1);
            expect(result.current.isLoading).toBe(true);
        });

        it("should set counter to 0 when false, not decrement (deprecated behavior)", () => {
            const { result } = renderHook(() => useGlobalLoadingStore());
            
            // Start with ref-counting
            act(() => {
                result.current.startLoading();
                result.current.startLoading();
            });
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(2);

            // setLoading(false) should reset counter to 0, not decrement to 1
            act(() => {
                result.current.setLoading(false);
            });
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(0);
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe("startLoading", () => {
        it("should set loading to true", () => {
            const { result } = renderHook(() => useGlobalLoadingStore());
            
            act(() => {
                result.current.startLoading();
            });

            expect(result.current.isLoading).toBe(true);
            expect(useGlobalLoadingStore.getState().isLoading).toBe(true);
        });

        it("should set loading to true even if already true", () => {
            const { result } = renderHook(() => useGlobalLoadingStore());
            
            act(() => {
                result.current.startLoading();
            });
            expect(result.current.isLoading).toBe(true);

            act(() => {
                result.current.startLoading();
            });

            expect(result.current.isLoading).toBe(true);
            expect(useGlobalLoadingStore.getState().isLoading).toBe(true);
        });
    });

    describe("stopLoading", () => {
        it("should set loading to false", () => {
            const { result } = renderHook(() => useGlobalLoadingStore());
            
            act(() => {
                result.current.setLoading(true);
            });
            expect(result.current.isLoading).toBe(true);

            act(() => {
                result.current.stopLoading();
            });

            expect(result.current.isLoading).toBe(false);
            expect(useGlobalLoadingStore.getState().isLoading).toBe(false);
        });

        it("should set loading to false even if already false", () => {
            const { result } = renderHook(() => useGlobalLoadingStore());
            expect(result.current.isLoading).toBe(false);

            act(() => {
                result.current.stopLoading();
            });

            expect(result.current.isLoading).toBe(false);
            expect(useGlobalLoadingStore.getState().isLoading).toBe(false);
        });
    });

    describe("multiple actions", () => {
        it("should handle multiple start/stop calls correctly", () => {
            const { result } = renderHook(() => useGlobalLoadingStore());
            
            act(() => {
                result.current.startLoading();
            });
            expect(result.current.isLoading).toBe(true);

            act(() => {
                result.current.stopLoading();
            });
            expect(result.current.isLoading).toBe(false);

            act(() => {
                result.current.startLoading();
            });
            expect(result.current.isLoading).toBe(true);

            act(() => {
                result.current.stopLoading();
            });
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe("ref-counting for concurrent operations", () => {
        it("should track multiple concurrent operations", () => {
            const { result } = renderHook(() => useGlobalLoadingStore());
            
            // Start first operation
            act(() => {
                result.current.startLoading();
            });
            expect(result.current.isLoading).toBe(true);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(1);

            // Start second operation (concurrent)
            act(() => {
                result.current.startLoading();
            });
            expect(result.current.isLoading).toBe(true);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(2);

            // Stop first operation - loader should still be visible
            act(() => {
                result.current.stopLoading();
            });
            expect(result.current.isLoading).toBe(true);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(1);

            // Stop second operation - loader should now be hidden
            act(() => {
                result.current.stopLoading();
            });
            expect(result.current.isLoading).toBe(false);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(0);
        });

        it("should handle stopLoading when no operations are active (guard against negative)", () => {
            const { result } = renderHook(() => useGlobalLoadingStore());
            
            expect(result.current.isLoading).toBe(false);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(0);

            // Stop without starting - should not go negative
            act(() => {
                result.current.stopLoading();
            });
            expect(result.current.isLoading).toBe(false);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(0);

            // Stop again - should still be 0
            act(() => {
                result.current.stopLoading();
            });
            expect(result.current.isLoading).toBe(false);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(0);
        });

        it("should handle three concurrent operations correctly", () => {
            const { result } = renderHook(() => useGlobalLoadingStore());
            
            // Start three operations
            act(() => {
                result.current.startLoading();
                result.current.startLoading();
                result.current.startLoading();
            });
            expect(result.current.isLoading).toBe(true);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(3);

            // Stop one - should still be loading
            act(() => {
                result.current.stopLoading();
            });
            expect(result.current.isLoading).toBe(true);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(2);

            // Stop another - should still be loading
            act(() => {
                result.current.stopLoading();
            });
            expect(result.current.isLoading).toBe(true);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(1);

            // Stop last one - should stop loading
            act(() => {
                result.current.stopLoading();
            });
            expect(result.current.isLoading).toBe(false);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(0);
        });
    });

    describe("integration: concurrent operations from different sources", () => {
        it("should handle concurrent mutations from different hooks (simulated)", () => {
            const { result } = renderHook(() => useGlobalLoadingStore());
            
            // Simulate: useCreateProduct starts
            act(() => {
                result.current.startLoading();
            });
            expect(result.current.isLoading).toBe(true);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(1);

            // Simulate: useAddActivity starts (while product creation is pending)
            act(() => {
                result.current.startLoading();
            });
            expect(result.current.isLoading).toBe(true);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(2);

            // Simulate: useAddActivity completes first (faster response)
            act(() => {
                result.current.stopLoading();
            });
            expect(result.current.isLoading).toBe(true);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(1);

            // Simulate: useCreateProduct completes later (slower response)
            act(() => {
                result.current.stopLoading();
            });
            expect(result.current.isLoading).toBe(false);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(0);
        });

        it("should handle dashboard layout cleanup with active operations", () => {
            const { result } = renderHook(() => useGlobalLoadingStore());
            
            // Simulate: Auth mutation in progress
            act(() => {
                result.current.startLoading();
            });
            expect(result.current.isLoading).toBe(true);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(1);

            // Simulate: Dashboard layout mounts and calls stopGlobalLoading()
            // This may decrement counter even if auth mutation still settling
            // The guard prevents negative values
            act(() => {
                result.current.stopLoading();
            });
            expect(result.current.isLoading).toBe(false);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(0);

            // Counter won't go negative even if auth mutation's onSettled fires later
            act(() => {
                result.current.stopLoading();
            });
            expect(result.current.isLoading).toBe(false);
            expect(useGlobalLoadingStore.getState().activeOperationsCount).toBe(0);
        });
    });
});

