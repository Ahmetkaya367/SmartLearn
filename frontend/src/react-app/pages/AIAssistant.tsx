import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/react-app/components/ui/button";
import { apiService } from '@/react-app/lib/apiService';
import { Bot, User, Send, Sparkles, Brain, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/react-app/store/useAuthStore';
import { Link } from 'react-router';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const user = useAuthStore((state) => state.user);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sohbet geçmişini sadece giriş yapmış kullanıcılar için yükle
    const savedMessages = localStorage.getItem('chat_history');
    if (user && savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Misafirse veya kayıt yoksa yeni selamlama getir
      fetchInitialGreeting();
    }
  }, [user?.id]); // Kullanıcı değiştiğinde de tetiklensin

  useEffect(() => {
    // Sadece giriş yapmış kullanıcıların mesajlarını kaydet
    if (user && messages.length > 0) {
      localStorage.setItem('chat_history', JSON.stringify(messages));
    }
  }, [messages, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchInitialGreeting = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAIRecommendations(user?.id || 'guest');
      setMessages([{ role: 'assistant', content: response.message }]);
    } catch (error) {
      setMessages([{ role: 'assistant', content: "Merhaba! Bugün size nasıl yardımcı olabilirim?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await apiService.chatWithAI(currentInput, user?.id || 'guest');
      setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Üzgünüm, şu an cevap veremiyorum. Lütfen tekrar dene." }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (content: string) => {
    // Önce linkleri ve başlıkları parçalayalım
    // Başlıklar: "Sizin için önereceğim kurs:", "Neden bu kurs?:", "Kariyerine Katkısı:"
    const parts = content.split(/(\[.*?\]\(.*?\)|Sizin için önereceğim kurs:|Neden bu kurs\?:|Kariyerine Katkısı:)/g);
    
    return parts.map((part, index) => {
      // Link kontrolü
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <Link 
            key={index} 
            to={linkMatch[2]} 
            className="text-blue-600 underline font-bold hover:text-blue-800 transition-colors bg-blue-50 px-2 py-0.5 rounded border border-blue-100 mx-1"
          >
            {linkMatch[1]}
          </Link>
        );
      }

      // Başlık kontrolü
      const isHeader = ["Sizin için önereceğim kurs:", "Neden bu kurs?:", "Kariyerine Katkısı:"].includes(part);
      if (isHeader) {
        return (
          <span key={index} className="font-bold text-primary block mt-2 mb-1 first:mt-0">
            {part}
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            SmartLearn Yapay Zeka Asistanı
          </motion.div>
          <h1 className="text-4xl font-bold mb-4">Size Özel Öğrenme Yolculuğu</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Yapay zeka asistanımız hedeflerinizi anlar, size en uygun kursları önerir ve kariyer yolculuğunuzda size rehberlik eder.
          </p>
        </div>

        {/* Chat Interface */}
        <div className="bg-card border rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px]">
          {/* Chat Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'assistant' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${msg.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                      msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                    }`}>
                      {msg.role === 'assistant' ? <Brain className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm leading-relaxed ${
                      msg.role === 'assistant' 
                        ? 'bg-muted/50 text-foreground rounded-tl-none border border-border/50' 
                        : 'bg-primary text-primary-foreground rounded-tr-none'
                    }`}>
                      {renderMessage(msg.content)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-3 items-center text-muted-foreground bg-muted/30 px-4 py-2 rounded-full text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Asistan düşünüyor...
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-muted/10 border-t flex gap-2">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Örn: Yazılıma nereden başlamalıyım?"
                disabled={loading}
                className="w-full bg-card border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>
            <Button type="submit" disabled={loading || !input.trim()} variant="primary" size="icon" className="rounded-xl">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            { icon: <Sparkles />, title: "Akıllı Öneriler", desc: "Geçmişinize göre en uygun içerikler." },
            { icon: <Brain />, title: "Kariyer Analizi", desc: "Hangi alanda uzmanlaşmanız gerektiğini söyler." },
            { icon: <ArrowRight />, title: "Hızlı Başlangıç", desc: "Öğrenmeye hemen başlamanız için rehberlik." }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="p-6 rounded-2xl border bg-card/50 hover:bg-card transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
