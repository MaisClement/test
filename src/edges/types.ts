export interface CustomEdgeData {
  label?: string;
  requiredFields?: string[];
  centerLabel?: string;
  startLabel?: string;
  endLabel?: string;
}

export interface CftEdgeData extends CustomEdgeData {
  fromControlMJob?: string;
  toControlM?: string;
  fromPath?: string;
  toPath?: string;
}

export interface ApiEdgeData extends CustomEdgeData {
  usedEndpoints?: string[];
}

export type EdgeHeight = 'default' | 'default' | 'defaultr';
export type EdgeColor = 'red' | 'grey' | 'turquoise' | 'purple' | 'yellow' | 'green';
