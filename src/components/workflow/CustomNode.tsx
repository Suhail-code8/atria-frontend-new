import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import {
  ClipboardList,
  CreditCard,
  Users,
  Star,
  Trophy,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export type ModuleType =
  | "REGISTRATION"
  | "PAYMENT"
  | "TEAM_FORMATION"
  | "JUDGING_ROUND"
  | "LEADERBOARD"
  | "SUBMISSION"
  | "ONBOARDING_COMPLETE";

const MODULE_META: Record<
  ModuleType,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  REGISTRATION: {
    label: "Registration",
    icon: <ClipboardList size={18} />,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  PAYMENT: {
    label: "Payment",
    icon: <CreditCard size={18} />,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  TEAM_FORMATION: {
    label: "Team Formation",
    icon: <Users size={18} />,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
  },
  JUDGING_ROUND: {
    label: "Judging Round",
    icon: <Star size={18} />,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  LEADERBOARD: {
    label: "Leaderboard",
    icon: <Trophy size={18} />,
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
  },
  SUBMISSION: {
    label: "Submission",
    icon: <Upload size={18} />,
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
  },
  ONBOARDING_COMPLETE: {
    label: "Onboarding Complete",
    icon: <CheckCircle2 size={18} />,
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-300",
  },
};

export interface WorkflowNodeData {
  moduleType: ModuleType;
  config?: Record<string, unknown>;
  label?: string;
}

function CustomNode({ data, selected }: NodeProps<WorkflowNodeData>) {
  // Defensive check for data and moduleType
  const moduleType = data?.moduleType || "REGISTRATION";
  const meta = MODULE_META[moduleType] ?? MODULE_META.REGISTRATION;
  const isTerminal = moduleType === "ONBOARDING_COMPLETE";
  const isConfigured = !!data?.config && Object.keys(data.config).length > 0;

  return (
    <div
      className={`
        relative bg-white rounded-xl shadow-md border-2 transition-all duration-200 min-w-[180px]
        ${isTerminal
          ? selected
            ? "border-emerald-500 shadow-lg shadow-emerald-100"
            : "border-emerald-300 hover:border-emerald-400 hover:shadow-lg"
          : selected
            ? "border-blue-500 shadow-lg shadow-blue-100"
            : "border-slate-200 hover:border-slate-300 hover:shadow-lg"
        }
      `}
    >
      {/* Pulsing ring for terminal node */}
      {isTerminal && (
        <span className="absolute -inset-[3px] rounded-xl border-2 border-emerald-400 opacity-30 animate-ping pointer-events-none" />
      )}

      {/* Top handle — terminal has no source (nothing out), so we show target only */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white hover:!bg-blue-500 transition-colors"
      />

      {/* Node content */}
      <div className="p-4">
        {/* Icon badge */}
        <div
          className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border ${meta.bg} ${meta.color} mb-3`}
        >
          {meta.icon}
        </div>

        {/* Label */}
        <p className="text-sm font-semibold text-slate-800 leading-tight">
          {data.label || meta.label}
        </p>

        {/* Terminal badge / status */}
        {isTerminal ? (
          <div className="flex items-center gap-1.5 mt-2">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wide">Terminal Node</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mt-2">
            {isConfigured ? (
              <>
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-[11px] text-emerald-600 font-medium">Configured</span>
              </>
            ) : (
              <>
                <AlertCircle size={12} className="text-amber-500" />
                <span className="text-[11px] text-amber-600 font-medium">Needs setup</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom handle — only for non-terminal nodes */}
      {!isTerminal && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white hover:!bg-blue-500 transition-colors"
        />
      )}
    </div>
  );
}

export default memo(CustomNode);
