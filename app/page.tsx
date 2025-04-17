// app/page.tsx

'use client';

import { useState } from 'react';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';

export default function HomePage() {
  const [productsUpdated, setProductsUpdated] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('list');

  const handleProductAdded = () => {
    setProductsUpdated(prev => !prev);
    setActiveTab('list');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Product Management</h1>

      <div className="mb-4">
        <button
          onClick={() => setActiveTab('list')}
          className={`mr-2 px-4 py-2 rounded ${activeTab === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
        >
          View Products
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-4 py-2 rounded ${activeTab === 'add' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
        >
          Add Product
        </button>
      </div>

      {activeTab === 'add' && (
        <div className="mb-8">
          <ProductForm onProductAdded={handleProductAdded} />
        </div>
      )}

      {activeTab === 'list' && (
        <div>
          <ProductList refresh={productsUpdated} />
        </div>
      )}
    </div>
  );
}
