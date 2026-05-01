import { useState, useEffect } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import { Badge } from "@/react-app/components/ui/badge";
import { Wallet, ArrowUpRight, ArrowDownLeft, Download } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";

import { useAuthStore } from "@/react-app/store/useAuthStore";

export default function InstructorEarnings() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            if (!user?.id) return;
            try {
                const [data, settings] = await Promise.all([
                    apiService.getInstructorEarnings(user.id),
                    apiService.getSystemSettings()
                ]);
                
                // Fallback: Eğer backend'den aylık gelir 0 geliyorsa ama bugün işlem varsa, frontend'de hesapla
                if (data && (!data.thisMonthRevenue || data.thisMonthRevenue === 0) && data.transactions) {
                    const today = new Date().toISOString().split('T')[0];
                    const calculatedThisMonth = data.transactions
                        .filter((tr: any) => tr.date.startsWith(today))
                        .reduce((sum: number, tr: any) => sum + (tr.amount || 0), 0);
                    
                    if (calculatedThisMonth > 0) {
                        data.thisMonthRevenue = calculatedThisMonth;
                        if (!data.newEnrollmentsCount) {
                            data.newEnrollmentsCount = data.transactions.filter((tr: any) => tr.date.startsWith(today)).length;
                        }
                    }
                }
                if (data) {
                    const commissionRate = settings?.platform_commission ? Number(settings.platform_commission) : 15;
                    data.availableWithdrawal = data.totalBalance * ((100 - commissionRate) / 100);
                }
                
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch earnings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, [user?.id]);

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Kazanç Takibi</h1>
                    <p className="text-muted-foreground">Satışlarınızı kontrol edin ve ödemelerinizi planlayın.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 space-y-2">
                    <p className="text-sm text-muted-foreground">Toplam Bakiye</p>
                    {loading ? <Skeleton className="h-10 w-32" /> : <p className="text-3xl font-bold text-foreground">{stats?.totalBalance.toLocaleString()} ₺</p>}
                </Card>
                <Card className="p-6 space-y-2">
                    <p className="text-sm text-muted-foreground">Çekilebilir Tutar</p>
                    {loading ? <Skeleton className="h-10 w-32" /> : <p className="text-3xl font-bold text-foreground">{stats?.availableWithdrawal.toLocaleString()} ₺</p>}
                    <Button variant="link" className="p-0 h-auto text-xs font-semibold">Şimdi Para Çek</Button>
                </Card>
                <Card className="p-6 space-y-2">
                    <p className="text-sm text-muted-foreground">Bu Ayki Satış</p>
                    {loading ? (
                        <Skeleton className="h-10 w-32" />
                    ) : (
                        <p className="text-3xl font-bold text-foreground">
                            {(stats?.thisMonthRevenue || 0).toLocaleString()} ₺
                        </p>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        {stats?.newEnrollmentsCount || 0} yeni kayıt
                        {/* Debug: {JSON.stringify(stats?.thisMonthRevenue)} */}
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Son İşlemler</h2>
                <div className="space-y-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                    ) : stats?.transactions.map((tr: any) => (
                        <div key={tr.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium">{tr.course}</p>
                                    <p className="text-xs text-muted-foreground">{tr.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-foreground">+{tr.amount} ₺</p>
                                <Badge variant="secondary" className="text-[10px]">{tr.status}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
