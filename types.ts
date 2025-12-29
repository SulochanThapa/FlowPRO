
export enum NodeType {
  START = 'START',
  HTTP_REQUEST = 'HTTP_REQUEST',
  APPROVAL = 'APPROVAL',
  CONDITION = 'CONDITION',
  SWITCH = 'SWITCH',
  DELAY = 'DELAY',
  SCRIPT = 'SCRIPT',
  END = 'END'
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface WorkflowStatus {
  id: string;
  code: string;
  label: string;
  color: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  position: NodePosition;
  data: {
    description?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url?: string;
    headers?: string;
    body?: string;
    assignee?: string;
    expiry?: string;
    outcomes?: string[];
    notificationConfig?: {
      enableEmail: boolean;
      enableSms: boolean;
      templateId?: string;
      customMessage?: string;
    };
    condition?: string;
    discriminator?: string;
    script?: string;
    lifecycleHooks?: {
      onEnterUrl?: string;
      onEnterMethod?: 'POST' | 'PUT' | 'PATCH';
      targetStatus?: string; // Links to a WorkflowStatus code
      syncPayload?: string; 
    };
    retries?: number;
    timeout?: number;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Workflow {
  id: string;
  name: string;
  triggerEvent: string;
  statusRegistry: WorkflowStatus[]; // List of possible DB statuses
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ConnectionState {
  sourceId: string;
  mouseX: number;
  mouseY: number;
}
