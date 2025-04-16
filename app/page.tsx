// src/app/page.js
'use client';

import { useState } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Product Inventory System</h1>
      
      <ProductForm />
      <ProductList />
    </main>
  );
}
