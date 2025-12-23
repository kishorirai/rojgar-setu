import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Helper to group and average CGPA by department
function getDepartmentAverages(students) {
  const deptMap = {};
  students.forEach(s => {
    if (!deptMap[s.department]) deptMap[s.department] = [];
    deptMap[s.department].push(s.cgpa);
  });
  return Object.entries(deptMap).map(([department, cgpas]) => ({
    department,
    avgCGPA: (cgpas.reduce((a, b) => a + b, 0) / cgpas.length).toFixed(2)
  }));
}

const DepartmentCGPAChart = ({ students }) => {
  const data = getDepartmentAverages(students);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="department" />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="avgCGPA" fill="#8884d8" name="Average CGPA" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepartmentCGPAChart; 