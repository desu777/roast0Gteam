import React, { useState } from 'react';
import { Swords, ChevronDown, ChevronUp } from 'lucide-react';

const ParticipantsList = ({ participants }) => {
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  
  // Calculate how many participants to show
  const maxVisible = 4;
  const visibleParticipants = showAllParticipants 
    ? participants 
    : participants.slice(0, maxVisible);

  if (participants.length === 0) {
    return null;
  }

  return (
    <div className="live-participants">
      <h4><Swords size={18} className="inline-icon" /> Roasters in Battle ({participants.length})</h4>
      <div className="participants-grid">
        {visibleParticipants.map((participant, index) => (
          <div key={index} className={`participant-card ${participant.isUser ? 'user-participant' : ''}`}>
            <div className="participant-address">
              {participant.address ? (
                <a 
                  href={`https://chainscan-galileo.0g.ai/address/${participant.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="address-link"
                  title={`View ${participant.address} on chain scanner`}
                >
                  {`${participant.address.slice(0, 6)}...${participant.address.slice(-4)}`}
                </a>
              ) : (
                'Anonymous'
              )}
              {participant.isUser && <span className="you-badge">YOU</span>}
            </div>
          </div>
        ))}
      </div>
      
      {participants.length > maxVisible && (
        <button 
          className="show-more-btn"
          onClick={() => setShowAllParticipants(!showAllParticipants)}
        >
          {showAllParticipants ? (
            <>
              <ChevronUp size={16} />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show More ({participants.length - maxVisible} more)
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ParticipantsList; 