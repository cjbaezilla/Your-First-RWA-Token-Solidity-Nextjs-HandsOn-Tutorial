import React, { useState } from 'react';
import styles from '../styles/Dashboard.module.css';
import { formatUnits } from 'viem';
import { ROLES } from '../hooks/useRwaToken';

export const StatCard = ({ title, value, label }: { title: string, value: string | number, label: string }) => (
  <div className={styles.card}>
    <div className={styles.cardTitle}>{title}</div>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

export const RoleSection = ({ rolesStatus }: { rolesStatus: Record<string, boolean> }) => (
  <div className={styles.card}>
    <div className={styles.cardTitle}>Your Roles & Permissions</div>
    <p className={styles.eventDetails}>Check which administrative roles you hold for this contract.</p>
    <div style={{ marginTop: '1rem' }}>
      {Object.entries(ROLES).map(([name, hash]) => (
        <div key={name} className={`${styles.roleBadge} ${rolesStatus[name] ? styles.active : ''}`}>
          {name} {rolesStatus[name] ? '✓' : '✗'}
        </div>
      ))}
    </div>
  </div>
);

export const ActionCard = ({ 
  title, 
  description, 
  inputs, 
  buttonText, 
  onAction, 
  actions,
  isLoading, 
  disabled,
  style
}: { 
  title: string, 
  description: string, 
  inputs: { label: string, placeholder: string, type: string, value: string, onChange: (v: string) => void }[],
  buttonText?: string,
  onAction?: () => void,
  actions?: { text: string, onClick: () => void, style?: React.CSSProperties, variant?: 'primary' | 'danger' }[],
  isLoading?: boolean,
  disabled?: boolean,
  style?: React.CSSProperties
}) => (
  <div className={styles.card} style={style}>
    <div className={styles.cardTitle}>{title}</div>
    <p className={styles.eventDetails} style={{ marginBottom: '1.5rem' }}>{description}</p>
    {inputs.map((input, idx) => (
      <div key={idx} className={styles.inputGroup}>
        <label>{input.label}</label>
        <input 
          className={styles.input} 
          type={input.type} 
          placeholder={input.placeholder} 
          value={input.value}
          onChange={(e) => input.onChange(e.target.value)}
        />
      </div>
    ))}
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {actions ? (
        actions.map((action, idx) => (
          <button 
            key={idx}
            className={`${styles.button}`} 
            onClick={action.onClick} 
            disabled={disabled || isLoading}
            style={{ 
              flex: 1, 
              background: action.variant === 'danger' ? 'var(--error)' : undefined,
              ...action.style 
            }}
          >
            {isLoading ? 'Processing...' : action.text}
          </button>
        ))
      ) : (
        <button 
          className={styles.button} 
          onClick={onAction} 
          disabled={disabled || isLoading}
          style={{ flex: 1 }}
        >
          {isLoading ? 'Processing...' : buttonText}
        </button>
      )}
    </div>
  </div>
);

export const EventLogList = ({ events }: { events: any[] }) => (
  <div className={`${styles.card} ${styles.eventLog}`}>
    <div className={styles.cardTitle}>Real-time Activity Feed</div>
    <div style={{ marginTop: '1rem' }}>
      {events.length === 0 ? (
        <p className={styles.eventDetails}>No recent events detected. Watching for updates...</p>
      ) : (
        events.map((event, idx) => (
          <div key={idx} className={styles.eventItem}>
            <div>
              <span className={styles.eventName}>{event.eventName}</span>
              <div className={styles.eventDetails}>
                {Object.entries(event.args || {}).map(([key, val]: [string, any]) => (
                  <span key={key} style={{ marginRight: '1rem' }}>
                    {key}: {typeof val === 'bigint' ? formatUnits(val, 18) : String(val)}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.eventDetails}>
              Block: {event.blockNumber?.toString()}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);
