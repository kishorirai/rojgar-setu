const { execSync } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

console.log('Starting complete database seeding...\n');

const scripts = [
  { name: 'Colleges', file: 'insertCollege.js' },
  { name: 'Companies', file: 'insertCompany.js' },
  { name: 'Employees', file: 'insertEmployees.js' },
  { name: 'Students', file: 'seedCollegeStudent.js' },
  { name: 'Roles(jobs from company)', file: 'seedRoles.js'},
  { name: 'Applications(from college)', file: 'seedApplications.js'},
  { name: 'Jobs and Internships(performed by student and employee)', file: 'seedJobsAndInternships.js' }
];

async function runScripts() {
  try {
    for (const script of scripts) {
      console.log(`\n=== Seeding ${script.name} ===`);
      console.log(`Running ${script.file}...`);
      
      try {
        execSync(`node ${path.join(__dirname, script.file)}`, { stdio: 'inherit' });
        console.log(`✓ ${script.name} seeded successfully`);
      } catch (error) {
        console.error(`✗ Error seeding ${script.name}:`, error.message);
        throw error;
      }
    }

    console.log('\n=== Verifying Data ===');
    execSync('node ' + path.join(__dirname, 'verifyData.js'), { stdio: 'inherit' });

    console.log('\n✓ All data seeded successfully!');
  } catch (error) {
    console.error('\n✗ Seeding failed:', error.message);
    process.exit(1);
  }
}

runScripts(); 