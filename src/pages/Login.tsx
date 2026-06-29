import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { authApi } from "../api/auth.api";
import { Input } from "../components/ui/Input";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import axiosInstance from "../api/axios";
import { useState, useEffect } from "react";
import { showToast } from "../lib/toast";
import { Mail, Lock, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const { user, setUser, setAccessToken, isLoading } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'PARTICIPANT') navigate('/dashboard/registrations');
      else if (user.role === 'ORGANIZER') navigate('/dashboard/events');
      else if (user.role === 'JUDGE') navigate('/dashboard/assignments');
      else navigate('/');
    }
  }, [user, navigate, isLoading]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const resp = await authApi.login(data.email, data.password);
      const loggedUser = resp.data.data.user;
      setUser(loggedUser);
      setAccessToken(resp.data.data.accessToken);
      if (loggedUser.role === 'PARTICIPANT') navigate('/dashboard/registrations');
      else if (loggedUser.role === 'ORGANIZER') navigate('/dashboard/events');
      else if (loggedUser.role === 'JUDGE') navigate('/dashboard/assignments');
      else navigate('/');
    } catch (err: any) {
      showToast.error(err.response?.data?.message || "Login failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const credential = credentialResponse.credential;
    if (!credential) return;

    setGoogleLoading(true);
    try {
      const response = await axiosInstance.post('/auth/google', { credential });
      const { accessToken, user: loggedUser } = response.data.data;
      setUser(loggedUser);
      setAccessToken(accessToken);
      if (loggedUser.role === 'PARTICIPANT') navigate('/dashboard/registrations');
      else if (loggedUser.role === 'ORGANIZER') navigate('/dashboard/events');
      else if (loggedUser.role === 'JUDGE') navigate('/dashboard/assignments');
      else navigate('/');
    } catch (err: any) {
      showToast.error(err.response?.data?.message || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-72 h-72 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)", top: "10%", right: "15%" }} />
        <div className="absolute w-96 h-96 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)", bottom: "5%", left: "10%" }} />
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
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1.5 tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in to continue to Atria</p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    autoComplete="current-password"
                    {...register("password")}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 input-glow transition-all duration-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || googleLoading}
                className="btn-premium w-full h-12 rounded-xl text-sm font-bold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Authenticating...
                  </span>
                ) : (
                  <>
                    Sign In
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
                  or continue with
                </span>
              </div>
            </div>

            {/* Google */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => showToast.error("Google login failed")}
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
          New to the platform?{" "}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
