import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { authApi } from "../api/auth.api";
import { UserRole } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import axiosInstance from "../api/axios";
import { useState } from "react";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.nativeEnum(UserRole)
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function Register() {
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: UserRole.PARTICIPANT }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const resp = await authApi.register(data.name, data.email, data.password, data.role);
      setUser(resp.data.data.user);
      setAccessToken(resp.data.data.accessToken);
      navigate("/dashboard/events");
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
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
      alert(err.response?.data?.message || "Google registration failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900 italic">Atria</CardTitle>
          <CardDescription className="text-lg">Create your champion account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Full Name</label>
              <Input 
                type="text" 
                placeholder="John Doe"
                {...register("name")}
                error={!!errors.name}
                className="h-11"
              />
              {errors.name && <p className="text-xs text-danger font-medium">{errors.name.message}</p>}
            </div>

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

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">I want to:</label>
              <select 
                {...register("role")}
                className="flex h-11 w-full rounded-lg border border-secondary/20 bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
              >
                <option value={UserRole.PARTICIPANT}>Participate in Events</option>
                <option value={UserRole.ORGANIZER}>Organize Events</option>
                <option value={UserRole.JUDGE}>Judge Events</option>
              </select>
            </div>

            <Button type="submit" className="w-full h-11 text-lg shadow-md mt-2" disabled={isSubmitting || googleLoading}>
              {isSubmitting ? "Creating..." : "Sign Up"}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-500 font-bold tracking-widest">or join with</span>
            </div>
          </div>

          <div className="flex justify-center flex-col items-center gap-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google registration failed")}
              theme="outline"
              size="large"
              width="320"
              shape="pill"
            />
          </div>
        </CardContent>
        <CardFooter className="justify-center pt-2 pb-6 border-t border-slate-50">
          <p className="text-sm text-secondary">
            Already a member? <Link to="/login" className="text-primary hover:underline font-bold">Sign In</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
