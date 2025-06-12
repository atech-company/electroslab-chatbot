import OpenAI from 'openai';
import * as cheerio from 'cheerio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store conversation history in memory (in production, use a database)
const conversationHistory = new Map();

// Helper function to extract price range from message
function extractPriceRange(message) {
  const pricePatterns = [
    /(\d+)\s*-\s*(\d+)\s*(?:dollars|USD|\$)/i,
    /(\d+)\s*to\s*(\d+)\s*(?:dollars|USD|\$)/i,
    /under\s*(\d+)\s*(?:dollars|USD|\$)/i,
    /less\s*than\s*(\d+)\s*(?:dollars|USD|\$)/i,
    /more\s*than\s*(\d+)\s*(?:dollars|USD|\$)/i,
    /above\s*(\d+)\s*(?:dollars|USD|\$)/i,
    /around\s*(\d+)\s*(?:dollars|USD|\$)/i,
    /approximately\s*(\d+)\s*(?:dollars|USD|\$)/i,
    /(\d+)\s*(?:dollars|USD|\$)/i
  ];

  for (const pattern of pricePatterns) {
    const match = message.match(pattern);
    if (match) {
      if (match[1] && match[2]) {
        return { min: parseInt(match[1]), max: parseInt(match[2]) };
      } else if (match[1]) {
        if (pattern.toString().includes('under') || pattern.toString().includes('less than')) {
          return { max: parseInt(match[1]) };
        } else if (pattern.toString().includes('more than') || pattern.toString().includes('above')) {
          return { min: parseInt(match[1]) };
        } else {
          return { target: parseInt(match[1]) };
        }
      }
    }
  }
  return null;
}

// Function to perform direct product search
async function performProductSearch(query) {
  try {
    const response = await fetch(`https://electroslab.com/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const products = [];

    // Try different selectors for product cards
    const productSelectors = [
      '.product-card',
      '.product',
      '.item',
      '.product-item',
      '[data-product]',
      '.product-listing',
      '.search-result-item'
    ];

    // Try each selector
    productSelectors.forEach(selector => {
      $(selector).each((_, el) => {
        const title = $(el).find('.product-title, h2, h3, .title, .name').first().text().trim();
        
        // Find the product link - look for links that are likely to be product pages
        let link = null;
        const possibleLinks = $(el).find('a');
        for (let j = 0; j < possibleLinks.length; j++) {
          const href = $(possibleLinks[j]).attr('href');
          // Skip collection, category, or vendor links
          if (href && 
              !href.includes('/collections/') && 
              !href.includes('/vendors') && 
              !href.includes('/categories') &&
              !href.includes('/search') &&
              !href.includes('/cart') &&
              !href.includes('/account')) {
            link = href;
            break;
          }
        }
        
        // If no suitable link found, try the first link as fallback
        if (!link) {
          link = $(el).find('a').first().attr('href');
        }

        // Try different image selectors and attributes
        const imageSelectors = [
          'img',
          '.product-image img',
          '.image img',
          '.thumbnail img',
          '[data-image]',
          '.product-img img'
        ];
        
        let image = null;
        for (const imgSelector of imageSelectors) {
          const img = $(el).find(imgSelector).first();
          if (img.length) {
            // Try different attributes that might contain the image URL
            const possibleAttrs = ['src', 'data-src', 'data-lazy-src', 'data-original', 'data-srcset'];
            for (const attr of possibleAttrs) {
              const value = img.attr(attr);
              if (value && !value.includes('base64')) {
                image = value;
                break;
              }
            }
            if (image) break;
          }
        }

        const price = $(el).find('.price, .product-price, .amount, [data-price]').first().text().trim();
        const description = $(el).find('.description, .product-description, p, .details').first().text().trim();

        // Check if product is sold out
        const isSoldOut = $(el).find('.sold-out, .out-of-stock, [data-sold-out="true"], .stock-status:contains("Sold Out"), .availability:contains("Out of stock")').length > 0;
        if (isSoldOut) {
          return; // Skip this product if it's sold out
        }

        // Extract numeric price value
        const priceValue = parseFloat(price.replace(/[^0-9.]/g, ''));

        // Check if product matches price range
        let matchesPriceRange = true;
        const priceRange = extractPriceRange(query);
        if (priceRange && priceValue) {
          if (priceRange.min && priceValue < priceRange.min) matchesPriceRange = false;
          if (priceRange.max && priceValue > priceRange.max) matchesPriceRange = false;
          if (priceRange.target && Math.abs(priceValue - priceRange.target) > priceRange.target * 0.2) matchesPriceRange = false;
        }

        if (title && link && matchesPriceRange) {
          let imageUrl = '';
          if (image) {
            // Remove any query parameters or fragments
            const cleanImage = image.split('?')[0].split('#')[0];
            
            if (cleanImage.startsWith('http')) {
              imageUrl = cleanImage;
            } else if (cleanImage.startsWith('//')) {
              imageUrl = `https:${cleanImage}`;
            } else if (cleanImage.startsWith('/')) {
              imageUrl = `https://electroslab.com${cleanImage}`;
            } else {
              imageUrl = `https://electroslab.com/${cleanImage}`;
            }
          }

          // Ensure the product link is absolute and points to the exact product
          let productLink = link;
          if (!productLink.startsWith('http')) {
            // If the link is relative, make it absolute
            productLink = `https://electroslab.com${productLink.startsWith('/') ? '' : '/'}${productLink}`;
          }

          // Remove any query parameters, fragments, or tracking parameters that might affect the product page
          productLink = productLink
            .split('?')[0] // Remove query parameters
            .split('#')[0] // Remove fragments
            .replace(/\/$/, ''); // Remove trailing slash

          // Log the product link for debugging
          console.log('Product link:', {
            original: link,
            processed: productLink
          });

          products.push({
            title,
            link: productLink,
            image: imageUrl,
            price,
            description,
          });
        }
      });
    });

    return products;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, sessionId = 'default', isAIMode = false } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    if (!isAIMode) {
      // Direct product search mode
      const products = await performProductSearch(message);
      
      // Create detailed response message
      let responseMessage = "";
      if (products.length > 0) {
        // Group products by price range
        const priceGroups = products.reduce((groups, product) => {
          const price = parseFloat(product.price.replace(/[^0-9.]/g, ''));
          if (price <= 100) groups.budget.push(product);
          else if (price <= 500) groups.midRange.push(product);
          else groups.premium.push(product);
          return groups;
        }, { budget: [], midRange: [], premium: [] });

        responseMessage = `I found ${products.length} products matching your search. Here's a breakdown:\n\n`;
        
        if (priceGroups.budget.length > 0) {
          responseMessage += `💰 Budget Options (Under $100): ${priceGroups.budget.length} products\n`;
        }
        if (priceGroups.midRange.length > 0) {
          responseMessage += `💎 Mid-Range Options ($100-$500): ${priceGroups.midRange.length} products\n`;
        }
        if (priceGroups.premium.length > 0) {
          responseMessage += `✨ Premium Options (Over $500): ${priceGroups.premium.length} products\n\n`;
        }

        // Add price range context if available
        const priceRange = extractPriceRange(message);
        if (priceRange) {
          responseMessage += `\nAll products shown are within your specified price range: ${
            priceRange.min && priceRange.max ? `$${priceRange.min} - $${priceRange.max}` :
            priceRange.max ? `under $${priceRange.max}` :
            priceRange.min ? `above $${priceRange.min}` :
            `around $${priceRange.target}`
          }\n`;
        }

        // Add sorting suggestions
        responseMessage += `\n💡 Tip: You can refine your search by:\n`;
        responseMessage += `• Adding specific features (e.g., "gaming", "4K", "wireless")\n`;
        responseMessage += `• Specifying a price range (e.g., "under $200")\n`;
        responseMessage += `• Mentioning brand preferences\n\n`;
        responseMessage += `Would you like to see more specific options or need help comparing these products?`;
      } else {
        responseMessage = "I couldn't find any products matching your search. Here are some suggestions:\n\n";
        responseMessage += "1. Try different keywords or spelling\n";
        responseMessage += "2. Use more general terms\n";
        responseMessage += "3. Check if the product name is correct\n";
        responseMessage += "4. Try searching by category instead\n\n";
        responseMessage += "Would you like to try a different search term?";
      }

      return res.status(200).json({
        response: responseMessage,
        products,
        isAIMode: false
      });
    }

    // AI mode
    if (!conversationHistory.has(sessionId)) {
      conversationHistory.set(sessionId, []);
    }
    const history = conversationHistory.get(sessionId);

    // Prepare system message for AI mode
    let systemMessage = `You are an advanced AI shopping assistant for Electroslab.com. Your role is to:
      1. Provide detailed product recommendations and comparisons
      2. Answer complex questions about products and their features
      3. Help customers make informed decisions based on their needs
      4. Provide price comparisons and value analysis
      5. Suggest alternatives and complementary products
      6. Explain technical specifications in simple terms
      7. Offer personalized shopping advice
      
      Always be helpful, knowledgeable, and maintain a friendly, professional tone.`;

    // Add price range context if available
    const priceRange = extractPriceRange(message);
    if (priceRange) {
      systemMessage += `\n\nIMPORTANT: The customer has specified a price range: ${
        priceRange.min && priceRange.max ? `$${priceRange.min} - $${priceRange.max}` :
        priceRange.max ? `under $${priceRange.max}` :
        priceRange.min ? `above $${priceRange.min}` :
        `around $${priceRange.target}`
      }. Please focus on recommending products within this price range and provide price-based advice.`;
    }

    // Prepare messages with system context and conversation history
    const messages = [
      {
        role: "system",
        content: systemMessage
      },
      ...history,
      {
        role: "user",
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.8,
      max_tokens: 800,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    const response = completion.choices[0].message.content;

    // Update conversation history
    history.push(
      { role: "user", content: message },
      { role: "assistant", content: response }
    );

    // Keep only last 10 messages to maintain context without using too much memory
    if (history.length > 10) {
      history.splice(0, 2);
    }

    res.status(200).json({ 
      response,
      sessionId,
      isAIMode: true
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 