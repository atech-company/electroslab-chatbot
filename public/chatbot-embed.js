// Chatbot Embed Script
(function() {
  // Create container for the chatbot
  const container = document.createElement('div');
  container.id = 'electroslab-chatbot-container';
  document.body.appendChild(container);

  // Create the chat button
  const chatButton = document.createElement('button');
  chatButton.className = 'bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center';
  chatButton.style.cssText = 'position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; z-index: 9999;';
  
  // Add chat icon
  chatButton.innerHTML = `
    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  `;

  // Create popup container
  const popupContainer = document.createElement('div');
  popupContainer.id = 'chat-popup-container';
  popupContainer.style.cssText = `
    display: none;
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 400px;
    height: 600px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
    z-index: 9998;
    overflow: hidden;
  `;

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.src = 'https://electroslab-chatbot.vercel.app';
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
  `;

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = `
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `;
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  `;

  // Add click handler for the chat button
  chatButton.onclick = function() {
    popupContainer.style.display = 'block';
    chatButton.style.display = 'none';
  };

  // Add click handler for the close button
  closeButton.onclick = function() {
    popupContainer.style.display = 'none';
    chatButton.style.display = 'flex';
  };

  // Assemble the popup
  popupContainer.appendChild(closeButton);
  popupContainer.appendChild(iframe);
  container.appendChild(popupContainer);
  container.appendChild(chatButton);

  // Add styles
  const styles = document.createElement('style');
  styles.textContent = `
    #electroslab-chatbot-container button {
      cursor: pointer;
      border: none;
      outline: none;
    }
    #electroslab-chatbot-container button:hover {
      transform: scale(1.05);
    }
    #electroslab-chatbot-container button:active {
      transform: scale(0.95);
    }
    #chat-popup-container {
      transition: all 0.3s ease-in-out;
    }
    #chat-popup-container iframe {
      border-radius: 12px;
    }
  `;
  document.head.appendChild(styles);
})();
