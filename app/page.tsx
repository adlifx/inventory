'use client';

import { useState, useCallback } from 'react';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';

export default function Home() {
  const [refreshList, setRefreshList] = useState(false);

  const handleProductAdded = useCallback(() => {
    setRefreshList((prev) => !prev);
  }, []);

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Product Inventory System</h1>
      <ProductForm onProductAdded={handleProductAdded} />
      <ProductList refresh={refreshList} />
    </main>
  );
}
