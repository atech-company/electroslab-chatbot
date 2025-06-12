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

  // Add click handler
  chatButton.onclick = function() {
    window.open('https://electroslab-chatbot.vercel.app', '_blank', 'width=400,height=600');
  };

  // Add the button to the container
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
  `;
  document.head.appendChild(styles);
})(); 