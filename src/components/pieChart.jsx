import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const getCSSVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const StudentsPieChart = ({ data = {}, title }) => {
  const primary = getCSSVar('--primary') || '220, 90%, 56%';
  const [textColor, setTextColor] = useState('#333');

  useEffect(() => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--foreground')
      .trim();

    if (color) setTextColor(`hsl(${color})`);
  }, []);

  useEffect(() => {
    const updateTextColor = () => {
        const color = getComputedStyle(document.documentElement)
        .getPropertyValue('--foreground')
        .trim();
        if (color) setTextColor(`hsl(${color})`);
    };

    updateTextColor();

    const observer = new MutationObserver(updateTextColor);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });

    return () => observer.disconnect();
}, []);



  const labels = Object.keys(data);
  const values = Object.values(data);

  const backgroundColors = labels.map(
    (_, i) =>
      `hsl(${(i * 360) / labels.length}, 70%, 60%)`
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: backgroundColors,
        borderColor: 'transparent',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          boxWidth: 14,
          padding: 16,
          font: {
            size: labels.length > 8 ? 10 : 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.label}: ${context.formattedValue}`,
        },
      },
    },
  };

  return (
    <div style={{ height: 400 }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default StudentsPieChart;
