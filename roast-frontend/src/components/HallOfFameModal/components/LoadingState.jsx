import React from 'react';
import { getLoadingStyles } from '../styles/RewardsStyles';

const LoadingState = ({ themeColors }) => {
  return (
    <div className="rewards-loading">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <p>Loading daily rewards...</p>
      <style jsx>{getLoadingStyles(themeColors)}</style>
    </div>
  );
};

export default LoadingState; 