import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { LogIn, Mail, Lock, Loader2, BrainCircuit } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    const res = await login(data.email, data.password);
    if (res.success) {
      toast.success("Welcome back to InterviewPilot!");
      navigate("/dashboard");
    } else {
      toast.error(res.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background visual helpers */}
      <div className="glow-blob bg-indigo-600/10 w-[400px] h-[400px] -top-20 -left-20 animate-pulse-slow" />
      <div className="glow-blob bg-purple-650/10 w-[500px] h-[500px] -bottom-30 -right-20 animate-pulse-slow" style={{ animationDelay: "2.5s" }} />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-4 animate-float">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-display font-extrabold tracking-tight text-white mb-1">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-400">
            Sign in to access your interview workspace
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-card rounded-2xl border border-slate-800/60 p-8 shadow-2xl relative">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm glass-input text-slate-200 placeholder-slate-650 ${
                    errors.email ? "border-rose-500/65 focus:border-rose-500" : ""
                  }`}
                  {...registerField("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm glass-input text-slate-200 placeholder-slate-650 ${
                    errors.password ? "border-rose-500/65 focus:border-rose-500" : ""
                  }`}
                  {...registerField("password")}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Form Footer */}
          <div className="mt-6 pt-6 border-t border-slate-800/40 text-center">
            <p className="text-xs text-slate-450">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-1"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
