// app/page.tsx (example - your actual file might look different)

'use client';

import { useState } from 'react';
import ProductForm from '@/components/ProductForm'; // Adjust the import path if necessary
import ProductList from '@/components/ProductList'; // Adjust the import path if necessary

export default function HomePage() {
  const [productsUpdated, setProductsUpdated] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('list'); // Assuming you have tabs

  const handleProductAdded = () => {
    setProductsUpdated(prev => !prev); // Toggle state to trigger re-render in ProductList
    setActiveTab('list'); // Switch back to the list after adding
  };

  return (
    <div>
      {/* ... other components and UI ... */}
      {activeTab === 'add' && (
        <div className="mb-8">
          {/* Change 'refresh' to 'onProductAdded' */}
          <ProductForm onProductAdded={handleProductAdded} />
        </div>
      )}

      {activeTab === 'list' && (
        <div>
          {/* Ensure ProductList is receiving the 'refresh' prop if it needs it */}
          <ProductList refresh={productsUpdated} />
        </div>
      )}
      {/* ... other components and UI ... */}
    </div>
  );
}
