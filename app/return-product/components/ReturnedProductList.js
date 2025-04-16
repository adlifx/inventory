// src/app/return-product/components/ReturnedProductList.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, orderBy } from 'firebase/firestore';

export default function ReturnedProductList() {
    const [returnedProducts, setReturnedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReturnedProducts = async () => {
            try {
                const returnedProductsRef = collection(db, 'returnedProducts');
                const snapshot = await getDocs(orderBy(returnedProductsRef, 'returnedAt', 'desc'));
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReturnedProducts(data);
                setLoading(false);
            } catch (e) {
                console.error('Error fetching returned products:', e);
                setError('Failed to load returned products.');
                setLoading(false);
            }
        };

        fetchReturnedProducts();
    }, []);

    if (loading) {
        return <p>Loading returned product records...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'black' }}>Returned Product Records</h2>
            {returnedProducts.length === 0 ? (
                <p>No returned products recorded yet.</p>
            ) : (
                <ul className="list-disc pl-5">
                    {returnedProducts.map(product => (
                        <li key={product.id} className="mb-2" style={{ color: 'black' }}>
                            <strong>{product.productName}:</strong> {product.serialNumbers.join(', ')} (Returned on:{' '}
                            {new Date(product.returnedAt?.seconds * 1000).toLocaleString()}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
