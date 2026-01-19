
// File này sẽ xử lý việc nhận dữ liệu từ học sinh và gửi đi
// Trong một ứng dụng thực tế trên Vercel, bạn có thể kết nối với MongoDB hoặc gửi Email qua SendGrid/EmailJS
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const message = req.body;

  try {
    // Đây là nơi bạn có thể tích hợp dịch vụ gửi email
    // Ví dụ gửi thông báo về Discord/Telegram Webhook để thầy nhận được ngay lập tức:
    // await fetch(process.env.DISCORD_WEBHOOK_URL, { 
    //   method: 'POST', 
    //   headers: {'Content-Type': 'application/json'},
    //   body: JSON.stringify({ content: `Có tâm sự mới từ ${message.name} (${message.className}): ${message.reflection}` })
    // });

    console.log("Đã nhận tâm sự mới:", message);
    
    return res.status(200).json({ success: true, message: 'Đã nhận được tâm sự!' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process message' });
  }
}
