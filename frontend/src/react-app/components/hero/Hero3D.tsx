import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Button } from "@/react-app/components/ui/button";
import { Scene } from './Scene';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiService } from '@/react-app/lib/apiService';
import { useAuthStore } from '@/react-app/store/useAuthStore';

export default function Hero3D() {
    const { user } = useAuthStore();
    const [userCount, setUserCount] = useState<number>(0);

    useEffect(() => {
        apiService.getAdminUsers()
            .then(users => setUserCount(users.length))
            .catch(() => setUserCount(2000)); // Fallback
    }, []);
    return (
        <section className="relative w-full min-h-screen lg:min-h-[800px] overflow-hidden bg-background">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] opacity-30 animate-pulse delay-1000" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full h-full flex flex-col lg:flex-row items-center">
                {/* Left Content */}
                <div className="w-full lg:w-1/2 pt-24 lg:pt-0 pb-12 lg:pb-0 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            New: Yapay Zeka Destekli Öğrenme Yolları
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
                            Sınır Tanımadan <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                                Öğrenin
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
                            Uzman eğitmenlerden dünya standartlarında kurslarla potansiyelinizi açığa çıkarın. 
                            Premium ve sürükleyici bir öğrenme ortamında yeni beceriler kazanın.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            {user?.role !== "admin" && user?.role !== "instructor" && (
                                <Link to="/ai-assistant">
                                    <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 w-full sm:w-auto">
                                        Ücretsiz Yapay Zeka Desteğini Başlat
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                            )}
                        </div>

                        <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-background bg-slate-200 flex items-center justify-center overflow-hidden z-[${5 - i}]`}>
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-background bg-slate-100 flex items-center justify-center text-xs font-semibold z-0">
                                    {userCount > 0 ? `+${userCount}` : '+2k'}
                                </div>
                            </div>
                            <p>{userCount > 0 ? `${userCount} öğrencinin tercihi` : "2.000'den fazla öğrencinin tercihi"}</p>
                        </div>
                    </motion.div>
                </div>

                {/* Right 3D Scene */}
                <div className="w-full lg:w-1/2 h-[500px] lg:h-[800px] relative pointer-events-none lg:pointer-events-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                        className="w-full h-full absolute inset-0"
                    >
                        <Scene />
                    </motion.div>
                </div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50 z-20"
            >
                <span className="text-xs uppercase tracking-widest">Kaydır</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
            </motion.div>
        </section>
    );
}
