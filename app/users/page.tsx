"use client"

import { useState, useEffect, useCallback } from "react"
import { COFFEE_PALETTE } from "../constants/theme"
import { Plus, Pencil, Trash2, X } from "lucide-react"
import { auth } from "../utils/firebase.browser"
import { useAuthStore } from "../store/useAuthStore"

type User = {
    id: string
    email: string
    displayName: string
    role: string
    createdAt: string
    updatedAt: string
}

const ROLES = ["superadmin", "admin", "user"]

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<User | null>(null)
    const [form, setForm] = useState({ email: "", password: "", displayName: "", role: "user" })
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)
    const role = useAuthStore((s) => s.role)
    const isSuperAdmin = role === "superadmin"

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch("/api/users")
            if (!res.ok) throw new Error("Failed to fetch")
            const data = await res.json()
            setUsers(data)
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load users")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const openCreate = () => {
        setEditing(null)
        setForm({ email: "", password: "", displayName: "", role: "user" })
        setError("")
        setModalOpen(true)
    }

    const openEdit = (u: User) => {
        setEditing(u)
        setForm({ email: u.email, password: "", displayName: u.displayName, role: u.role })
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditing(null)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.email?.trim()) return
        if (!editing && (!form.password || form.password.length < 6)) {
            setError("Password must be at least 6 characters")
            return
        }
        setSaving(true)
        setError("")
        try {
            if (editing) {
                const token = await auth.currentUser?.getIdToken()
                const res = await fetch(`/api/users/${editing.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: JSON.stringify({ ...form, password: undefined }),
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) throw new Error(data.error ?? "Update failed")
            } else {
                const token = await auth.currentUser?.getIdToken()
                const res = await fetch("/api/users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: JSON.stringify(form),
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) throw new Error(data.error ?? "Create failed")
            }
            closeModal()
            fetchUsers()
        } catch (e) {
            setError(e instanceof Error ? e.message : "Request failed")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this user?")) return
        setDeleting(id)
        try {
            const token = await auth.currentUser?.getIdToken()
            const res = await fetch(`/api/users/${id}`, {
                method: "DELETE",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.error ?? "Delete failed")
            fetchUsers()
        } catch (e) {
            setError(e instanceof Error ? e.message : "Delete failed")
        } finally {
            setDeleting(null)
        }
    }

    return (
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold" style={{ color: COFFEE_PALETTE.cardBg }}>
                        Users
                    </h2>
                    <p className="text-sm mt-1 opacity-80" style={{ color: COFFEE_PALETTE.cardBg }}>
                        Manage dashboard users • {users.length} total
                    </p>
                </div>
                {isSuperAdmin && (
                <button
                    onClick={openCreate}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium shrink-0"
                    style={{ backgroundColor: COFFEE_PALETTE.primary, color: COFFEE_PALETTE.cardBg }}
                >
                    <Plus size={18} />
                    Add User
                </button>
            )}
            </div>

            {error && (
                <div
                    className="mb-6 p-4 rounded-lg border"
                    style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.primary }}
                >
                    <p className="text-sm font-medium" style={{ color: COFFEE_PALETTE.background }}>{error}</p>
                </div>
            )}

            <div
                className="rounded-lg border overflow-hidden"
                style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.background }}
            >
                {loading ? (
                    <div className="p-12 text-center opacity-80" style={{ color: COFFEE_PALETTE.background }}>
                        Loading...
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center opacity-80" style={{ color: COFFEE_PALETTE.background }}>
                        No users yet. Click &quot;Add User&quot; to create one.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: COFFEE_PALETTE.background, borderBottom: `1px solid ${COFFEE_PALETTE.background}` }}>
                                    <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: COFFEE_PALETTE.cardBg }}>Email</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: COFFEE_PALETTE.cardBg }}>Name</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: COFFEE_PALETTE.cardBg }}>Role</th>
                                    {isSuperAdmin && <th className="text-right px-4 py-3 text-sm font-semibold" style={{ color: COFFEE_PALETTE.cardBg }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} style={{ borderBottom: `1px solid ${COFFEE_PALETTE.background}` }}>
                                        <td className="px-4 py-3 text-sm" style={{ color: COFFEE_PALETTE.background }}>{u.email}</td>
                                        <td className="px-4 py-3 text-sm" style={{ color: COFFEE_PALETTE.background }}>{u.displayName || "—"}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="px-2 py-0.5 rounded text-xs font-medium"
                                                style={{
                                                    backgroundColor: COFFEE_PALETTE.primary + "20",
                                                    color: COFFEE_PALETTE.primary,
                                                }}
                                            >
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {isSuperAdmin && (
                                                <>
                                                    <button
                                                        onClick={() => openEdit(u)}
                                                        className="p-2 rounded hover:opacity-80 mr-1"
                                                        style={{ color: COFFEE_PALETTE.primary }}
                                                        aria-label="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        disabled={deleting === u.id}
                                                        className="p-2 rounded hover:opacity-80 disabled:opacity-50"
                                                        style={{ color: COFFEE_PALETTE.primary }}
                                                        aria-label="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                    onClick={closeModal}
                >
                    <div
                        className="w-full max-w-md rounded-lg shadow-lg p-6"
                        style={{ backgroundColor: COFFEE_PALETTE.cardBg }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold" style={{ color: COFFEE_PALETTE.background }}>
                                {editing ? "Edit User" : "Add User"}
                            </h3>
                            <button onClick={closeModal} className="p-1 rounded hover:opacity-80" style={{ color: COFFEE_PALETTE.primary }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: COFFEE_PALETTE.background }}>Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                    required
                                    disabled={!!editing}
                                    className="w-full px-3 py-2 rounded border text-sm"
                                    style={{ borderColor: COFFEE_PALETTE.background, color: COFFEE_PALETTE.background, backgroundColor: COFFEE_PALETTE.cardBg }}
                                />
                            </div>
                            {!editing && (
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: COFFEE_PALETTE.background }}>Password</label>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                        required={!editing}
                                        minLength={6}
                                        placeholder="Min 6 characters"
                                        className="w-full px-3 py-2 rounded border text-sm"
                                        style={{ borderColor: COFFEE_PALETTE.background, color: COFFEE_PALETTE.background, backgroundColor: COFFEE_PALETTE.cardBg }}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: COFFEE_PALETTE.background }}>Display Name</label>
                                <input
                                    type="text"
                                    value={form.displayName}
                                    onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                                    className="w-full px-3 py-2 rounded border text-sm"
                                    style={{ borderColor: COFFEE_PALETTE.background, color: COFFEE_PALETTE.background, backgroundColor: COFFEE_PALETTE.cardBg }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: COFFEE_PALETTE.background }}>Role</label>
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                                    className="w-full px-3 py-2 rounded border text-sm"
                                    style={{ borderColor: COFFEE_PALETTE.background, color: COFFEE_PALETTE.background, backgroundColor: COFFEE_PALETTE.cardBg }}
                                >
                                    {ROLES.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2 rounded font-medium disabled:opacity-50"
                                    style={{ backgroundColor: COFFEE_PALETTE.primary, color: COFFEE_PALETTE.cardBg }}
                                >
                                    {saving ? "Saving..." : editing ? "Update" : "Create"}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded font-medium border"
                                    style={{ borderColor: COFFEE_PALETTE.primary, color: COFFEE_PALETTE.primary }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
