"use client";

import {
    ThemeProvider as NextThemesProvider,
    type ThemeProviderProps,
    useTheme,
} from "next-themes";

export type Theme = "light" | "dark" | "system";

export function ThemeProvider({
    children,
    attribute = "class",
    defaultTheme = "system",
    ...props
}: ThemeProviderProps) {
    return (
        <NextThemesProvider attribute={attribute} defaultTheme={defaultTheme} {...props}>
            {children}
        </NextThemesProvider>
    );
}

export { useTheme };
