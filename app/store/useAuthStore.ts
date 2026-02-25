import { create } from "zustand"
import { User } from "firebase/auth"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../utils/firebase.browser"

type AuthState = {
    user: User | null | undefined
    role: string
    isLoading: boolean
    _unsub: (() => void) | null
    subscribe: () => () => void
}

async function fetchRole(uid: string): Promise<string> {
    const snap = await getDoc(doc(db, "users", uid))
    return snap.data()?.role ?? "user"
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: undefined,
    role: "user",
    isLoading: true,
    _unsub: null,

    subscribe: () => {
        if (get()._unsub) return get()._unsub!
        const unsub = onAuthStateChanged(auth, async (user) => {
            set({ user, isLoading: true })
            console.log(user)
            if (user) {
                const role = await fetchRole(user.uid)
                console.log(role)
                set({ role, isLoading: false })
            } else {
                set({ role: "user", isLoading: false })
            }
        })
        set({ _unsub: unsub })
        return unsub
    },
}))
