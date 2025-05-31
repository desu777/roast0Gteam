import React from 'react';
import { Flame, Github, Heart } from 'lucide-react';

// Custom X (Twitter) icon component
const XIcon = ({ size = 16 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 512 512"
    width={size}
    height={size}
    fill="currentColor"
  >
    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
  </svg>
);

const Footer = () => {
  return (
    <>
      <footer className="arena-footer">
        <div className="footer-content">
          <div className="footer-center">
            <div className="footer-logo">
              <Flame size={32} className="footer-flame footer-flame-left" />
              <div className="footer-text-content">
                
                <div className="powered-by-footer">
                  <span className="powered-text">p0wered by desu</span>
                  <div className="social-links">
                    <a 
                      href="https://x.com/nov3lolo" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link"
                      title="Follow on X"
                    >
                      <XIcon size={14} />
                    </a>
                    <a 
                      href="https://github.com/desu777" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link"
                      title="View on GitHub"
                    >
                      <Github size={14} />
                    </a>
                  </div>
                </div>
              </div>
              <Flame size={32} className="footer-flame footer-flame-right" />
            </div>
            <div className="footer-divider"></div>
           
          </div>
        </div>
      </footer>

      <style jsx>{`
        .arena-footer {
          margin-top: auto;
          padding: 30px 20px 20px;
          background: linear-gradient(180deg, transparent, rgba(10, 10, 10, 0.8));
          border-top: 1px solid rgba(60, 75, 95, 0.3);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-center {
          text-align: center;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        /* Większe ekrany - rozszerz położenie płomieni */
        @media (min-width: 768px) {
          .footer-logo {
            gap: 19px; /* 16px + 3px */
          }
        }

        .footer-flame {
          color: var(--theme-primary, #FFD700);
          animation: flamePulse 2s ease-in-out infinite;
        }

        .footer-flame-left {
          animation-delay: 0s;
        }

        .footer-flame-right {
          animation-delay: 1s;
        }

        @keyframes flamePulse {
          0%, 100% { 
            transform: scale(1);
            filter: drop-shadow(0 0 10px var(--theme-primary-50, rgba(255, 215, 0, 0.5)));
          }
          50% { 
            transform: scale(1.1);
            filter: drop-shadow(0 0 20px rgba(var(--theme-primary-rgb, 255, 215, 0), 0.8));
          }
        }

        .footer-text-content p {
          color: #9999A5;
          font-size: 14px;
          margin: 0 0 12px 0;
          line-height: 1.6;
        }

        /* Większe ekrany - zwiększ margines od tekstu po bokach */
        @media (min-width: 768px) {
          .footer-text-content {
            margin: 0 20px; /* Dodaj margines po bokach tekstu */
          }
        }

        .footer-text-content strong {
          color: #00D2E9;
          font-weight: 600;
        }

        .powered-by-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .powered-text {
          color: var(--theme-primary, #FFD700);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .social-links {
          display: flex;
          gap: 8px;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: var(--theme-primary-10, rgba(255, 215, 0, 0.1));
          border: 1px solid var(--theme-primary-30, rgba(255, 215, 0, 0.3));
          border-radius: 8px;
          color: var(--theme-primary, #FFD700);
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: var(--theme-primary-20, rgba(255, 215, 0, 0.2));
          border-color: var(--theme-primary, #FFD700);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--theme-primary-30, rgba(255, 215, 0, 0.3));
        }

        .footer-divider {
          width: 100px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--theme-primary-50, rgba(255, 215, 0, 0.5)), transparent);
          margin: 20px auto;
        }

        .footer-info {
          color: #666;
          font-size: 12px;
        }

        .heart-icon {
          display: inline-block;
          color: #FF5CAA;
          animation: heartBeat 1.5s ease-in-out infinite;
          vertical-align: middle;
          margin: 0 4px;
        }

        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          10%, 30% { transform: scale(1.1); }
          20% { transform: scale(1.2); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .arena-footer {
            padding: 20px 15px;
          }

          .footer-logo {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </>
  );
};

export default Footer; 