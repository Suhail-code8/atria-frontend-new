import { useState, useEffect } from "react";
import { submissionsApi } from "../api/submissions.api";
import { participationApi } from "../api/participation.api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card";
import { Upload, FileText, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

interface SubmissionModuleProps {
  config: any;
  participation: any;
  isLastStep?: boolean;
  onAdvanced: (data: any) => void;
}

export default function SubmissionModule({ config, participation, isLastStep, onAdvanced }: SubmissionModuleProps) {
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // Requirement 7: Skip if a submission already exists
    submissionsApi.getMySubmission(participation.event._id)
      .then((res) => {
        const data = res.data.data;
        // Fix: Backend returns an array for listMySubmissions. Pick the first one if it exists.
        const sub = (data && Array.isArray(data) && data.length > 0) ? data[0] : null;
        
        if (sub) {
          setSubmission(sub);
          setFormData({
            title: sub.title || '',
            description: sub.description || ''
          });
        }
      })
      .catch(err => {
        console.error("Failed to fetch submission:", err);
      })
      .finally(() => setIsLoading(false));
  }, [participation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // --- Real Validations ---
    if (config.deadline && new Date() > new Date(config.deadline)) {
      setError("The submission deadline has passed. Late submissions are not accepted.");
      return;
    }

    if (selectedFile) {
      if (config.maxFileSize) {
        const maxSizeInBytes = Number(config.maxFileSize) * 1024 * 1024;
        if (selectedFile.size > maxSizeInBytes) {
          setError(`File is too large. Maximum allowed size is ${config.maxFileSize}MB.`);
          return;
        }
      }

      if (config.allowedFileTypes) {
        // Extract extensions from config like ".pdf, .zip" or "pdf, zip"
        const allowedExts = config.allowedFileTypes.split(',').map((t: string) => t.trim().toLowerCase().replace(/^\./, ''));
        const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
        
        if (fileExtension && !allowedExts.includes(fileExtension)) {
           setError(`Invalid file type. Allowed types are: ${config.allowedFileTypes}`);
           return;
        }
      }
    }
    // ------------------------

    setIsSubmitting(true);

    try {
      // 1. Prepare Payload
      const payload: any = {
        title: formData.title,
        description: formData.description,
        type: 'FILE',
      };
      
      // Only include file if a new one is selected
      if (selectedFile) {
        payload.file = selectedFile;
      }

      let currentSubmission = submission;

      // 2. Create or Update Core Record
      if (currentSubmission && currentSubmission.status === 'DRAFT') {
        const res = await submissionsApi.updateSubmission(participation.event._id, currentSubmission._id, payload);
        currentSubmission = res.data.data;
      } else if (!currentSubmission) {
        // Double check if we already have one to prevent 400s
        try {
          const res = await submissionsApi.createSubmission(participation.event._id, payload);
          currentSubmission = res.data.data;
        } catch (createErr: any) {
          if (createErr.response?.data?.message?.includes("already have a submission")) {
             // Resilience: Fetch existing and update instead
             const getRes = await submissionsApi.getMySubmission(participation.event._id);
             const subData = getRes.data.data;
             currentSubmission = (subData && Array.isArray(subData) && subData.length > 0) ? subData[0] : null;
             if (currentSubmission) {
                const upRes = await submissionsApi.updateSubmission(participation.event._id, currentSubmission._id, payload);
                currentSubmission = upRes.data.data;
             } else throw createErr;
          } else throw createErr;
        }
      }

      // 3. Finalize/Submit if DRAFT
      if (currentSubmission && currentSubmission.status === 'DRAFT') {
        const submitRes = await submissionsApi.submitSubmission(participation.event._id, currentSubmission._id);
        currentSubmission = submitRes.data.data;
      }
      
      // 4. Advance Workflow
      const advanceRes = await participationApi.advance(participation._id);
      onAdvanced(advanceRes.data.data.participation);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to process submission. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-secondary">Checking submission status...</div>;

  const formatDate = (date: string) => {
    if (!date) return "Not set";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (submission && submission.status !== 'DRAFT') {
    return (
      <Card className="border-indigo-100 bg-indigo-50/30">
        <CardHeader>
          <div className="flex items-center gap-2 text-indigo-600">
            <CheckCircle2 size={20} />
            <CardTitle className="text-lg">Project Submitted</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm">
             <div className="flex items-center gap-4 mb-3">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                   <FileText size={20} />
                </div>
                <h3 className="font-bold text-slate-900">{submission.title}</h3>
             </div>
             <p className="text-sm text-secondary line-clamp-2">{submission.description}</p>
             {submission.file && (
               <a 
                 href={submission.file.url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="mt-4 flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs font-semibold text-primary hover:bg-slate-100 transition-colors"
               >
                 <span className="truncate">{submission.file.originalName}</span>
                 <ExternalLink size={14} />
               </a>
             )}
          </div>
        </CardContent>
        <CardFooter>
           <Button 
             className="w-full" 
             onClick={() => {
               participationApi.advance(participation._id).then(res => onAdvanced(res.data.data.participation));
             }}
           >
             Proceed
           </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="text-primary" />
          Final Artifact Submission
        </CardTitle>
        <div className="flex flex-wrap gap-4 mt-2">
           {config.deadline && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-danger bg-danger/5 px-2 py-1 rounded">
                 <AlertCircle size={12} />
                 Deadline: {formatDate(config.deadline)}
              </div>
           )}
           {config.maxFileSize && (
             <div className="text-xs font-semibold text-secondary bg-slate-100 px-2 py-1 rounded">
                Max Size: {config.maxFileSize}MB
             </div>
           )}
        </div>
      </CardHeader>
      <CardContent>
        {submission && submission.status === 'DRAFT' && (
          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg mb-4 flex items-center gap-3">
             <div className="bg-white p-1.5 rounded-md shadow-sm">
                <FileText size={16} className="text-indigo-600" />
             </div>
             <div>
                <p className="text-xs font-bold text-indigo-900 leading-tight">Draft Submission Found</p>
                <p className="text-[11px] text-indigo-700">We've pre-filled your previous work. You can update it or finalize below.</p>
             </div>
          </div>
        )}
        <form id="submission-form" onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger/10 text-danger p-3 rounded-lg flex items-center gap-2 text-sm border border-danger/20">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Project Title</label>
            <Input 
              required 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="e.g. Atria Platform Redesign"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Short Description</label>
            <textarea 
              className="w-full rounded-lg border border-secondary/20 bg-white px-3 py-2 text-sm min-h-[80px]"
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Summarize your core contribution..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Project File</label>
            <div className="relative border-2 border-dashed border-secondary/20 rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-slate-50/50">
               <input 
                 type="file" 
                 className="absolute inset-0 opacity-0 cursor-pointer"
                 onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                 accept={config.allowedFileTypes ? config.allowedFileTypes.split(',').map((t: string) => t.trim().startsWith('.') ? t.trim() : `.${t.trim()}`).join(',') : undefined}
               />
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 border border-secondary/10">
                     <Upload size={24} className="text-secondary/60" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedFile ? selectedFile.name : "Click or drag to upload"}
                  </p>
                  <p className="text-xs text-secondary mt-1">
                    {config.allowedFileTypes ? `Allowed: ${config.allowedFileTypes}` : "PDF, ZIP or Images"} 
                    (Max {config.maxFileSize || 10}MB)
                  </p>
               </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          form="submission-form" 
          className="w-full h-11 shadow-lg" 
          disabled={isSubmitting || (!selectedFile && !submission)}
        >
          {isSubmitting ? "Syncing Artifacts..." : (submission?.status === 'DRAFT' ? "Update & Finalize" : "Submit Project")}
        </Button>
      </CardFooter>
    </Card>
  );
}
