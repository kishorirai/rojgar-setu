/**
 * Calculates the campus score for a student based on their internship and interview performance
 * @param {Object} student - The student object containing internship and interview data
 * @returns {string} - The calculated campus score with one decimal place
 */
const calculateCampusScore = (student) => {
    if (!student) return '0.0';

    try {
        let totalScore = 0;
        let validScoresCount = 0;

        // Calculate internship scores (weight: 40%)
        if (student.internships && Array.isArray(student.internships)) {
            const internshipScores = student.internships
                .map(internship => parseFloat(internship?.internshipScore))
                .filter(score => !isNaN(score) && score > 0);
            
            if (internshipScores.length > 0) {
                const avgInternshipScore = internshipScores.reduce((sum, score) => sum + score, 0) / internshipScores.length;
                totalScore += avgInternshipScore * 0.4; // 40% weight
                validScoresCount += 0.4;
            }
        }

        // Calculate interview feedback scores (weight: 40%)
        if (student.interview_scheduled && Array.isArray(student.interview_scheduled)) {
            const interviewScores = student.interview_scheduled
                .map(interview => parseFloat(interview?.feedback?.overallScore))
                .filter(score => !isNaN(score) && score > 0);
            
            if (interviewScores.length > 0) {
                const avgInterviewScore = interviewScores.reduce((sum, score) => sum + score, 0) / interviewScores.length;
                totalScore += avgInterviewScore * 0.4; // 40% weight
                validScoresCount += 0.4;
            }
        }

        // Calculate CGPA contribution (weight: 20%)
        if (student.cgpa) {
            const cgpaScore = parseFloat(student.cgpa);
            if (!isNaN(cgpaScore) && cgpaScore > 0) {
                // Convert CGPA to a 10-point scale (assuming CGPA is on a 10-point scale)
                const normalizedCgpa = Math.min(cgpaScore, 10);
                totalScore += normalizedCgpa * 0.2; // 20% weight
                validScoresCount += 0.2;
            }
        }

        // If no valid scores found, return 0.0
        if (validScoresCount === 0) return '0.0';

        // Calculate weighted average score
        const weightedScore = totalScore / validScoresCount;
        
        // Ensure the score is between 0.0 and 10.0
        const finalScore = Math.max(0.0, Math.min(10.0, weightedScore));
        
        return finalScore.toFixed(1);
    } catch (error) {
        console.error('Error calculating campus score:', error);
        return '0.0';
    }
};

export default calculateCampusScore; 