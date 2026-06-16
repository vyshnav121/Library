import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Library, Mail, Lock, User, Loader2, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP Verification view states
  const [isVerifyStep, setIsVerifyStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const { register, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // If redirected with verification request, open OTP step directly
    const verifyParam = searchParams.get('verify');
    const emailParam = searchParams.get('email');
    if (verifyParam === 'true' && emailParam) {
      setEmail(emailParam);
      setIsVerifyStep(true);
      setSuccessMsg('Your account is registered but unverified. Please input the 6-digit code from the console.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    const result = await register(name, email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    const result = await verifyOTP(email, otpCode);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    const result = await resendOTP(email);
    if (result.success) {
      setSuccessMsg('A new OTP has been printed to the server console.');
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="flex items-center mb-8">
        <Library className="h-10 w-10 text-primary mr-3" />
        <h1 className="text-3xl font-black tracking-tight">SmartLibrary</h1>
      </div>

      <div className="max-w-md w-full card p-8 sm:p-10 border border-border shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />

        {!isVerifyStep ? (
          <>
            <div>
              <h2 className="text-2xl font-bold text-text">Create an account</h2>
              <p className="mt-2 text-sm text-gray-500">Join the smart library community</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded-r-xl flex gap-2 text-rose-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text mb-1.5 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field pl-10 py-3 text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1.5 uppercase tracking-wide">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10 py-3 text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1.5 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10 py-3 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center py-3.5 text-xs uppercase tracking-widest font-bold shadow-xl shadow-primary/20"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create account'}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-border pt-6">
              <p className="text-xs text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => {
                  setIsVerifyStep(false);
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-gray-400 hover:text-text transition-colors p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-text">Verify Email OTP</h2>
            </div>
            <p className="text-xs text-gray-500 mb-6">Enter the 6-digit OTP code sent to {email}</p>

            {error && (
              <div className="bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded-r-xl text-rose-400 text-xs mb-4">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-r-xl text-emerald-400 text-xs mb-4">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-text mb-1.5 uppercase tracking-wide">Verification OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="input-field pl-10 py-3 text-sm font-mono tracking-widest text-center"
                    placeholder="123456"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center py-3.5 text-xs uppercase tracking-widest font-bold shadow-xl shadow-primary/20"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify Account'}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="w-full text-center text-xs font-bold text-primary hover:underline uppercase tracking-wider mt-2"
              >
                Resend Code
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
