import { COFFEE_PALETTE } from "@/app/constants/theme";
import { Log } from "@/app/logs/interface/Log";

interface RecentActivityProps {
    log: Log
}

export default function RecentActivity({
    log
}: RecentActivityProps) {

    const levelColor = () => {
        switch (log.level) {
            case 'error':
                return COFFEE_PALETTE.error;
            case 'warning':
                return COFFEE_PALETTE.warning;
            case 'success':
                return COFFEE_PALETTE.success;
            default:
                return COFFEE_PALETTE.primary;
        }
    }

    return (
        <div className="flex items-start gap-3 pb-3 border-b last:border-b-0" style={{ borderColor: COFFEE_PALETTE.border }}>
            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: levelColor() }}></div>
            <div className="flex-1 min-w-0">
                {/* <p className="text-sm font-medium leading-none mb-1" style={{ color: COFFEE_PALETTE.textPrimary }}>{log.msg}</p> */}
                <p className="text-[10px]" style={{ color: COFFEE_PALETTE.textSecondary }}>{log.id} • {log.timestamp.toLocaleString()}</p>
            </div>
        </div>
    );
}