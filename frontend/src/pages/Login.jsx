import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Library, Mail, Lock, Loader2, Sparkles, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password recovery flow states
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = request code, 2 = enter code & reset
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { login, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    const result = await forgotPassword(email);
    if (result.success) {
      setSuccessMsg('A reset code has been generated. Check the server console.');
      setForgotStep(2);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    const result = await resetPassword(email, resetCode, newPassword);
    if (result.success) {
      setSuccessMsg('Your password has been reset successfully. Please log in.');
      setIsForgotMode(false);
      setForgotStep(1);
      setPassword('');
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
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />

        {!isForgotMode ? (
          <>
            <div>
              <h2 className="text-2xl font-bold text-text">Welcome back</h2>
              <p className="mt-2 text-sm text-gray-500">Sign in to your library account</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded-r-xl flex gap-2 text-rose-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-r-xl text-emerald-400 text-sm">
                  {successMsg}
                </div>
              )}

              <div className="space-y-4">
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
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-text uppercase tracking-wide">Password</label>
                    <button
                      type="button"
                      onClick={() => setIsForgotMode(true)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
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
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign in'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => {
                  setIsForgotMode(false);
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-gray-400 hover:text-text transition-colors p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-text">Reset Password</h2>
            </div>
            <p className="text-xs text-gray-500 mb-6">Recover access to your account using verification codes</p>

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

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestCode} className="space-y-5">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex justify-center items-center py-3.5 text-xs uppercase tracking-widest font-bold shadow-xl shadow-primary/20"
                >
                  {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Send Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text mb-1.5 uppercase tracking-wide">Verification Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        type="text"
                        required
                        maxLength="6"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        className="input-field pl-10 py-3 text-sm font-mono tracking-widest"
                        placeholder="123456"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text mb-1.5 uppercase tracking-wide">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                  {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Update Password'}
                </button>
              </form>
            )}
          </>
        )}

        <div className="mt-8 text-center border-t border-border pt-6">
          <p className="text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
