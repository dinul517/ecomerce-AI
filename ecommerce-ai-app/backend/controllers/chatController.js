const ChatSession = require('../models/chatModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Cart = require('../models/cart');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get or create a chat session
const getOrCreateChatSession = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find active session or create new one
    let chatSession = await ChatSession.findOne({
      user: userId,
      status: 'active'
    });

    if (!chatSession) {
      chatSession = new ChatSession({
        user: userId,
        messages: [{
          role: 'assistant',
          content: 'Halo! Saya adalah asisten AI Anda. Saya bisa membantu Anda dengan:\n' +
                  '1. Mencari dan merekomendasikan produk\n' +
                  '2. Menjelaskan detail produk\n' +
                  '3. Membantu dengan pesanan Anda\n' +
                  '4. Menjawab pertanyaan tentang layanan kami\n\n' +
                  'Apa yang bisa saya bantu hari ini?'
        }]
      });
      await chatSession.save();
    }

    res.status(200).json(chatSession);
  } catch (error) {
    console.error('Error in getOrCreateChatSession:', error);
    res.status(500).json({ message: 'Error creating chat session', error: error.message });
  }
};

// Send message to chatbot
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get active chat session
    let chatSession = await ChatSession.findOne({
      user: userId,
      status: 'active'
    });

    if (!chatSession) {
      return res.status(404).json({ message: 'No active chat session found' });
    }

    // Add user message
    chatSession.messages.push({
      role: 'user',
      content: message
    });

    // Get user context
    const userContext = await getUserContext(userId);
    
    // Generate AI response
    const aiResponse = await generateAIResponse(message, chatSession, userContext);
    
    // Add AI response
    chatSession.messages.push({
      role: 'assistant',
      content: aiResponse
    });

    await chatSession.save();
    res.status(200).json(chatSession);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Get user context for better responses
const getUserContext = async (userId) => {
  try {
    const [user, recentOrders, cart] = await Promise.all([
      User.findById(userId).select('name email'),
      Order.find({ user: userId }).sort('-createdAt').limit(3),
      Cart.findOne({ user: userId }).populate('items.product')
    ]);

    return {
      user: {
        name: user.name,
        email: user.email
      },
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        status: order.status,
        total: order.totalAmount,
        date: order.createdAt
      })),
      cart: cart ? {
        items: cart.items.map(item => ({
          product: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        total: cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      } : null
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return null;
  }
};

// Generate AI response using OpenAI
const generateAIResponse = async (message, chatSession, userContext) => {
  try {
    // Prepare conversation history
    const conversationHistory = chatSession.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Prepare system message with context
    const systemMessage = {
      role: 'system',
      content: `Anda adalah asisten AI untuk toko online. 
                Informasi pengguna: ${userContext ? `Nama: ${userContext.user.name}, Email: ${userContext.user.email}` : 'Tidak tersedia'}
                ${userContext?.recentOrders ? `\nPesanan terakhir: ${JSON.stringify(userContext.recentOrders)}` : ''}
                ${userContext?.cart ? `\nKeranjang saat ini: ${JSON.stringify(userContext.cart)}` : ''}
                
                Anda dapat membantu dengan:
                1. Mencari dan merekomendasikan produk
                2. Menjelaskan detail produk
                3. Membantu dengan pesanan
                4. Menjawab pertanyaan tentang layanan
                
                Berikan jawaban yang informatif dan ramah.`
    };

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...conversationHistory],
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Fallback to basic response if OpenAI fails
    return handleBasicResponse(message, userContext);
  }
};

// Handle basic response when OpenAI is not available
const handleBasicResponse = async (message, userContext) => {
  const lowerMessage = message.toLowerCase();

  // Product queries
  if (lowerMessage.includes('produk') || lowerMessage.includes('barang')) {
    const products = await Product.find()
      .select('name price category description')
      .limit(5);
    
    return `Berikut beberapa produk yang mungkin Anda suka:\n${products.map(p => 
      `- ${p.name} (Rp ${p.price.toLocaleString()})`
    ).join('\n')}\n\nApakah ada yang menarik minat Anda?`;
  }

  // Order queries
  if (lowerMessage.includes('pesanan') || lowerMessage.includes('order')) {
    if (userContext?.recentOrders?.length > 0) {
      return `Pesanan terakhir Anda:\n${userContext.recentOrders.map(order => 
        `- Order #${order.id.slice(-6)} (${order.status}) - Rp ${order.total.toLocaleString()}`
      ).join('\n')}\n\nApakah ada yang ingin Anda tanyakan tentang pesanan ini?`;
    }
    return 'Anda belum memiliki pesanan. Apakah Anda ingin melihat katalog produk kami?';
  }

  // Cart queries
  if (lowerMessage.includes('keranjang') || lowerMessage.includes('cart')) {
    if (userContext?.cart?.items?.length > 0) {
      return `Keranjang Anda saat ini:\n${userContext.cart.items.map(item => 
        `- ${item.product} (${item.quantity}x) - Rp ${(item.price * item.quantity).toLocaleString()}`
      ).join('\n')}\n\nTotal: Rp ${userContext.cart.total.toLocaleString()}\n\nApakah Anda ingin melanjutkan ke pembayaran?`;
    }
    return 'Keranjang Anda masih kosong. Apakah Anda ingin melihat rekomendasi produk?';
  }

  // Default response
  return 'Saya bisa membantu Anda dengan informasi produk, pesanan, dan layanan kami. Apa yang ingin Anda ketahui?';
};

// Close chat session
const closeChatSession = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const chatSession = await ChatSession.findOne({
      user: userId,
      status: 'active'
    });

    if (!chatSession) {
      return res.status(404).json({ message: 'No active chat session found' });
    }

    chatSession.status = 'closed';
    await chatSession.save();

    res.status(200).json({ message: 'Chat session closed successfully' });
  } catch (error) {
    console.error('Error in closeChatSession:', error);
    res.status(500).json({ message: 'Error closing chat session', error: error.message });
  }
};

module.exports = {
  getOrCreateChatSession,
  sendMessage,
  closeChatSession
};