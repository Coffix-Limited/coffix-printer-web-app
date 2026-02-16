"use client"

import { useEffect } from "react";
import { COFFEE_PALETTE } from "../constants/theme";
import { usePrinterStore } from "../printer/store/usePrinterStore";
import { Log } from "../logs/interface/Log";
import { Printer } from "../printer/interface/Printer";
import StatusCard from "./components/StatusCard";
import PrinterItem from "./components/PrinterItem";
import RecentActivity from "./components/RecentActivity";
import { useLogStore } from "../logs/store/useLogStore";

export default function DashboardPage() {
    const { printers, setPrinters, loading, error } = usePrinterStore();
    const { logs, setLogs } = useLogStore();

    useEffect(() => {
        setPrinters()
        setLogs();
    }, [setPrinters, setLogs]);

    return (
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-4 rounded-lg border flex flex-col sm:flex-row items-start gap-3"
                    style={{ backgroundColor: '#FFEBEE', borderColor: COFFEE_PALETTE.error }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: COFFEE_PALETTE.error }}>
                        <span className="text-white text-xs">!</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1" style={{ color: COFFEE_PALETTE.error }}>
                            Firebase Connection Error
                        </h4>
                        <p className="text-sm mb-2" style={{ color: COFFEE_PALETTE.textPrimary }}>{error}</p>
                        <p className="text-xs opacity-80" style={{ color: COFFEE_PALETTE.textSecondary }}>
                            Check browser console or <code className="bg-white/50 px-1 py-0.5 rounded">FIREBASE_SETUP.md</code>
                        </p>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold mb-1" style={{ color: COFFEE_PALETTE.textPrimary }}>Overview</h2>
                <div className="flex flex-wrap items-center gap-2 text-sm" style={{ color: COFFEE_PALETTE.textSecondary }}>
                    <span>Real-time monitoring of all printer nodes</span>
                    {loading && <span className="animate-pulse text-xs italic">⏳ Loading...</span>}
                    {!loading && printers.length > 0 && (
                        <span className="bg-stone-100 px-2 py-0.5 rounded-full text-xs">
                            {printers.length} connected
                        </span>
                    )}
                </div>
            </div>

            {/* Top Stats Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
                <StatusCard title="Total Printers" value={printers.length.toString()} subtext="Across all locations" icon="🖨️" />
                <StatusCard title="Online Now" value="9" subtext="3 offline" statusDot />
            </div>

            {/* Main Content: Stacks on mobile/tablet, Side-by-side on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Printer Status Section */}
                <div className="lg:col-span-2">
                    <section className="p-5 md:p-6 rounded-lg shadow-sm border h-full"
                        style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.border }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: COFFEE_PALETTE.textPrimary }}>Printer Status</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {printers.map((printer: Printer) => (
                                <PrinterItem key={printer.id} printer={printer} />
                            ))}
                        </div>
                    </section>
                </div>

                {/* Recent Activity Section */}
                <div className="lg:col-span-1">
                    <section className="p-5 md:p-6 rounded-lg shadow-sm border h-full"
                        style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.border }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: COFFEE_PALETTE.textPrimary }}>Recent Activity</h3>
                        <div className="space-y-4">
                            {logs.slice(0, 5).map((log: Log) => (
                                <RecentActivity key={log.id} log={log} />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}
