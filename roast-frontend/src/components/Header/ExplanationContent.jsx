import React from 'react';
import { Target, Crosshair } from 'lucide-react';
import { TEAM_MEMBERS } from '../../data/teamMembers';
import { TEAM_ROASTERS } from '../../data/teamRoasters';
import TeamMemberCard from './TeamMemberCard';

const ExplanationContent = ({ type, data, onCharacterSelect }) => {
  const getExplanationContent = () => {
    switch (type) {
      case 'bets':
        return {
          title: 'Battle Bets',
          icon: <Target size={24} />,
          content: (
            <div>
              <p>Shows the number of players who have placed bets on this side.</p>
              <div className="explanation-details">
                <div className="detail-item">
                  <strong>Current Bets:</strong> {data?.count || 0} players
                </div>
                <div className="detail-item">
                  <strong>How it works:</strong> Each player can place one bet per battle. More bets indicate higher confidence in that side.
                </div>
                <div className="detail-item">
                  <strong>Minimum Required:</strong> At least 1 bet on each side to start the battle.
                </div>
              </div>
            </div>
          )
        };

      case 'odds':
        return {
          title: 'Betting Odds',
          icon: <Crosshair size={24} />,
          content: (
            <div>
              <p>Shows the potential payout multiplier if this side wins.</p>
              <div className="explanation-details">
                <div className="detail-item">
                  <strong>Current Odds:</strong> {data?.odds || '1.0x'}
                </div>
                <div className="detail-item">
                  <strong>How it works:</strong> Odds are calculated based on the total amount bet on each side. Lower odds = higher chance of winning.
                </div>
                <div className="detail-item">
                  <strong>Example:</strong> If you bet 1 0G at 2.5x odds and win, you receive 2.5 0G total.
                </div>
                <div className="detail-item">
                  <strong>Dynamic:</strong> Odds change as more bets are placed on either side.
                </div>
              </div>
            </div>
          )
        };

      case 'og-team':
        return {
          title: '0G Team',
          icon: <div className="og-team-logo">
            <img src="/logo.jpg" alt="0G Labs" />
          </div>,
          content: (
            <div>
              <p>The 0G Network team characters defending their project.</p>
              <div className="explanation-details">
                <div className="detail-item">
                  <strong>Total Bet Amount:</strong> {(data?.total || 0).toFixed(3)} 0G
                </div>
                <div className="detail-item">
                  <strong>Fighting Style:</strong> Defensive, technical arguments about 0G's technology and vision.
                </div>
                <div className="detail-item">
                  <strong>Win Condition:</strong> Successfully defend 0G against roaster attacks with solid arguments.
                </div>
              </div>
              
              <div className="team-members-section">
                <h4>Team Members ({TEAM_MEMBERS.length})</h4>
                <div className="team-members-grid">
                  {TEAM_MEMBERS.map((member) => (
                    <TeamMemberCard
                      key={member.id}
                      member={member}
                      onClick={(member) => onCharacterSelect(member, 'og')}
                      isRoaster={false}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        };

      case 'roaster':
        return {
          title: 'Crypto Roasters',
          icon: <div className="roaster-team-logo">
            <img src="/gg.png" alt="Roasters" />
          </div>,
          content: (
            <div>
              <p>Independent crypto critics challenging 0G Network.</p>
              <div className="explanation-details">
                <div className="detail-item">
                  <strong>Total Bet Amount:</strong> {(data?.total || 0).toFixed(3)} 0G
                </div>
                <div className="detail-item">
                  <strong>Fighting Style:</strong> Aggressive, critical analysis of 0G's weaknesses and market position.
                </div>
                <div className="detail-item">
                  <strong>Win Condition:</strong> Successfully expose 0G's flaws with devastating roasts and solid criticism.
                </div>
              </div>
              
              <div className="team-members-section">
                <h4>Roaster Types ({TEAM_ROASTERS.length})</h4>
                <div className="team-members-grid">
                  {TEAM_ROASTERS.map((roaster) => (
                    <TeamMemberCard
                      key={roaster.id}
                      member={roaster}
                      onClick={(roaster) => onCharacterSelect(roaster, 'roaster')}
                      isRoaster={true}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        };

      default:
        return {
          title: 'Information',
          icon: <Target size={24} />,
          content: <p>No information available.</p>
        };
    }
  };

  return getExplanationContent();
};

export default ExplanationContent; 