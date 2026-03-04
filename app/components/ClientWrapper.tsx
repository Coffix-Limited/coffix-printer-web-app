"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "../store/useAuthStore"
import { COFFEE_PALETTE } from "../constants/theme"
import SideBar from "./SideBar"

type Props = {
    children: React.ReactNode
}

const ClientWrapper: React.FC<Props> = ({ children }) => {
    const { user, subscribe } = useAuthStore((s) => s)
    const router = useRouter()
    const pathname = usePathname()
    const isLoginPage = pathname === "/login"

    useEffect(() => {
        return subscribe()
    }, [subscribe])

    useEffect(() => {
        if (user === undefined) return
        if (!user && !isLoginPage) router.replace("/login")
        if (user && isLoginPage) router.replace("/")
    }, [user, isLoginPage, router])

    if (user === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-[#6F4E37]">Loading...</div>
            </div>
        )
    }
    if (!user && !isLoginPage) return null
    if (user && isLoginPage) return null

    if (isLoginPage) return <>{children}</>

    return (
        <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: COFFEE_PALETTE.background }}>
            <SideBar />
            <main className="flex-1 w-full md:ml-64 transition-all duration-300">
                {children}
            </main>
        </div>
    )
}

export default ClientWrapper;