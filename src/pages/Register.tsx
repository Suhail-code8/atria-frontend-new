import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { authApi } from "../api/auth.api";
import { UserRole } from "../types";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import axiosInstance from "../api/axios";
import { useState } from "react";
import { showToast } from "../lib/toast";
import { User, Mail, Lock, ArrowRight, Rocket, Megaphone, Scale } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.nativeEnum(UserRole)
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const roleOptions = [
  { value: UserRole.PARTICIPANT, label: "Participate in Events", icon: Rocket, desc: "Join hackathons & competitions" },
  { value: UserRole.ORGANIZER, label: "Organize Events", icon: Megaphone, desc: "Create & manage your events" },
  { value: UserRole.JUDGE, label: "Judge Events", icon: Scale, desc: "Review & score submissions" },
];

export function Register() {
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: UserRole.PARTICIPANT }
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const resp = await authApi.register(data.name, data.email, data.password, data.role);
      setUser(resp.data.data.user);
      setAccessToken(resp.data.data.accessToken);
      navigate("/dashboard/events");
    } catch (err: any) {
      showToast.error(err.response?.data?.message || "Registration failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const credential = credentialResponse.credential;
    if (!credential) return;

    setGoogleLoading(true);
    try {
      const response = await axiosInstance.post('/auth/google', { credential });
      const { accessToken, user } = response.data.data;
      setUser(user);
      setAccessToken(accessToken);
      navigate("/dashboard/events");
    } catch (err: any) {
      showToast.error(err.response?.data?.message || "Google registration failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-72 h-72 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)", top: "5%", left: "20%" }} />
        <div className="absolute w-96 h-96 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)", bottom: "10%", right: "10%" }} />
      </div>

      <div className="w-full max-w-md relative z-10 fade-in-up">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="pt-10 pb-6 px-8 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto mb-5 shadow-lg"
              style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
            >
              A
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1.5 tracking-tight">Create your account</h1>
            <p className="text-sm text-slate-500">Join the community of builders</p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    {...register("name")}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 input-glow transition-all duration-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 input-glow transition-all duration-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 input-glow transition-all duration-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.password.message}</p>}
              </div>

              {/* Role selector — card-based */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">I want to</label>
                <input type="hidden" {...register("role")} />
                <div className="grid grid-cols-3 gap-2">
                  {roleOptions.map((opt) => {
                    const isActive = selectedRole === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue("role", opt.value)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-center"
                        style={{
                          borderColor: isActive ? "#6366f1" : "#e2e8f0",
                          background: isActive ? "rgba(99,102,241,0.06)" : "white",
                        }}
                      >
                        <opt.icon className="w-5 h-5" style={{ color: isActive ? "#6366f1" : "#94a3b8" }} />
                        <span className="text-[11px] font-bold leading-tight" style={{ color: isActive ? "#6366f1" : "#475569" }}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || googleLoading}
                className="btn-premium w-full h-12 rounded-xl text-sm font-bold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Creating...
                  </span>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full section-divider" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em]">
                  or join with
                </span>
              </div>
            </div>

            {/* Google */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => showToast.error("Google registration failed")}
                theme="outline"
                size="large"
                width="320"
                shape="pill"
              />
            </div>
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center mt-6 text-sm text-slate-500">
          Already a member?{" "}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
