import React from 'react';

export interface CenterLabelProps {
  label: string;
  color: string;
  backgroundColor?: string;
}

export const CenterLabel: React.FC<CenterLabelProps> = ({ 
  label, 
  color, 
  backgroundColor = 'white' 
}) => {
  return (
    <div
      style={{
        background: backgroundColor,
        padding: '4px 8px',
        borderRadius: '4px',
        border: `1px solid ${color}`,
        color: color,
        fontSize: '12px',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  );
};

export interface CftLabelProps {
  fromControlMJob?: string;
  toControlM?: string;
  fromPath?: string;
  toPath?: string;
}

export const CftLabel: React.FC<CftLabelProps> = ({
  fromControlMJob,
  toControlM,
  fromPath,
  toPath,
}) => {
  const fields = [
    fromControlMJob && `From Job: ${fromControlMJob}`,
    toControlM && `To Control-M: ${toControlM}`,
    fromPath && `From: ${fromPath}`,
    toPath && `To: ${toPath}`,
  ].filter(Boolean);

  const displayText = fields.length > 0 ? fields.join(' | ') : 'CFT Transfer';

  return (
    <CenterLabel 
      label={displayText} 
      color="#ef4444" 
    />
  );
};

export interface ApiLabelProps {
  usedEndpoints?: string[];
}

export const ApiLabel: React.FC<ApiLabelProps> = ({ usedEndpoints }) => {
  const displayText = usedEndpoints && usedEndpoints.length > 0 
    ? `Endpoints: ${usedEndpoints.join(', ')}`
    : 'API Call';

  return (
    <CenterLabel 
      label={displayText} 
      color="#06b6d4" 
    />
  );
};

export const MqLabel: React.FC = () => {
  return (
    <CenterLabel 
      label="MQ Message" 
      color="#6b7280" 
    />
  );
};

export const KafkaPublisherLabel: React.FC = () => {
  return (
    <CenterLabel 
      label="Kafka Publisher" 
      color="#8b5cf6" 
    />
  );
};

export const KafkaSubscriberLabel: React.FC = () => {
  return (
    <CenterLabel 
      label="Kafka Subscriber" 
      color="#eab308" 
    />
  );
};

export const ManualLabel: React.FC = () => {
  return (
    <CenterLabel 
      label="Manual Entry" 
      color="#ef4444" 
    />
  );
};

export const ExternalLabel: React.FC = () => {
  return (
    <CenterLabel 
      label="External Entry" 
      color="#22c55e" 
    />
  );
};
