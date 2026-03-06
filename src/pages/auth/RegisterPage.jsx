import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, Eye, EyeOff, Tractor, Store } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    role: "",
  });

  const handleRoleSelect = (role) => {
    setForm({ ...form, role });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-800 to-primary-950 text-white flex-col justify-center px-16">
        <Sprout className="h-16 w-16 text-primary-300 mb-8" />
        <h1 className="text-4xl font-bold mb-4">Join Krishi Setu</h1>
        <p className="text-primary-200 text-lg leading-relaxed">
          Whether you're a farmer looking to sell your produce or a retailer
          searching for quality crops — we've got you covered.
        </p>
        <div className="mt-12 space-y-4">
          <div className="flex items-center gap-4 bg-primary-800/50 rounded-xl p-4">
            <Tractor className="h-8 w-8 text-primary-300" />
            <div>
              <p className="font-semibold">For Farmers</p>
              <p className="text-primary-400 text-sm">
                List crops, receive bids, get fair prices
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-primary-800/50 rounded-xl p-4">
            <Store className="h-8 w-8 text-primary-300" />
            <div>
              <p className="font-semibold">For Retailers</p>
              <p className="text-primary-400 text-sm">
                Browse fresh produce, place competitive bids
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Sprout className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Krishi Setu</span>
          </div>

          {step === 1 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900">I am a...</h2>
              <p className="text-gray-500 mt-1 mb-8">
                Select your role to get started
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => handleRoleSelect("FARMER")}
                  className="w-full flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                >
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200">
                    <Tractor className="h-6 w-6 text-green-700" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Farmer</p>
                    <p className="text-sm text-gray-500">
                      I want to sell my crops
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSelect("RETAILER")}
                  className="w-full flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                >
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                    <Store className="h-6 w-6 text-blue-700" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Retailer</p>
                    <p className="text-sm text-gray-500">I want to buy crops</p>
                  </div>
                </button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-8">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 font-medium hover:text-primary-700"
                >
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-primary-600 hover:text-primary-700 mb-4"
              >
                ← Change role
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                Create account
              </h2>
              <p className="text-gray-500 mt-1 mb-6">
                Registering as{" "}
                <span className="font-medium text-primary-600">
                  {form.role === "FARMER" ? "Farmer" : "Retailer"}
                </span>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={update("fullName")}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={form.username}
                      onChange={update("username")}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={update("email")}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
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
                      onChange={update("password")}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm pr-10"
                      placeholder="Min. 6 characters"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phoneNumber}
                    onChange={update("phoneNumber")}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                    placeholder="+91XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={form.address}
                    onChange={update("address")}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 font-medium hover:text-primary-700"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
