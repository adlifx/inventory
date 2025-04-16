// src/app/page.js
'use client';

import { useState, useCallback } from 'react'; // Import useCallback
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';

export default function Home() {
  const [refreshList, setRefreshList] = useState(false); // State to trigger refresh

  // useCallback to memoize the function (optional but good practice)
  const handleProductAdded = useCallback(() => {
    setRefreshList((prev) => !prev); // Toggle the state to trigger re-render of ProductList
  }, []);

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Product Inventory System</h1>

      <ProductForm onProductAdded={handleProductAdded} /> {/* Pass the function as a prop */}
      <ProductList refresh={refreshList} /> {/* Pass a prop to ProductList to trigger refresh */}
    </main>
  );
}
