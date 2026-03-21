import React from 'react';
import styles from '../styles/Dashboard.module.css';
import { formatUnits } from 'viem';

export const StatCard = ({ title, value, label }: { title: string, value: string | number, label: string }) => (
  <div className={styles.statCardCompact}>
    <div className={styles.statCardIcon}>📊</div>
    <div className={styles.statCardContent}>
      <div className={styles.statCardValue}>{value}</div>
      <div className={styles.statCardLabel}>{title}</div>
    </div>
  </div>
);

export const ActionCard = ({ 
  title, 
  description, 
  icon,
  inputs, 
  buttonText, 
  onAction, 
  actions,
  isLoading, 
  disabled,
  accent = 'primary'
}: { 
  title: string; 
  description: string; 
  icon?: string;
  inputs: { label: string, placeholder: string, type: string, value: string, onChange: (v: string) => void }[];
  buttonText?: string;
  onAction?: () => void;
  actions?: { text: string, onClick: () => void, variant?: 'primary' | 'danger' }[];
  isLoading?: boolean;
  disabled?: boolean;
  accent?: 'primary' | 'danger' | 'warning';
}) => (
  <div className={styles.card}>
    <div className={styles.actionCardHeader}>
      {icon && <span className={styles.actionIcon}>{icon}</span>}
      <div>
        <div className={styles.cardTitle}>{title}</div>
        <p className={styles.eventDetails}>{description}</p>
      </div>
    </div>
    <div className={styles.formArea}>
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
      <div className={styles.buttonContainer}>
        {actions ? (
          actions.map((action, idx) => (
            <button 
              key={idx}
              className={`${styles.button} ${action.variant === 'danger' ? styles.buttonDanger : ''}`} 
              onClick={action.onClick} 
              disabled={disabled || isLoading}
            >
              {isLoading ? 'Processing...' : action.text}
            </button>
          ))
        ) : (
          <button 
            className={`${styles.button} ${accent === 'danger' ? styles.buttonDanger : accent === 'warning' ? styles.buttonWarning : ''}`} 
            onClick={onAction} 
            disabled={disabled || isLoading}
          >
            {isLoading ? 'Processing...' : buttonText}
          </button>
        )}
      </div>
    </div>
  </div>
);

export const EventLogList = ({ events }: { events: any[] }) => (
  <div className={`${styles.card} ${styles.eventLog}`}>
    <div className={styles.cardTitle}>Real-time Activity Feed</div>
    <div className={styles.eventLogContent}>
      {events.length === 0 ? (
        <p className={styles.eventDetails}>No recent events detected. Watching for updates...</p>
      ) : (
        events.map((event, idx) => (
          <div key={idx} className={styles.eventItem}>
            <div>
              <span className={styles.eventName}>{event.eventName}</span>
              <div className={styles.eventDetails}>
                {Object.entries(event.args || {}).map(([key, val]: [string, any]) => (
                  <span key={key} className={styles.eventArg}>
                    {key}: {typeof val === 'bigint' ? formatUnits(val, 18) : String(val)}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.eventBlock}>
              Block {event.blockNumber?.toString()}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);
