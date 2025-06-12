import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const [imgSrc, setImgSrc] = useState(product.image || '/no-image.png');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (product.image) {
      setIsLoading(true);
      setHasError(false);
      // Preload the image
      const img = new Image();
      img.src = product.image;
      img.onload = () => {
        setImgSrc(product.image);
        setIsLoading(false);
      };
      img.onerror = () => {
        console.error('Failed to load image:', product.image);
        setImgSrc('/no-image.png');
        setHasError(true);
        setIsLoading(false);
      };
    }
  }, [product.image]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-w-16 aspect-h-9 w-full bg-gray-100">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}
        <motion.img
          src={imgSrc}
          alt={product.title}
          className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={(e) => {
            console.error('Image failed to load:', product.image);
            setImgSrc('/no-image.png');
            setHasError(true);
            setIsLoading(false);
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center"
        >
          <motion.a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold transform hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Details
          </motion.a>
        </motion.div>
      </div>
      <div className="p-6">
        <motion.h3 
          className="text-xl font-bold text-gray-900 mb-3 line-clamp-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {product.title}
        </motion.h3>
        {product.price && (
          <motion.p 
            className="text-2xl font-bold text-blue-600 mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {product.price}
          </motion.p>
        )}
        {product.description && (
          <motion.p 
            className="text-gray-600 text-base mb-4 line-clamp-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {product.description}
          </motion.p>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between items-center"
        >
          <motion.a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Shop Now
            <svg 
              className="w-5 h-5 ml-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M14 5l7 7m0 0l-7 7m7-7H3" 
              />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductCard; 