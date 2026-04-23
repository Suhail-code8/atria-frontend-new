import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DateTimePicker } from '../ui/DateTimePicker';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import type { ModuleType } from './CustomNode';
import { Trash2, Plus, CheckCircle2, Lock } from 'lucide-react';

const registrationSchema = z.object({
  capacity: z.number().optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  requiresApproval: z.boolean(),
  customFields: z.array(z.object({
    label: z.string(),
    type: z.enum(['text', 'number', 'file', 'select']),
    required: z.boolean(),
    options: z.string().optional(),
  })),
});

const paymentSchema = z.object({
  price: z.number().min(0),
  currency: z.string().default('INR'),
  earlyBirdDiscount: z.boolean(),
});

const teamFormationSchema = z.object({
  teamSize: z.number().min(1),
  teamCreationMode: z.enum(['organizer_creates', 'participants_create']),
  teamLeaderSelection: z.enum(['creator_is_leader', 'organizer_selects']),
  allowSelfEnrollment: z.boolean().default(false),
});

const judgingRoundSchema = z.object({
  criteria: z.array(z.object({
    name: z.string(),
    weight: z.number().min(1).max(100),
    maxScore: z.number().min(1),
  })),
  judgesPerSubmission: z.number().min(1),
  blindJudging: z.boolean(),
});

const leaderboardSchema = z.object({
  displayType: z.enum(['individual', 'team', 'both']),
  visibleTo: z.enum(['public', 'participants', 'organizers_only']),
  displayScoreBreakdown: z.boolean(),
});

const submissionSchema = z.object({
  allowedFileTypes: z.string(), // comma separated
  maxFileSize: z.number().min(1),
  deadline: z.string(),
});

interface ConfigPanelProps {
  node: any;
  onUpdate: (id: string, config: any) => void;
  onDelete: (id: string) => void;
}

export function ConfigPanel({ node, onUpdate, onDelete }: ConfigPanelProps) {
  const moduleType = node?.data?.moduleType as ModuleType;

  const getSchema = () => {
    switch (moduleType) {
      case 'REGISTRATION': return registrationSchema;
      case 'PAYMENT': return paymentSchema;
      case 'TEAM_FORMATION': return teamFormationSchema;
      case 'JUDGING_ROUND': return judgingRoundSchema;
      case 'LEADERBOARD': return leaderboardSchema;
      case 'SUBMISSION': return submissionSchema;
      default: return z.any();
    }
  };

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: node?.data?.config || {},
  });

  useEffect(() => {
    reset(node?.data?.config || {});
  }, [node, reset]);

  const onSubmit = (data: any) => {
    onUpdate(node.id, data);
  };

  // Field Array for Registration Custom Fields
  const { fields: regFields, append: appendReg, remove: removeReg } = useFieldArray({
    control,
    name: "customFields"
  });

  // Field Array for Judging Criteria
  const { fields: critFields, append: appendCrit, remove: removeCrit } = useFieldArray({
    control,
    name: "criteria"
  });

  if (!node) return null;

  // Terminal node — show info only, no config form
  if (moduleType === 'ONBOARDING_COMPLETE') {
    return (
      <div className="w-96 border border-secondary/10 bg-white rounded-xl shadow-sm overflow-y-auto p-6 h-full">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">Onboarding Complete</h3>
          <p className="text-xs text-secondary mt-1">This is the terminal node of the onboarding flow.</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Journey Endpoint</p>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                  When a participant advances to this node, their onboarding is marked complete and they are
                  redirected to the Persistent Dashboard showing all enabled feature modules.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
            <Lock size={16} className="text-slate-400 shrink-0" />
            <p className="text-xs text-slate-500">
              This node is auto-managed and cannot be deleted. It is automatically appended when you save the workflow.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 border border-secondary/10 bg-white rounded-xl shadow-sm overflow-y-auto p-6 h-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">{moduleType.replace(/_/g, ' ')} Settings</h3>
        <p className="text-xs text-secondary mt-1">Configure parameters for this workflow step.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {moduleType === 'REGISTRATION' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Capacity</label>
              <Input type="number" {...register('capacity', { valueAsNumber: true })} error={!!errors.capacity} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-tight">Reg. Start</label>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.startDate}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-tight">Reg. End</label>
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.endDate}
                    />
                  )}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register('requiresApproval')} className="accent-primary" />
              <label className="text-sm font-medium">Requires Approval</label>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold">Custom Fields</label>
                <Button type="button" variant="outline" size="sm" onClick={() => appendReg({ label: '', type: 'text', required: false })}>
                  <Plus size={14} />
                </Button>
              </div>
              {regFields.map((field, index) => (
                <div key={field.id} className="p-3 border border-secondary/10 rounded-lg space-y-2 bg-slate-50">
                  <Input placeholder="Field Label" {...register(`customFields.${index}.label` as const)} />
                  <select {...register(`customFields.${index}.type` as const)} className="w-full rounded-lg border border-secondary/20 bg-white px-3 py-2 text-sm">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="file">File</option>
                    <option value="select">Select</option>
                  </select>
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" {...register(`customFields.${index}.required` as const)} /> Required
                    </label>
                    <Button type="button" variant="ghost" className="text-danger p-1 h-auto" onClick={() => removeReg(index)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {moduleType === 'PAYMENT' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price</label>
              <Input type="number" {...register('price', { valueAsNumber: true })} error={!!errors.price} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <select {...register('currency')} className="w-full rounded-lg border border-secondary/20 bg-surface px-3 py-2 text-sm">
                <option value="INR">INR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register('earlyBirdDiscount')} className="accent-primary" />
              <label className="text-sm font-medium">Early Bird Discount</label>
            </div>
          </>
        )}

        {moduleType === 'TEAM_FORMATION' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Team Size</label>
              <Input type="number" {...register('teamSize', { valueAsNumber: true })} error={!!errors.teamSize} />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold">Who can create teams?</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-secondary/20 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    value="participants_create"
                    {...register('teamCreationMode')}
                    className="accent-primary"
                  />
                  <div>
                    <p className="text-sm font-medium">Participants self-organize</p>
                    <p className="text-xs text-secondary">Participants create teams and invite others via code</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-secondary/20 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    value="organizer_creates"
                    {...register('teamCreationMode')}
                    className="accent-primary"
                  />
                  <div>
                    <p className="text-sm font-medium">Organizer pre-assigns teams</p>
                    <p className="text-xs text-secondary">Organizer creates teams and assigns participants from the Teams Hub</p>
                  </div>
                </label>
                {watch('teamCreationMode') === 'organizer_creates' && (
                  <div className="ml-8 mt-2 flex items-center gap-2 p-2 bg-primary/5 border border-primary/10 rounded-lg">
                    <input
                      type="checkbox"
                      {...register('allowSelfEnrollment')}
                      className="accent-primary h-4 w-4"
                    />
                    <label className="text-xs font-medium text-primary cursor-pointer">
                      Allow participants to join teams themselves
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold">Team Leader Assignment</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-secondary/20 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    value="creator_is_leader"
                    {...register('teamLeaderSelection')}
                    className="accent-primary"
                  />
                  <div>
                    <p className="text-sm font-medium">Auto-assign creator as leader</p>
                    <p className="text-xs text-secondary">The first member / team creator is automatically the leader</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-secondary/20 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    value="organizer_selects"
                    {...register('teamLeaderSelection')}
                    className="accent-primary"
                  />
                  <div>
                    <p className="text-sm font-medium">Organizer selects leader</p>
                    <p className="text-xs text-secondary">Organizer manually designates a leader per team in Teams Hub</p>
                  </div>
                </label>
              </div>
            </div>

          </>
        )}

        {moduleType === 'JUDGING_ROUND' && (
          <>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold">Judging Criteria</label>
                <Button type="button" variant="outline" size="sm" onClick={() => appendCrit({ name: '', weight: 1, maxScore: 10 })}>
                  <Plus size={14} />
                </Button>
              </div>
              {critFields.map((field, index) => (
                <div key={field.id} className="p-3 border border-secondary/10 rounded-lg space-y-2 bg-slate-50">
                  <Input placeholder="Criterion Name" {...register(`criteria.${index}.name` as const)} />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-secondary font-bold">Weight (%)</label>
                      <Input type="number" {...register(`criteria.${index}.weight` as const, { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-secondary font-bold">Max Score</label>
                      <Input type="number" {...register(`criteria.${index}.maxScore` as const, { valueAsNumber: true })} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" className="text-danger p-1 h-auto" onClick={() => removeCrit(index)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Judges per Submission</label>
              <Input type="number" {...register('judgesPerSubmission', { valueAsNumber: true })} error={!!errors.judgesPerSubmission} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register('blindJudging')} className="accent-primary" />
              <label className="text-sm font-medium">Blind Judging</label>
            </div>
          </>
        )}

        {moduleType === 'LEADERBOARD' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Type</label>
              <select {...register('displayType')} className="w-full rounded-lg border border-secondary/20 bg-surface px-3 py-2 text-sm">
                <option value="individual">Individual Rankings</option>
                <option value="team">Team Rankings</option>
                <option value="both">Both (Tabs)</option>
              </select>
              <p className="text-xs text-secondary">Controls which leaderboard view participants see.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Visibility</label>
              <select {...register('visibleTo')} className="w-full rounded-lg border border-secondary/20 bg-surface px-3 py-2 text-sm">
                <option value="public">Public — visible to everyone</option>
                <option value="participants">Participants only</option>
                <option value="organizers_only">Organizers only (hidden from participants)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register('displayScoreBreakdown')} className="accent-primary" />
              <label className="text-sm font-medium">Display Score Breakdown</label>
            </div>
          </>
        )}

        {moduleType === 'SUBMISSION' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Allowed File Types (.pdf, .zip)</label>
              <Input {...register('allowedFileTypes')} error={!!errors.allowedFileTypes} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max File Size (MB)</label>
              <Input type="number" {...register('maxFileSize', { valueAsNumber: true })} error={!!errors.maxFileSize} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deadline</label>
              <Controller
                control={control}
                name="deadline"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.deadline}
                  />
                )}
              />
            </div>
          </>
        )}

        <div className="pt-4 border-t border-secondary/10 flex flex-col gap-2">
          <Button type="submit" className="w-full">Update Node</Button>
          <Button 
            type="button" 
            variant="danger" 
            className="w-full bg-transparent border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all font-semibold"
            onClick={() => onDelete(node.id)}
          >
            Remove Module
          </Button>
        </div>
      </form>
    </div>
  );
}
