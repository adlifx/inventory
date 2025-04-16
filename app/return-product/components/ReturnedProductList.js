// src/app/return-product/components/ReturnedProductList.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function ReturnedProductList() {
    const [returnedProducts, setReturnedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        const q = query(
            collection(db, 'returnedProducts'),
            orderBy('returnedAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const productData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReturnedProducts(productData);
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching returned products:', err);
                setError('Failed to load returned products.');
                setLoading(false);
            }
        );

        return () => unsubscribe();
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
                        <li key={product.id} className="mb-3" style={{ color: 'black' }}>
                            <strong className="block">{product.productName}</strong>
                            <span className="block">
                                Serial Numbers: {product.serialNumbers.join(', ')}
                            </span>
                            <span className="block text-gray-600">
                                Returned on: {new Date(product.returnedAt?.seconds * 1000).toLocaleString()}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
