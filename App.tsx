
import React, { useState, useEffect } from 'react';
import { ScrapbookMessage } from './types';
import { Heart, BookOpen, PenTool, Sparkles, ChevronDown, ChevronUp, Trash2, Wand2, Send, Loader2 } from 'lucide-react';

/**
 * CẤU HÌNH EMAILJS ĐÃ ĐƯỢC CẬP NHẬT CHÍNH XÁC
 */
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'NgOzSYY1suxM67NmO',
  SERVICE_ID: 'service_fyf789u',
  TEMPLATE_ID: 'template_qbey9ab'
};

declare global {
  interface Window {
    emailjs: any;
  }
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<ScrapbookMessage[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    className: '',
    reflection: '',
    improvement: '',
    signature: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showDatabase, setShowDatabase] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    // Khởi tạo EmailJS với Public Key đã cung cấp
    if (window.emailjs) {
      window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    }

    const saved = localStorage.getItem('scrapbook_messages');
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  const saveToLocalStorage = (newMessages: ScrapbookMessage[]) => {
    localStorage.setItem('scrapbook_messages', JSON.stringify(newMessages));
  };

  const sendToTeacher = async (message: ScrapbookMessage) => {
    try {
      if (!window.emailjs) return false;

      // Đảm bảo các biến này trùng khớp với các thẻ {{}} trong Email Template của bạn
      const templateParams = {
        from_name: message.name,
        class_name: message.className,
        message: message.reflection,
        improvement: message.improvement,
        created_at: message.createdAt,
        to_email: 'mquan1997td@gmail.com'
      };

      const response = await window.emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      return response.status === 200;
    } catch (error) {
      console.error("Lỗi gửi EmailJS:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.reflection) {
      alert("Em hãy điền đầy đủ thông tin nhé! ✨");
      return;
    }

    setIsSending(true);

    const newMessage: ScrapbookMessage = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const success = await sendToTeacher(newMessage);
    
    if (success) {
      const updatedMessages = [newMessage, ...messages];
      setMessages(updatedMessages);
      saveToLocalStorage(updatedMessages);
      setIsSubmitted(true);
      setFormData({ name: '', className: '', reflection: '', improvement: '', signature: '' });
    } else {
      alert("Hệ thống gặp chút lỗi nhỏ khi gửi thư. Thầy vui lòng kiểm tra lại trạng thái tài khoản EmailJS (đã bật Service và Template chưa nhé)!");
    }
    
    setIsSending(false);
  };

  const generateAISummary = async () => {
    if (messages.length === 0) return;
    setIsGeneratingSummary(true);
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      const data = await response.json();
      if (data.text) setAiSummary(data.text);
    } catch (error) {
      setAiSummary("Hãy tiếp tục lắng nghe những trái tim nhỏ bé này nhé!");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const deleteMessage = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa lời nhắn này không?")) {
      const filtered = messages.filter(m => m.id !== id);
      setMessages(filtered);
      saveToLocalStorage(filtered);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#fdfbf7]">
        <div className="max-w-md w-full text-center space-y-6 animate-fadeIn">
          <div className="flex justify-center">
            <div className="p-4 bg-orange-50 rounded-full">
              <Sparkles className="w-12 h-12 text-orange-300" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-stone-700 handwriting">
            Cảm ơn em vì đã để lại những lời thương mến 🌱
          </h2>
          <p className="text-stone-500 leading-relaxed">
            Lời nhắn của em đã được gửi an toàn đến thầy (mquan1997td@gmail.com) rồi nhé.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="px-6 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-full transition-all text-sm font-medium"
          >
            Gửi thêm lời nhắn khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-800 pb-20">
      <header className="pt-12 pb-8 px-6 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-stone-700 handwriting mb-2">Tâm Sự Nhỏ</h1>
        <p className="text-stone-500 italic">“Nơi những kỷ niệm được gọi tên bằng sự chân thành”</p>
      </header>

      <main className="max-w-2xl mx-auto px-6 mb-16">
        <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-sm border border-stone-100 rounded-2xl p-8 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-600 ml-1">Biệt danh hoặc tên em là</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ví dụ: Minh Quân..."
                className="w-full bg-white/80 border-b-2 border-stone-200 focus:border-orange-200 focus:outline-none px-2 py-2 transition-all placeholder:text-stone-300"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-600 ml-1">Em là thành viên lớp</label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="Lớp của em..."
                className="w-full bg-white/80 border-b-2 border-stone-200 focus:border-orange-200 focus:outline-none px-2 py-2 transition-all placeholder:text-stone-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-600 ml-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-300" />
              Cảm nghĩ của em sau quá trình học
            </label>
            <textarea
              rows={5}
              required
              value={formData.reflection}
              onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
              placeholder="Những điều em muốn nhắn nhủ..."
              className="w-full bg-white/80 border border-stone-200 rounded-xl focus:border-orange-200 focus:ring-0 focus:outline-none p-4 transition-all placeholder:text-stone-300 leading-relaxed text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-600 ml-1 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-blue-300" />
              Những điều em mong thầy có thể cải thiện
            </label>
            <textarea
              rows={3}
              value={formData.improvement}
              onChange={(e) => setFormData({ ...formData, improvement: e.target.value })}
              placeholder="Góp ý chân thành để thầy dạy tốt hơn..."
              className="w-full bg-white/80 border border-stone-200 rounded-xl focus:border-orange-200 focus:ring-0 focus:outline-none p-4 transition-all placeholder:text-stone-300 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-4 bg-orange-100 hover:bg-orange-200 disabled:bg-stone-100 text-orange-800 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group mt-4"
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang gửi thư cho thầy...
              </>
            ) : (
              <>
                Gửi lời nhắn
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </main>

      {/* Database View for Teacher */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
        <div className="bg-white/95 backdrop-blur-md border border-stone-200 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
          <button
            onClick={() => {
              if (!showDatabase && messages.length > 0) generateAISummary();
              setShowDatabase(!showDatabase);
            }}
            className="w-full p-4 flex items-center justify-between text-stone-500 hover:text-stone-800 transition-colors"
          >
            <span className="text-xs font-semibold tracking-widest uppercase flex items-center gap-2 text-orange-600">
              <Heart className="w-3 h-3 fill-current" /> lưu bút trên máy này ({messages.length})
            </span>
            {showDatabase ? <ChevronDown /> : <ChevronUp />}
          </button>

          {showDatabase && (
            <div className="max-h-[60vh] overflow-y-auto p-4 border-t border-stone-100 space-y-4 bg-stone-50/50">
              {messages.length > 0 && (
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 mb-6">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <Wand2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Góc Tổng Kết AI</span>
                  </div>
                  {isGeneratingSummary ? (
                    <p className="text-stone-400 text-xs animate-pulse italic">Đang lắng nghe tâm tình của các em...</p>
                  ) : (
                    <p className="text-stone-700 text-sm italic leading-relaxed">{aiSummary || "Hãy xem qua những lời nhắn bên dưới nhé."}</p>
                  )}
                </div>
              )}

              {messages.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-stone-400 italic">Lời nhắn sẽ hiển thị tại đây sau khi gửi thành công.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="bg-white border border-stone-100 p-6 rounded-xl shadow-sm relative group animate-fadeIn">
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                      className="absolute top-4 right-4 p-2 text-stone-300 hover:text-red-500 rounded-lg opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="mb-4">
                      <h4 className="font-bold text-stone-800 text-lg leading-tight">{msg.name}</h4>
                      <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">{msg.className} • {msg.createdAt}</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-stone-600 text-sm whitespace-pre-wrap leading-relaxed italic">"{msg.reflection}"</p>
                      </div>
                      {msg.improvement && (
                        <div className="bg-blue-50/30 p-3 rounded-lg border border-blue-100/50">
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Góp ý</p>
                          <p className="text-stone-600 text-sm">{msg.improvement}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
