// Chatbot Embed Script
(function() {
  // Create container for the chatbot
  const container = document.createElement('div');
  container.id = 'electroslab-chatbot-container';
  document.body.appendChild(container);

  // Create script element to load the chatbot
  const script = document.createElement('script');
  script.src = 'https://electroslab-chatbot.vercel.app/chatbot.js';
  script.async = true;
  document.head.appendChild(script);

  // Add styles
  const styles = document.createElement('style');
  styles.textContent = `
    #electroslab-chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    }
  `;
  document.head.appendChild(styles);
})(); 
