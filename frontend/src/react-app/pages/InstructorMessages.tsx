import { useState, useEffect, useRef } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Button } from "@/react-app/components/ui/button";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import { Search, Mail, User, Send, ChevronLeft, MoreVertical, MessageSquare } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";
import { cn } from "@/react-app/lib/utils";

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    sentAt: string;
    read: boolean;
}

interface Contact {
    id: string;
    name?: string;
    avatar?: string;
    lastMessage?: string;
    role?: string;
}

export default function InstructorMessages() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedTab, setSelectedTab] = useState<"recent" | "new">("recent");
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchRecentConversations();
    }, []);

    useEffect(() => {
        if (selectedContact) {
            fetchThread(selectedContact.id);
        }
    }, [selectedContact]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchRecentConversations = async () => {
        setLoading(true);
        try {
            const conversations = await apiService.getConversations();
            setContacts(conversations.map((c: any) => ({
                id: c.userId,
                name: c.name || "Unknown Person",
                lastMessage: c.lastMessage.content
            })));
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEligibleStudents = async () => {
        setLoading(true);
        try {
            const contactsList = await apiService.getEligibleContacts();
            setContacts(contactsList.map((c: any) => ({
                id: c.id,
                name: c.name || "Unknown Person",
            })));
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchThread = async (contactId: string) => {
        try {
            const thread = await apiService.getMessageThread(contactId);
            setMessages(thread);
        } catch (error) {
            console.error("Failed to fetch thread:", error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        try {
            const sent = await apiService.sendMessage(selectedContact.id, newMessage);
            setMessages([...messages, sent]);
            setNewMessage("");
            // Refresh contacts to update last message
            if (selectedTab === "recent") fetchRecentConversations();
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const filteredContacts = contacts.filter(c => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 h-[calc(100vh-64px)] flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Eğitmen Mesajları</h1>
                    <p className="text-muted-foreground">Öğrencilerinizin sorularını yanıtlayın ve onlara rehberlik edin.</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-card border rounded-2xl overflow-hidden flex shadow-sm">
                {/* Sidebar */}
                <div className={cn(
                    "w-full md:w-80 border-r flex flex-col bg-muted/30",
                    selectedContact ? "hidden md:flex" : "flex"
                )}>
                    <div className="p-4 space-y-4">
                        <div className="flex p-1 bg-muted rounded-lg">
                            <button
                                onClick={() => { setSelectedTab("recent"); fetchRecentConversations(); }}
                                className={cn(
                                    "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                    selectedTab === "recent" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Sohbetler
                            </button>
                            <button
                                onClick={() => { setSelectedTab("new"); fetchEligibleStudents(); }}
                                className={cn(
                                    "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                    selectedTab === "new" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Öğrenci Ara
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Mesajlarda veya kişilerde ara..." 
                                className="pl-9 bg-background/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 space-y-4">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                            </div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="p-8 text-center space-y-2">
                                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                                <p className="text-sm text-muted-foreground">Konuşma bulunamadı.</p>
                            </div>
                        ) : (
                            filteredContacts.map((contact) => (
                                <button
                                    key={contact.id}
                                    onClick={() => setSelectedContact(contact)}
                                    className={cn(
                                        "w-full p-4 flex items-center gap-3 transition-colors hover:bg-accent/50 text-left border-b last:border-0",
                                        selectedContact?.id === contact.id && "bg-accent"
                                    )}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full border bg-muted flex flex-col items-center justify-center text-muted-foreground font-semibold">
                                            {contact.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="font-semibold truncate text-sm">{contact.name}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {contact.lastMessage || "Sohbeti başlatmak için tıklayın"}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className={cn(
                    "flex-1 flex flex-col bg-background/50 backdrop-blur-sm",
                    !selectedContact ? "hidden md:flex" : "flex"
                )}>
                    {selectedContact ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b flex items-center justify-between bg-background">
                                <div className="flex items-center gap-3">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="md:hidden"
                                        onClick={() => setSelectedContact(null)}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                    <div className="w-10 h-10 rounded-full border bg-muted flex flex-col items-center justify-center text-muted-foreground font-semibold">
                                        {selectedContact.name?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{selectedContact.name}</p>
                                        <p className="text-[10px] text-green-500 font-medium">Aktif</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Chat Messages */}
                            <div 
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed"
                            >
                                {messages.map((m) => {
                                    const isMe = m.senderId !== selectedContact.id;
                                    return (
                                        <div 
                                            key={m.id} 
                                            className={cn(
                                                "flex w-full max-w-[80%]",
                                                isMe ? "ml-auto justify-end" : "justify-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "px-4 py-2 rounded-2xl text-sm shadow-md",
                                                isMe 
                                                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                                                    : "bg-background border rounded-tl-none"
                                            )}>
                                                <p>{m.content}</p>
                                                <p className={cn(
                                                    "text-[9px] mt-1 text-right",
                                                    isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                                                )}>
                                                    {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSendMessage} className="p-4 bg-background border-t">
                                <div className="flex gap-2 p-1 bg-muted rounded-xl border">
                                    <Input 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Cevabınızı yazın..." 
                                        className="border-0 bg-transparent focus-visible:ring-0"
                                    />
                                    <Button type="submit" size="sm" className="rounded-lg">
                                        <Send className="w-4 h-4 mr-2" />
                                        Gönder
                                    </Button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                            <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                                <Mail className="w-12 h-12 text-primary" />
                            </div>
                            <div className="max-w-xs space-y-2">
                                <h3 className="text-xl font-bold">Öğrencilerinize Destek Olun</h3>
                                <p className="text-sm text-muted-foreground">
                                    Öğrencilerinizden gelen mesajları görüntülemek için soldaki listeden bir seçim yapın veya yeni bir öğrenci araması yapın.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
