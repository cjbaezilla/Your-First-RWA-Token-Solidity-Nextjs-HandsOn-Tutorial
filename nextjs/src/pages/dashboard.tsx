import type { NextPage } from 'next';
import Head from 'next/head';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useMemo } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { useRwaToken, ROLES } from '../hooks/useRwaToken';
import { StatCard, ActionCard, EventLogList } from '../components/DashboardComponents';
import styles from '../styles/Dashboard.module.css';

type TabType = 'overview' | 'transfer' | 'mint' | 'burn' | 'admin' | 'activity';

const Dashboard: NextPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    useTokenBalance,
    useTokenSupply,
    useIsUserAllowed,
    usePaused,
    useFrozenAmount,
    useHasRole,
    useTokenDecimals,
    mint,
    freeze,
    allowUser,
    disallowUser,
    pause,
    unpause,
    forcedTransfer,
    transfer,
    burn,
    burnFrom,
    approve,
    transferFrom,
    events,
    isWritePending,
    isConfirming,
    userAddress
  } = useRwaToken();

  // Form states
  const [formData, setFormData] = useState({
    // Transfer
    transferTo: '',
    transferAmount: '',
    // Approve
    approveSpender: '',
    approveAmount: '',
    // Burn
    burnAmount: '',
    // Mint
    mintTo: '',
    mintAmount: '',
    // Freeze
    freezeUser: '',
    freezeAmount: '',
    // Allowlist
    allowAddr: '',
    // Burn From
    burnFromAddr: '',
    burnFromAmount: '',
    // Transfer From
    tFromFrom: '',
    tFromTo: '',
    tFromAmount: '',
    // Forced Transfer
    forcedFrom: '',
    forcedTo: '',
    forcedAmount: ''
  });

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Fetch data
  const { data: balance } = useTokenBalance(userAddress);
  const { data: supply } = useTokenSupply();
  const { data: isPaused } = usePaused();
  const { data: isAllowed } = useIsUserAllowed(userAddress);
  const { data: frozenAmt } = useFrozenAmount(userAddress);
  const { data: tokenDecimals } = useTokenDecimals();

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
  }), [hasAdmin, hasPauser, hasMinter, hasFreezer, hasRecovery]);

  const decimals = tokenDecimals ?? 18n;

  const formatAmount = (value: bigint | undefined | null) => {
    if (!value) return '0';
    return formatUnits(value, Number(decimals));
  };

  const parseAmount = (value: string) => {
    return parseUnits(value, Number(decimals));
  };

  const canMint = hasMinter || hasAdmin;
  const canFreeze = hasFreezer || hasAdmin;
  const canManageAllowlist = hasLimiter || hasAdmin;
  const canRecover = hasRecovery || hasAdmin;
  const canPause = hasAdmin || hasPauser;

  const sidebarNav = [
    { id: 'overview' as TabType, label: 'Overview', icon: '📊' },
    { id: 'transfer' as TabType, label: 'Transfer', icon: '💸' },
    { id: 'mint' as TabType, label: 'Mint', icon: '🪙', show: canMint },
    { id: 'burn' as TabType, label: 'Burn', icon: '🔥' },
    { id: 'admin' as TabType, label: 'Admin', icon: '🔐', show: canMint || canFreeze || canManageAllowlist || canRecover },
    { id: 'activity' as TabType, label: 'Activity', icon: '📋' },
  ].filter(item => item.show !== false);

  return (
    <div className={styles.dashboardContainer}>
      <Head>
        <title>RWA Token Dashboard</title>
      </Head>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>◇</span>
            {!sidebarCollapsed && <span className={styles.logoText}>1stRWA</span>}
          </div>
          <button 
            className={styles.sidebarToggle}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {sidebarNav.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!sidebarCollapsed && <span className={styles.navLabel}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <ConnectButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <div>
            <h1 className={styles.pageTitle}>
              {sidebarNav.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className={styles.pageSubtitle}>
              {isPaused ? '⚠️ Contract is paused' : 'System operational'}
            </p>
          </div>
             <div className={styles.headerStats}>
               <div className={styles.headerStat}>
                 <span className={styles.headerStatValue}>
                   {formatAmount(supply)} RWA
                 </span>
                 <span className={styles.headerStatLabel}>Total Supply</span>
               </div>
               <div className={styles.headerStat}>
                 <span className={styles.headerStatValue}>
                   {formatAmount(balance)} RWA
                 </span>
                 <span className={styles.headerStatLabel}>Your Balance</span>
               </div>
             </div>
        </div>

        <div className={styles.contentBody}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className={styles.overviewGrid}>
              <div className={styles.quickStats}>
                <div className={styles.statCardCompact}>
                  <div className={styles.statCardIcon}>💰</div>
                 <div className={styles.statCardContent}>
                     <div className={styles.statCardValue}>
                       {formatAmount(balance)} RWA
                     </div>
                     <div className={styles.statCardLabel}>Your Balance</div>
                   </div>
                </div>
                <div className={styles.statCardCompact}>
                  <div className={styles.statCardIcon}>📈</div>
                 <div className={styles.statCardContent}>
                     <div className={styles.statCardValue}>
                       {formatAmount(supply)} RWA
                     </div>
                     <div className={styles.statCardLabel}>Total Supply</div>
                   </div>
                </div>
                <div className={`${styles.statCardCompact} ${isPaused ? styles.statCardWarning : styles.statCardSuccess}`}>
                  <div className={styles.statCardIcon}>{isPaused ? '⏸️' : '▶️'}</div>
                  <div className={styles.statCardContent}>
                    <div className={styles.statCardValue}>
                      {isPaused ? 'Paused' : 'Active'}
                    </div>
                    <div className={styles.statCardLabel}>Contract Status</div>
                  </div>
                </div>
              </div>

              <div className={styles.accountStatus}>
                <div className={styles.statusHeader}>
                  <h3>Account Status</h3>
                  <div className={`${styles.statusBadge} ${isAllowed ? styles.statusBadgeAllowed : styles.statusBadgeRestricted}`}>
                    {isAllowed ? '✓ Allowed' : '⛔ Restricted'}
                  </div>
                </div>
                <div className={styles.statusDetails}>
                   <div className={styles.statusRow}>
                     <span>Frozen Amount:</span>
                     <span className={styles.statusValue}>
                       {formatAmount(frozenAmt)} RWA
                     </span>
                   </div>
                  <div className={styles.statusMessage}>
                    {isAllowed 
                      ? 'Your account is approved and can perform token transfers.'
                      : 'You cannot transfer tokens until an admin with LIMITER role approves your address.'
                    }
                  </div>
                </div>
                {canPause && (
                  <button
                    className={`${styles.emergencyButton} ${isPaused ? styles.unpauseButton : styles.pauseButton}`}
                    onClick={() => isPaused ? unpause() : pause()}
                    disabled={isWritePending || isConfirming}
                  >
                    {isPaused ? '▶️ Resume Operations' : '⏸️ Emergency Pause'}
                  </button>
                )}
              </div>

              <div className={styles.rolesPanel}>
                <h3>Your Roles</h3>
                <div className={styles.rolesGrid}>
                  {Object.entries(ROLES).map(([name, hash]) => (
                    <div 
                      key={name} 
                      className={`${styles.roleBadge} ${rolesStatus[name] ? styles.roleBadgeActive : ''}`}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transfer Tab */}
          {activeTab === 'transfer' && (
            <div className={styles.actionsGrid}>
              <ActionCard
                title="Quick Transfer"
                description="Send tokens to any address"
                icon="💸"
                inputs={[
                  { label: 'Recipient Address', placeholder: '0x...', type: 'text', value: formData.transferTo, onChange: (v) => updateFormData('transferTo', v) },
                  { label: 'Amount (RWA)', placeholder: '0.0', type: 'number', value: formData.transferAmount, onChange: (v) => updateFormData('transferAmount', v) },
                ]}
                 buttonText="Transfer"
                 onAction={() => transfer(formData.transferTo, parseAmount(formData.transferAmount))}
                isLoading={isWritePending || isConfirming}
                disabled={!isAllowed}
              />

              <ActionCard
                title="Approve Spender"
                description="Allow another address to spend your tokens"
                icon="✅"
                inputs={[
                  { label: 'Spender Address', placeholder: '0x...', type: 'text', value: formData.approveSpender, onChange: (v) => updateFormData('approveSpender', v) },
                  { label: 'Amount (RWA)', placeholder: '0.0', type: 'number', value: formData.approveAmount, onChange: (v) => updateFormData('approveAmount', v) },
                ]}
                 buttonText="Approve"
                 onAction={() => approve(formData.approveSpender, parseAmount(formData.approveAmount))}
                isLoading={isWritePending || isConfirming}
              />

              <ActionCard
                title="Transfer From"
                description="Transfer tokens from another account (requires allowance)"
                icon="🔄"
                inputs={[
                  { label: 'From Address', placeholder: '0x...', type: 'text', value: formData.tFromFrom, onChange: (v) => updateFormData('tFromFrom', v) },
                  { label: 'To Address', placeholder: '0x...', type: 'text', value: formData.tFromTo, onChange: (v) => updateFormData('tFromTo', v) },
                  { label: 'Amount (RWA)', placeholder: '0.0', type: 'number', value: formData.tFromAmount, onChange: (v) => updateFormData('tFromAmount', v) },
                ]}
                 buttonText="Transfer From"
                 onAction={() => transferFrom(formData.tFromFrom, formData.tFromTo, parseAmount(formData.tFromAmount))}
                isLoading={isWritePending || isConfirming}
              />
            </div>
          )}

          {/* Mint Tab */}
          {activeTab === 'mint' && canMint && (
            <div className={styles.actionsGrid}>
              <ActionCard
                title="Mint New Tokens"
                description="Create new tokens and send to an address"
                icon="🪙"
                accent="primary"
                inputs={[
                  { label: 'Recipient Address', placeholder: '0x...', type: 'text', value: formData.mintTo, onChange: (v) => updateFormData('mintTo', v) },
                  { label: 'Amount (RWA)', placeholder: '0.0', type: 'number', value: formData.mintAmount, onChange: (v) => updateFormData('mintAmount', v) },
                ]}
                 buttonText="Mint Tokens"
                 onAction={() => mint(formData.mintTo, parseAmount(formData.mintAmount))}
                isLoading={isWritePending || isConfirming}
              />
            </div>
          )}

          {/* Burn Tab */}
          {activeTab === 'burn' && (
            <div className={styles.actionsGrid}>
              <ActionCard
                title="Burn Your Tokens"
                description="Permanently destroy your own tokens"
                icon="🔥"
                accent="danger"
                inputs={[
                  { label: 'Amount to Burn', placeholder: '0.0', type: 'number', value: formData.burnAmount, onChange: (v) => updateFormData('burnAmount', v) },
                ]}
                 buttonText="Burn Tokens"
                 onAction={() => burn(parseAmount(formData.burnAmount))}
                isLoading={isWritePending || isConfirming}
              />

              <ActionCard
                title="Burn From Address"
                description="Burn tokens from another account (requires allowance)"
                icon="🔥"
                accent="danger"
                inputs={[
                  { label: 'Account Address', placeholder: '0x...', type: 'text', value: formData.burnFromAddr, onChange: (v) => updateFormData('burnFromAddr', v) },
                  { label: 'Amount to Burn', placeholder: '0.0', type: 'number', value: formData.burnFromAmount, onChange: (v) => updateFormData('burnFromAmount', v) },
                ]}
                 buttonText="Burn From"
                 onAction={() => burnFrom(formData.burnFromAddr, parseAmount(formData.burnFromAmount))}
                isLoading={isWritePending || isConfirming}
              />
            </div>
          )}

          {/* Admin Tab */}
          {activeTab === 'admin' && (canMint || canFreeze || canManageAllowlist || canRecover) && (
            <div className={styles.actionsGrid}>
              {canManageAllowlist && (
                <ActionCard
                  title="Manage Allowlist"
                  description="Control which users can transact"
                  icon="📋"
                  inputs={[
                    { label: 'Address', placeholder: '0x...', type: 'text', value: formData.allowAddr, onChange: (v) => updateFormData('allowAddr', v) },
                  ]}
                  actions={[
                    { text: 'Allow User', onClick: () => allowUser(formData.allowAddr), variant: 'primary' },
                    { text: 'Disallow User', onClick: () => disallowUser(formData.allowAddr), variant: 'danger' },
                  ]}
                  isLoading={isWritePending || isConfirming}
                />
              )}

              {canFreeze && (
                <ActionCard
                  title="Freeze Balance"
                  description="Lock tokens in a user's account"
                  icon="❄️"
                  accent="warning"
                  inputs={[
                    { label: 'User Address', placeholder: '0x...', type: 'text', value: formData.freezeUser, onChange: (v) => updateFormData('freezeUser', v) },
                    { label: 'Amount to Freeze', placeholder: '0.0', type: 'number', value: formData.freezeAmount, onChange: (v) => updateFormData('freezeAmount', v) },
                  ]}
                   buttonText="Set Frozen Amount"
                   onAction={() => freeze(formData.freezeUser, parseAmount(formData.freezeAmount))}
                  isLoading={isWritePending || isConfirming}
                />
              )}

              {canRecover && (
                <ActionCard
                  title="Recovery Transfer"
                  description="Forcefully transfer tokens between accounts"
                  icon="🛡️"
                  accent="danger"
                  inputs={[
                    { label: 'From Address', placeholder: '0x...', type: 'text', value: formData.forcedFrom, onChange: (v) => updateFormData('forcedFrom', v) },
                    { label: 'To Address', placeholder: '0x...', type: 'text', value: formData.forcedTo, onChange: (v) => updateFormData('forcedTo', v) },
                    { label: 'Amount (RWA)', placeholder: '0.0', type: 'number', value: formData.forcedAmount, onChange: (v) => updateFormData('forcedAmount', v) },
                  ]}
                   buttonText="Execute Transfer"
                   onAction={() => forcedTransfer(formData.forcedFrom, formData.forcedTo, parseAmount(formData.forcedAmount))}
                  isLoading={isWritePending || isConfirming}
                />
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className={styles.activityContainer}>
              <EventLogList events={events} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
