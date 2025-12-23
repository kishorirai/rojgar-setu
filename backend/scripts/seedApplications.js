require('dotenv').config();
const Student = require('../models/Student');
const CollegeApplication = require('../models/CollegeApplication');
const College = require('../models/College');
const Company = require('../models/Company');
const Role = require('../models/Role');
const mongoose = require('mongoose');
const { application } = require('express');

const main = async () => {
  await mongoose.connect(`${process.env.MONGODB_URI}`, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log(`Connected to ${process.env.MONGODB_URI}`);
};

main();
let insertApplicationDeleteOld = async () =>{
  await CollegeApplication.deleteMany()
  console.log('old applications deleted')
  const colleges = await College.find()
  const companies = await Company.find()
  const roles = await Role.find()
  let applications = []
  for(college of colleges){
    let students = await Student.find()
    let studentsList = students.map(s=>({
      studentId: s._id,
      status: 'applied',
      interview: null,
    }))
    for (company of companies){
      for(role of roles){
        
        if(company._id.equals(role.companyId)){
          applications.push({
            applicationFromCollege: college._id,
            applicationToCompany: company._id,
            roleId: role._id,
            roleName: role.jobTitle,
            students: studentsList,
          })
        }
      }
    }
  }
  console.log("here is your application array:",)
      try{
        await CollegeApplication.insertMany(applications)
        for(a of applications){
          console.log("Application From College:",a.applicationFromCollege)
          console.log("Application To Company:",a.applicationToCompany)
          console.log("Application Role:",a.roleId)
          console.log("Role:",a.roleName)
          console.log("Students:",a.students[0],",",a.students[0],"...",a.students.length-2,"more...")
          
        }
        console.log('success pushing applications')
        process.exit(0)
      }catch(err){
        console.log('error pushing appliction',err)
      }
        


}
insertApplicationDeleteOld();
let run = async () => {
  let applications = await CollegeApplication.find()
    .populate('applicationFromCollege', 'name')
    .populate('applicationToCompany', 'name')
    .populate('roleId', 'jobTitle')
    .populate('students.studentId', 'name email rollNumber')
    .lean();
  
  console.log('Applications with populated data:',applications[0]);
  applications.forEach(app => {
    console.log('\nApplication:', {
      college: app.applicationFromCollege.name,
      company: app.applicationToCompany.name,
      role: app.roleId.jobTitle,
      students: app.students.map(s => ({
        name: s.studentId.name,
        email: s.studentId.email,
        rollNumber: s.studentId.rollNumber,
        status: s.status,
        interviewDate: s.interviewDate,
        interviewLink: s.interviewLink
      }))
    });
  });
};


module.exports = run; 