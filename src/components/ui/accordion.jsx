import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomAccordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="border rounded-md">
          <button
            onClick={() => toggle(index)}
            className="flex justify-between items-center w-full p-4 text-left bg-muted hover:bg-muted/60 font-medium"
          >
            <span>{item.title}</span>
            <ChevronDown
              className={`transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
              size={18}
            />
          </button>
          {openIndex === index && (
            <div className="p-4 bg-background border-t">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CustomAccordion;
