import { COFFEE_PALETTE } from "@/app/constants/theme";
import { Printer } from "@/app/printer/interface/Printer";

interface PrinterItemProps {
    printer: Printer
}

export default function PrinterItem({
    printer,
}: PrinterItemProps) {

    return (
        <div className="p-4 rounded-lg border hover:shadow-md transition-shadow" style={{ borderColor: COFFEE_PALETTE.border }}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: printer.isOnline ? COFFEE_PALETTE.success : COFFEE_PALETTE.error }}></div>
                    <span className="font-bold" style={{ color: COFFEE_PALETTE.textPrimary }}>{printer.id}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: printer.isOnline ? COFFEE_PALETTE.success : COFFEE_PALETTE.error }}>
                    {printer.isOnline ? 'Connected' : 'Disconnected'}
                </span>
            </div>
            <p className="text-xs mb-1" style={{ color: COFFEE_PALETTE.textSecondary }}>Location: {printer.location}</p>
            <p className="text-xs font-medium" style={{ color: COFFEE_PALETTE.textPrimary }}>Jobs: 0</p>
        </div>
    );
}