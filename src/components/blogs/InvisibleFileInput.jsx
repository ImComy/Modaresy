import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

const InvisibleFileInput = ({ label, Icon = ImageIcon, accept, multiple = false, onChange }) => {
  const inputId = `file-${label.replace(/\s+/g, '-')}-${Math.floor(Math.random() * 10000)}`;
  return (
    <>
      <label
        htmlFor={inputId}
        className="flex items-center gap-2 px-2 py-1 text-sm rounded cursor-pointer hover:bg-[hsl(var(--input))]"
        style={{ color: 'hsl(var(--muted-foreground))' }}
        title={label}
      >
        <Icon size={16} />
        <span className="text-xs">{label}</span>
      </label>
      <input id={inputId} type="file" accept={accept} multiple={multiple} className="hidden" onChange={onChange} />
    </>
  );
};

export default InvisibleFileInput;