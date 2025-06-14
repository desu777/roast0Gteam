export const battleArenaStyles = `
  /* CSS Property for Border Angle Animation */
  @property --border-angle {
    syntax: "<angle>";
    inherits: true;
    initial-value: 0turn;
  }

  /* Laser Border Animation */
  @keyframes laser-spin {
    to {
      --border-angle: 1turn;
    }
  }

  /* Countdown Time Animations */
  @keyframes countdown-glow {
    0% {
      text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
      transform: scale(1);
    }
    100% {
      text-shadow: 0 0 15px currentColor, 0 0 30px currentColor, 0 0 40px currentColor;
      transform: scale(1.05);
    }
  }

  @keyframes countdown-pulse {
    0%, 100% {
      text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
      transform: scale(1);
      opacity: 1;
    }
    50% {
      text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;
      transform: scale(1.1);
      opacity: 0.8;
    }
  }

  @keyframes winner-glow {
    0% {
      text-shadow: 0 0 10px currentColor;
      transform: scale(1);
    }
    100% {
      text-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
      transform: scale(1.02);
    }
  }

  .battle-arena {
    background: rgba(18, 18, 24, 0.9);
    border: 1px solid rgba(60, 75, 95, 0.3);
    border-radius: 16px;
    padding: 24px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
    justify-content: space-between;
  }

  .arena-title {
    text-align: center;
    flex: 0 0 auto;
    margin-bottom: 0;
  }

  .arena-title h2 {
    color: #E6E6E6;
    font-size: 32px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    line-height: 1;
  }

  .gradient-text {
    color: #FFFFFF;
    font-weight: 700;
    display: inline-block;
    line-height: 1;
    text-shadow: 0 2px 4px rgba(255, 255, 255, 0.3);
  }



  .arena-icon {
    width: 36px;
    height: 36px;
    filter: drop-shadow(0 0 8px currentColor);
    animation: iconGlow 3s ease-in-out infinite alternate;
    transition: color 0.3s ease;
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  @keyframes iconGlow {
    0% { 
      filter: drop-shadow(0 0 8px currentColor); 
      transform: scale(1);
    }
    100% { 
      filter: drop-shadow(0 0 16px currentColor); 
      transform: scale(1.05);
    }
  }

  .arena-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .characters-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 24px;
    border-radius: 12px;
    min-height: 180px;
  }

  .characters-status-message {
    width: 100%;
    text-align: center;
    padding: 16px 24px;
    margin-bottom: 16px;
    position: relative;
  }

  .characters-status-message:hover {
    animation-play-state: paused;
  }

  .status-white-text {
    color: #FFFFFF;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
  }

  .characters-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 60px;
    width: 100%;
  }

  .character-card {
    text-align: center;
    padding: 24px;
    border-radius: 12px;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    flex: 1;
    max-width: 250px;
    min-width: 240px;
    min-height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .character-card.winner {
    border-color: var(--theme-primary, #FFD700);
    box-shadow: 0 0 20px var(--theme-primary-30, rgba(255, 215, 0, 0.4));
  }

  .character-icon {
    width: 120px;
    height: 120px;
    margin: 0 auto 12px;
    position: relative;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(60, 60, 70, 0.5);
    flex-shrink: 0;
  }

  .character-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .fallback-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 50px;
    font-weight: bold;
    color: #E6E6E6;
  }

  .character-card h3 {
    color: #E6E6E6;
    font-size: 20px;
    margin: 0 0 8px 0;
    font-weight: 700;
  }

  .character-card p {
    color: #9999A5;
    font-size: 14px;
    margin: 0;
    font-weight: 500;
  }

  .vs-divider {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 80px;
    flex-shrink: 0;
  }

  .vs-icon {
    filter: drop-shadow(0 0 8px currentColor);
    animation: iconGlow 3s ease-in-out infinite alternate;
    transition: color 0.3s ease;
  }

  .vs-gradient-text {
    color: #FFFFFF;
    font-weight: 900;
    font-size: 18px;
    letter-spacing: 2px;
    text-shadow: 0 2px 4px rgba(255, 255, 255, 0.3);
  }

  .battle-status {
    text-align: center;
    padding: 16px 24px;
    border-radius: 12px;
    border: 1px solid;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
    flex: 0 0 auto;
  }

  .status-gradient-text {
    color: #FFFFFF;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(255, 255, 255, 0.3);
  }

  .battle-transition {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 24px;
  }

  .transition-message {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .loader-text {
    font-size: 18px;
    opacity: 0.8;
  }

  /* Battle Loader Animation */
  .battle-loader {
    position: relative;
    width: 2.5em;
    height: 2.5em;
    transform: rotate(165deg);
  }

  .battle-loader:before, 
  .battle-loader:after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    display: block;
    width: 0.5em;
    height: 0.5em;
    border-radius: 0.25em;
    transform: translate(-50%, -50%);
  }

  .battle-loader:before {
    animation: battleLoaderBefore 2s infinite;
  }

  .battle-loader:after {
    animation: battleLoaderAfter 2s infinite;
  }

  @keyframes battleLoaderBefore {
    0% {
      width: 0.5em;
      box-shadow: 1em -0.5em var(--judge-color, #FFD700), -1em 0.5em var(--judge-color-light, #FFD70080);
    }
    35% {
      width: 2.5em;
      box-shadow: 0 -0.5em var(--judge-color, #FFD700), 0 0.5em var(--judge-color-light, #FFD70080);
    }
    70% {
      width: 0.5em;
      box-shadow: -1em -0.5em var(--judge-color, #FFD700), 1em 0.5em var(--judge-color-light, #FFD70080);
    }
    100% {
      box-shadow: 1em -0.5em var(--judge-color, #FFD700), -1em 0.5em var(--judge-color-light, #FFD70080);
    }
  }

  @keyframes battleLoaderAfter {
    0% {
      height: 0.5em;
      box-shadow: 0.5em 1em var(--judge-color-dark, #FFD700CC), -0.5em -1em var(--judge-color, #FFD700);
    }
    35% {
      height: 2.5em;
      box-shadow: 0.5em 0 var(--judge-color-dark, #FFD700CC), -0.5em 0 var(--judge-color, #FFD700);
    }
    70% {
      height: 0.5em;
      box-shadow: 0.5em -1em var(--judge-color-dark, #FFD700CC), -0.5em 1em var(--judge-color, #FFD700);
    }
    100% {
      box-shadow: 0.5em 1em var(--judge-color-dark, #FFD700CC), -0.5em -1em var(--judge-color, #FFD700);
    }
  }

  /* Transition Animations */
  .fade-out {
    opacity: 0;
    transform: scale(0.95);
    transition: all 0.2s ease-out;
  }

  .fade-in {
    opacity: 1;
    transform: scale(1);
    transition: all 0.3s ease-in;
  }

  /* Full-screen Chat Styles */
  .battle-chat-fullscreen {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 500px;
  }

  .chat-header {
    padding: 20px;
    background: rgba(18, 18, 24, 0.9);
    border-bottom: 1px solid rgba(60, 75, 95, 0.3);
    border-radius: 16px 16px 0 0;
  }

  .chat-participants {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    padding: 0 20px;
  }

  .participant {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #E6E6E6;
    font-weight: 600;
  }

  .participant-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(60, 75, 95, 0.3);
  }

  .participant-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .chat-messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: rgba(18, 18, 24, 0.7);
    max-height: 400px;
  }

  .message {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    animation: messageSlideIn 0.3s ease-out;
  }

  @keyframes messageSlideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message.roaster {
    flex-direction: row-reverse;
  }

  .message-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(60, 75, 95, 0.3);
    flex-shrink: 0;
  }

  .message-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .message-avatar span {
    color: #E6E6E6;
    font-weight: bold;
    font-size: 16px;
  }

  .message-content {
    flex: 1;
    max-width: 70%;
  }

  .message-header {
    margin-bottom: 4px;
  }

  .message-sender {
    font-size: 12px;
    font-weight: 600;
    color: #9999A5;
  }

  .message.roaster .message-sender {
    text-align: right;
  }

  .message-text {
    background: rgba(60, 75, 95, 0.3);
    padding: 8px 12px;
    border-radius: 12px;
    color: #E6E6E6;
    font-size: 14px;
    line-height: 1.4;
  }

  .message.roaster .message-text {
    background: rgba(255, 92, 170, 0.2);
  }

  .message-impact {
    font-size: 11px;
    color: #9999A5;
    margin-top: 4px;
    text-align: right;
  }

  .message.roaster .message-impact {
    text-align: left;
  }

  /* Typing Indicator */
  .typing-message {
    opacity: 0.7;
  }

  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 16px;
    background: rgba(60, 75, 95, 0.3);
    border-radius: 12px;
    max-width: fit-content;
  }

  .typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #9999A5;
    animation: typingDot 1.4s infinite ease-in-out;
  }

  .typing-indicator span:nth-child(1) {
    animation-delay: -0.32s;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes typingDot {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Full-screen Results Styles */
  .battle-results-fullscreen {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
    text-align: center;
    gap: 24px;
    min-height: 500px;
  }

  .ai-question {
    font-size: 18px;
    margin-bottom: 8px;
  }

  .winner-character {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }

  .winner-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(60, 75, 95, 0.3);
    border: 3px solid #FFD700;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
  }

  .winner-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .winner-avatar span {
    color: #E6E6E6;
    font-weight: bold;
    font-size: 32px;
  }

  .winner-reveal h2 {
    color: #FFD700;
    font-size: 20px;
    margin: 0 0 12px 0;
  }

  .battle-scores {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin: 20px 0;
  }

  .score-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    border-radius: 12px;
    background: rgba(60, 75, 95, 0.3);
    border: 1px solid rgba(60, 75, 95, 0.5);
  }

  .score-label {
    color: #9999A5;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .score-value {
    color: #E6E6E6;
    font-size: 24px;
    font-weight: bold;
  }

  .score-divider {
    color: #9999A5;
    font-size: 16px;
    font-weight: bold;
  }

  .ai-reasoning {
    max-width: 600px;
    margin-top: 20px;
  }

  .ai-reasoning h3 {
    color: #FFD700;
    font-size: 18px;
    margin-bottom: 16px;
  }

  .ai-reasoning p {
    color: #E6E6E6;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .decisive-moment {
    background: rgba(60, 75, 95, 0.3);
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid #FFD700;
  }

  .decisive-moment strong {
    color: #FFD700;
    display: block;
    margin-bottom: 8px;
  }

  .decisive-moment span {
    color: #E6E6E6;
    font-style: italic;
  }

  /* Advanced Bio Button Styles */
  .bio-btn-17,
  .bio-btn-17 *,
  .bio-btn-17 :after,
  .bio-btn-17 :before,
  .bio-btn-17:after,
  .bio-btn-17:before {
    border: 0 solid;
    box-sizing: border-box;
  }

  .bio-btn-17 {
    -webkit-tap-highlight-color: transparent;
    -webkit-appearance: button;
    background-color: rgba(0, 0, 0, 0.4);
    background-image: none;
    color: var(--judge-color, #FFD700);
    cursor: pointer;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.5;
    margin: 12px 0 0 0;
    -webkit-mask-image: -webkit-radial-gradient(#000, #fff);
    padding: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-radius: 99rem;
    border: 2px solid var(--judge-color, #FFD700);
    padding: 0.6rem 1.5rem;
    z-index: 0;
    position: relative;
    overflow: hidden;
  }

  .bio-btn-17:disabled {
    cursor: default;
  }

  .bio-btn-17:-moz-focusring {
    outline: auto;
  }

  .bio-btn-17 svg {
    display: inline-block;
    vertical-align: middle;
    margin-right: 6px;
  }

  .bio-btn-17 [hidden] {
    display: none;
  }

  .bio-btn-17 .text-container {
    display: block;
    mix-blend-mode: difference;
    overflow: hidden;
    position: relative;
  }

  .bio-btn-17 .text {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    position: relative;
  }

  .bio-btn-17:hover .text {
    -webkit-animation: move-up-alternate 0.3s forwards;
    animation: move-up-alternate 0.3s forwards;
  }

  @-webkit-keyframes move-up-alternate {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(80%);
    }
    51% {
      transform: translateY(-80%);
    }
    to {
      transform: translateY(0);
    }
  }

  @keyframes move-up-alternate {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(80%);
    }
    51% {
      transform: translateY(-80%);
    }
    to {
      transform: translateY(0);
    }
  }

  .bio-btn-17:after,
  .bio-btn-17:before {
    --skew: 0.2;
    background: var(--judge-color, #FFD700);
    content: "";
    display: block;
    height: 102%;
    left: calc(-50% - 50% * var(--skew));
    pointer-events: none;
    position: absolute;
    top: -104%;
    transform: skew(calc(150deg * var(--skew))) translateY(var(--progress, 0));
    transition: transform 0.2s ease;
    width: 100%;
  }

  .bio-btn-17:after {
    --progress: 0%;
    left: calc(50% + 50% * var(--skew));
    top: 102%;
    z-index: -1;
  }

  .bio-btn-17:hover:before {
    --progress: 100%;
  }

  .bio-btn-17:hover:after {
    --progress: -102%;
  }

  /* Responsive Design */
  @media (max-width: 1400px) and (min-width: 1025px) {
    .characters-display {
      gap: 40px;
      padding: 20px;
    }
    
    .character-card {
      min-width: 160px;
      max-width: 200px;
    }
    
    .character-icon {
      width: 90px;
      height: 90px;
    }
  }

  @media (max-width: 1024px) {
    .battle-arena {
      padding: 20px;
      gap: 16px;
    }

    .arena-title h2 {
      font-size: 28px;
    }

    .arena-icon {
      width: 32px;
      height: 32px;
    }

    .characters-display {
      gap: 16px;
      padding: 16px;
      min-height: 160px;
    }

    .characters-row {
      gap: 20px;
    }

    .characters-status-message {
      padding: 12px 16px;
      margin-bottom: 12px;
    }

    .status-white-text {
      font-size: 15px;
    }

    .character-card {
      padding: 16px;
      min-width: 120px;
      max-width: 160px;
      min-height: 120px;
    }

    .character-icon {
      width: 75px;
      height: 75px;
      margin-bottom: 8px;
    }

    .character-card h3 {
      font-size: 16px;
    }

    .character-card p {
      font-size: 13px;
    }

    .vs-divider {
      min-width: 60px;
    }

    .vs-icon {
      width: 32px;
      height: 32px;
    }

    .vs-gradient-text {
      font-size: 16px;
    }
  }

  @media (max-width: 768px) {
    .battle-arena {
      padding: 16px;
      gap: 12px;
    }

    .arena-title h2 {
      font-size: 24px;
    }

    .arena-icon {
      width: 28px;
      height: 28px;
    }

    .characters-display {
      gap: 12px;
      padding: 16px;
      min-height: auto;
    }

    .characters-row {
      flex-direction: column;
      gap: 16px;
    }

    .characters-status-message {
      padding: 10px 14px;
      margin-bottom: 10px;
    }

    .status-white-text {
      font-size: 14px;
    }

    .character-card {
      max-width: 100%;
      min-width: 0;
      flex: none;
      width: 100%;
      padding: 20px;
      min-height: 100px;
    }

    .vs-divider {
      flex-direction: row;
      order: 0;
      gap: 12px;
    }

    .vs-icon {
      width: 28px;
      height: 28px;
    }

    .vs-gradient-text {
      font-size: 14px;
    }

    .battle-status {
      padding: 12px 20px;
      font-size: 15px;
    }

    .bio-btn-17 {
      padding: 0.5rem 1.2rem;
      font-size: 11px;
      margin-top: 8px;
    }
  }

  @media (max-width: 480px) {
    .battle-arena {
      padding: 12px;
      gap: 10px;
    }

    .arena-title h2 {
      font-size: 22px;
    }

    .arena-icon {
      width: 24px;
      height: 24px;
    }

    .characters-row {
      flex-direction: column;
      gap: 12px;
    }

    .characters-status-message {
      padding: 8px 12px;
      margin-bottom: 8px;
    }

    .status-white-text {
      font-size: 13px;
    }

    .character-card {
      padding: 16px;
    }

    .character-icon {
      width: 60px;
      height: 60px;
    }

    .character-card h3 {
      font-size: 15px;
    }

    .character-card p {
      font-size: 12px;
    }

    .battle-status {
      padding: 10px 16px;
      font-size: 14px;
    }

    .vs-icon {
      width: 24px;
      height: 24px;
    }

    .vs-gradient-text {
      font-size: 12px;
    }

    .bio-btn-17 {
      padding: 0.4rem 1rem;
      font-size: 10px;
      margin-top: 6px;
    }
  }
`; 