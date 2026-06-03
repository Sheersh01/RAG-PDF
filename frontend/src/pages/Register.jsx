import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { UserPlus, Mail, Lock, User, Loader2, BrainCircuit } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Register = () => {
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    const res = await registerUser(data.name, data.email, data.password);
    if (res.success) {
      toast.success("Account created! Welcome to InterviewPilot.");
      navigate("/dashboard");
    } else {
      toast.error(res.message || "Failed to create account");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#111111] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-8 h-8 rounded bg-[#111111] flex items-center justify-center text-white font-bold text-sm mb-4">
            ip
          </div>
          <h2 className="text-3xl font-display font-medium tracking-tight text-[#111111] mb-1">
            Create Account
          </h2>
          <p className="text-xs text-[#6B6B6B]">
            Get started with your interview workspace
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-[#E8E8E6] rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B6B6B]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border border-[#E8E8E6] focus:border-[#111111] outline-none text-[#111111] placeholder-[#6B6B6B]/40 bg-white ${
                    errors.name ? "border-red-500/65" : ""
                  }`}
                  {...registerField("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1.5 font-medium pl-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B6B6B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border border-[#E8E8E6] focus:border-[#111111] outline-none text-[#111111] placeholder-[#6B6B6B]/40 bg-white ${
                    errors.email ? "border-red-500/65" : ""
                  }`}
                  {...registerField("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1.5 font-medium pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B6B6B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border border-[#E8E8E6] focus:border-[#111111] outline-none text-[#111111] placeholder-[#6B6B6B]/40 bg-white ${
                    errors.password ? "border-red-500/65" : ""
                  }`}
                  {...registerField("password")}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1.5 font-medium pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-[#111111] hover:bg-black text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          {/* Form Footer */}
          <div className="mt-6 pt-6 border-t border-[#E8E8E6] text-center">
            <p className="text-xs text-[#6B6B6B]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#111111] hover:underline font-semibold ml-1"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
