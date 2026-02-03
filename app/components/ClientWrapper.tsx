"use client"

import { onAuthStateChanged } from "firebase/auth"
import { useEffect } from "react"
import { auth } from "../utils/firebase.browser"
import { usePathname } from "next/navigation"
import SideBar from "./SideBar"

type Props = {
    children: React.ReactNode
}

const ClientWrapper: React.FC<Props> = ({ children }) => {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const uid = user.uid;
                console.log("User signed in:", uid);
            } else {
                console.log("No user signed in");
            }
        });
    }, []);

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <SideBar />
            <main className="flex-1 w-full md:ml-64 transition-all duration-300">
        {children}
            </main>
    </div>
    );
}

export default ClientWrapper;