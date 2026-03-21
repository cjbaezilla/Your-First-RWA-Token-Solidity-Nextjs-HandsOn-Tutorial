import type { NextPage } from 'next';
import Head from 'next/head';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useMemo } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { useRwaToken, ROLES } from '../hooks/useRwaToken';
import { StatCard, RoleSection, ActionCard, EventLogList } from '../components/DashboardComponents';
import styles from '../styles/Dashboard.module.css';

const Dashboard: NextPage = () => {
  const {
    useTokenBalance,
    useTokenSupply,
    useIsUserAllowed,
    usePaused,
    useFrozenAmount,
    useHasRole,
    mint,
    freeze,
    allowUser,
    disallowUser,
    pause,
    unpause,
    forcedTransfer,
    transfer,
    events,
    isWritePending,
    isConfirming,
    userAddress
  } = useRwaToken();

  // State for forms
  const [mintTo, setMintTo] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [freezeUser, setFreezeUser] = useState('');
  const [freezeAmount, setFreezeAmount] = useState('');
  const [allowAddr, setAllowAddr] = useState('');
  const [disallowAddr, setDisallowAddr] = useState('');
  const [forcedFrom, setForcedFrom] = useState('');
  const [forcedTo, setForcedTo] = useState('');
  const [forcedAmount, setForcedAmount] = useState('');

  // Fetch data
  const { data: balance } = useTokenBalance(userAddress);
  const { data: supply } = useTokenSupply();
  const { data: isPaused } = usePaused();
  const { data: isAllowed } = useIsUserAllowed(userAddress);
  const { data: frozenAmt } = useFrozenAmount(userAddress);

  // Check roles
  const { data: hasAdmin } = useHasRole(ROLES.ADMIN, userAddress);
  const { data: hasPauser } = useHasRole(ROLES.PAUSER, userAddress);
  const { data: hasMinter } = useHasRole(ROLES.MINTER, userAddress);
  const { data: hasFreezer } = useHasRole(ROLES.FREEZER, userAddress);
  const { data: hasLimiter } = useHasRole(ROLES.LIMITER, userAddress);
  const { data: hasRecovery } = useHasRole(ROLES.RECOVERY, userAddress);

  const rolesStatus = useMemo(() => ({
    ADMIN: !!hasAdmin,
    PAUSER: !!hasPauser,
    MINTER: !!hasMinter,
    FREEZER: !!hasFreezer,
    LIMITER: !!hasLimiter,
    RECOVERY: !!hasRecovery,
  }), [hasAdmin, hasPauser, hasMinter, hasFreezer, hasLimiter, hasRecovery]);

  return (
    <div className={styles.dashboardContainer}>
      <Head>
        <title>RWA Token Dashboard</title>
      </Head>

      <header className={styles.header}>
        <h1 className={styles.title}>1stRWA Dashboard</h1>
        <ConnectButton />
      </header>

      <div className={styles.grid}>
        {/* Statistics Section */}
        <StatCard 
          title="Total Supply" 
          value={supply ? formatUnits(supply as bigint, 18) : '0'} 
          label="1stRWA Tokens" 
        />
        <StatCard 
          title="Your Balance" 
          value={balance ? formatUnits(balance as bigint, 18) : '0'} 
          label="Available" 
        />
        <StatCard 
          title="Status" 
          value={isPaused ? 'PAUSED' : 'ACTIVE'} 
          label={isPaused ? 'Transfers Disabled' : 'Normal Operations'} 
        />

        {/* Roles Section */}
        <RoleSection rolesStatus={rolesStatus} />

        {/* Personal Stats Section */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Account Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className={styles.eventDetails}>
              Restriction: <span style={{ color: isAllowed ? '#4ade80' : '#f87171' }}>
                {isAllowed ? 'ALLOWED' : 'RESTRICTED'}
              </span>
            </div>
            <div className={styles.eventDetails}>
              Frozen Amount: {frozenAmt ? formatUnits(frozenAmt as bigint, 18) : '0'} 1stRWA
            </div>
          </div>
        </div>

        {/* Global Controls (Admin/Pauser) */}
        {(hasAdmin || hasPauser) && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Global Controls</div>
            <p className={styles.eventDetails}>Emergency functions to stop or resume all token activities.</p>
            <button 
              className={styles.button} 
              onClick={() => isPaused ? unpause() : pause()}
              disabled={isWritePending || isConfirming}
              style={{ background: isPaused ? 'var(--success)' : 'var(--error)' }}
            >
              {isPaused ? 'Unpause Contract' : 'Pause Contract'}
            </button>
          </div>
        )}

        {/* Specialized Actions */}
        {hasMinter && (
          <ActionCard 
            title="Mint Tokens"
            description="Create new tokens and send them to a specific address."
            inputs={[
              { label: 'Recipient Address', placeholder: '0x...', type: 'text', value: mintTo, onChange: setMintTo },
              { label: 'Amount', placeholder: '0.0', type: 'number', value: mintAmount, onChange: setMintAmount },
            ]}
            buttonText="Mint 1stRWA"
            onAction={() => mint(mintTo, parseUnits(mintAmount, 18))}
            isLoading={isWritePending || isConfirming}
          />
        )}

        {hasFreezer && (
          <ActionCard 
            title="Freeze Balance"
            description="Lock a specific amount of tokens in a user's account."
            inputs={[
              { label: 'User Address', placeholder: '0x...', type: 'text', value: freezeUser, onChange: setFreezeUser },
              { label: 'Amount to Freeze', placeholder: '0.0', type: 'number', value: freezeAmount, onChange: setFreezeAmount },
            ]}
            buttonText="Set Frozen Amount"
            onAction={() => freeze(freezeUser, parseUnits(freezeAmount, 18))}
            isLoading={isWritePending || isConfirming}
          />
        )}

        {hasLimiter && (
          <ActionCard 
            title="Manage Allowlist"
            description="Control which users are allowed to transact with the token."
            inputs={[
              { label: 'Address', placeholder: '0x...', type: 'text', value: allowAddr, onChange: setAllowAddr },
            ]}
            buttonText="Allow User"
            onAction={() => allowUser(allowAddr)}
            isLoading={isWritePending || isConfirming}
          />
        )}

        {hasRecovery && (
          <ActionCard 
            title="Recovery Transfer"
            description="Forcefully transfer tokens from one account to another (Clawback)."
            inputs={[
              { label: 'From Address', placeholder: '0x...', type: 'text', value: forcedFrom, onChange: setForcedFrom },
              { label: 'To Address', placeholder: '0x...', type: 'text', value: forcedTo, onChange: setForcedTo },
              { label: 'Amount', placeholder: '0.0', type: 'number', value: forcedAmount, onChange: setForcedAmount },
            ]}
            buttonText="Execute Forced Transfer"
            onAction={() => forcedTransfer(forcedFrom, forcedTo, parseUnits(forcedAmount, 18))}
            isLoading={isWritePending || isConfirming}
            style={{ border: '2px solid var(--error)' }}
          />
        )}

        {/* Real-time Events feed */}
        <EventLogList events={events} />
      </div>

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        <p>Real World Asset Token Management System</p>
        <p style={{ marginTop: '0.5rem' }}>Contract: 0x4AA...6aB4</p>
      </footer>
    </div>
  );
};

export default Dashboard;
