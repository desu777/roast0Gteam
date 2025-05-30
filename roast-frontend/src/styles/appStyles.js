export const globalStyles = `
  /* Global scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(30, 30, 40, 0.8);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(60, 75, 95, 0.6);
    border-radius: 4px;
    border: 1px solid rgba(40, 50, 65, 0.8);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(80, 95, 115, 0.8);
  }

  ::-webkit-scrollbar-corner {
    background: rgba(30, 30, 40, 0.8);
  }

  /* Firefox scrollbar */
  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(60, 75, 95, 0.6) rgba(30, 30, 40, 0.8);
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 50%, #16213E 100%);
    color: #E6E6E6;
    min-height: 100vh;
  }
`;

export const appStyles = `
  .arena-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #0A0A0A, #1A0A1A, #0A1A0A);
    color: #E6E6E6;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    position: relative;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
  }

  .arena-main {
    padding: 30px 20px;
    max-width: 1800px;
    margin: 0 auto;
    flex: 1;
    position: relative;
  }

  .arena-layout {
    display: grid;
    grid-template-columns: 380px 6fr 380px;
    grid-template-areas: 
      "left center right";
    gap: 50px;
    align-items: start;
  }

  .left-column {
    grid-area: left;
  }

  .center-column {
    grid-area: center;
    min-width: 0; /* Prevents overflow */
  }

  .right-column {
    grid-area: right;
  }

  .error-message {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: rgba(255, 92, 92, 0.1);
    border: 1px solid rgba(255, 92, 92, 0.3);
    border-radius: 8px;
    color: #FF5C5C;
    margin: 20px;
    font-size: 14px;
  }

  .error-message button {
    background: none;
    border: none;
    color: #FF5C5C;
    cursor: pointer;
    font-size: 18px;
    padding: 0 4px;
  }

  .error-message button:hover {
    opacity: 0.7;
  }

  .waiting-phase {
    text-align: center;
    padding: 40px 20px;
  }

  .waiting-content h2 {
    color: #FFD700;
    margin-bottom: 16px;
    font-size: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .waiting-content p {
    color: #B0B0B0;
    margin-bottom: 32px;
    font-size: 16px;
  }

  .waiting-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 32px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .stat-label {
    color: #888;
    font-size: 14px;
  }

  .stat-value {
    color: #FFD700;
    font-size: 18px;
    font-weight: 600;
  }

  .connect-prompt {
    padding: 20px;
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 12px;
    color: #FFD700;
  }

  .roast-form {
    margin-top: 32px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .timer-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 12px;
    margin-bottom: 24px;
  }

  .timer {
    color: #FFD700;
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .participants-count {
    color: #00D2E9;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .roast-section h3 {
    color: #FF6B6B;
    text-align: center;
    margin-bottom: 16px;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .judge-style {
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 20px;
    color: #E6E6E6;
    font-size: 14px;
    line-height: 1.4;
  }

  .roast-input {
    position: relative;
    margin-bottom: 20px;
  }

  .roast-input textarea {
    width: 100%;
    min-height: 120px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #E6E6E6;
    font-size: 16px;
    font-family: inherit;
    resize: vertical;
    transition: border-color 0.3s ease;
  }

  .roast-input textarea:focus {
    outline: none;
    border-color: #FFD700;
  }

  .roast-input textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Custom scrollbar dla textarea */
  .roast-input textarea::-webkit-scrollbar {
    width: 8px;
  }

  .roast-input textarea::-webkit-scrollbar-track {
    background: rgba(30, 30, 40, 0.8);
    border-radius: 4px;
  }

  .roast-input textarea::-webkit-scrollbar-thumb {
    background: rgba(60, 75, 95, 0.6);
    border-radius: 4px;
    border: 1px solid rgba(40, 50, 65, 0.8);
  }

  .roast-input textarea::-webkit-scrollbar-thumb:hover {
    background: rgba(80, 95, 115, 0.8);
  }

  .char-count {
    position: absolute;
    bottom: 8px;
    right: 12px;
    color: #888;
    font-size: 12px;
  }

  .submit-button {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .submit-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #FF5252, #FF7979);
    transform: translateY(-2px);
  }

  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .submitted-status {
    text-align: center;
    padding: 40px 20px;
  }

  .submitted-badge {
    background: rgba(0, 184, 151, 0.1);
    border: 2px solid #00B897;
    border-radius: 20px;
    padding: 30px;
    max-width: 400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .trophy-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .submitted-badge h3 {
    color: #00B897;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }

  .submitted-badge p {
    color: #9999A5;
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
  }

  .entry-fee {
    text-align: center;
    color: #FFD700;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .inline-icon {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Responsive Design */
  /* Tablety i średnie ekrany - stacked layout */
  @media (max-width: 1200px) {
    .arena-main {
      padding: 20px 15px;
      max-width: 100%;
    }

    .arena-layout {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-areas: 
        "center"
        "right" 
        "left";
      gap: 20px;
    }

    .left-column, .right-column {
      width: 100%;
    }

    .error-message {
      margin: 15px;
    }

    .waiting-stats {
      flex-direction: column;
      gap: 20px;
    }

    .timer-section {
      flex-direction: column;
      gap: 8px;
      text-align: center;
    }

    .roast-form {
      margin-top: 24px;
    }
  }

  /* Mobile - mniejsze adjustments */
  @media (max-width: 768px) {
    .arena-main {
      padding: 15px 10px;
    }

    .arena-layout {
      gap: 15px;
    }

    .roast-form {
      margin-top: 20px;
    }
  }
`; 