import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Zap, Copy, LogOut, AlertTriangle } from 'lucide-react';

const ConnectWallet = ({ currentJudge }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Ready state check
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              // Not connected state - Gradient Connect Button
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="connect-wallet-btn"
                  >
                    <Zap size={20} />
                    Connect Wallet
                  </button>
                );
              }

              // Wrong network state
              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="connect-wallet-btn error"
                  >
                    <AlertTriangle size={20} />
                    Wrong Network
                  </button>
                );
              }

              // Connected state - Custom wallet modal trigger
              return (
                <div className="wallet-container">
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="wallet-connected-btn"
                    style={{
                      '--judge-color': currentJudge?.color || '#00D2E9',
                      '--judge-color-rgb': currentJudge?.color 
                        ? `${parseInt(currentJudge.color.slice(1, 3), 16)}, ${parseInt(currentJudge.color.slice(3, 5), 16)}, ${parseInt(currentJudge.color.slice(5, 7), 16)}`
                        : '0, 210, 233'
                    }}
                  >
                    <div className="wallet-avatar">
                      <div className="avatar-gradient"></div>
                      <span>{account.displayName}</span>
                    </div>
                    <div 
                      className="wallet-balance"
                      style={{ 
                        color: currentJudge?.color || '#00D2E9' 
                      }}
                    >
                      {account.displayBalance}
                    </div>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectWallet; 