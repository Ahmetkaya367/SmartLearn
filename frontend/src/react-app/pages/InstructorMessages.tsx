import { useState, useEffect } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import { Search, Mail, User, Send } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";

export default function InstructorMessages() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await apiService.getMessages();
                setMessages(data);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, []);

    return (
        <div className="p-8 space-y-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Mesajlar</h1>
                <p className="text-muted-foreground">Öğrencilerinizden gelen soruları yanıtlayın.</p>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Mesajlarda ara..." className="pl-10" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto divide-y">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                        ) : messages.map((m) => (
                            <div key={m.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-sm">{m.sender}</p>
                                    <span className="text-[10px] text-muted-foreground">{m.time}</span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">{m.content}</p>
                                {!m.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="md:col-span-2 flex flex-col overflow-hidden">
                    <div className="flex-1 p-6 flex items-center justify-center text-center">
                        <div className="space-y-4 max-w-sm">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                                <Mail className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Bir konuşma seçin</h3>
                                <p className="text-sm text-muted-foreground">Sohbeti görüntülemek ve yanıtlamak için soldaki listeden bir kişiye tıklayın.</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
