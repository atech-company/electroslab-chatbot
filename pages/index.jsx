import React from 'react';
import ChatWidget from '../components/ChatWidget';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
        
        </h1>
        <p className="text-center text-gray-600 mb-12">
         
        </p>
      </main>
      <ChatWidget />
    </div>
  );
}

// This is a static page, so we don't need getStaticPaths
export const getStaticProps = async () => {
  return {
    props: {}
  };
}; 