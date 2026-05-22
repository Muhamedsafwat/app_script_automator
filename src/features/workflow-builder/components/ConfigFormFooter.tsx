import React from "react";

interface ConfigFormFooterProps {
  onSave: () => void;
}

export const ConfigFormFooter: React.FC<ConfigFormFooterProps> = ({ onSave }) => {
  return (
    <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex justify-end">
      <button
        onClick={onSave}
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all"
      >
        Save &amp; Close
      </button>
    </div>
  );
};
