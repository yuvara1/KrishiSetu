import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Sprout, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success("Welcome back!");
      const routes = {
        FARMER: "/farmer",
        RETAILER: "/retailer",
        ADMIN: "/admin",
      };
      navigate(routes[user.role] || "/");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-800 to-primary-950 text-white flex-col justify-center px-16">
        <Sprout className="h-16 w-16 text-primary-300 mb-8" />
        <h1 className="text-4xl font-bold mb-4">Krishi Setu</h1>
        <p className="text-primary-200 text-lg leading-relaxed mb-10">
          From farm to marketplace in just a few simple steps.
        </p>
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary-300 text-primary-900 font-bold text-sm shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold text-lg">Create Your Account</h3>
              <p className="text-primary-200 text-sm mt-1">
                Sign up as a farmer or retailer and set up your profile in
                minutes.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary-300 text-primary-900 font-bold text-sm shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold text-lg">List or Browse Crops</h3>
              <p className="text-primary-200 text-sm mt-1">
                Farmers list crop batches with photos and details. Retailers
                browse the marketplace.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary-300 text-primary-900 font-bold text-sm shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold text-lg">Place & Accept Bids</h3>
              <p className="text-primary-200 text-sm mt-1">
                Retailers bid on crops they need. Farmers review and accept the
                best offers.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary-300 text-primary-900 font-bold text-sm shrink-0">
              4
            </div>
            <div>
              <h3 className="font-semibold text-lg">Trade & Get Paid</h3>
              <p className="text-primary-200 text-sm mt-1">
                Complete the order with secure tracking and transparent payment
                processing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Sprout className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">
              Krishi Setu
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 mt-1 mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary-600 font-medium hover:text-primary-700"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
