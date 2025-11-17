"use client";

import type { ReactNode } from "react";
import GlobalLoader from "@/presentation/components/globalLoader/GlobalLoader";

type Props = {
    children: ReactNode;
};

/** Provides global loader component. */
const GlobalLoaderProvider = ({ children }: Props) => {
    return (
        <>
            {children}
            <GlobalLoader />
        </>
    );
};

export default GlobalLoaderProvider;

