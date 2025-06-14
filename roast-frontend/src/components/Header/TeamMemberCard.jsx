import React from 'react';
import { User } from 'lucide-react';

const TeamMemberCard = ({ member, onClick, isRoaster = false }) => {
  const getImageSrc = () => {
    if (isRoaster) {
      return `/${member.id}.jpg`;
    } else {
      return `/${member.id}.jpg`;
    }
  };

  return (
    <div 
      className="team-member-card"
      onClick={() => onClick(member)}
    >
      <div className="member-avatar" style={{ borderColor: member.color }}>
        <img 
          src={getImageSrc()} 
          alt={member.name}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div 
          className="fallback-avatar" 
          style={{ 
            display: 'none',
            backgroundColor: member.color,
            color: 'white'
          }}
        >
          {member.name?.[0] || '?'}
        </div>
      </div>
      <div className="member-info">
        <h5>{member.name}</h5>
        <p>{member.role}</p>
        <span className="member-archetype">{member.archetype}</span>
      </div>
      <div className="view-bio-hint">
        <User size={14} />
        <span>View Bio</span>
      </div>
    </div>
  );
};

export default TeamMemberCard; 