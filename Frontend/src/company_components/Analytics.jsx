import React from 'react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ChartDataLabels);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Custom plugin to draw the total at the center
const centerTextPlugin = {
  id: 'centerTextPlugin',
  afterDraw: (chart) => {
    if (chart.config.type !== 'doughnut') return;
    const { ctx, chartArea } = chart;
    const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
    ctx.save();
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#222';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Total', chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2 - 12);
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(total, chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2 + 16);
    ctx.restore();
  }
};

const Analytics = () => {
  // Applications Over Time Data
  const applicationsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Applications',
        data: [65, 59, 80, 81, 56, 55],
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: '#6366f1',
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointStyle: 'circle',
      },
    ],
  };

  // Application Status Distribution (Donut)
  const statusData = {
    labels: ['Under Review', 'Interview Scheduled', 'Hired', 'Rejected'],
    datasets: [
      {
        data: [30, 25, 15, 30],
        backgroundColor: [
          '#4F46E5', // Under Review (purple)
          '#0EA5E9', // Interview Scheduled (blue)
          '#F59E42', // Hired (orange)
          '#EF4444', // Rejected (red)
        ],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        display: true,
        color: '#222',
        font: { weight: 'bold', size: 11 },
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          return `${label}: ${value}`;
        },
        align: 'end',
        anchor: 'end',
        offset: 0,
        backgroundColor: null,
        padding: 0,
        borderWidth: 0,
        clamp: false,
      },
      tooltip: { enabled: true },
    },
    cutout: '75%',
  };

  // Average Scores by Role
  const scoresData = {
    labels: ['Developer', 'Designer', 'Manager', 'Analyst'],
    datasets: [
      {
        label: 'Average Score',
        data: [85, 78, 82, 75],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(79, 70, 229, 0.8)',
          'rgba(67, 56, 202, 0.8)',
          'rgba(55, 48, 163, 0.8)',
        ],
        borderRadius: 4,
        borderWidth: 0,
        hoverBackgroundColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(79, 70, 229, 1)',
          'rgba(67, 56, 202, 1)',
          'rgba(55, 48, 163, 1)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="analytics-container">
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Applications Over Time</h3>
          <div style={{ height: '300px' }}>
            <Line data={applicationsData} options={chartOptions} />
          </div>
        </div>
        
        <div className="analytics-card">
          <h3>Application Status Distribution</h3>
          <div style={{ height: '300px', width: '380px', position: 'relative', margin: '0 auto' }}>
            <Doughnut data={statusData} options={doughnutOptions} plugins={[centerTextPlugin]} />
          </div>
        </div>
        
        <div className="analytics-card">
          <h3>Average Scores by Role</h3>
          <div style={{ height: '300px' }}>
            <Bar data={scoresData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 