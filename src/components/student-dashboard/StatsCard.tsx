import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
    description?: string;
    className?: string; // Allow custom classes
}

export function StatsCard({ title, value, change, trend, icon, description, className }: StatsCardProps) {
    return (
        <div className={cn("p-6 rounded-3xl bg-[#0F1115] text-white flex flex-col justify-between h-full relative overflow-hidden group", className)}>
            {/* Background Gradient/Mesh effect to match design */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-start mb-4 z-10">
                <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
                {icon && (
                    <div className="p-2 bg-white/10 rounded-full text-white">
                        {icon}
                    </div>
                )}
            </div>

            <div className="z-10">
                <div className="flex items-end gap-3 mb-1">
                    <span className="text-3xl font-bold tracking-tight">{value}</span>
                    <div className={cn(
                        "flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium",
                        trend === 'up' ? "bg-[#B4F3C4] text-[#044E27]" :
                            trend === 'down' ? "bg-[#F3B4B4] text-[#4E0404]" : "bg-gray-700 text-gray-300"
                    )}>
                        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                        {change}
                    </div>
                </div>

                {description && (
                    <p className="text-xs text-gray-500">{description}</p>
                )}
            </div>
        </div>
    );
}
