import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { authApi } from "../api/auth.api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import axiosInstance from "../api/axios";
import { useState } from "react";
import { showToast } from "../lib/toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const resp = await authApi.login(data.email, data.password);
      setUser(resp.data.data.user);
      setAccessToken(resp.data.data.accessToken);
      navigate("/dashboard/events");
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
      const { accessToken, user } = response.data.data;
      setUser(user);
      setAccessToken(accessToken);
      navigate("/dashboard/events");
    } catch (err: any) {
      showToast.error(err.response?.data?.message || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900 italic">Atria</CardTitle>
          <CardDescription className="text-lg">Welcome back to the arena</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email</label>
              <Input 
                type="email" 
                placeholder="john@example.com"
                {...register("email")}
                error={!!errors.email}
                className="h-11"
              />
              {errors.email && <p className="text-xs text-danger font-medium">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••"
                {...register("password")}
                error={!!errors.password}
                className="h-11"
              />
              {errors.password && <p className="text-xs text-danger font-medium">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full h-11 text-lg shadow-md" disabled={isSubmitting || googleLoading}>
              {isSubmitting ? "Authenticating..." : "Sign In"}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-500 font-bold tracking-widest">or continue with</span>
            </div>
          </div>

          <div className="flex justify-center flex-col items-center gap-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => showToast.error("Google login failed")}
              theme="outline"
              size="large"
              width="320"
              shape="pill"
            />
          </div>
        </CardContent>
        <CardFooter className="justify-center pt-2 pb-6 border-t border-slate-50">
          <p className="text-sm text-secondary">
            New to the platform? <Link to="/register" className="text-primary hover:underline font-bold">Create an account</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
