import { useState } from "react";
import { Link } from "react-router-dom";
import { profileService } from "../../services";
import { Mail, KeyRound, ShieldCheck, ArrowLeft, Phone } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/krishi-setu-logo.png";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("email"); // "email" or "phone"
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await profileService.forgotPassword(email, method);
      toast.success(res.data?.message || "OTP sent!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await profileService.verifyOtp(email, otp);
      toast.success("OTP verified!");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await profileService.resetPassword(email, otp, newPassword);
      toast.success("Password reset successfully! Please login.");
      window.location.href = "/login";
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { icon: Mail, label: "Email", active: step >= 1 },
    { icon: ShieldCheck, label: "Verify OTP", active: step >= 2 },
    { icon: KeyRound, label: "New Password", active: step >= 3 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <img src={logo} alt="Krishi Setu" className="h-8 w-8" />
          <span className="text-xl font-bold text-gray-900">Krishi Setu</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold ${
                s.active ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${s.active ? "text-primary-700 font-medium" : "text-gray-400"}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${step > i + 1 ? "bg-primary-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <p className="text-sm text-gray-500 mb-4">Enter your registered email and choose how to receive the OTP.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Send OTP via</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    method === "email"
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("phone")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    method === "phone"
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  Phone SMS
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <p className="text-sm text-gray-500 mb-4">Enter the 6-digit OTP sent to your <strong>{method === "phone" ? "phone" : "email"}</strong> ({method === "phone" ? "registered number" : email})</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-center text-2xl tracking-[0.5em]"
                placeholder="000000"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button type="button" onClick={() => setStep(1)}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
              Resend OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <p className="text-sm text-gray-500 mb-4">Create a new password for your account.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
