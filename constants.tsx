
import React from 'react';
import { 
  Play, 
  Globe, 
  UserCheck, 
  GitBranch, 
  Clock, 
  Code, 
  Flag,
  GitMerge
} from 'lucide-react';
import { NodeType } from './types';

export const NODE_CONFIG = {
  [NodeType.START]: {
    color: 'bg-emerald-500',
    icon: <Play className="w-4 h-4 text-white" />,
    label: 'Trigger / Event'
  },
  [NodeType.HTTP_REQUEST]: {
    color: 'bg-indigo-600',
    icon: <Globe className="w-4 h-4 text-white" />,
    label: 'API Request'
  },
  [NodeType.APPROVAL]: {
    color: 'bg-amber-500',
    icon: <UserCheck className="w-4 h-4 text-white" />,
    label: 'Human Approval'
  },
  [NodeType.CONDITION]: {
    color: 'bg-purple-500',
    icon: <GitBranch className="w-4 h-4 text-white" />,
    label: 'Boolean Branch'
  },
  [NodeType.SWITCH]: {
    color: 'bg-pink-600',
    icon: <GitMerge className="w-4 h-4 text-white" />,
    label: 'Switch / Case'
  },
  [NodeType.DELAY]: {
    color: 'bg-slate-500',
    icon: <Clock className="w-4 h-4 text-white" />,
    label: 'Delay / Timer'
  },
  [NodeType.SCRIPT]: {
    color: 'bg-sky-500',
    icon: <Code className="w-4 h-4 text-white" />,
    label: 'Custom Script'
  },
  [NodeType.END]: {
    color: 'bg-rose-500',
    icon: <Flag className="w-4 h-4 text-white" />,
    label: 'Process End'
  }
};
