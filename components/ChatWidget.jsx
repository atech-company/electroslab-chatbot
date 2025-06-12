import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [isAIMode, setIsAIMode] = useState(false);
  const [showModePopup, setShowModePopup] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'home'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [displayedProducts, setDisplayedProducts] = useState(2); // Number of products to show initially
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chat is first opened
      setMessages([
        {
          role: 'assistant',
          content: isAIMode 
            ? `👋 Welcome to Electroslab AI Assistant!\n\nI'm your AI shopping assistant. I can help you find the perfect products and provide personalized recommendations.\n\nTo get started, simply:\n• Ask about specific products or categories\n• Request price comparisons\n• Ask for recommendations based on your needs\n• Get advice on product features and specifications\n\nWhat would you like help with today? 😊`
            : `👋 Welcome to Electroslab Product Search!\n\nI can help you find products quickly. Simply:\n• Type a brand name (e.g., "HP", "Dell", "Lenovo")\n• Type a model number (e.g., "HP Victus", "Dell XPS")\n• Ask about specific features (e.g., "gaming laptops", "4K monitors")\n\nWhat would you like to search for today? 😊`
        }
      ]);
    }
  }, [isOpen, isAIMode]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input.trim(), isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input.trim(), 
          isAIMode,
          sessionId: Date.now().toString() // Add session ID for conversation tracking
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Handle both AI and product search responses
      if (data.products) {
        // Product search response
        const productMessage = {
          text: data.response,
          isUser: false,
          products: data.products
        };
        setMessages(prev => [...prev, productMessage]);
      } else {
        // AI response
        setMessages(prev => [...prev, { 
          text: data.response, 
          isUser: false 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error. Please try again.', 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSelect = (mode) => {
    setIsAIMode(mode === 'ai');
    setShowModePopup(false);
    setMessages([]);
  };

  const socialLinks = [
    { name: 'Instagram', icon: '📸', url: 'https://instagram.com/your-company' },
    { name: 'Facebook', icon: '👥', url: 'https://facebook.com/your-company' },
    { name: 'TikTok', icon: '🎵', url: 'https://tiktok.com/@your-company' }
  ];

  const departmentContacts = [
    { name: 'Sales', icon: '💼', whatsapp: 'YOUR_SALES_WHATSAPP' },
    { name: 'Support', icon: '🛟', whatsapp: 'YOUR_SUPPORT_WHATSAPP' },
    { name: 'Technical', icon: '🔧', whatsapp: 'YOUR_TECHNICAL_WHATSAPP' }
  ];

  const handleWhatsAppClick = (number) => {
    window.open(`https://wa.me/${number}`, '_blank');
  };

  const renderHomeContent = () => (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to Electroslab</h3>
        <p className="text-sm text-gray-600">Your trusted partner in electronics</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-medium text-gray-800 mb-3">Contact Departments</h4>
          <div className="space-y-2">
            {departmentContacts.map((dept) => (
              <button
                key={dept.name}
                onClick={() => handleWhatsAppClick(dept.whatsapp)}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span>{dept.icon}</span>
                  <span className="text-sm text-gray-700">{dept.name}</span>
                </div>
                <span className="text-xs text-blue-600">Contact on WhatsApp</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-medium text-gray-800 mb-3">Follow Us</h4>
          <div className="grid grid-cols-3 gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="text-xl mb-1">{social.icon}</span>
                <span className="text-xs text-gray-600">{social.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Add function to handle product click
  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  // Add function to close product details
  const handleCloseProductDetails = () => {
    setSelectedProduct(null);
  };

  // Update the product card renderer
  const renderProductCard = (product, index) => (
    <div 
      key={`product-${product.title}-${index}`}
      className="bg-white rounded-lg shadow-sm p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handleProductClick(product)}
    >
      <div className="flex items-start space-x-3">
        {product.image && (
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-16 h-16 object-cover rounded"
          />
        )}
        <div className="flex-1">
          <h4 className="font-medium text-sm text-gray-800">{product.title}</h4>
          <p className="text-sm text-gray-600">{product.price}</p>
          {product.description && product.description !== 'No description available' && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
          )}
          <button 
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick(product);
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  // Update the message rendering to include product cards with load more
  const renderMessage = (msg, index) => (
    <div
      key={`message-${index}`}
      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${msg.isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
      >
        {msg.text}
        {msg.products && (
          <div className="mt-3 space-y-2">
            {msg.products.slice(0, displayedProducts).map((product, productIndex) => 
              renderProductCard(product, productIndex)
            )}
            {msg.products.length > displayedProducts && (
              <button
                onClick={() => setDisplayedProducts(prev => prev + 2)}
                className="w-full py-2 mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Load More Products ({msg.products.length - displayedProducts} remaining)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Reset displayed products when new search is performed
  useEffect(() => {
    setDisplayedProducts(2);
  }, [messages]);

  // Add product details modal
  const renderProductDetails = () => {
    if (!selectedProduct) return null;

    const handleViewOnWebsite = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (selectedProduct.link) {
        window.open(selectedProduct.link, '_blank', 'noopener,noreferrer');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{selectedProduct.title}</h3>
            <button 
              onClick={handleCloseProductDetails}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {selectedProduct.image && (
            <div className="mb-4">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.title} 
                className="w-full h-80 object-contain rounded-lg bg-gray-50"
              />
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-blue-600">{selectedProduct.price}</span>
              <button 
                onClick={handleViewOnWebsite}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>View on Website</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
            
            {selectedProduct.description && selectedProduct.description !== 'No description available' && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Product Description</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>
            )}
            
            {selectedProduct.specifications && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-3">
                    {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                      <li key={`spec-${key}`} className="flex justify-between text-sm border-b border-gray-200 pb-2 last:border-0">
                        <span className="text-gray-600 font-medium">{key}:</span>
                        <span className="text-gray-800">{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => {
            setIsOpen(true);
            setShowModePopup(true);
          }}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          style={{ width: '60px', height: '60px' }}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      ) : (
        <div className="relative">
          {isMinimized ? (
            <div className="bg-white rounded-lg shadow-xl w-80">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <img src="https://electroslab.com/cdn/shop/files/LOGO_1.png" alt="Logo" className="w-10 h-10 object-contain flex-shrink-0" />
                  <span className="font-semibold text-gray-800">Electroslab Chat</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMinimized(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-100 to-white rounded-lg shadow-xl w-96 h-[600px] flex flex-col">
              {/* Header */}
              <div className="relative p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src="https://electroslab.com/cdn/shop/files/LOGO_1.png" alt="Electroslab Logo" className="w-12 h-12 object-contain flex-shrink-0" />
                  <span className="text-xl font-bold">Electroslab Assistant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    isAIMode ? 'bg-purple-500' : 'bg-green-500'
                  }`}>
                    {isAIMode ? 'AI Mode' : 'Search Mode'}
                  </span>
                  <button
                    onClick={() => setIsAIMode(!isAIMode)}
                    className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full p-1 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full p-1 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full p-1 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-gray-200 bg-white">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('home')}
                  className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                    activeTab === 'home'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Home
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto bg-white p-4 space-y-4">
                {activeTab === 'home' ? (
                  renderHomeContent()
                ) : (
                  <>
                    {!isAIMode && (
                      <div className="bg-gradient-to-r from-green-50 to-white p-2 border-b border-green-100 rounded-md mb-4 text-center text-gray-700">
                        <p className="text-xs flex items-center justify-center">
                          <span className="mr-1.5 text-base">🔍</span>
                          Quick product search mode. Type your search query to find products instantly.
                        </p>
                      </div>
                    )}
                    {messages.map((msg, index) => renderMessage(msg, index))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Input Area */}
              {activeTab === 'chat' && (
                <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50 rounded-b-lg">
                  <div className="flex space-x-2 items-center">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && renderProductDetails()}

      {/* Mode Selection Popup */}
      <AnimatePresence>
        {showModePopup && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Assistant Mode</h3>
              <div className="space-y-4">
                <button
                  onClick={() => handleModeSelect('search')}
                  className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors"
                >
                  <h4 className="font-semibold text-blue-900">Search Mode</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Quick product search with direct results. Best for finding specific items.
                  </p>
                </button>
                <button
                  onClick={() => handleModeSelect('ai')}
                  className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors"
                >
                  <h4 className="font-semibold text-purple-900">AI Assistant Mode</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Get personalized recommendations and detailed product advice.
                  </p>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget; 