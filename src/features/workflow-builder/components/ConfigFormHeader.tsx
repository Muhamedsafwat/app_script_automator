import React from "react";
import { FiX } from "react-icons/fi";

interface ConfigFormHeaderProps {
  metadata: { label: string; category: string; };
  categoryIcon?: React.ComponentType<{ size: number }>;
  onClose: () => void;
}

export const ConfigFormHeader: React.FC<ConfigFormHeaderProps> = ({
  metadata,
  categoryIcon: CategoryIcon,
  onClose,
}) => (
  <div className="flex items-center justify-between p-5 border-b border-slate-800">
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-xl flex items-center justify-center ${
          // Placeholder for category style; default fallback
          "bg-slate-800 text-white"
        }`}
      >
        {CategoryIcon && <CategoryIcon size={18} />}
      </div>
      <div>
        <h3 className="font-bold text-base text-slate-100">
          {metadata.label} Settings
        </h3>
        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
          {metadata.category} Node
        </p>
      </div>
    </div>
    <button
      onClick={onClose}
      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
    >
      <FiX size={18} />
    </button>
  </div>
);
