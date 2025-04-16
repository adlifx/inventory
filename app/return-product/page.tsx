// src/app/return-product/page.tsx
'use client';

import ReturnProductForm from './components/ReturnProductForm';
import ReturnedProductList from './components/ReturnedProductList';

export default function ReturnProductPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-center mb-8" style={{ color: 'black' }}>Returned Broken Products</h1>
            <ReturnProductForm />
            <ReturnedProductList />
        </div>
    );
}
