import React from 'react';

interface EdgeTypeOption {
  type: string;
  label: string;
  description: string;
  color: string;
}

interface EdgeTypeSelectorProps {
  isOpen: boolean;
  onSelect: (edgeType: string) => void;
  onCancel: () => void;
  sourceNodeType?: string;
  targetNodeType?: string;
}

const edgeTypeOptions: EdgeTypeOption[] = [
  {
    type: 'cft',
    label: 'CFT Transfer',
    description: 'Transfert de fichiers via CFT',
    color: '#ff6b6b'
  },
  {
    type: 'mq',
    label: 'Message Queue',
    description: 'File de messages MQ',
    color: '#4ecdc4'
  },
  {
    type: 'api',
    label: 'API Integration',
    description: 'Intégration via API REST',
    color: '#45b7d1'
  },
  {
    type: 'kafka_pub',
    label: 'Kafka Publisher',
    description: 'Publication vers Kafka',
    color: '#9c27b0'
  },
  {
    type: 'kafka_sub',
    label: 'Kafka Subscriber',
    description: 'Souscription depuis Kafka',
    color: '#ffc107'
  },
  {
    type: 'manual',
    label: 'Manual Entry',
    description: 'Saisie manuelle',
    color: '#ff9800'
  },
  {
    type: 'external',
    label: 'External Entry',
    description: 'Entrée externe',
    color: '#8bc34a'
  }
];

export const EdgeTypeSelector: React.FC<EdgeTypeSelectorProps> = ({
  isOpen,
  onSelect,
  onCancel,
  sourceNodeType,
  targetNodeType
}) => {
  if (!isOpen) return null;

  // Filtrer les options en fonction du contexte de connexion
  const getAvailableOptions = (): EdgeTypeOption[] => {
    // Si on se connecte à un kafka-topic, seul kafka_pub est autorisé
    if (targetNodeType === 'kafka-topic') {
      return edgeTypeOptions.filter(option => option.type === 'kafka_pub');
    }
    
    // Si on part d'un kafka-topic, seul kafka_sub est autorisé
    if (sourceNodeType === 'kafka-topic') {
      return edgeTypeOptions.filter(option => option.type === 'kafka_sub');
    }
    
    // Sinon, toutes les options sont disponibles
    return edgeTypeOptions;
  };

  const availableOptions = getAvailableOptions();

  const handleSelect = (edgeType: string) => {
    onSelect(edgeType);
  };

  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto'
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    textAlign: 'center',
    color: '#333'
  };

  const optionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    margin: '8px 0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '2px solid transparent'
  };

  const colorIndicatorStyle = (color: string): React.CSSProperties => ({
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: color,
    marginRight: '12px',
    flexShrink: 0
  });

  const labelStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '16px',
    marginBottom: '4px'
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.3'
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '20px',
    gap: '12px'
  };

  const cancelButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  };

  return (
    <div style={modalStyle} onClick={onCancel}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>Sélectionnez le type d'edge</div>
        
        {/* Afficher un message d'information si des restrictions s'appliquent */}
        {(targetNodeType === 'kafka-topic' || sourceNodeType === 'kafka-topic') && (
          <div style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#1976d2'
          }}>
            {targetNodeType === 'kafka-topic' && 
              '💡 Seuls les edges "Kafka Publisher" peuvent se connecter à un Kafka Topic'}
            {sourceNodeType === 'kafka-topic' && 
              '💡 Seuls les edges "Kafka Subscriber" peuvent partir d\'un Kafka Topic'}
          </div>
        )}
        
        {availableOptions.map((option) => (
          <div
            key={option.type}
            style={optionStyle}
            onClick={() => handleSelect(option.type)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.borderColor = option.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={colorIndicatorStyle(option.color)} />
            <div>
              <div style={labelStyle}>{option.label}</div>
              <div style={descriptionStyle}>{option.description}</div>
            </div>
          </div>
        ))}
        
        <div style={buttonContainerStyle}>
          <button style={cancelButtonStyle} onClick={onCancel}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};
