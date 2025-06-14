export const modalStyles = `
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      background: rgba(0, 0, 0, 0);
    }
    to {
      opacity: 1;
      background: rgba(0, 0, 0, 0.7);
    }
  }

  .explanation-modal {
    background: rgba(18, 18, 24, 0.95);
    border: 2px solid var(--judge-color, #FFD700);
    border-radius: 16px;
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    backdrop-filter: blur(10px);
    box-shadow: 0 0 30px rgba(var(--judge-color-rgb, 255, 215, 0), 0.3);
  }

  .modal-slide-in {
    animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-50px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid var(--judge-color, #FFD700);
    background: linear-gradient(90deg, 
      rgba(var(--judge-color-rgb, 255, 215, 0), 0.1), 
      rgba(var(--judge-color-rgb, 255, 215, 0), 0.05)
    );
  }

  .modal-title {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #E6E6E6;
  }

  .modal-title h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
  }

  .og-team-logo {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .og-team-logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .roaster-team-logo {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD);
    background-size: 300% 300%;
    animation: gradientFlow 3s ease infinite;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .roaster-team-logo img {
    width: 16px;
    height: 16px;
    object-fit: contain;
    z-index: 1;
    position: relative;
  }

  @keyframes gradientFlow {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .close-btn {
    background: rgba(30, 30, 40, 0.8);
    border: 1px solid rgba(60, 75, 95, 0.5);
    color: #9999A5;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    position: relative;
    overflow: hidden;
  }

  .close-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.3s ease;
  }

  .close-btn:hover::before {
    left: 100%;
  }

  .close-btn:hover {
    color: #E6E6E6;
    background: rgba(var(--judge-color-rgb, 255, 215, 0), 0.2);
    border-color: var(--judge-color, #FFD700);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(var(--judge-color-rgb, 255, 215, 0), 0.3);
  }

  .close-btn:active {
    transform: scale(0.95);
  }

  .modal-content {
    padding: 20px;
    color: #E6E6E6;
    line-height: 1.6;
  }

  .modal-content p {
    margin: 0 0 16px 0;
    font-size: 16px;
  }

  .explanation-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .detail-item {
    padding: 12px;
    background: rgba(30, 30, 40, 0.6);
    border-radius: 8px;
    border-left: 3px solid var(--judge-color, #FFD700);
  }

  .detail-item strong {
    color: var(--judge-color, #FFD700);
    display: block;
    margin-bottom: 4px;
    font-size: 14px;
  }

  /* Scrollbar styling */
  .explanation-modal::-webkit-scrollbar {
    width: 6px;
  }

  .explanation-modal::-webkit-scrollbar-track {
    background: rgba(30, 30, 40, 0.5);
  }

  .explanation-modal::-webkit-scrollbar-thumb {
    background: rgba(100, 100, 120, 0.5);
    border-radius: 3px;
  }

  .explanation-modal::-webkit-scrollbar-thumb:hover {
    background: rgba(120, 120, 140, 0.7);
  }

  /* Team Members Section */
  .team-members-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(var(--judge-color-rgb, 255, 215, 0), 0.3);
  }

  .team-members-section h4 {
    color: var(--judge-color, #FFD700);
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
  }

  .team-members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .team-member-card {
    background: rgba(30, 30, 40, 0.6);
    border: 1px solid rgba(60, 75, 95, 0.3);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .team-member-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.3s ease;
  }

  .team-member-card:hover::before {
    left: 100%;
  }

  .team-member-card:hover {
    transform: translateY(-2px);
    border-color: var(--judge-color, #FFD700);
    box-shadow: 0 4px 12px rgba(var(--judge-color-rgb, 255, 215, 0), 0.2);
  }

  .member-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 12px;
    border: 2px solid;
    position: relative;
  }

  .member-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .fallback-avatar {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
  }

  .member-info h5 {
    color: #E6E6E6;
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
  }

  .member-info p {
    color: #9999A5;
    margin: 0 0 8px 0;
    font-size: 12px;
  }

  .member-archetype {
    color: var(--judge-color, #FFD700);
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .view-bio-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    color: #9999A5;
    font-size: 11px;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
  }

  .team-member-card:hover .view-bio-hint {
    opacity: 1;
    transform: translateY(0);
    color: var(--judge-color, #FFD700);
  }

  /* Character Bio View */
  .character-bio-view {
    animation: slideInFromRight 0.3s ease-out;
  }

  @keyframes slideInFromRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .bio-header {
    margin-bottom: 20px;
  }

  .back-btn {
    background: rgba(30, 30, 40, 0.8);
    border: 1px solid rgba(var(--judge-color-rgb, 255, 215, 0), 0.5);
    color: var(--judge-color, #FFD700);
    padding: 10px 20px;
    border-radius: 12px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 20px;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(5px);
  }

  .back-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.3s ease;
  }

  .back-btn:hover::before {
    left: 100%;
  }

  .back-btn:hover {
    background: rgba(var(--judge-color-rgb, 255, 215, 0), 0.2);
    border-color: var(--judge-color, #FFD700);
    color: #E6E6E6;
    transform: translateX(-4px);
    box-shadow: 0 4px 12px rgba(var(--judge-color-rgb, 255, 215, 0), 0.3);
  }

  .back-btn:active {
    transform: translateX(-2px) scale(0.98);
  }

  .character-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .character-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid;
    position: relative;
  }

  .character-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .character-info h3 {
    color: #E6E6E6;
    margin: 0 0 4px 0;
    font-size: 20px;
    font-weight: 700;
  }

  .character-info p {
    color: #9999A5;
    margin: 0 0 8px 0;
    font-size: 14px;
  }

  .character-archetype {
    color: var(--judge-color, #FFD700);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .bio-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .twitter-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--judge-color, #FFD700);
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    margin-top: 8px;
  }

  .twitter-link:hover {
    color: #E6E6E6;
    transform: translateX(4px);
  }

  .catchphrase {
    color: var(--judge-color, #FFD700);
    font-style: italic;
    font-weight: 600;
  }

  .crypto-personality {
    color: #B8B8C2;
    font-style: italic;
  }

  .traits-list {
    margin: 8px 0 0 0;
    padding-left: 20px;
    color: #9999A5;
    line-height: 1.5;
  }

  .traits-list li {
    margin-bottom: 4px;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .modal-overlay {
      padding: 10px;
    }

    .explanation-modal {
      max-height: 90vh;
    }

    .modal-header {
      padding: 16px;
    }

    .modal-content {
      padding: 16px;
    }

    .modal-title h3 {
      font-size: 18px;
    }

    .team-members-grid {
      grid-template-columns: 1fr;
    }

    .character-header {
      flex-direction: column;
      text-align: center;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      padding: 6px;
    }

    .back-btn {
      padding: 8px 16px;
      font-size: 12px;
      margin-bottom: 16px;
    }

    .back-btn:hover {
      transform: translateX(-2px);
    }
  }
`; 