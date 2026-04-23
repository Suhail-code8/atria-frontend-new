import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  MiniMap,
  useNodesState,
  useEdgesState,
  updateEdge,
  BackgroundVariant,
  type ReactFlowInstance
} from "reactflow";
import "reactflow/dist/style.css";
import { eventsApi } from "../../../api/events.api";
import { competitionApi } from "../../../api/competition.api";
import { Button } from "../../../components/ui/Button";
import {
  Save, CreditCard, Users, Upload, ClipboardList,
  Trophy, Star, Megaphone, CheckCircle2, Info, ToggleLeft, ToggleRight, Settings2
} from "lucide-react";
import CustomNode, { type ModuleType } from "../../../components/workflow/CustomNode";
import { ConfigPanel } from "../../../components/workflow/ConfigPanel";
import { FeatureConfigModal } from "../../../components/workflow/FeatureConfigModal";

// ─── Module Classification ────────────────────────────────────────────────────

const ONBOARDING_MODULES = [
  { type: 'REGISTRATION',  label: 'Registration',  description: 'Collect participant info', icon: <ClipboardList size={18} /> },
  { type: 'PAYMENT',       label: 'Payment',        description: 'Process entry fees',      icon: <CreditCard size={18} />    },
  { type: 'TEAM_FORMATION',label: 'Team Formation', description: 'Group participants',       icon: <Users size={18} />         },
  { type: 'SUBMISSION',    label: 'Submission',     description: 'Collect project files',   icon: <Upload size={18} />        },
];

const FEATURE_MODULES = [
  {
    key: 'leaderboard' as const,
    label: 'Leaderboard',
    description: 'Live rankings for participants',
    icon: <Trophy size={16} />,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
  },
  {
    key: 'judgingFeedback' as const,
    label: 'Judging Feedback',
    description: 'Show scoring & judge comments',
    icon: <Star size={16} />,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-200',
  },
  {
    key: 'teamHub' as const,
    label: 'Team Hub',
    description: 'Team management & collaboration',
    icon: <Users size={16} />,
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200',
  },
  {
    key: 'announcements' as const,
    label: 'Announcements',
    description: 'Event updates feed',
    icon: <Megaphone size={16} />,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
  },
];

type FeatureKey = 'leaderboard' | 'judgingFeedback' | 'teamHub' | 'announcements';

interface FeatureModules {
  leaderboard:     { enabled: boolean; config: Record<string, any> };
  judgingFeedback: { enabled: boolean; config: Record<string, any> };
  teamHub:         { enabled: boolean; config: Record<string, any> };
  announcements:   { enabled: boolean; config: Record<string, any> };
}

const DEFAULT_FEATURE_MODULES: FeatureModules = {
  leaderboard:     { enabled: false, config: {} },
  judgingFeedback: { enabled: false, config: {} },
  teamHub:         { enabled: false, config: {} },
  announcements:   { enabled: false, config: {} },
};

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm">
      <Info size={16} className="text-amber-400 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

// ─── Feature Module Key Set (for drop guard) ──────────────────────────────────
// These should NOT be dropped onto the canvas — they live in feature checkboxes only
const FEATURE_MODULE_TYPES = new Set(['LEADERBOARD', 'JUDGING_ROUND', 'ANNOUNCEMENTS']);

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkflowBuilder() {
  const nodeTypes = useMemo(() => ({
    REGISTRATION: CustomNode,
    PAYMENT: CustomNode,
    TEAM_FORMATION: CustomNode,
    JUDGING_ROUND: CustomNode,
    LEADERBOARD: CustomNode,
    SUBMISSION: CustomNode,
    ONBOARDING_COMPLETE: CustomNode,
  }), []);

  const { id } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [hasCompetitionItems, setHasCompetitionItems] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [featureModules, setFeatureModules] = useState<FeatureModules>(DEFAULT_FEATURE_MODULES);
  const [activeFeatureModal, setActiveFeatureModal] = useState<FeatureKey | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // ─── Load workflow ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    eventsApi.getEvent(id)
      .then((res: any) => {
        setEventData(res.data.data);
        const wf = res.data.data.workflow;
        if (wf && wf.nodes && wf.nodes.length > 0) {
          const migratedNodes = wf.nodes
            // Filter out old LEADERBOARD/JUDGING_ROUND nodes that were sequential
            // (they're now feature modules). Keep ONBOARDING_COMPLETE.
            .filter((node: any) => {
              const t = node.data?.moduleType || node.type;
              return !FEATURE_MODULE_TYPES.has(t) || t === 'ONBOARDING_COMPLETE';
            })
            .map((node: any) => {
              const moduleType = node.data?.moduleType || node.type || "REGISTRATION";
              return {
                ...node,
                type: moduleType,
                data: {
                  ...node.data,
                  moduleType,
                  label: node.data?.label || moduleType.replace(/_/g, ' '),
                  config: node.config || node.data?.config || {}
                }
              };
            });
          setNodes(migratedNodes);
          const mappedEdges = (wf.edges || []).map((edge: any) => ({
            ...edge,
            id: edge.id || edge._id || `e${edge.source}-${edge.target}`
          }));
          setEdges(mappedEdges);
        } else {
          setNodes([{
            id: 'node_1',
            type: 'REGISTRATION',
            position: { x: 250, y: 150 },
            data: { moduleType: 'REGISTRATION', label: 'Registration', config: {} },
          }]);
        }

        // Load feature modules
        if (wf?.featureModules) {
          setFeatureModules({
            leaderboard:     wf.featureModules.leaderboard     || { enabled: false, config: {} },
            judgingFeedback: wf.featureModules.judgingFeedback || { enabled: false, config: {} },
            teamHub:         wf.featureModules.teamHub         || { enabled: false, config: {} },
            announcements:   wf.featureModules.announcements   || { enabled: false, config: {} },
          });
        }
        
        // Fetch competition items to determine leaderboard availability
        return competitionApi.getItems(id);
      })
      .then((res: any) => {
        if (res && res.data && res.data.data) {
          setHasCompetitionItems(res.data.data.length > 0);
        }
      })
      .catch((err) => {
        console.error("Error loading workflow or competition items:", err);
      })
      .finally(() => setLoading(false));
  }, [id, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onEdgeUpdate = useCallback(
    (oldEdge: any, newConnection: any) =>
      setEdges((els) => updateEdge(oldEdge, newConnection, els)),
    [setEdges]
  );

  const onDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => {
      const node = nds.find(n => n.id === nodeId);
      if (node?.type === 'ONBOARDING_COMPLETE') return nds; // protect terminal
      return nds.filter((n) => n.id !== nodeId);
    });
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  // ─── Feature Dependency Sync ────────────────────────────────────────────────
  const getFeatureStatus = useCallback((key: FeatureKey): { available: boolean; reason?: string } => {
    const hasTeamFormation = nodes.some((n: any) => n.type === 'TEAM_FORMATION');
    const hasJudgingRound = nodes.some((n: any) => n.type === 'JUDGING_ROUND');
    const isCompetition = eventData?.isCompetition;
    const canHaveLeaderboard = hasJudgingRound || hasCompetitionItems;

    switch (key) {
      case 'teamHub':
        return hasTeamFormation 
          ? { available: true } 
          : { available: false, reason: "Requires a Team Formation step in the onboarding flow." };
      case 'judgingFeedback':
        return hasJudgingRound 
          ? { available: true } 
          : { available: false, reason: "Requires a Judging Round step in the onboarding flow." };
      case 'leaderboard':
        return canHaveLeaderboard
          ? { available: true } 
          : { available: false, reason: "Requires a Judging Round or Competition Items to enable Leaderboard." };
      case 'announcements':
        return { available: true };
      default:
        return { available: true };
    }
  }, [nodes, eventData, hasCompetitionItems]);

  useEffect(() => {
    setFeatureModules(prev => {
      let changed = false;
      const next = { ...prev };

      FEATURE_MODULES.forEach(feat => {
        const status = getFeatureStatus(feat.key);
        if (!status.available && next[feat.key].enabled) {
          next[feat.key] = { ...next[feat.key], enabled: false };
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [getFeatureStatus]);

  // ─── Duplicate detection ───────────────────────────────────────────────────
  useEffect(() => {
    setNodes((nds) => {
      const typeCounts: Record<string, number> = {};
      nds.forEach(n => {
        const type = n.data?.moduleType || n.type;
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      let changed = false;
      const nextNodes = nds.map(n => {
        const type = n.data?.moduleType || n.type;
        const isDuplicate = typeCounts[type] > 1;
        if (n.data?.isDuplicate !== isDuplicate) {
          changed = true;
          return { ...n, data: { ...n.data, isDuplicate } };
        }
        return n;
      });
      return changed ? nextNodes : nds;
    });
  }, [nodes.length, setNodes]);

  // ─── Save ──────────────────────────────────────────────────────────────────
  const onSave = async () => {
    setSaving(true);
    try {
      // Auto-insert ONBOARDING_COMPLETE terminal node if not present
      let finalNodes = nodes.map(node => ({
        ...node,
        type: node.data?.moduleType || node.type,
        label: node.data?.label,
        config: node.data?.config || {}
      }));

      const hasTerminal = finalNodes.some(n => n.type === 'ONBOARDING_COMPLETE');
      if (!hasTerminal) {
        // Find rightmost node position to place terminal to the right
        const maxX = finalNodes.reduce((max: number, n: any) => Math.max(max, (n.position?.x || 0) + 220), 0);
        const avgY = finalNodes.reduce((sum: number, n: any) => sum + (n.position?.y || 150), 0) / (finalNodes.length || 1);

        const terminalId = `node_terminal_${Date.now()}`;
        const terminalNode = {
          id: terminalId,
          type: 'ONBOARDING_COMPLETE',
          position: { x: maxX + 60, y: Math.round(avgY) },
          label: 'Onboarding Complete',
          config: {},
          data: {
            moduleType: 'ONBOARDING_COMPLETE',
            label: 'Onboarding Complete',
            config: {}
          }
        };
        finalNodes = [...finalNodes, terminalNode];

        // Wire the last non-terminal node to the terminal if it has no outgoing edge
        const nonTerminal = finalNodes.filter(n => n.type !== 'ONBOARDING_COMPLETE');
        const lastNode = nonTerminal[nonTerminal.length - 1];
        const currentEdges = edges;
        const hasOutgoing = currentEdges.some((e: any) => e.source === lastNode?.id);
        let finalEdges = currentEdges;
        if (lastNode && !hasOutgoing) {
          finalEdges = [
            ...currentEdges,
            {
              id: `e_${lastNode.id}_${terminalId}`,
              source: lastNode.id,
              target: terminalId,
            }
          ];
          setEdges(finalEdges);
        }

        // Also update React Flow state so user can see the new node
        setNodes(finalNodes);

        await eventsApi.updateEventWorkflow(id!, {
          nodes: finalNodes,
          edges: finalEdges,
          featureModules
        });
      } else {
        await eventsApi.updateEventWorkflow(id!, {
          nodes: finalNodes,
          edges,
          featureModules
        });
      }

      setToast("Workflow saved successfully!");
    } catch {
      setToast("Failed to save workflow. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow') as ModuleType;
      if (typeof type === 'undefined' || !type) return;

      // ── Feature module drop guard ──────────────────────────────────────────
      if (FEATURE_MODULE_TYPES.has(type)) {
        setToast("This is a dashboard feature, not a step in the onboarding flow. Enable it in the Features panel.");
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: any = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: {
          moduleType: type,
          label: type.replace(/_/g, ' ').charAt(0) + type.replace(/_/g, ' ').slice(1).toLowerCase(),
          config: {}
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = (_: React.MouseEvent, node: any) => {
    setSelectedNode(node);
  };

  const onPaneClick = (_: React.MouseEvent) => {
    setSelectedNode(null);
  };

  const updateNodeConfig = (nodeId: string, config: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, config } };
        }
        return node;
      })
    );
    setToast("Node configuration updated!");
  };

  const toggleFeature = (key: FeatureKey) => {
    const status = getFeatureStatus(key);
    if (!status.available) return;

    setFeatureModules(prev => {
      const isNowEnabled = !prev[key].enabled;
      // Auto-open modal on first enable if no config exists
      if (isNowEnabled && Object.keys(prev[key].config || {}).length === 0) {
        setActiveFeatureModal(key);
      }
      return {
        ...prev,
        [key]: { ...prev[key], enabled: isNowEnabled }
      };
    });
  };

  const handleSaveFeatureConfig = (config: any) => {
    if (!activeFeatureModal) return;
    setFeatureModules(prev => ({
      ...prev,
      [activeFeatureModal]: { ...prev[activeFeatureModal], config }
    }));
    setActiveFeatureModal(null);
    setToast("Feature configuration saved locally (don't forget to Save Workflow).");
  };

  if (loading) return <div className="p-8 text-center text-secondary">Loading workflow...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-85px)] -mt-2">
      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Journey Designer</h1>
          <p className="text-secondary mt-1">Build the sequential onboarding flow. Enable persistent features below.</p>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2 shadow-lg" onClick={onSave} disabled={saving}>
            <Save size={16} /> {saving ? "Saving Workflow..." : "Save Workflow"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border border-secondary/10 rounded-xl shadow-sm overflow-y-auto flex flex-col">
          {/* ── Onboarding Modules ───────────────────────────────────────── */}
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 mb-1 uppercase tracking-wider">
              Onboarding Flow
            </h3>
            <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
              Drag modules onto the canvas to build sequential steps.
            </p>
            <div className="space-y-2">
              {ONBOARDING_MODULES.map((tpl) => (
                <div
                  key={tpl.type}
                  className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-grab hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  draggable
                  onDragStart={(e) => onDragStart(e, tpl.type)}
                >
                  <div className="text-secondary group-hover:text-primary transition-colors mt-0.5 shrink-0">
                    {tpl.icon}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-slate-700">{tpl.label}</span>
                    <span className="text-[10px] text-slate-500 opacity-80 truncate">{tpl.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Feature Modules ───────────────────────────────────────────── */}
          <div className="p-5 flex-1">
            <h3 className="text-xs font-bold text-slate-900 mb-1 uppercase tracking-wider">
              Dashboard Features
            </h3>
            <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
              Enable persistent features visible on the participant dashboard after onboarding.
            </p>
            <div className="space-y-2">
              {FEATURE_MODULES.map((feat) => {
                const isEnabled = featureModules[feat.key].enabled;
                const status = getFeatureStatus(feat.key);
                const disabled = !status.available;

                return (
                  <div 
                    key={feat.key} 
                    className={`w-full flex items-center gap-2 p-3 rounded-lg border transition-all ${
                      disabled ? 'opacity-50 grayscale cursor-not-allowed bg-slate-50 border-slate-200' :
                      isEnabled
                        ? `${feat.bg} border-current/20`
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                    title={disabled ? status.reason : undefined}
                  >
                    <button
                      onClick={() => !disabled && toggleFeature(feat.key)}
                      className={`shrink-0 ${isEnabled && !disabled ? feat.color : 'text-slate-400'}`}
                      disabled={disabled}
                    >
                      {feat.icon}
                    </button>
                    <button
                      className="flex-1 min-w-0 text-left flex flex-col"
                      onClick={() => !disabled && toggleFeature(feat.key)}
                      disabled={disabled}
                    >
                      <p className={`text-xs font-semibold leading-tight ${isEnabled && !disabled ? feat.color : 'text-slate-500'}`}>
                        {feat.label}
                      </p>
                      <p className={`text-[9px] opacity-70 truncate mt-0.5 ${isEnabled && !disabled ? feat.color : 'text-slate-500'}`}>
                        {feat.description}
                      </p>
                    </button>
                    <div className="shrink-0 flex items-center gap-1.5">
                      {isEnabled && !disabled && (
                        <button
                          onClick={() => setActiveFeatureModal(feat.key)}
                          className={`p-1.5 rounded-md transition-colors ${feat.color} hover:bg-black/5`}
                          title="Configure Settings"
                        >
                          <Settings2 size={16} />
                        </button>
                      )}
                      <button onClick={() => !disabled && toggleFeature(feat.key)} disabled={disabled}>
                        {isEnabled && !disabled
                          ? <ToggleRight size={18} className={feat.color} />
                          : <ToggleLeft size={18} className="text-slate-300" />
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tip */}
          <div className="p-4 m-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
                An <strong>Onboarding Complete</strong> terminal node is automatically appended when you save.
              </p>
            </div>
          </div>
        </aside>

        {/* Canvas Area */}
        <div
          className="flex-1 relative border border-secondary/20 rounded-xl overflow-hidden bg-white shadow-elevated"
          ref={reactFlowWrapper}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeUpdate={onEdgeUpdate}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            deleteKeyCode={['Delete', 'Backspace']}
            fitView
          >
            <Background color="#cbd5e1" variant={BackgroundVariant.Dots} gap={20} size={1} />
            <MiniMap
              zoomable
              pannable
              className="!bg-white !border !border-secondary/20 rounded-lg"
            />
            <Controls className="!border-secondary/20 !bg-white !shadow-sm" />
          </ReactFlow>
        </div>

        {/* Right Sidebar - Configuration */}
        <ConfigPanel
          node={selectedNode}
          onUpdate={updateNodeConfig}
          onDelete={(nodeId) => onDeleteNode(nodeId)}
        />
      </div>

      {/* Feature Configuration Modal */}
      {activeFeatureModal && (
        <FeatureConfigModal
          moduleKey={activeFeatureModal}
          moduleLabel={FEATURE_MODULES.find(f => f.key === activeFeatureModal)?.label || 'Feature'}
          initialConfig={featureModules[activeFeatureModal].config}
          onSave={handleSaveFeatureConfig}
          onClose={() => setActiveFeatureModal(null)}
        />
      )}
    </div>
  );
}
