import { COFFEE_PALETTE } from "@/app/constants/theme";
import { ReactNode } from "react";

interface StatusCardProps {
    title: string
    value: string
    subtext: string
    icon?: ReactNode
    statusDot?: boolean
}


export default function StatusCard(
    { title, value, subtext, icon, statusDot }: StatusCardProps
) {
    return (
        <div className="p-5 md:p-6 rounded-lg shadow-sm border"
            style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.border }}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium" style={{ color: COFFEE_PALETTE.textSecondary }}>{title}</h3>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg">
                    {statusDot ? <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COFFEE_PALETTE.success }}></div> : icon}
                </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold" style={{ color: COFFEE_PALETTE.textPrimary }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: COFFEE_PALETTE.textSecondary }}>{subtext}</p>
        </div>
    );
}