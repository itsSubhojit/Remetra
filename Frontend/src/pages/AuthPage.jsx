import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login"); // 'login' | 'register' | 'forgot'
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, loginDemoUser, resetPassword } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState(location.state?.email || "");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: "", color: "" });

  // Reset form state
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Status & error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordStrength = (val) => {
    setRegPassword(val);
    if (!val) {
      setPasswordStrength({ score: 0, text: "", color: "" });
      return;
    }
    if (val.length < 6) {
      setPasswordStrength({ score: 25, text: "Weak", color: "bg-error text-error" });
    } else if (val.length < 10) {
      setPasswordStrength({ score: 50, text: "Fair", color: "bg-secondary text-secondary" });
    } else {
      setPasswordStrength({ score: 100, text: "Strong Vault Password", color: "bg-tertiary text-tertiary" });
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!loginEmail || !loginPassword) {
      setError("Please fill in both email and password.");
      return;
    }
    try {
      setLoading(true);
      await login(loginEmail, loginPassword);
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!regEmail || !regPassword) {
      setError("Email and password are required.");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (regPassword !== regConfirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      await register(regName, regEmail, regPassword);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    try {
      setLoading(true);
      await loginWithGoogle();
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!resetEmail) {
      setError("Please enter your email address.");
      return;
    }
    try {
      setLoading(true);
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body-md min-h-screen flex flex-col justify-between overflow-x-hidden selection:bg-primary selection:text-on-primary-container">
      {/* Main Container Split Layout */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto min-h-screen grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* LEFT COLUMN: Brand Showcase & Alert Previews (Hidden on small screens, shown lg+) */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between p-12 xl:p-16 relative overflow-hidden border-r border-outline-variant/30">
          <div className="mesh-glow-1"></div>
          <div className="mesh-glow-2"></div>

          {/* Top Header / Logo */}
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 mb-4 group inline-flex">
              <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(99,102,241,0.25)] group-hover:scale-105 transition-all">
                <span className="material-symbols-outlined text-primary text-[24px]">receipt_long</span>
              </div>
              <div>
                <h1 className="text-headline-md font-headline-md font-extrabold text-on-surface tracking-tight leading-none">
                  Remetra
                </h1>
                <span className="text-label-sm font-label-sm text-on-surface-variant tracking-wider uppercase">
                  Household Vault
                </span>
              </div>
            </Link>
            <p className="text-headline-sm font-headline-sm text-on-surface font-normal max-w-md mt-6 leading-snug">
              Smart Bill Reminders &amp; Spend Insights
            </p>
            <p className="text-body-md font-body-md text-on-surface-variant max-w-sm mt-2">
              Calm financial foresight. Manage utility schedules, subscriptions, and recurring obligations without noise.
            </p>
          </div>

          {/* Middle Content: High-Fidelity Alert Visual Cards */}
          <div className="relative z-10 my-8 space-y-4 max-w-md">
            <div className="text-label-sm font-label-sm uppercase tracking-widest text-outline">Real-time Cycle Monitoring</div>

            {/* Alert 1: Tata Power */}
            <div className="bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/50 rounded-xl p-4 transition-all duration-300 hover:border-primary/40 shadow-sm relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-container"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary border border-outline-variant/40">
                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                  </div>
                  <div>
                    <h4 className="text-body-md font-body-md font-semibold text-on-surface">Tata Power</h4>
                    <div className="flex items-center gap-1.5 text-body-sm font-body-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span>Due tomorrow • Electricity</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-body-lg font-numeric-metric font-semibold text-on-surface">₹3,420</div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-error-container/30 text-error border border-error/30">
                    Action Req.
                  </span>
                </div>
              </div>
            </div>

            {/* Alert 2: Airtel Prepaid */}
            <div className="bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/50 rounded-xl p-4 transition-all duration-300 hover:border-primary/40 shadow-sm relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-tertiary border border-outline-variant/40">
                    <span className="material-symbols-outlined text-[20px]">signal_cellular_alt</span>
                  </div>
                  <div>
                    <h4 className="text-body-md font-body-md font-semibold text-on-surface">Airtel Prepaid</h4>
                    <div className="flex items-center gap-1.5 text-body-sm font-body-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">event_repeat</span>
                      <span>Validity expiring in 3 days</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-body-lg font-numeric-metric font-semibold text-on-surface">₹839</div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-secondary-container/20 text-secondary border border-secondary-container/40">
                    Cycle Alert
                  </span>
                </div>
              </div>
            </div>

            {/* Metric pill summary */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-surface-container-lowest/60 border border-outline-variant/30 rounded-lg p-3">
                <div className="text-label-sm font-label-sm text-on-surface-variant">Upcoming (7d)</div>
                <div className="text-headline-sm font-numeric-metric font-semibold text-on-surface mt-0.5">₹14,250</div>
              </div>
              <div className="bg-surface-container-lowest/60 border border-outline-variant/30 rounded-lg p-3">
                <div className="text-label-sm font-label-sm text-on-surface-variant">Protected Vault</div>
                <div className="text-headline-sm font-headline-sm font-semibold text-tertiary mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span> 100% Isolated
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Reassurance */}
          <div className="relative z-10 pt-6 border-t border-outline-variant/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-container/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">shield</span>
            </div>
            <p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
              Household bills organized without banking credentials or security risks. Built upon isolated zero-trust cloud infrastructure.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Auth Card */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center p-6 sm:p-10 md:p-12 relative">
          {/* Background Ambient Flare */}
          <div className="absolute -top-12 -right-12 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-3 mb-6 self-start">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
              <div>
                <h2 className="text-headline-sm font-headline-sm font-extrabold text-on-surface tracking-tight">Remetra</h2>
                <span className="text-label-sm font-label-sm text-on-surface-variant uppercase">Household Vault</span>
              </div>
            </Link>
          </div>

          {/* Auth Container Box */}
          <div className="w-full max-w-md bg-surface-container-low border border-outline-variant/50 rounded-2xl p-6 sm:p-8 shadow-xl relative backdrop-blur-sm">
            {/* Tabbed Switcher */}
            <div className="flex items-center justify-between p-1 bg-surface-container-lowest rounded-xl border border-outline-variant/40 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setError("");
                }}
                className={`flex-1 py-2 text-center text-label-md font-label-md rounded-lg transition-all duration-150 font-semibold ${
                  activeTab === "login"
                    ? "bg-surface-container-high text-primary border border-outline-variant/40 shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setError("");
                }}
                className={`flex-1 py-2 text-center text-label-md font-label-md rounded-lg transition-all duration-150 font-semibold ${
                  activeTab === "register"
                    ? "bg-surface-container-high text-primary border border-outline-variant/40 shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("forgot");
                  setError("");
                }}
                className={`flex-1 py-2 text-center text-label-md font-label-md rounded-lg transition-all duration-150 font-semibold ${
                  activeTab === "forgot"
                    ? "bg-surface-container-high text-primary border border-outline-variant/40 shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Reset
              </button>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-error-container/20 border border-error/40 text-error text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* FORM 1: LOGIN MODE */}
            {activeTab === "login" && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface">Welcome back</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail("subhojit@remetra.app");
                        setLoginPassword("remetra123");
                      }}
                      className="text-label-sm font-label-sm text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 transition hover:bg-primary/20"
                      title="Auto-fill demo credentials"
                    >
                      <span className="material-symbols-outlined text-[14px]">bolt</span>
                      Auto-fill Demo
                    </button>
                  </div>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                    Access your household vault and scheduled debits.
                  </p>
                </div>
                <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-label-md font-label-md text-on-surface" htmlFor="login-email">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                        mail
                      </span>
                      <input
                        className="w-full h-10 pl-10 pr-3 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-body-md font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
                        id="login-email"
                        placeholder="alex@remetra.app"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-label-md font-label-md text-on-surface" htmlFor="login-password">
                        Password
                      </label>
                      <button
                        type="button"
                        className="text-label-sm font-label-sm text-primary hover:underline"
                        onClick={() => setActiveTab("forgot")}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                        lock
                      </span>
                      <input
                        className="w-full h-10 pl-10 pr-10 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-body-md font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
                        id="login-password"
                        placeholder="••••••••••••"
                        type={showLoginPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        className="absolute right-3 top-2.5 text-outline hover:text-on-surface flex items-center"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showLoginPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        defaultChecked
                        className="w-4 h-4 rounded bg-surface-container-lowest border-outline-variant/80 text-primary-container focus:ring-0 focus:ring-offset-0"
                        type="checkbox"
                      />
                      <span className="text-body-sm font-body-sm text-on-surface-variant">Keep session active</span>
                    </label>
                  </div>

                  <button
                    className="w-full h-10 rounded-lg bg-primary-container text-on-primary-container font-label-lg font-semibold hover:opacity-95 active:scale-[0.98] transition shadow-[0_4px_14px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 disabled:opacity-60"
                    type="submit"
                    disabled={loading}
                  >
                    {loading && <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>}
                    <span>Sign In to Remetra</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/30"></div>
                  </div>
                  <div className="relative flex justify-center text-label-sm font-label-sm">
                    <span className="px-3 bg-surface-container-low text-on-surface-variant">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full h-10 rounded-lg bg-surface-container-lowest border border-outline-variant/50 hover:border-outline-variant text-on-surface font-label-md font-medium flex items-center justify-center gap-3 transition active:scale-[0.98] disabled:opacity-60"
                  type="button"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.8 5 12 5z"
                      fill="#EA4335"
                    />
                    <path
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z"
                      fill="#4285F4"
                    />
                    <path
                      d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.6 7c-.8 1.6-1.3 3.4-1.3 5.3s.5 3.7 1.3 5.3l3.7-2.9z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 6.4 10.4 6.4z"
                      fill="#34A853"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Explore Demo Vault */}
                <button
                  onClick={() => {
                    loginDemoUser();
                    navigate("/dashboard");
                  }}
                  className="w-full mt-2.5 h-10 rounded-lg bg-surface-container-high border border-outline-variant/60 hover:border-primary/40 text-primary font-label-md font-semibold flex items-center justify-center gap-2 transition active:scale-[0.98]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>Explore Demo Household Vault</span>
                </button>

                <p className="text-center text-body-sm font-body-sm text-on-surface-variant pt-2">
                  Don't have an account?{" "}
                  <button
                    className="text-primary font-semibold hover:underline"
                    onClick={() => {
                      setActiveTab("register");
                      setError("");
                    }}
                    type="button"
                  >
                    Register now
                  </button>
                </p>
              </div>
            )}

            {/* FORM 2: REGISTER MODE */}
            {activeTab === "register" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface">Create vault account</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                    Start monitoring your commitments with zero data sharing.
                  </p>
                </div>
                <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-label-md font-label-md text-on-surface" htmlFor="reg-name">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                        person
                      </span>
                      <input
                        className="w-full h-10 pl-10 pr-3 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-body-md font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
                        id="reg-name"
                        placeholder="Alex Morgan"
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-label-md font-label-md text-on-surface" htmlFor="reg-email">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                        mail
                      </span>
                      <input
                        className="w-full h-10 pl-10 pr-3 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-body-md font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
                        id="reg-email"
                        placeholder="alex@remetra.app"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-label-md font-label-md text-on-surface" htmlFor="reg-password">
                      Password
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                        lock
                      </span>
                      <input
                        className="w-full h-10 pl-10 pr-10 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-body-md font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
                        id="reg-password"
                        placeholder="Minimum 8 characters"
                        type={showRegPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => handlePasswordStrength(e.target.value)}
                        required
                      />
                      <button
                        className="absolute right-3 top-2.5 text-outline hover:text-on-surface flex items-center"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showRegPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {regPassword && (
                      <div className="pt-1">
                        <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden flex">
                          <div
                            className={`h-full transition-all duration-300 ${passwordStrength.color.split(" ")[0]}`}
                            style={{ width: `${passwordStrength.score}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className={`text-label-sm font-label-sm ${passwordStrength.color.split(" ")[1]}`}>
                            {passwordStrength.text}
                          </span>
                          <span className="text-label-sm font-label-sm text-on-surface-variant">Use uppercase &amp; symbols</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-label-md font-label-md text-on-surface" htmlFor="reg-confirm">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                        lock_reset
                      </span>
                      <input
                        className="w-full h-10 pl-10 pr-3 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-body-md font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
                        id="reg-confirm"
                        placeholder="Repeat your password"
                        type="password"
                        value={regConfirm}
                        onChange={(e) => setRegConfirm(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <p className="text-body-sm font-body-sm text-on-surface-variant text-[11px] leading-tight pt-1">
                    By creating an account, you accept Remetra's zero-knowledge security agreement.
                  </p>

                  <button
                    className="w-full h-10 rounded-lg bg-primary-container text-on-primary-container font-label-lg font-semibold hover:opacity-95 active:scale-[0.98] transition shadow-[0_4px_14px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 disabled:opacity-60"
                    type="submit"
                    disabled={loading}
                  >
                    {loading && <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>}
                    <span>Create Account</span>
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/30"></div>
                  </div>
                  <div className="relative flex justify-center text-label-sm font-label-sm">
                    <span className="px-3 bg-surface-container-low text-on-surface-variant">Or sign up with</span>
                  </div>
                </div>

                {/* Google Sign Up */}
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full h-10 rounded-lg bg-surface-container-lowest border border-outline-variant/50 hover:border-outline-variant text-on-surface font-label-md font-medium flex items-center justify-center gap-3 transition active:scale-[0.98] disabled:opacity-60"
                  type="button"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.8 5 12 5z"
                      fill="#EA4335"
                    />
                    <path
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z"
                      fill="#4285F4"
                    />
                    <path
                      d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.6 7c-.8 1.6-1.3 3.4-1.3 5.3s.5 3.7 1.3 5.3l3.7-2.9z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 6.4 10.4 6.4z"
                      fill="#34A853"
                    />
                  </svg>
                  <span>Sign up with Google</span>
                </button>

                <p className="text-center text-body-sm font-body-sm text-on-surface-variant pt-2">
                  Already registered?{" "}
                  <button
                    className="text-primary font-semibold hover:underline"
                    onClick={() => {
                      setActiveTab("login");
                      setError("");
                    }}
                    type="button"
                  >
                    Log in here
                  </button>
                </p>
              </div>
            )}

            {/* FORM 3: FORGOT PASSWORD MODE */}
            {activeTab === "forgot" && (
              <div className="space-y-5">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-surface-container-highest border border-outline-variant/50 flex items-center justify-center text-primary mb-3">
                    <span className="material-symbols-outlined text-[22px]">key</span>
                  </div>
                  <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface">Recover vault access</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                    Enter your registered email and we'll dispatch an end-to-end encrypted recovery link.
                  </p>
                </div>
                <form onSubmit={handleResetSubmit} className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-label-md font-label-md text-on-surface" htmlFor="forgot-email">
                      Account Email
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                        alternate_email
                      </span>
                      <input
                        className="w-full h-10 pl-10 pr-3 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-body-md font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
                        id="forgot-email"
                        placeholder="name@domain.com"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {resetSuccess && (
                    <div className="p-3 rounded-lg bg-tertiary-container/20 border border-tertiary/40 text-tertiary text-body-sm font-body-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Reset instructions sent to your email.</span>
                    </div>
                  )}

                  <button
                    className="w-full h-10 rounded-lg bg-primary-container text-on-primary-container font-label-lg font-semibold hover:opacity-95 active:scale-[0.98] transition shadow-[0_4px_14px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 disabled:opacity-60"
                    type="submit"
                    disabled={loading}
                  >
                    {loading && <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>}
                    <span>Send Reset Email</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>

                  <button
                    className="w-full h-10 rounded-lg bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md font-semibold transition flex items-center justify-center gap-2"
                    onClick={() => {
                      setActiveTab("login");
                      setError("");
                      setResetSuccess(false);
                    }}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    <span>Back to Login</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Compliance & Status Footer */}
          <div className="mt-8 flex items-center gap-6 text-label-sm font-label-sm text-outline">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span> Systems Operational
            </span>
            <span>•</span>
            <span>Firebase Auth Protected</span>
            <span>•</span>
            <span className="hover:text-on-surface cursor-pointer">Zero Trust Isolation</span>
          </div>
        </div>
      </main>
    </div>
  );
};
