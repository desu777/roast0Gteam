/**
 * Styles for WritingPhase component and its sub-components
 */

export const getWritingPhaseStyles = () => `
  .writing-phase {
    max-width: 800px;
    margin: 0 auto;
  }

  .round-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 24px;
    background: rgba(18, 18, 24, 0.9);
    border-radius: 16px;
    border: 1px solid rgba(60, 75, 95, 0.3);
  }

  .timer-section {
    text-align: center;
  }

  .timer-display {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .timer-text {
    font-size: 32px;
    font-weight: 700;
    color: var(--theme-primary, #FFD700);
    font-family: 'Courier New', monospace;
  }

  .timer-text.timer-warning {
    color: #FF5C5C;
    animation: warningBlink 1s ease-in-out infinite;
  }

  @keyframes warningBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .timer-label {
    color: #9999A5;
    font-size: 14px;
  }

  .participants-count {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #E6E6E6;
    font-size: 18px;
    font-weight: 500;
  }

  .gradient-text {
    background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientFlow 3s linear infinite;
    font-weight: 600;
  }

  @keyframes gradientFlow {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  .writing-section {
    margin-bottom: 30px;
  }

  .writing-prompt {
    text-align: center;
    margin-bottom: 30px;
  }

  .writing-prompt h3 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 16px;
    background: linear-gradient(90deg, #FFD700, #FF6B6B, #FF5CAA);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: fireGlow 2s ease-in-out infinite alternate;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    line-height: 1.2;
  }

  @keyframes fireGlow {
    0% { filter: brightness(1); }
    100% { filter: brightness(1.2) drop-shadow(0 0 10px rgba(255, 107, 107, 0.5)); }
  }

  .fire-icon {
    color: #FF6B6B;
    animation: fireWiggle 1s ease-in-out infinite;
  }

  .inline-icon {
    display: inline-block;
    vertical-align: text-top;
    margin-right: 8px;
  }

  .flame-indicator {
    display: flex;
    gap: 4px;
    color: #FF6B6B;
  }

  @keyframes fireWiggle {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(-5deg) scale(1.1); }
    75% { transform: rotate(5deg) scale(1.1); }
  }

  .fire-emoji {
    display: inline-block;
    animation: fireWiggle 1s ease-in-out infinite;
    margin: 0 8px;
  }

  .roast-input-container {
    margin-bottom: 24px;
  }

  .roast-input-wrapper {
    position: relative;
    margin-bottom: 24px;
  }

  .flame-border {
    position: absolute;
    inset: -3px;
    border-radius: 20px;
    background: linear-gradient(
      45deg,
      #FFD700,
      #FF6B6B,
      #FF5CAA,
      #FFD700
    );
    background-size: 300% 300%;
    animation: flameGradient 3s ease infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .roast-textarea:focus ~ .flame-border {
    opacity: 1;
  }

  @keyframes flameGradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .flame {
    position: absolute;
    width: 20px;
    height: 30px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .roast-textarea:focus ~ .flame-border .flame {
    opacity: 0.8;
  }

  .flame-1 {
    top: -15px;
    left: 20%;
    animation-delay: 0s;
  }

  .flame-2 {
    top: -15px;
    right: 20%;
    animation-delay: 0.3s;
  }

  .flame-3 {
    bottom: -15px;
    left: 30%;
    animation-delay: 0.6s;
  }

  .flame-4 {
    bottom: -15px;
    right: 30%;
    animation-delay: 0.9s;
  }

  .flame::before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 20px solid #FFD700;
    animation: flameFlicker 0.5s ease-in-out infinite alternate;
  }

  .flame::after {
    content: "";
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 12px solid #FF6B6B;
    animation: flameFlicker 0.7s ease-in-out infinite alternate-reverse;
  }

  @keyframes flameFlicker {
    0% { transform: translateX(-50%) scale(1) rotate(-2deg); }
    100% { transform: translateX(-50%) scale(1.1) rotate(2deg); }
  }

  .roast-textarea {
    width: 100%;
    min-height: 180px;
    padding: 24px;
    background: rgba(18, 18, 24, 0.95);
    border: 2px solid rgba(60, 75, 95, 0.3);
    border-radius: 16px;
    color: #E6E6E6;
    font-size: 16px;
    line-height: 1.6;
    resize: none;
    outline: none;
    font-family: inherit;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
  }

  .roast-textarea:focus {
    border-color: rgba(255, 215, 0, 0.5);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
  }

  .roast-textarea::placeholder {
    color: #9999A5;
    line-height: 1.6;
  }

  .textarea-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding: 0 4px;
  }

  .char-count {
    font-size: 14px;
    color: #9999A5;
  }

  .char-count .warning {
    color: #FF6B6B;
    font-weight: 600;
  }

  .submit-roast-btn {
    position: relative;
    width: 100%;
    max-width: 400px;
    margin: 0 auto 20px auto;
    padding: 0;
    background: linear-gradient(135deg, #FFD700, #FF6B6B);
    border: 2px solid #FFD700;
    border-radius: 16px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    display: block;
    font-size: 18px;
    font-weight: 600;
    animation: goldGlow 2s ease-in-out infinite alternate;
  }

  .submit-roast-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
    animation: intensePulse 0.5s ease-in-out infinite alternate;
  }

  .submit-roast-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  @keyframes goldGlow {
    0% { box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3); }
    100% { box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6); }
  }

  @keyframes intensePulse {
    0% { transform: translateY(-2px) scale(1); }
    100% { transform: translateY(-2px) scale(1.02); }
  }

  .btn-flame-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, 
      rgba(255, 215, 0, 0.8), 
      rgba(255, 107, 107, 0.8), 
      rgba(255, 92, 170, 0.8),
      rgba(255, 215, 0, 0.8)
    );
    background-size: 300% 300%;
    animation: flameShift 3s ease infinite;
    opacity: 0.9;
  }

  @keyframes flameShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .btn-content {
    position: relative;
    z-index: 1;
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .btn-content span {
    background: linear-gradient(90deg, #FFFFFF, #FFD700, #FFFFFF);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 2s linear infinite;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .btn-content svg {
    color: #FFFFFF;
    filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
  }

  .submit-roast-btn:disabled {
    background: #666;
    border-color: #666;
    animation: none;
    box-shadow: none;
    cursor: not-allowed;
  }

  .submit-roast-btn.disabled {
    background: #666;
    border-color: #666;
    animation: none;
    box-shadow: none;
  }

  .submit-roast-btn.disabled .btn-content span {
    background: #FF5C5C;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: none;
  }

  .submit-roast-btn.disabled .btn-content svg {
    color: #FF5C5C;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 215, 0, 0.3);
    border-radius: 50%;
    border-top-color: #FFD700;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .entry-fee-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 20px;
    color: #FFD700;
    font-weight: 600;
    font-size: 14px;
    margin: 0 auto;
    width: fit-content;
  }

  .submitted-status {
    text-align: center;
    padding: 40px 20px;
  }

  .submitted-badge {
    background: rgba(0, 210, 233, 0.1);
    border: 2px solid rgba(0, 210, 233, 0.3);
    border-radius: 16px;
    padding: 30px;
    color: #00D2E9;
  }

  .submitted-badge h3 {
    margin: 16px 0 12px 0;
    font-size: 24px;
    font-weight: 700;
  }

  .submitted-badge p {
    color: #E6E6E6;
    margin: 0;
    line-height: 1.5;
  }

  .live-participants {
    margin-top: 30px;
  }

  .live-participants h4 {
    margin-bottom: 16px;
    color: #E6E6E6;
    font-weight: 600;
  }

  .participants-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
  }

  .participant-card {
    background: rgba(18, 18, 24, 0.8);
    border: 1px solid rgba(60, 75, 95, 0.3);
    border-radius: 12px;
    padding: 12px;
    text-align: center;
    transition: all 0.2s ease;
  }

  .participant-card:hover {
    border-color: rgba(255, 215, 0, 0.3);
    transform: translateY(-2px);
  }

  .user-participant {
    border-color: rgba(0, 210, 233, 0.5);
    background: rgba(0, 210, 233, 0.1);
  }

  .participant-address {
    font-size: 14px;
    color: #E6E6E6;
    font-weight: 500;
  }

  .address-link {
    color: inherit;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .address-link:hover {
    color: #FFD700;
    text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
  }

  .address-link:visited {
    color: inherit;
  }

  .you-badge {
    background: #00D2E9;
    color: #0A0A0A;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    margin-left: 8px;
  }

  .show-more-btn {
    width: 100%;
    background: linear-gradient(135deg, rgba(18, 18, 24, 0.9), rgba(28, 28, 35, 0.9));
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    color: #FFD700;
    transition: all 0.3s ease;
    margin-top: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .show-more-btn:hover {
    background: linear-gradient(135deg, rgba(28, 28, 35, 0.9), rgba(38, 38, 45, 0.9));
    border-color: rgba(255, 215, 0, 0.5);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
  }

  .show-more-btn:active {
    transform: translateY(0);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .round-status {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }

    .roast-textarea {
      min-height: 150px;
      padding: 20px;
      font-size: 15px;
    }

    .submit-roast-btn {
      font-size: 16px;
    }

    .btn-content {
      padding: 16px;
    }

    .participants-grid {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    }
  }
`; 