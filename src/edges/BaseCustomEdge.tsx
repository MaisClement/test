import React from 'react';
import { EdgeLabelRenderer, getBezierPath, EdgeProps } from '@xyflow/react';
import type { CftEdgeData, ApiEdgeData, CustomEdgeData, EdgeHeight, EdgeColor } from './types';
import { 
  CftLabel, 
  ApiLabel, 
  MqLabel, 
  KafkaPublisherLabel, 
  KafkaSubscriberLabel, 
  ManualLabel, 
  ExternalLabel 
} from './EdgeLabels';

interface BaseCustomEdgeProps extends Omit<EdgeProps, 'data'> {
  data?: CftEdgeData | ApiEdgeData | CustomEdgeData;
  height?: EdgeHeight;
  color?: EdgeColor;
  hasStartMarker?: boolean;
  hasEndMarker?: boolean;
  hasCenterLabel?: boolean;
  edgeType?: 'cft' | 'api' | 'mq' | 'kafka_pub' | 'kafka_sub' | 'manual' | 'external';
}

const getStrokeWidth = (height: EdgeHeight) => {
  switch (height) {
    case 'defaultr':
      return 6;
    case 'default':
      return 4;
    case 'default':
    default:
      return 2;
  }
};

const getColor = (color: EdgeColor) => {
  switch (color) {
    case 'red':
      return '#ef4444';
    case 'grey':
      return '#6b7280';
    case 'turquoise':
      return '#06b6d4';
    case 'purple':
      return '#8b5cf6';
    case 'yellow':
      return '#eab308';
    case 'green':
      return '#22c55e';
    default:
      return '#6b7280';
  }
};

export const BaseCustomEdge: React.FC<BaseCustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  height = 'default',
  color = 'grey',
  hasStartMarker = false,
  hasEndMarker = true,
  hasCenterLabel = false,
  edgeType,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const strokeColor = getColor(color);
  const strokeWidth = getStrokeWidth(height);

  const renderLabel = () => {
    if (!hasCenterLabel || !data) return null;

    switch (edgeType) {
      case 'cft': {
        const cftData = data as CftEdgeData;
        return (
          <CftLabel
            fromControlMJob={cftData.fromControlMJob}
            toControlM={cftData.toControlM}
            fromPath={cftData.fromPath}
            toPath={cftData.toPath}
          />
        );
      }
      case 'api': {
        const apiData = data as ApiEdgeData;
        return <ApiLabel usedEndpoints={apiData.usedEndpoints} />;
      }
      case 'mq':
        return <MqLabel />;
      case 'kafka_pub':
        return <KafkaPublisherLabel />;
      case 'kafka_sub':
        return <KafkaSubscriberLabel />;
      case 'manual':
        return <ManualLabel />;
      case 'external':
        return <ExternalLabel />;
      default:
        return data.centerLabel ? (
          <div
            style={{
              background: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              border: `1px solid ${strokeColor}`,
              color: strokeColor,
            }}
          >
            {data.centerLabel}
          </div>
        ) : null;
    }
  };

  return (
    <>
      <defs>
        {hasStartMarker && (
          <marker
            id={`start-marker-${id}`}
            markerWidth="8"
            markerHeight="8"
            refX="0"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0,0 0,8 8,4"
              fill={strokeColor}
            />
          </marker>
        )}
        {hasEndMarker && (
          <marker
            id={`end-marker-${id}`}
            markerWidth="8"
            markerHeight="8"
            refX="8"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0,0 0,8 8,4"
              fill={strokeColor}
            />
          </marker>
        )}
      </defs>
      <path
        id={id}
        style={{
          stroke: strokeColor,
          strokeWidth,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={hasEndMarker ? `url(#end-marker-${id})` : undefined}
        markerStart={hasStartMarker ? `url(#start-marker-${id})` : undefined}
      />
      {hasCenterLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              fontWeight: 700,
            }}
            className="nodrag nopan"
          >
            {renderLabel()}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
