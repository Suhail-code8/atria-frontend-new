import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { X, Settings2 } from 'lucide-react';

const leaderboardSchema = z.object({
  displayType: z.enum(['individual', 'team', 'both']),
  visibleTo: z.enum(['public', 'participants', 'organizers_only']),
  displayScoreBreakdown: z.boolean(),
});

const judgingFeedbackSchema = z.object({
  showRubricBreakdown: z.boolean(),
  visibleTo: z.enum(['public', 'participants', 'organizers_only']),
});

const teamHubSchema = z.object({
  allowInvites: z.boolean(),
  showMembers: z.boolean(),
});

const announcementsSchema = z.object({
  emailEnabled: z.boolean(),
  priorityDefault: z.enum(['normal', 'high']),
});

interface FeatureConfigModalProps {
  moduleKey: string;
  moduleLabel: string;
  initialConfig: any;
  onSave: (config: any) => void;
  onClose: () => void;
}

export function FeatureConfigModal({ moduleKey, moduleLabel, initialConfig, onSave, onClose }: FeatureConfigModalProps) {
  const getSchema = () => {
    switch (moduleKey) {
      case 'leaderboard': return leaderboardSchema;
      case 'judgingFeedback': return judgingFeedbackSchema;
      case 'teamHub': return teamHubSchema;
      case 'announcements': return announcementsSchema;
      default: return z.any();
    }
  };

  const getDefaultValues = () => {
    const defaults: any = {
      leaderboard: { displayType: 'individual', visibleTo: 'public', displayScoreBreakdown: true },
      judgingFeedback: { showRubricBreakdown: true, visibleTo: 'participants' },
      teamHub: { allowInvites: true, showMembers: true },
      announcements: { emailEnabled: false, priorityDefault: 'normal' },
    };
    return { ...(defaults[moduleKey] || {}), ...initialConfig };
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: getDefaultValues(),
  });

  const onSubmit = (data: any) => {
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Settings2 size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-slate-900">{moduleLabel} Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="feature-config-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {moduleKey === 'leaderboard' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Display Type</label>
                  <select {...register('displayType')} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="individual">Individual Rankings</option>
                    <option value="team">Team Rankings</option>
                    <option value="both">Both (Tabs)</option>
                  </select>
                  <p className="text-xs text-secondary">Controls which leaderboard view participants see.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Visibility</label>
                  <select {...register('visibleTo')} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="public">Public — visible to everyone</option>
                    <option value="participants">Participants only</option>
                    <option value="organizers_only">Organizers only (hidden from participants)</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="checkbox" {...register('displayScoreBreakdown')} className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Show Score Breakdown</p>
                    <p className="text-xs text-slate-500">Allow users to see individual rubric criteria scores</p>
                  </div>
                </label>
              </>
            )}

            {moduleKey === 'judgingFeedback' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Visibility</label>
                  <select {...register('visibleTo')} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="public">Public — visible to everyone</option>
                    <option value="participants">Participants only</option>
                    <option value="organizers_only">Organizers only (hidden from participants)</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="checkbox" {...register('showRubricBreakdown')} className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Show Rubric Breakdown</p>
                    <p className="text-xs text-slate-500">Display the detailed scoring rubric to participants</p>
                  </div>
                </label>
              </>
            )}

            {moduleKey === 'teamHub' && (
              <>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="checkbox" {...register('allowInvites')} className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Allow Invite Codes</p>
                    <p className="text-xs text-slate-500">Let participants invite others using a code</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="checkbox" {...register('showMembers')} className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Show Members Directory</p>
                    <p className="text-xs text-slate-500">Allow participants to see other teams and members</p>
                  </div>
                </label>
              </>
            )}

            {moduleKey === 'announcements' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Default Priority</label>
                  <select {...register('priorityDefault')} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="normal">Normal</option>
                    <option value="high">High (Pinned/Highlighted)</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="checkbox" {...register('emailEnabled')} className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Email Notifications</p>
                    <p className="text-xs text-slate-500">Send an email to all participants by default when a new announcement is posted</p>
                  </div>
                </label>
              </>
            )}

          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="feature-config-form">Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
