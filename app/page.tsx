// src/app/page.tsx
'use client';

import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import DeliverProductForm from './components/DeliverProductForm';
import Link from 'next/link'; // Import the Link component
import { useState, useCallback } from 'react';

export default function Home() {
    const [activeTab, setActiveTab] = useState('add');
    const [refreshList, setRefreshList] = useState(false);

    const handleProductAdded = useCallback(() => {
        setRefreshList((prev) => !prev);
    }, []);

    return (
        <main className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-center mb-8">Product Inventory System</h1>

            <div className="flex justify-center mb-4">
                <button
                    className={`px-4 py-2 rounded-l ${activeTab === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                    onClick={() => setActiveTab('add')}
                >
                    Add Product
                </button>
                <button
                    className={`px-4 py-2 rounded-r ${activeTab === 'deliver' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                    onClick={() => setActiveTab('deliver')}
                >
                    Deliver Product
                </button>
            </div>

            {activeTab === 'add' && (
                <div className="mb-8">
                    <ProductForm onProductAdded={handleProductAdded} />
                </div>
            )}

            {activeTab === 'deliver' && (
                <div className="mb-8">
                    <DeliverProductForm />
                </div>
            )}

            <ProductList refresh={refreshList} />

            <div className="mt-8 text-center">
                <Link href="/return-product" className="bg-red-500 text-white p-2 rounded hover:bg-red-600">
                    Go to Return Product Page
                </Link>
            </div>
        </main>
    );
}
