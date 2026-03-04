"use client"

import { useEffect, useMemo } from "react";
import { COFFEE_PALETTE } from "../constants/theme";
import { useLogStore } from "./store/useLogStore";
import {
    FileText,
    AlertCircle,
    AlertTriangle,
    Info,
    CheckCircle,
    Activity,
    Search,
    Filter,
    X
} from "lucide-react";
import { Log } from "./interface/Log";

export default function LogsPage() {
    const { logs, setLogs, loading, error, filterLevel, searchQuery, setFilterLevel, setSearchQuery } = useLogStore();

    useEffect(() => {
        setLogs();
    }, [setLogs]);

    const filteredLogs = useMemo(() => {
        const q = (searchQuery ?? "").trim().toLowerCase();
        return logs.filter(log => {
            const matchesLevel = !filterLevel || log.level === filterLevel;
            if (!q) return matchesLevel;
            const message = (log.message ?? "").toLowerCase();
            const id = (log.id ?? "").toLowerCase();
            const printerId = (log.printerId ?? "").toLowerCase();
            const serverId = (log.serverId ?? "").toLowerCase();
            const matchesSearch =
                message.includes(q) ||
                id.includes(q) ||
                printerId.includes(q) ||
                serverId.includes(q);
            return matchesLevel && matchesSearch;
        });
    }, [logs, filterLevel, searchQuery]);

    const getLogIcon = (level: string) => {
        switch (level.toLowerCase()) {
            case 'error':
                return <AlertCircle className="w-4 h-4" style={{ color: COFFEE_PALETTE.primary }} />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4" style={{ color: COFFEE_PALETTE.primary }} />;
            case 'success':
                return <CheckCircle className="w-4 h-4" style={{ color: COFFEE_PALETTE.primary }} />;
            case 'info':
            default:
                return <Info className="w-4 h-4" style={{ color: COFFEE_PALETTE.primary }} />;
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const logLevels = ['info', 'warning', 'error'];
    const logCounts = useMemo(() => {
        return {
            total: logs.length,
            info: logs.filter(l => l.level === 'info').length,
            success: logs.filter(l => l.level === 'success').length,
            warning: logs.filter(l => l.level === 'warning').length,
            error: logs.filter(l => l.level === 'error').length,
        };
    }, [logs]);

    return (
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {error && (
                <div className="mb-6 p-4 rounded-lg border flex items-start gap-3"
                    style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.primary }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: COFFEE_PALETTE.primary }}>
                        <span className="text-xs" style={{ color: COFFEE_PALETTE.cardBg }}>!</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1" style={{ color: COFFEE_PALETTE.primary }}>
                            Firebase Connection Error
                        </h4>
                        <p className="text-sm mb-2" style={{ color: COFFEE_PALETTE.background }}>{error}</p>
                        <p className="text-xs opacity-80" style={{ color: COFFEE_PALETTE.background }}>
                            Check browser console or <code className="px-1 py-0.5 rounded" style={{ backgroundColor: COFFEE_PALETTE.background + '20' }}>FIREBASE_SETUP.md</code>
                        </p>
                    </div>
                </div>
            )}

            <div className="mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold mb-1" style={{ color: COFFEE_PALETTE.cardBg }}>
                    System Logs
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm opacity-80" style={{ color: COFFEE_PALETTE.cardBg }}>
                    <span>View all system logs and activity</span>
                    {loading && <span className="animate-pulse text-xs italic">Loading...</span>}
                    {!loading && logs.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: COFFEE_PALETTE.cardBg }}>
                            {filteredLogs.length} of {logs.length} logs
                        </span>
                    )}
                </div>
            </div>

            <div className="mb-6 p-4 md:p-6 rounded-lg border"
                style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.background }}>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                            style={{ color: COFFEE_PALETTE.background }} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 rounded-md border focus:outline-none focus:ring-2"
                            style={{
                                borderColor: COFFEE_PALETTE.background,
                                color: COFFEE_PALETTE.background
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <X className="w-4 h-4" style={{ color: COFFEE_PALETTE.primary }} />
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilterLevel(null)}
                            className="px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2"
                            style={{
                                backgroundColor: !filterLevel ? COFFEE_PALETTE.primary : 'transparent',
                                color: !filterLevel ? COFFEE_PALETTE.cardBg : COFFEE_PALETTE.background,
                                borderWidth: !filterLevel ? 0 : 1,
                                borderColor: COFFEE_PALETTE.background
                            }}
                        >
                            <Filter className="w-4 h-4" />
                            All ({logCounts.total})
                        </button>
                        {logLevels.map(level => (
                            <button
                                key={level}
                                onClick={() => setFilterLevel(level)}
                                className="px-4 py-2 rounded-md text-sm font-medium transition-all capitalize"
                                style={{
                                    backgroundColor: filterLevel === level ? COFFEE_PALETTE.background : 'transparent',
                                    color: filterLevel === level ? COFFEE_PALETTE.primary : COFFEE_PALETTE.background,
                                    borderWidth: 1,
                                    borderColor: filterLevel === level ? COFFEE_PALETTE.primary : COFFEE_PALETTE.background
                                }}
                            >
                                {level} ({logCounts[level as keyof typeof logCounts]})
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Activity className="w-8 h-8 mx-auto mb-2 animate-spin" style={{ color: COFFEE_PALETTE.primary }} />
                        <p className="text-sm opacity-80" style={{ color: COFFEE_PALETTE.cardBg }}>Loading logs...</p>
                    </div>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="p-12 rounded-lg border-2 border-dashed text-center"
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: COFFEE_PALETTE.cardBg }} />
                    <h3 className="text-lg font-semibold mb-1" style={{ color: COFFEE_PALETTE.cardBg }}>
                        {logs.length === 0 ? 'No Logs Found' : 'No Matching Logs'}
                    </h3>
                    <p className="text-sm opacity-80" style={{ color: COFFEE_PALETTE.cardBg }}>
                        {logs.length === 0
                            ? 'Add log documents in Firestore to see them here'
                            : 'Try adjusting your filters or search query'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredLogs.map((log: Log) => (
                        <div
                            key={log.id}
                            className="p-4 md:p-5 rounded-lg border hover:shadow-sm transition-shadow"
                            style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.background }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="shrink-0 mt-0.5">
                                    {getLogIcon(log.level)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <div className="flex-1">
                                            <p className="text-sm md:text-base font-medium wrap-break-word"
                                                style={{ color: COFFEE_PALETTE.background }}>
                                                {log.message}
                                            </p>
                                        </div>
                                        <span
                                            className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                                            style={{
                                                backgroundColor: COFFEE_PALETTE.primary + '20',
                                                color: COFFEE_PALETTE.primary
                                            }}
                                        >
                                            {log.level}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs opacity-80" style={{ color: COFFEE_PALETTE.background }}>
                                        {log.id != null && log.id !== "" && (
                                            <>
                                                <span className="font-mono">{log.id.substring(0, 8)}</span>
                                                <span>•</span>
                                            </>
                                        )}
                                        {log.printerId != null && log.printerId !== "" && (
                                            <>
                                                <span title="Printer ID" className="font-mono">Printer: {log.printerId}</span>
                                                <span>•</span>
                                            </>
                                        )}
                                        {log.serverId != null && log.serverId !== "" && (
                                            <>
                                                <span title="Server ID" className="font-mono">Server: {log.serverId}</span>
                                                <span>•</span>
                                            </>
                                        )}
                                        <span>{formatTime(log.timestamp)}</span>
                                        <span>•</span>
                                        <span>{log.timestamp != null ? log.timestamp.toLocaleString() : "—"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}