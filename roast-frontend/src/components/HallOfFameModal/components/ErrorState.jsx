import React from 'react';

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="rewards-error">
      <div className="error-icon">⚠️</div>
      <h3>Unable to load rewards data</h3>
      <p>{error}</p>
      <button 
        className="retry-btn"
        onClick={onRetry}
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorState; 