"use client"

import dynamic from "next/dynamic"
import { Logo } from "@/components/logo"

// Alteração feita pelo copilot para solucionar erros de Hydratation
const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((mod) => mod.ThemeToggle),
  {
    ssr: false,
  }
)

const CartSidebar = dynamic(
  () => import("@/components/cart/sidebar").then((mod) => mod.CartSidebar),
  {
    ssr: false,
  }
)
// Fim das alterações do copilot.

export const Header = () => {
    return (
        <header className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
                <Logo />
            </div>
            <div className="flex items-center gap-3">
                <ThemeToggle />
                {/* É responsável por mostrar o menu lateral qunado clicado em carrinho */}
                <CartSidebar />
            </div>
        </header>
    )
}