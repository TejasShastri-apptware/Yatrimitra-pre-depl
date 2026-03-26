import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (username === "user123" && password === "pass123") {
            localStorage.setItem("auth", "true");
            navigate("/");
        } else {
            setError("Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />

            <div className="relative w-full max-w-[440px] px-6">
                
                {/*Icon*/}
                <div className="flex justify-center mb-8">
                    <div className="h-12 max-w-full rounded-xl bg-gradient-to-tr from-blue-400 via-teal-500 to-green-400 flex items-center justify-center shadow-lg shadow-green-500/20 rotate-3">
                        <span className="px-3 text-black font-black text-2xl">YatriMitra Blueprints</span>
                    </div>
                </div>

                <div className="bg-slate-950/50 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-8 md:p-10 shadow-2xl">
                    <header className="mb-10">
                        <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-slate-400 text-sm">
                            Enter your credentials to access <span className="text-green-400 font-medium">Yatrimitra</span>
                        </p>
                    </header>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-slate-500 ml-1">
                                Username
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. user123"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-900/50 text-slate-200 rounded-xl border border-slate-800 px-4 py-3 
                                           focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50
                                           transition-all duration-300 placeholder:text-slate-600 shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-medium uppercase tracking-widest text-slate-500">
                                    Password
                                </label>
                                <button type="button" className="text-xs text-green-500 hover:text-green-400 transition-colors">
                                    Forgot?
                                </button>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900/50 text-slate-200 rounded-xl border border-slate-800 px-4 py-3 
                                           focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50
                                           transition-all duration-300 placeholder:text-slate-600 shadow-inner"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 py-2 rounded-lg">
                                <p className="text-red-400 text-xs text-center font-medium">{error}</p>
                            </div>
                        )}

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full h-12 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl
                                           shadow-lg shadow-green-500/20 transition-all duration-300 
                                           active:scale-[0.98] relative overflow-hidden group"
                            >
                                <span className="relative z-10">Sign In</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            </Button>
                        </div>
                    </form>

                    <footer className="mt-10 pt-6 border-t border-slate-800/50">
                        <p className="text-center text-slate-500 text-xs">
                            I'll implement actual auth based on what Sir.KP says
                        </p>
                    </footer>
                </div>

                {/* Footnote */}
                <p className="mt-8 text-center text-slate-600 text-[11px] uppercase tracking-[0.2em]">
                    &copy; 2026 Yatrimitra Systems
                </p>
            </div>
        </div>
    );
}