// src/app/return-product/components/ReturnedProductList.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';

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
        return <p className="text-white">Loading returned product records...</p>;
    }

    if (error) {
        return <p className="text-red-500">Error: {error}</p>;
    }

    return (
        <div className="mt-8 text-white"> {/* Changed text-black to text-white here */}
            <h2 className="text-xl font-semibold mb-4">Returned Product Records</h2>
            {returnedProducts.length === 0 ? (
                <p>No returned products recorded yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-800 border rounded shadow-md"> {/* Using a dark background for the table */}
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="py-2 px-4 border-b font-semibold text-left text-white">Product Name</th>
                                <th className="py-2 px-4 border-b font-semibold text-left text-white">Quantity</th>
                                <th className="py-2 px-4 border-b font-semibold text-left text-white">Serial Numbers</th>
                                <th className="py-2 px-4 border-b font-semibold text-left text-white">Returned On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returnedProducts.map(product => (
                                <tr key={product.id} className="hover:bg-gray-600">
                                    <td className="py-2 px-4 border-b text-white">{product.productName}</td>
                                    <td className="py-2 px-4 border-b text-white">{product.serialNumbers.length}</td>
                                    <td className="py-2 px-4 border-b text-white">{product.serialNumbers.join(', ')}</td>
                                    <td className="py-2 px-4 border-b text-white">
                                        {new Date(product.returnedAt?.seconds * 1000).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-6">
                <Link href="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Go Back to Add Product
                </Link>
            </div>
        </div>
    );
}
