import React, { useEffect, useState } from 'react';
import '../styles/TestResultStyle.css';
import { Check, X, Eye, Clock, ChartBar, Code, AlertTriangle, Home } from 'lucide-react';
import DashboardHeader from '../components/StudentDashboard/dash';
import { useNavigate } from 'react-router-dom';

const TestResultPage = () => {
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const navigate = useNavigate();

  // Prevent back navigation by manipulating history
  useEffect(() => {
    // Clear history by pushing multiple states
    const clearHistory = () => {
      for (let i = 0; i < 50; i++) {
        window.history.pushState(null, '', window.location.href);
      }
      window.history.replaceState(null, '', window.location.href);
    };

    clearHistory();

    // Add popstate listener to prevent back navigation
    const handlePopState = (event) => {
      event.preventDefault();
      window.history.pushState(null, '', window.location.href);
      navigate('/dashboard');
    };

    window.addEventListener('popstate', handlePopState);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    else if (minutes > 0) return `${minutes}m ${secs}s`;
    else return `${secs}s`;
  };

  useEffect(() => {
    const fetchResult = () => {
      try {
        setLoading(true);
        const savedResult = localStorage.getItem('test_result');
        const savedTimer = localStorage.getItem('test_timer');

        if (!savedResult) {
          setError('No test result found. Please take a test first.');
          setDialogMessage('No test result found. Please take a test first.');
          setShowDialog(true);
          return;
        }

        const parsedResult = JSON.parse(savedResult);
        if (!parsedResult.testName || !parsedResult.studentName) {
          setError('Invalid test result data.');
          setDialogMessage('Invalid test result data.');
          setShowDialog(true);
          return;
        }

        setResultData(parsedResult);

        // Calculate total time: 60s per MCQ, 600s per coding question
        const totalMcqs =
          (parsedResult.mcqAnswered || 0) +
          (parsedResult.mcqNotAnswered || 0) +
          (parsedResult.mcqNotVisited || 0);
        const totalCoding = parsedResult.codingIds?.length || 0;
        const totalTime = totalMcqs * 60 + totalCoding * 600;

        // Time taken = total time - remaining time
        if (savedTimer) {
          const remainingTime = parseInt(savedTimer);
          setTimeTaken(totalTime - remainingTime);
        }
      } catch (error) {
        console.error('Error fetching test result:', error);
        setError('Failed to load test result.');
        setDialogMessage('Failed to load test result.');
        setShowDialog(true);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, []);

  const handleBackToDashboard = () => {
    // Clear localStorage
    localStorage.removeItem('test_result');
    localStorage.removeItem('test_progress');
    localStorage.removeItem('test_timer');

    // Clear history before navigating to landing page
    const targetRoute = '/dashboard';
    if (targetRoute === '/' || targetRoute.includes('landing')) {
      for (let i = 0; i < 50; i++) {
        window.history.pushState(null, '', window.location.href);
      }
      window.history.replaceState(null, '', window.location.href);
    }

    navigate(targetRoute);
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    handleBackToDashboard();
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const getPerformanceText = (percentage) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-content loading-container">
            <div className="circular-progress"></div>
            <p className="loading-text">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-content error-content">
            <AlertTriangle className="warning-icon" size={48} />
            <h3 className="error-title">Error</h3>
            <p className="error-message">{error}</p>
            <button className="btn btn-primary" onClick={handleBackToDashboard}>
              <Home size={16} className="btn-icon" /> Dashboard
            </button>
          </div>
        </div>

        {showDialog && (
          <div className="dialog-overlay" onClick={handleDialogClose}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
              <div className="dialog-header">
                <h3>Error</h3>
              </div>
              <div className="dialog-content">
                <AlertTriangle className="dialog-icon" size={48} />
                <p>{dialogMessage}</p>
              </div>
              <div className="dialog-actions">
                <button className="btn btn-primary" onClick={handleDialogClose}>OK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const percentage = Math.round((resultData.result_score / resultData.result_total_score) * 100);

  return (
    <div>
      <DashboardHeader />
      <div className="container">
        <div className="card">
          <div className="card-content">
            {/* Test Info */}
            <div className="test-info">
              <div className="test-info-main">
                <h2 className="test-name">{resultData.testName}</h2>
                <p className="student-name">Student: {resultData.studentName}</p>
                <div className="time-display">
                  <Clock size={16} className="time-icon" />
                  <span className="time-text">{formatTime(timeTaken)}</span>
                </div>
              </div>
              <button className="btn btn-primary dashboard-btn" onClick={handleBackToDashboard}>
                <Home size={16} className="btn-icon" /> Dashboard
              </button>
            </div>

            {/* Score Overview */}
            <div className="score-overview">
              <div className="score-card">
                <div className={`score-percentage ${getScoreColor(percentage)}`}>{percentage}%</div>
                <p className="score-details">
                  {resultData.result_score} / {resultData.result_total_score} points
                </p>
                <div className={`performance-badge ${getScoreColor(percentage)}`}>
                  {getPerformanceText(percentage)}
                </div>
              </div>

              <div className="stats-card">
                <div className="card-header">
                  <ChartBar size={20} className="icon" />
                  <h3>Overall Statistics</h3>
                </div>
                <div className="stats-list">
                  <div className="stat-item">
                    <span>Total Questions</span>
                    <span className="stat-value">
                      {(resultData.mcqAnswered || 0) +
                        (resultData.mcqNotAnswered || 0) +
                        (resultData.mcqNotVisited || 0) +
                        (resultData.codingIds?.length || 0)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span>Attempted</span>
                    <span className="stat-value">
                      {(resultData.mcqAnswered || 0) + (resultData.codingAnswered || 0)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span>Correct</span>
                    <span className="stat-value success">
                      {(resultData.mcqCorrect || 0) + (resultData.codingCorrect || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="time-card">
                <div className="stats-list"></div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="detailed-breakdown">
              {/* MCQ Section */}
              <div className="section-card">
                <div className="section-header">
                  <ChartBar size={24} className="icon" />
                  <h3>Multiple Choice Questions</h3>
                </div>
                <div className="grid-container">
                  <div className="grid-item success-light">
                    <Check size={32} className="grid-icon success" />
                    <div className="grid-value success">{resultData.mcqCorrect || 0}</div>
                    <div className="grid-label">Correct</div>
                  </div>
                  <div className="grid-item error-light">
                    <X size={32} className="grid-icon error" />
                    <div className="grid-value error">{resultData.mcqWrong || 0}</div>
                    <div className="grid-label">Wrong</div>
                  </div>
                  <div className="grid-item warning-light">
                    <Eye size={32} className="grid-icon warning" />
                    <div className="grid-value warning">{resultData.marked || 0}</div>
                    <div className="grid-label">Marked</div>
                  </div>
                  <div className="grid-item grey-light">
                    <Eye size={32} className="grid-icon grey" />
                    <div className="grid-value grey">{resultData.mcqNotVisited || 0}</div>
                    <div className="grid-label">Not Visited</div>
                  </div>
                </div>
              </div>

              {/* Coding Section */}
              {resultData.codingIds?.length > 0 && (
                <div className="section-card">
                  <div className="section-header">
                    <Code size={24} className="icon" />
                    <h3>Coding Problems</h3>
                  </div>
                  <div className="grid-container">
                    <div className="grid-item success-light">
                      <Check size={32} className="grid-icon success" />
                      <div className="grid-value success">{resultData.codingCorrect || 0}</div>
                      <div className="grid-label">Solved</div>
                    </div>
                    <div className="grid-item error-light">
                      <X size={32} className="grid-icon error" />
                      <div className="grid-value error">{resultData.codingWrong || 0}</div>
                      <div className="grid-label">Failed</div>
                    </div>
                    <div className="grid-item warning-light">
                      <Eye size={32} className="grid-icon warning" />
                      <div className="grid-value warning">{resultData.codingAnswered || 0}</div>
                      <div className="grid-label">Attempted</div>
                    </div>
                    <div className="grid-item grey-light">
                      <Eye size={32} className="grid-icon grey" />
                      <div className="grid-value grey">{resultData.codingNotAnswered || 0}</div>
                      <div className="grid-label">Not Visited</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {showDialog && (
          <div className="dialog-overlay" onClick={handleDialogClose}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
              <div className="dialog-header">
                <h3>Error</h3>
              </div>
              <div className="dialog-content">
                <AlertTriangle className="dialog-icon" size={48} />
                <p>{dialogMessage}</p>
              </div>
              <div className="dialog-actions">
                <button className="btn btn-primary" onClick={handleDialogClose}>OK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResultPage;