import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronDown, FaChevronUp, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCode, FaLaptopCode, FaStar, FaTrophy, FaGithub, FaCheck } from 'react-icons/fa';
import './MatchingStudents.css';

const apiUrl = import.meta.env.VITE_API_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const MatchingStudents = ({ roleId, roleName, skills }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [pendingMinScore, setPendingMinScore] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch matching students when component mounts or filters change
  useEffect(() => {
    const fetchMatchingStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/student-matching/roles/${roleId}/matches`, {
          params: { minScore }
        });
        
        if (response.data.success) {
          setStudents(response.data.students);
          setError(null);
        } else {
          setError(response.data.message || 'Failed to fetch matching students');
          setStudents([]);
        }
      } catch (err) {
        console.error('Error fetching matching students:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching matching students');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    if (roleId) {
      fetchMatchingStudents();
    }
  }, [roleId, minScore]);

  // When roleId changes, reset both minScore and pendingMinScore
  useEffect(() => {
    setMinScore(0);
    setPendingMinScore(0);
  }, [roleId]);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Handler for slider change (while dragging)
  const handleScoreFilterChange = (e) => {
    setPendingMinScore(parseFloat(e.target.value));
  };

  // Handler for slider release (mouse up or touch end)
  const handleScoreFilterCommit = () => {
    setMinScore(pendingMinScore);
  };

  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student);
  };

  const closeStudentDetails = () => {
    setSelectedStudent(null);
  };

  // Render student details modal
  const renderStudentDetailsModal = () => {
    if (!selectedStudent) return null;

    return (
      <div className="student-details-modal-overlay">
        <div className="student-details-modal">
          <button className="close-modal-btn" onClick={closeStudentDetails}>×</button>
          
          <div className="student-details-header">
            <img 
              src={selectedStudent.profileImage || 'https://via.placeholder.com/150'} 
              alt={selectedStudent.name} 
              className="student-details-avatar"
            />
            <div>
              <h2>{selectedStudent.name}</h2>
              <p className="student-email"><FaEnvelope /> {selectedStudent.email}</p>
              {selectedStudent.phone && (
                <p className="student-phone"><FaPhone /> {selectedStudent.phone}</p>
              )}
              {selectedStudent.location && (
                <p className="student-location"><FaMapMarkerAlt /> {selectedStudent.location}</p>
              )}
            </div>
            <div className="student-score">
              <span className="score-label">Campus Score</span>
              <span className="score-value">{selectedStudent.campusScore.toFixed(1)}</span>
            </div>
          </div>

          <div className="student-details-content">
            {/* Skills Section */}
            <div className="details-section">
              <h3><FaCode /> Skills</h3>
              <div className="skills-container">
                {selectedStudent.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>

            {/* Projects Section */}
            {selectedStudent.projects && selectedStudent.projects.length > 0 && (
              <div className="details-section">
                <h3><FaLaptopCode /> Projects</h3>
                <div className="projects-container">
                  {selectedStudent.projects.map((project, index) => (
                    <div key={index} className="project-card">
                      <h4>{project.title}</h4>
                      <p>{project.description}</p>
                      {project.technologies && (
                        <div className="project-tech">
                          {project.technologies.map((tech, techIndex) => (
                            <span key={techIndex} className="tech-tag">{tech}</span>
                          ))}
                        </div>
                      )}
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                          <FaGithub /> View Project
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements Section */}
            {selectedStudent.achievements && selectedStudent.achievements.length > 0 && (
              <div className="details-section">
                <h3><FaTrophy /> Achievements</h3>
                <div className="achievements-container">
                  {selectedStudent.achievements.map((achievement, index) => (
                    <div key={index} className="achievement-card">
                      <h4>{achievement.title}</h4>
                      <p>{achievement.description}</p>
                      {achievement.issuer && <p className="achievement-issuer">Issued by: {achievement.issuer}</p>}
                      {achievement.date && <p className="achievement-date">Date: {new Date(achievement.date).toLocaleDateString()}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="matching-students-container">
      <div className="matching-students-header" onClick={toggleExpanded}>
        <div className="header-content">
          <h3>Matching Students</h3>
          <div className="match-count">
            {loading ? (
              <span className="loading-indicator">Loading...</span>
            ) : (
              <span className="count-badge">{students.length} matches</span>
            )}
          </div>
        </div>
        <button className="expand-button">
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {expanded && (
        <div className="matching-students-content">
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              <div className="filters-container">
                <div className="filter">
                  <label htmlFor="minScore">Minimum Campus Score:</label>
                  <input 
                    type="range" 
                    id="minScore" 
                    min="0" 
                    max="10" 
                    step="0.5" 
                    value={pendingMinScore} 
                    onChange={handleScoreFilterChange} 
                    onMouseUp={handleScoreFilterCommit}
                    onTouchEnd={handleScoreFilterCommit}
                  />
                  <span className="filter-value">{pendingMinScore.toFixed(1)}</span>
                </div>
              </div>

              {loading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Finding matching students...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="no-matches">
                  <p>No matching students found for the selected criteria.</p>
                  <p>Try adjusting your filters or adding more skills to the role.</p>
                </div>
              ) : (
                <div className="students-grid">
                  {students.map(student => {
                    // Calculate the number of matched skills
                    const matchedSkills = student.skills.filter(skill => 
                      skills.some(requiredSkill => 
                        skill.toLowerCase().includes(requiredSkill.toLowerCase()) || 
                        requiredSkill.toLowerCase().includes(skill.toLowerCase())
                      )
                    );
                    const matchPercentage = skills.length > 0 ? (matchedSkills.length / skills.length) * 100 : 0;

                    let matchClass = 'low-match';
                    if (matchPercentage >= 75) {
                      matchClass = 'high-match';
                    } else if (matchPercentage >= 40) {
                      matchClass = 'medium-match';
                    }

                    return (
                      <div key={student._id} className="student-card">
                        <div className="student-card-header">
                          <img 
                            src={student.profileImage || 'https://via.placeholder.com/50'} 
                            alt={student.name} 
                            className="student-avatar"
                          />
                          <div className="student-info">
                            <h4 className="student-name">{student.name}</h4>
                            <p className="student-email">{student.email}</p>
                          </div>
                          <div className="student-score-badge">
                            <FaStar />
                            <span>{student.campusScore.toFixed(1)}</span>
                          </div>
                        </div>

                        <div className="match-percentage">
                          <div className={`match-badge ${matchClass}`}>{matchPercentage.toFixed(0)}% Match</div>
                        </div>

                        <div className="student-skills">
                          {student.skills.slice(0, 5).map((skill, index) => {
                            const isMatched = skills.some(requiredSkill => 
                              skill.toLowerCase().includes(requiredSkill.toLowerCase()) || 
                              requiredSkill.toLowerCase().includes(skill.toLowerCase())
                            );
                            return (
                              <span key={index} className={`skill-tag ${isMatched ? 'matching-skill' : ''}`}>
                                {skill}
                                {isMatched && <FaCheck className="match-icon" />}
                              </span>
                            );
                          })}
                          {student.skills.length > 5 && (
                            <span className="more-skills">+{student.skills.length - 5} more</span>
                          )}
                        </div>
                        
                        <button 
                          className="view-details-btn" 
                          onClick={() => handleViewStudentDetails(student)}
                        >
                          View Details
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {renderStudentDetailsModal()}
    </div>
  );
};

export default MatchingStudents;