<script>
// Chatbot Embed Script
(function () {
  // Create container for the chatbot
  const container = document.createElement('div');
  container.id = 'electroslab-chatbot-container';
  document.body.appendChild(container);

  // Add styles for container position and background
  const styles = document.createElement('style');
  styles.textContent = `
    #electroslab-chatbot-container {
      position: fixed;
      bottom: 80px; /* Adjust height from the bottom */
      right: 20px;
      z-index: 9999;
      background-color: transparent !important;
    }
  `;
  document.head.appendChild(styles);

  // Create script element to load the chatbot
  const script = document.createElement('script');
  script.src = 'https://electroslab-chatbot.vercel.app/chatbot.js';
  script.async = true;

  // Once script is loaded, observe and style the iframe
  script.onload = () => {
    const observer = new MutationObserver(() => {
      const iframe = container.querySelector('iframe');
      if (iframe) {
        iframe.style.backgroundColor = 'transparent'; // Fix white background
        iframe.style.zIndex = '9999';
        iframe.style.border = 'none';
      }
    });

    // Observe changes inside container
    observer.observe(container, { childList: true, subtree: true });
  };

  // Append the chatbot script to head
  document.head.appendChild(script);
})();
</script>
