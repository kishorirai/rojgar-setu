const mongoose = require('mongoose');
const Review = require('../models/Review');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const College = require('../models/College');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/campus_connect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedReviews = async () => {
  try {
    // Find the student by email
    const student = await Student.findOne({ email: 'kishorirai02@gmail.com' });
    
    if (!student) {
      console.log('Student not found. Please make sure the student exists.');
      return;
    }

    console.log(`Found student: ${student.name} (${student.email})`);

    // Check for existing companies
    const companies = await Company.find({ contactEmail: 'careers@airtel.com' });
    console.log(`Found ${companies.length} companies in database`);

    // Check for existing employees
    const employees = companies.length > 0
      ? await Employee.find({ companyId: companies[0]._id })
      : [];
    console.log(`Found ${employees.length} employees in database`);;

    // Check for existing colleges
    const colleges = await College.find({ contactEmail: 'career-services@mit.edu' });
    console.log(`Found ${colleges.length} colleges in database`);

    if (companies.length === 0 && employees.length === 0 && colleges.length === 0) {
      console.log('No companies, employees, or colleges found in database. Cannot create reviews without references.');
      console.log('Please seed companies, employees, and colleges first.');
      return;
    }

    // Clear existing reviews for this student
    await Review.deleteMany({ 
      belongsTo: student._id, 
      belongsToModel: 'Student' 
    });
    console.log('Cleared existing reviews for the student');

    const reviewsData = [];

    // Create employee reviews if employees exist
    if (employees.length > 0 && companies.length > 0) {
      const company = companies[0];
      employees.forEach((employee, index) => {
        if (index < 2) { // Limit to 2 employee reviews
          reviewsData.push({
            belongsTo: student._id,
            belongsToModel: 'Student',
            reviewedByModel: 'Employee',
            reviewerName: employee.name,
            entityName: company.name,
            feedback: {
              technicalScore: 8.5 - (index * 0.5),
              communicationScore: 7.8 + (index * 0.2),
              problemSolvingScore: 8.2 - (index * 0.3),
              overallScore: 8.2 - (index * 0.2),
              comments: index === 0 ? 
                "Excellent technical skills demonstrated during the interview. Strong problem-solving approach and good communication. Would highly recommend for technical roles." :
                "Good communication skills and team collaboration. Technical skills need some improvement but shows willingness to learn. Has potential.",
              date: new Date(`2024-01-${15 + (index * 5)}`)
            }
          });
        }
      });
    }

    // Create company reviews if companies exist (only 1 company)
    if (companies.length > 0) {
      const company = companies[0]; // Take only the first company
      reviewsData.push({
        belongsTo: student._id,
        belongsToModel: 'Student',
        reviewedByModel: 'Company',
        reviewerName: "Company Admin",
        entityName: company.name,
        feedback: {
          technicalScore: 8.5,
          communicationScore: 8.2,
          problemSolvingScore: 8.8,
          overallScore: 8.5,
          comments: "Exceptional technical abilities combined with strong problem-solving skills. Excellent candidate for senior technical roles. Highly recommended.",
          date: new Date('2024-01-20')
        }
      });
    }

    // Create college reviews if colleges exist (only 1 college)
    if (colleges.length > 0) {
      const college = colleges[0]; // Take only the first college
      reviewsData.push({
        belongsTo: student._id,
        belongsToModel: 'Student',
        reviewedByModel: 'College',
        reviewerName: "Admin",
        entityName: college.name,
        feedback: {
          technicalScore: 8.0,
          communicationScore: 9.0,
          problemSolvingScore: 8.5,
          overallScore: 8.5,
          comments: "Outstanding performance in academic projects. Demonstrates strong analytical thinking and excellent presentation skills. A model student with great potential for leadership roles.",
          date: new Date('2024-01-25')
        }
      });
    }

    if (reviewsData.length === 0) {
      console.log('No reviews to create. Please ensure you have companies, employees, or colleges in the database.');
      return;
    }

    // Insert new reviews
    const reviews = await Review.insertMany(reviewsData);
    console.log(`Successfully seeded ${reviews.length} reviews for ${student.name}`);

    // Display the seeded reviews
    console.log('\nSeeded Reviews:');
    reviews.forEach((review, index) => {
      console.log(`\n${index + 1}. ${review.reviewedByModel} Review:`);
      console.log(`   Technical: ${review.feedback.technicalScore}/10`);
      console.log(`   Communication: ${review.feedback.communicationScore}/10`);
      console.log(`   Problem Solving: ${review.feedback.problemSolvingScore}/10`);
      console.log(`   Overall: ${review.feedback.overallScore}/10`);
      console.log(`   Comments: ${review.feedback.comments}`);
      console.log(`   Date: ${review.feedback.date.toLocaleDateString()}`);
    });

    console.log('\nReviews seeded successfully!');
    console.log('You can now check the "Received Feedback" tab in the student dashboard.');

  } catch (error) {
    console.error('Error seeding reviews:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
seedReviews(); 