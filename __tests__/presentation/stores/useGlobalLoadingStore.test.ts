import { renderHook, act } from "@testing-library/react";
import { useGlobalLoadingStore } from "@/presentation/stores/useGlobalLoadingStore";

describe("useGlobalLoadingStore", () => {
    beforeEach(() => {
        // Reset store to initial state before each test
        useGlobalLoadingStore.getState().setLoading(false);
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
});

