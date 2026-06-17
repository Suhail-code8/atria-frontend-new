import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { participationApi } from "../api/participation.api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card";
import { CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";
import { showToast } from "../lib/toast";

interface RegistrationModuleProps {
  config: any;
  participation: any;
  registrationForm?: any[]; // Source of truth from organizer
  isLastStep?: boolean;
  onAdvanced: (data: any) => void;
}

export default function RegistrationModule({ config, participation, registrationForm, isLastStep, onAdvanced }: RegistrationModuleProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use event-level registrationForm if available, falling back to workflow module config
  const fields = registrationForm && registrationForm.length > 0 ? registrationForm : (config.customFields || []);

  // Requirement: Dynamic Zod Schema
  const schema = useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = {};
    fields.forEach((field: any) => {
      let fieldSchema: z.ZodTypeAny = z.any();
      
      if (field.type === 'email') {
        fieldSchema = z.string().email("Invalid email address");
      } else if (field.type === 'number') {
        fieldSchema = z.string().or(z.number()).transform(v => Number(v));
      } else if (field.type === 'checkbox') {
        fieldSchema = z.boolean();
      } else {
        fieldSchema = z.string();
      }

      if (field.required) {
        if (field.type === 'checkbox') {
          fieldSchema = fieldSchema.refine(v => v === true, { message: "Required" });
        } else {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`);
        }
      } else {
        fieldSchema = fieldSchema.optional().or(z.literal(""));
      }
      
      shape[field.label] = fieldSchema;
    });
    return z.object(shape);
  }, [fields]);

  // Requirement 2: Check if already completed
  const isCompleted = participation.workflowData?.registration || (participation.history?.some((h: any) => h.nodeId === participation.currentWorkflowNodeId && h.leftAt));

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: participation.workflowData?.registration || {}
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Atomic Operation: Save and Advance in one backend transaction
      const advanceRes = await participationApi.update(participation._id, {
        workflowData: {
          ...participation.workflowData,
          registration: data
        }
      }, true); // Always auto-advance
      
      onAdvanced(advanceRes.data.data);
    } catch (error: any) {
       console.error("Save & Advance Error:", error);
       const message = error.response?.data?.message || "Failed to save and advance. Please try again.";
       showToast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <Card className="border-emerald-100 bg-emerald-50/30">
        <CardHeader>
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 size={20} />
            <CardTitle className="text-lg">Registration Complete</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fields.map((field: any) => (
              <div key={field.label} className="flex justify-between text-sm py-2 border-b border-emerald-100/50">
                <span className="text-secondary font-medium">{field.label}</span>
                <span className="text-slate-900">{String(participation.workflowData?.registration?.[field.label] || "—")}</span>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
           <Button 
             className="w-full" 
             onClick={async () => {
               try {
                 setIsSubmitting(true);
                 const res = await participationApi.advance(participation._id);
                 onAdvanced(res.data.data.participation);
               } catch (err: any) {
                 showToast.error(err.response?.data?.message || "Could not advance. You might need to fulfill more conditions.");
               } finally {
                 setIsSubmitting(false);
               }
             }}
             disabled={isSubmitting}
           >
             {isSubmitting ? "Advancing..." : "Proceed"}
           </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Registration</CardTitle>
        <p className="text-sm text-secondary">Please provide the required details to proceed.</p>
      </CardHeader>
      <CardContent>
        <form id="registration-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field: any) => (
            <div key={field.label} className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                {field.label}
                {field.required && <span className="text-danger ml-0.5">*</span>}
              </label>
              
              {field.type === 'select' ? (
                <select 
                  {...register(field.label, { required: field.required })}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition-all focus:ring-2 focus:ring-primary/20 ${
                    errors[field.label] ? 'border-danger focus:border-danger' : 'border-secondary/20 focus:border-primary'
                  }`}
                >
                  <option value="">Select optional...</option>
                  {(field.options || []).map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea 
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  {...register(field.label, { required: field.required })}
                  rows={3}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition-all focus:ring-2 focus:ring-primary/20 ${
                    errors[field.label] ? 'border-danger focus:border-danger' : 'border-secondary/20 focus:border-primary'
                  }`}
                />
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center gap-2 py-1">
                  <input 
                    type="checkbox"
                    id={field.label}
                    {...register(field.label, { required: field.required })}
                    className="w-4 h-4 rounded border-secondary/20 text-primary focus:ring-primary/20"
                  />
                  <label htmlFor={field.label} className="text-sm text-secondary">
                    {field.placeholder || `Accept ${field.label.toLowerCase()}`}
                  </label>
                </div>
              ) : (
                <Input 
                  type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  {...register(field.label, { required: field.required })}
                  error={!!errors[field.label]}
                />
              )}
              {errors[field.label] && (
                <p className="text-[10px] font-bold text-danger uppercase tracking-tight">
                  {(errors[field.label]?.message as string) || "This field is required"}
                </p>
              )}
            </div>
          ))}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          form="registration-form" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save and Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}
