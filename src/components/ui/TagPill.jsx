import { motion } from "framer-motion";
import { Tag as TagIcon, X } from "lucide-react";

const TAG_STYLE = {
  default: {
    bg: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))",
    color: "hsl(var(--primary))",
    border: "hsl(var(--primary) / 0.3)"
  }
};

export function TagPill({ tag, onClick, selected = false, closable = false, onClose }) {
  const s = TAG_STYLE.default;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 mr-2 mb-2 rounded-full inline-flex items-center gap-1 transition-all duration-200 hover:scale-105 ${
        onClick ? "cursor-pointer" : "cursor-default"
      } ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      style={{ 
        background: s.bg, 
        color: s.color, 
        border: `1px solid ${s.border}`,
      }}
    >
      <TagIcon size={12} />
      <span>{tag}</span>
      {closable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className="ml-1 rounded-full hover:bg-black/10 p-0.5 transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </motion.div>
  );
}