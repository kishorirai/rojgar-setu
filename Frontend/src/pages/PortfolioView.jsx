import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import GlowingParticles from '../components/GlowingParticles';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Portfolio+User&background=0D8ABC&color=fff&size=256';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const fetchPortfolioData = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/portfolio/generate`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch portfolio');
    const data = await response.json();
    return data.portfolio || null;
  } catch {
    return null;
  }
};

// Helper to get the real student profile image URL
function getStudentProfileImageUrl(studentId) {
  return studentId
    ? `http://localhost:5000/api/studentsProfile/${studentId}/profile-pic`
    : DEFAULT_AVATAR;
}

const PortfolioView = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileCareerObjective, setProfileCareerObjective] = useState('');
  const [profileLinks, setProfileLinks] = useState({});

  // Get studentId from portfolio or localStorage
  const studentId = portfolio?.personalInfo?.studentId || localStorage.getItem('studentId');

  // Helper to get the correct image for both web and PDF
  const getProfileImgSrc = () => {
    return `https://campusadmin.onrender.com/api/student/me/profile-pic?${Date.now()}`;
  };

  useEffect(() => {
    const local = localStorage.getItem('portfolioData');
    if (local) {
      setPortfolio(JSON.parse(local));
      setLoading(false);
    } else {
      fetchPortfolioData().then(data => {
        if (data) {
          setPortfolio(data);
          localStorage.setItem('portfolioData', JSON.stringify(data));
        } else {
          setError('Could not load portfolio data.');
        }
        setLoading(false);
      });
    }

    // Fetch career objective from profile API
    fetch('https://campusadmin.onrender.com/api/student/me', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        if (data && (data.careerObjective || (data.profile && data.profile.careerObjective))) {
          setProfileCareerObjective(data.careerObjective || data.profile.careerObjective);
        }
      })
      .catch(() => {});

    // Fetch links from student profile
    fetch(`${apiUrl}/api/student/me`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setProfileLinks({
          resume: data.resume,
          portfolioUrl: data.portfolioUrl,
          githubUrl: data.githubUrl,
          linkedinUrl: data.linkedinUrl
        });
      });
  }, []);

  const handleDownloadPDF = async () => {
    // Create a plain container for PDF export
    const pdfDiv = document.createElement('div');
    pdfDiv.style.background = '#fff';
    pdfDiv.style.color = '#000';
    pdfDiv.style.fontFamily = 'Arial, sans-serif';
    pdfDiv.style.fontSize = '16px';
    pdfDiv.style.padding = '32px';
    pdfDiv.style.width = '800px';
    pdfDiv.style.maxWidth = '100%';
    pdfDiv.style.lineHeight = '1.5';

    // Add content: image, name, title, email, phone, location, about, education, skills, projects
    let html = '';
    if (portfolio?.personalInfo) {
      html += `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="text-align:left;">
            <h1 style="font-size:2em;font-weight:bold;margin:0;">${portfolio.personalInfo.name || ''}</h1>
          </div>
          <div style="text-align:right;font-size:1em;">
            <div>Email: ${portfolio.personalInfo.email || ''}</div>
            <div>Contact: ${portfolio.personalInfo.phone || ''}</div>
            <div>${portfolio.personalInfo.location || ''}</div>
          </div>
        </div>
        <hr style="border:1px solid #222;margin:8px 0 16px 0;"/>
      `;
      if (portfolio.personalInfo.linkedin || portfolio.personalInfo.github || portfolio.personalInfo.website) {
        html += `<div style="margin-bottom:10px;">`;
        if (portfolio.personalInfo.linkedin) html += `<a href="${portfolio.personalInfo.linkedin}" style="color:#2563eb;text-decoration:underline;margin-right:10px;">LinkedIn</a>`;
        if (portfolio.personalInfo.github) html += `<a href="${portfolio.personalInfo.github}" style="color:#2563eb;text-decoration:underline;margin-right:10px;">GitHub</a>`;
        if (portfolio.personalInfo.website) html += `<a href="${portfolio.personalInfo.website}" style="color:#2563eb;text-decoration:underline;">Website</a>`;
        html += `</div>`;
      }
      if (profileCareerObjective || portfolio.personalInfo.careerObjective) {
        html += `<div style="margin-bottom:18px;"><span style="font-weight:bold;text-decoration:underline;">PROFESSIONAL SUMMARY</span><br>${profileCareerObjective || portfolio.personalInfo.careerObjective}</div>`;
      }
    }
    // Education
    if (portfolio?.education && (portfolio.education.degree || portfolio.education.major || portfolio.education.year || portfolio.education.cgpa || portfolio.education.expectedGraduation || portfolio.education.department)) {
      html += `<div style="margin-bottom:12px;"><span style="font-weight:bold;text-decoration:underline;">EDUCATION</span><hr style='border:0;border-top:1px solid #aaa;margin:4px 0 8px 0;'>`;
      html += `<div><b>${portfolio.education.degree || ''}${portfolio.education.major ? ', ' + portfolio.education.major : ''}</b></div>`;
      html += `<div>${portfolio.education.department || ''}${portfolio.education.year ? ', ' + portfolio.education.year : ''}</div>`;
      html += `<div>${portfolio.education.cgpa ? 'CGPA: ' + portfolio.education.cgpa : ''}${portfolio.education.expectedGraduation ? ', Graduation: ' + portfolio.education.expectedGraduation : ''}</div>`;
      html += `</div>`;
    }
    // Skills
    if (portfolio?.skills && (portfolio.skills.skills?.length || portfolio.skills.programmingLanguages?.length || portfolio.skills.technologies?.length)) {
      html += `<div style="margin-bottom:12px;"><span style="font-weight:bold;text-decoration:underline;">TECHNICAL SKILLS</span><hr style='border:0;border-top:1px solid #aaa;margin:4px 0 8px 0;'>`;
      if (portfolio.skills.skills?.length) html += `<div><b>General:</b> ${portfolio.skills.skills.join(', ')}</div>`;
      if (portfolio.skills.programmingLanguages?.length) html += `<div><b>Programming:</b> ${portfolio.skills.programmingLanguages.join(', ')}</div>`;
      if (portfolio.skills.technologies?.length) html += `<div><b>Technologies:</b> ${portfolio.skills.technologies.join(', ')}</div>`;
      html += `</div>`;
    }
    // Work Experience
    if (portfolio?.experience?.length) {
      html += `<div style="margin-bottom:12px;"><span style="font-weight:bold;text-decoration:underline;">WORK EXPERIENCE</span><hr style='border:0;border-top:1px solid #aaa;margin:4px 0 8px 0;'>`;
      portfolio.experience.forEach(exp => {
        html += `<div style='margin-bottom:6px;'><b>${exp.title || ''} | ${exp.company || ''}</b> <span style='float:right;'>${exp.startDate || ''}${exp.endDate ? ' – ' + exp.endDate : ''}</span><br>`;
        if (exp.description) html += `<span>${exp.description}</span><br>`;
        if (exp.responsibilities?.length) {
          html += `<ul style='margin:0 0 0 18px;'>`;
          exp.responsibilities.forEach(r => html += `<li>${r}</li>`);
          html += `</ul>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    }
    // Projects (with achievements below if present)
    if ((portfolio?.projects?.filter(p => p && p.name)?.length) || (portfolio?.achievements?.length)) {
      html += `<div style=\"margin-bottom:12px;\"><span style=\"font-weight:bold;text-decoration:underline;\">PROJECTS</span><hr style='border:0;border-top:1px solid #aaa;margin:4px 0 8px 0;'>`;
      // Projects
      if (portfolio?.projects?.filter(p => p && p.name)?.length) {
        portfolio.projects.filter(p => p && p.name).forEach(project => {
          html += `<div style='margin-bottom:4px;'><b>${project.name}</b>${project.technologies?.length ? ' (' + project.technologies.join(', ') + ')' : ''}<br>`;
          if (project.description) html += `<span>${project.description}</span><br>`;
          if (project.achievement) html += `<span><i>${project.achievement}</i></span><br>`;
          html += `</div>`;
        });
      }
      // Achievements (as a bulleted list below projects)
      if (portfolio?.achievements?.length) {
        html += `<ul style='margin:0 0 0 18px;'>`;
        portfolio.achievements.forEach(a => {
          if (typeof a === 'string') {
            html += `<li>${a}</li>`;
          } else if (a && (a.title || a.description)) {
            html += `<li><b>${a.title || ''}</b>${a.description ? ': ' + a.description : ''}</li>`;
          }
        });
        html += `</ul>`;
      }
      html += `</div>`;
    }
    // Certifications
    if (portfolio?.certifications?.filter(cert => cert && cert.name)?.length) {
      html += `<div style="margin-bottom:12px;"><span style="font-weight:bold;text-decoration:underline;">CERTIFICATES</span><hr style='border:0;border-top:1px solid #aaa;margin:4px 0 8px 0;'>`;
      html += `<ul style='margin:0 0 0 18px;'>`;
      portfolio.certifications.filter(cert => cert && cert.name).forEach(cert => {
        html += `<li><b>${cert.name}</b>${cert.issuer ? ' – ' + cert.issuer : ''}${cert.date ? ', ' + new Date(cert.date).toLocaleDateString() : ''}${cert.link ? ` <a href='${cert.link}' style='color:#2563eb;text-decoration:underline;'>[Link]</a>` : ''}</li>`;
      });
      html += `</ul></div>`;
    }
    // Extracurricular Activities Section
    if (portfolio?.extracurricular?.length > 0 && (portfolio?.projects?.filter(p => p && p.name)?.length || portfolio?.achievements?.length)) {
      html += `<div style="margin-bottom:12px;"><span style="font-weight:bold;text-decoration:underline;">EXTRACURRICULAR ACTIVITIES</span><hr style='border:0;border-top:1px solid #aaa;margin:4px 0 8px 0;'>`;
      html += `<ul style='margin:0 0 0 18px;'>`;
      portfolio.extracurricular.forEach(item => {
        html += `<li>${item.activity}${item.role ? ' (' + item.role + ')' : ''}${item.achievement ? ': ' + item.achievement : ''}</li>`;
      });
      html += `</ul></div>`;
    }
    // Research Section
    if (portfolio?.research?.filter(item => item && item.title)?.length > 0 && (portfolio?.projects?.filter(p => p && p.name)?.length || portfolio?.achievements?.length)) {
      html += `<div style="margin-bottom:12px;"><span style="font-weight:bold;text-decoration:underline;">RESEARCH</span><hr style='border:0;border-top:1px solid #aaa;margin:4px 0 8px 0;'>`;
      html += `<ul style='margin:0 0 0 18px;'>`;
      portfolio.research.filter(item => item && item.title).forEach(item => {
        html += `<li><b>${item.title}</b>${item.year ? ' (' + item.year + ')' : ''}${item.role ? ', ' + item.role : ''}${item.description ? ': ' + item.description : ''}</li>`;
      });
      html += `</ul></div>`;
    }
    // Footer with logo and bold colored text
    html += `<div style='margin-top:24px;text-align:center;'>
      <img src='https://campusadmin.onrender.com/assets/rojgarlogo.png' alt='Rojgar Setu Logo' style='height:28px;opacity:0.85;margin-bottom:4px;'/><br>
      <span style='font-size:1.05em;font-weight:bold;color:#6C2EB5;'>Powered by Rojgar Setu</span>
    </div>`;
    pdfDiv.innerHTML = html;

    // Hide the div off-screen
    pdfDiv.style.position = 'fixed';
    pdfDiv.style.left = '-9999px';
    pdfDiv.style.top = '0';
    document.body.appendChild(pdfDiv);

    // Wait for image(s) to load
    const imgs = pdfDiv.querySelectorAll('img');
    const imgPromises = Array.from(imgs).map(img => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise(resolve => { img.onload = img.onerror = () => resolve(); });
    });
    await Promise.all(imgPromises);
    await new Promise(res => setTimeout(res, 200));

    // Render to canvas and PDF
    try {
      const canvas = await html2canvas(pdfDiv, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${portfolio?.personalInfo?.name || 'Portfolio'}_Resume.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. See console for details.');
    } finally {
      document.body.removeChild(pdfDiv);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-white text-xl flex items-center gap-3"
      >
        <div className="w-5 h-5 rounded-full bg-indigo-500 animate-pulse"></div>
        Loading...
      </motion.div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-red-300 text-xl p-6 bg-red-900/20 rounded-xl border border-red-500/30"
      >
        {error}
      </motion.div>
    </div>
  );
  
  if (!portfolio) return null;

  const { personalInfo, education, skills, projects } = portfolio;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d0036] via-[#3a0ca3] to-[#7209b7] flex flex-col items-center px-4 py-0 relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between py-16">
        {/* Left: Intro */}
        <div className="flex-1 flex flex-col items-start gap-6">
          <span className="uppercase text-xs tracking-widest text-purple-200 font-semibold">Welcome to my world ✨</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Hi, I'm <span className="text-purple-300">{portfolio?.personalInfo?.name || "Your Name"}</span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
            {portfolio?.personalInfo?.title || "UI/UX Designer"}
          </h2>
          <p className="text-slate-200 max-w-lg">
            {profileCareerObjective || portfolio?.personalInfo?.careerObjective || "Passionate designer/developer..."}
          </p>
          <div className="flex gap-4 mt-4">
            <button onClick={handleDownloadPDF} className="px-6 py-2 rounded-full border-2 border-purple-400 text-purple-200 font-semibold hover:bg-purple-700 hover:text-white transition">Download CV</button>
          </div>
          <div className="flex gap-3 mt-6">
            {portfolio?.personalInfo?.linkedin && (
              <a href={portfolio.personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                <img src="/assets/linkedin.svg" alt="LinkedIn" className="h-7 w-7" />
              </a>
            )}
            {/* Add more social icons as needed */}
          </div>
        </div>
        {/* Right: Avatar */}
        <div className="flex-1 flex justify-center items-center mt-10 md:mt-0">
          <div className="rounded-3xl bg-gradient-to-br from-purple-700/60 to-pink-400/40 p-4 shadow-2xl">
            <img
              src={getProfileImgSrc()}
              alt="Profile"
              className="w-56 h-56 rounded-2xl object-cover border-4 border-purple-300 shadow-lg"
              onError={e => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
            />
          </div>
        </div>
      </section>

      {/* All Links Section (fetches directly from student profile, using correct field names) */}
      <section className="w-full max-w-5xl mx-auto mt-2">
        <div className="bg-purple-600 rounded-xl shadow p-6 mb-4 space-y-2">
          <h2 className="text-lg font-bold text-white mb-2">Links</h2>
          <div className="flex flex-col gap-2">
            <div>
              <span className="text-white">Resume (link): </span>
              <a href={profileLinks.resume || "#"} className="text-yellow-200 hover:text-yellow-300" target="_blank" rel="noopener noreferrer">
                {profileLinks.resume || "Not Provided"}
              </a>
            </div>
            <div>
              <span className="text-white">Portfolio URL: </span>
              <a href={profileLinks.portfolioUrl || "#"} className="text-yellow-200 hover:text-yellow-300" target="_blank" rel="noopener noreferrer">
                {profileLinks.portfolioUrl || "Not Provided"}
              </a>
            </div>
            <div>
              <span className="text-white">GitHub: </span>
              <a href={profileLinks.githubUrl || "#"} className="text-yellow-200 hover:text-yellow-300" target="_blank" rel="noopener noreferrer">
                {profileLinks.githubUrl || "Not Provided"}
              </a>
            </div>
            <div>
              <span className="text-white">LinkedIn: </span>
              <a href={profileLinks.linkedinUrl || "#"} className="text-yellow-200 hover:text-yellow-300" target="_blank" rel="noopener noreferrer">
                {profileLinks.linkedinUrl || "Not Provided"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section (icon buttons/cards) */}
      {(portfolio?.skills?.skills?.length > 0 || portfolio?.skills?.programmingLanguages?.length > 0 || portfolio?.skills?.technologies?.length > 0) && (
        <section className="w-full max-w-5xl flex flex-col items-start py-8">
          <h2 className="text-2xl font-bold text-white mb-4">Skills</h2>
          <div className="flex flex-wrap gap-4 mb-6">
            {portfolio.skills.skills?.map((skill, idx) => (
              <span key={idx} className="px-5 py-2 rounded-xl bg-purple-700/60 text-white font-semibold text-lg shadow hover:bg-purple-800 transition">
                {skill}
              </span>
            ))}
          </div>
          {portfolio.skills.programmingLanguages?.length > 0 && (
            <div className="mb-6 w-full">
              <h3 className="text-lg font-semibold text-pink-200 mb-2">Programming Languages</h3>
              <div className="flex flex-wrap gap-3">
                {portfolio.skills.programmingLanguages.map((lang, idx) => (
                  <span key={idx} className="px-5 py-2 rounded-xl bg-pink-600/60 text-white font-semibold text-lg shadow hover:bg-pink-700 transition">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
          {portfolio.skills.technologies?.length > 0 && (
            <div className="mb-6 w-full">
              <h3 className="text-lg font-semibold text-yellow-200 mb-2">Technologies</h3>
              <div className="flex flex-wrap gap-3">
                {portfolio.skills.technologies.map((tech, idx) => (
                  <span key={idx} className="px-5 py-2 rounded-xl bg-yellow-500/60 text-white font-semibold text-lg shadow hover:bg-yellow-600 transition">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Projects Section */}
      {portfolio?.projects?.filter(p => p && p.name)?.length > 0 && (
        <section className="w-full max-w-5xl py-8">
          <h2 className="text-2xl font-bold text-white mb-4">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolio.projects.filter(p => p && p.name).map((project, idx) => (
              <div key={idx} className="rounded-2xl bg-white/10 p-6 shadow-lg border border-white/10 flex flex-col gap-2">
                <h3 className="text-xl font-bold text-purple-200 mb-1">{project.name}</h3>
                {project.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-1">
                    {project.technologies.map((tech, tIdx) => (
                      <span key={tIdx} className="px-3 py-1 rounded-lg bg-purple-700/40 text-purple-100 text-xs font-semibold">{tech}</span>
                    ))}
                  </div>
                )}
                <p className="text-slate-200 text-base">{project.description}</p>
                {project.achievement && <div className="text-pink-200 text-sm mt-1">🏆 {project.achievement}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements Section */}
      {portfolio?.achievements?.length > 0 && (
        <section className="w-full max-w-5xl py-8">
          <h2 className="text-2xl font-bold text-white mb-4">Achievements</h2>
          <div className="flex flex-wrap gap-4">
            {portfolio.achievements.map((a, idx) => (
              <div key={idx} className="rounded-xl bg-pink-700/60 text-white px-6 py-4 font-semibold shadow">
                {typeof a === 'string' ? a : (a.title || '') + (a.description ? ': ' + a.description : '')}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications Section */}
      {portfolio?.certifications?.filter(cert => cert && cert.name)?.length > 0 && (
        <section className="w-full max-w-5xl py-8">
          <h2 className="text-2xl font-bold text-white mb-4">Certifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolio.certifications.filter(cert => cert && cert.name).map((cert, idx) => (
              <div key={idx} className="rounded-2xl bg-white/10 p-6 shadow-lg border border-white/10 flex flex-col gap-2">
                <span className="font-bold text-purple-200">{cert.name}</span>
                <span className="text-slate-200 text-sm">{cert.issuer}</span>
                {cert.date && <span className="text-slate-400 text-xs">{new Date(cert.date).toLocaleDateString()}</span>}
                {cert.link && <a href={cert.link} className="text-blue-300 underline text-xs mt-1" target="_blank" rel="noopener noreferrer">[Link]</a>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Extracurricular Activities Section */}
      {portfolio?.extracurricular?.length > 0 && (
        <section className="w-full max-w-5xl py-8">
          <h2 className="text-2xl font-bold text-white mb-4">Extracurricular Activities</h2>
          <div className="flex flex-wrap gap-4">
            {portfolio.extracurricular.map((item, idx) => (
              <div key={idx} className="rounded-xl bg-purple-800/60 text-white px-6 py-4 font-semibold shadow">
                {item.activity}{item.role ? ' (' + item.role + ')' : ''}{item.achievement ? ': ' + item.achievement : ''}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Research Section */}
      {portfolio?.research?.filter(item => item && item.title)?.length > 0 && (
        <section className="w-full max-w-5xl py-8">
          <h2 className="text-2xl font-bold text-white mb-4">Research</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolio.research.filter(item => item && item.title).map((item, idx) => (
              <div key={idx} className="rounded-2xl bg-white/10 p-6 shadow-lg border border-white/10 flex flex-col gap-2">
                <span className="font-bold text-purple-200">{item.title}</span>
                <span className="text-slate-200 text-sm">{item.role}</span>
                {item.year && <span className="text-slate-400 text-xs">{item.year}</span>}
                {item.description && <span className="text-slate-300 text-xs mt-1">{item.description}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hackathons Section */}
      {portfolio?.hackathons?.filter(item => item && item.name)?.length > 0 && (
        <section className="w-full max-w-5xl py-8">
          <h2 className="text-2xl font-bold text-white mb-4">Hackathons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolio.hackathons.filter(item => item && item.name).map((item, idx) => (
              <div key={idx} className="rounded-2xl bg-pink-800/60 p-6 shadow-lg border border-white/10 flex flex-col gap-2 text-white">
                <span className="font-bold">{item.name}</span>
                {item.year && <span className="text-slate-200 text-xs">{item.year}</span>}
                {item.achievement && <span className="text-yellow-200 text-xs">🏆 {item.achievement}</span>}
                {item.description && <span className="text-slate-300 text-xs mt-1">{item.description}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add watermark at the very bottom of the page */}
      <div className="w-full flex justify-center relative mt-24">
        <div style={{position:'fixed',right:'32px',bottom:'24px',zIndex:50,fontWeight:900,color:'#fff',fontSize:'1.1em',letterSpacing:'0.5px',background:'rgba(44,0,80,0.7)',borderRadius:'1.5rem',padding:'8px 18px',boxShadow:'0 2px 12px 0 rgba(80,0,120,0.10)'}}>
          Powered by Rojgar Setu
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;