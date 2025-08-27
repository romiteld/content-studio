import React, { useState } from 'react';
import {
  TrendingUp,
  FileText,
  Shield,
  Zap,
  Calendar,
  BarChart3,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  Settings,
  ChevronRight,
  Activity,
  Bot,
  Sparkles
} from 'lucide-react';
import '../styles/AIAgentsPanel.css';

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  status: 'idle' | 'working' | 'completed' | 'error';
  lastActivity?: string;
  tasks: number;
  successRate: number;
}

interface WorkflowStep {
  id: string;
  agent: string;
  action: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  output?: any;
}

const AGENTS: Agent[] = [
  {
    id: 'market-intel',
    name: 'Market Intelligence Analyst',
    role: 'Analyzes trends and compensation data',
    icon: TrendingUp,
    status: 'idle',
    tasks: 156,
    successRate: 98.5
  },
  {
    id: 'content-architect',
    name: 'Content Architect',
    role: 'Structures LinkedIn posts and campaigns',
    icon: FileText,
    status: 'idle',
    tasks: 89,
    successRate: 96.2
  },
  {
    id: 'visual-designer',
    name: 'Visual Designer',
    role: 'Creates visual specifications with Gemini 2.5',
    icon: Sparkles,
    status: 'idle',
    tasks: 124,
    successRate: 94.8
  },
  {
    id: 'compliance',
    name: 'Compliance Validator',
    role: 'Ensures regulatory compliance',
    icon: Shield,
    status: 'idle',
    tasks: 203,
    successRate: 100
  }
];

const WORKFLOW_TEMPLATES = [
  {
    id: 'talent-ticker',
    name: 'Daily Talent Ticker',
    description: 'Generate daily market updates',
    agents: ['market-intel', 'content-architect', 'compliance', 'visual-designer']
  },
  {
    id: 'partner-spotlight',
    name: 'Partner Firm Spotlight',
    description: 'Create partner feature content',
    agents: ['market-intel', 'content-architect', 'visual-designer', 'compliance']
  },
  {
    id: 'weekly-campaign',
    name: 'Weekly Content Campaign',
    description: 'Full week content generation',
    agents: ['market-intel', 'content-architect', 'visual-designer', 'compliance']
  }
];

export default function AIAgentsPanel() {
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  const startWorkflow = async (workflowId: string) => {
    const workflow = WORKFLOW_TEMPLATES.find(w => w.id === workflowId);
    if (!workflow) return;

    setSelectedWorkflow(workflowId);
    setIsRunning(true);

    // Initialize workflow steps
    const steps: WorkflowStep[] = workflow.agents.map((agentId, index) => ({
      id: `step-${index}`,
      agent: agentId,
      action: getAgentAction(agentId, workflowId),
      status: index === 0 ? 'active' : 'pending',
      output: undefined
    }));

    setWorkflowSteps(steps);

    // Simulate workflow execution
    for (let i = 0; i < steps.length; i++) {
      await executeStep(steps[i], i);
    }

    setIsRunning(false);
  };

  const getAgentAction = (agentId: string, workflowId: string): string => {
    const actions: { [key: string]: { [key: string]: string } } = {
      'market-intel': {
        'talent-ticker': 'Analyzing market trends for today',
        'partner-spotlight': 'Researching partner firm data',
        'weekly-campaign': 'Compiling weekly market insights'
      },
      'content-architect': {
        'talent-ticker': 'Structuring Talent Ticker post',
        'partner-spotlight': 'Creating spotlight narrative',
        'weekly-campaign': 'Planning content calendar'
      },
      'visual-designer': {
        'talent-ticker': 'Generating visual specifications',
        'partner-spotlight': 'Designing carousel layouts',
        'weekly-campaign': 'Creating visual templates'
      },
      'compliance': {
        'talent-ticker': 'Validating compliance',
        'partner-spotlight': 'Checking regulatory requirements',
        'weekly-campaign': 'Reviewing all content'
      }
    };

    return actions[agentId]?.[workflowId] || 'Processing';
  };

  const executeStep = async (step: WorkflowStep, index: number) => {
    // Update agent status
    setActiveAgentId(step.agent);
    setAgents(prev => prev.map(agent =>
      agent.id === step.agent
        ? { ...agent, status: 'working', lastActivity: 'Now' }
        : agent
    ));

    // Update step status
    setWorkflowSteps(prev => prev.map((s, i) =>
      i === index ? { ...s, status: 'active' } : s
    ));

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Complete step
    setWorkflowSteps(prev => prev.map((s, i) =>
      i === index 
        ? { ...s, status: 'completed', output: { success: true } }
        : i === index + 1
        ? { ...s, status: 'active' }
        : s
    ));

    // Update agent status
    setAgents(prev => prev.map(agent =>
      agent.id === step.agent
        ? { ...agent, status: 'completed', lastActivity: 'Just now' }
        : agent
    ));
  };

  const resetWorkflow = () => {
    setSelectedWorkflow(null);
    setWorkflowSteps([]);
    setIsRunning(false);
    setActiveAgentId(null);
    setAgents(AGENTS);
  };

  return (
    <div className="ai-agents-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="header-content">
          <Bot className="panel-icon" />
          <div>
            <h2>AI Agent Orchestration</h2>
            <p>Multi-agent workflow powered by Gemini 2.5 Flash</p>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat-card">
            <Activity className="stat-icon" />
            <div>
              <span className="stat-value">4</span>
              <span className="stat-label">Active Agents</span>
            </div>
          </div>
          <div className="stat-card">
            <CheckCircle className="stat-icon success" />
            <div>
              <span className="stat-value">572</span>
              <span className="stat-label">Tasks Completed</span>
            </div>
          </div>
          <div className="stat-card">
            <Zap className="stat-icon warning" />
            <div>
              <span className="stat-value">97.3%</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="panel-content">
        {/* Agents Grid */}
        <div className="agents-section">
          <h3 className="section-title">AI Agents</h3>
          <div className="agents-grid">
            {agents.map(agent => {
              const IconComponent = agent.icon;
              return (
                <div 
                  key={agent.id} 
                  className={`agent-card ${agent.status} ${activeAgentId === agent.id ? 'active' : ''}`}
                >
                  <div className="agent-header">
                    <IconComponent className="agent-icon" />
                    <div className={`agent-status-indicator ${agent.status}`}>
                      {agent.status === 'working' && <RefreshCw className="status-icon spinning" />}
                      {agent.status === 'completed' && <CheckCircle className="status-icon" />}
                      {agent.status === 'error' && <AlertCircle className="status-icon" />}
                    </div>
                  </div>
                  
                  <h4 className="agent-name">{agent.name}</h4>
                  <p className="agent-role">{agent.role}</p>
                  
                  <div className="agent-stats">
                    <div className="agent-stat">
                      <span className="stat-number">{agent.tasks}</span>
                      <span className="stat-text">Tasks</span>
                    </div>
                    <div className="agent-stat">
                      <span className="stat-number">{agent.successRate}%</span>
                      <span className="stat-text">Success</span>
                    </div>
                  </div>
                  
                  {agent.lastActivity && (
                    <div className="agent-activity">
                      Last active: {agent.lastActivity}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow Section */}
        <div className="workflow-section">
          <h3 className="section-title">Workflow Templates</h3>
          
          {!selectedWorkflow ? (
            <div className="workflow-templates">
              {WORKFLOW_TEMPLATES.map(template => (
                <div key={template.id} className="workflow-card">
                  <div className="workflow-info">
                    <h4>{template.name}</h4>
                    <p>{template.description}</p>
                    <div className="workflow-agents">
                      {template.agents.map((agentId, idx) => (
                        <span key={idx} className="workflow-agent-tag">
                          {AGENTS.find(a => a.id === agentId)?.name.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button 
                    className="workflow-start-btn"
                    onClick={() => startWorkflow(template.id)}
                    disabled={isRunning}
                  >
                    <Play className="btn-icon" />
                    Start Workflow
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="workflow-execution">
              <div className="execution-header">
                <h4>{WORKFLOW_TEMPLATES.find(w => w.id === selectedWorkflow)?.name}</h4>
                <div className="execution-controls">
                  {isRunning ? (
                    <button className="control-btn pause">
                      <Pause /> Pause
                    </button>
                  ) : (
                    <button className="control-btn reset" onClick={resetWorkflow}>
                      <RefreshCw /> Reset
                    </button>
                  )}
                </div>
              </div>
              
              <div className="workflow-steps">
                {workflowSteps.map((step, index) => (
                  <div key={step.id} className={`workflow-step ${step.status}`}>
                    <div className="step-indicator">
                      {step.status === 'completed' && <CheckCircle />}
                      {step.status === 'active' && <RefreshCw className="spinning" />}
                      {step.status === 'pending' && <span className="step-number">{index + 1}</span>}
                      {step.status === 'error' && <AlertCircle />}
                    </div>
                    
                    <div className="step-content">
                      <div className="step-agent">
                        {AGENTS.find(a => a.id === step.agent)?.name}
                      </div>
                      <div className="step-action">{step.action}</div>
                    </div>
                    
                    {index < workflowSteps.length - 1 && (
                      <ChevronRight className="step-arrow" />
                    )}
                  </div>
                ))}
              </div>
              
              {!isRunning && workflowSteps.every(s => s.status === 'completed') && (
                <div className="workflow-complete">
                  <CheckCircle className="complete-icon" />
                  <h4>Workflow Complete!</h4>
                  <p>All agents have successfully completed their tasks.</p>
                  <button className="view-results-btn">
                    View Generated Content
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action-btn">
          <Calendar /> Schedule Weekly Content
        </button>
        <button className="quick-action-btn">
          <MessageSquare /> Generate Talent Ticker
        </button>
        <button className="quick-action-btn">
          <BarChart3 /> Create Market Report
        </button>
        <button className="quick-action-btn">
          <Settings /> Configure Agents
        </button>
      </div>
    </div>
  );
}