// src/app/return-product/components/ReturnProductForm.js
'use client';

import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ReturnProductForm() {
    const [productName, setProductName] = useState('');
    const [serialNumbers, setSerialNumbers] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleProductNameChange = (e) => {
        setProductName(e.target.value);
    };

    const handleSerialNumbersChange = (e) => {
        setSerialNumbers(e.target.value);
    };

    const handleReturnProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const serialNumbersArray = serialNumbers.split(',').map(sn => sn.trim()).filter(sn => sn !== '');

        if (!productName || serialNumbersArray.length === 0) {
            setMessage('Please enter the product name and at least one serial number.');
            setLoading(false);
            return;
        }

        try {
            const returnedProductsRef = collection(db, 'returnedProducts');
            await addDoc(returnedProductsRef, {
                productName,
                serialNumbers: serialNumbersArray,
                returnedAt: serverTimestamp()
                // You might want to add details like reason for return, etc.
            });

            setMessage(`Successfully recorded return for ${serialNumbersArray.length} units of ${productName} (Serial Numbers: ${serialNumbersArray.join(', ')})`);
            setProductName('');
            setSerialNumbers('');
        } catch (error) {
            console.error('Error recording returned product:', error);
            setMessage(`Failed to record return: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 rounded shadow mt-8" style={{ backgroundColor: 'white', color: 'black' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'black' }}>Record Returned Product (Broken)</h2>
            {message && (
                <div className={`p-2 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-black' : 'bg-green-100 text-black'}`}>
                    {message}
                </div>
            )}
            <form onSubmit={handleReturnProduct}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" style={{ color: 'black' }}>
                        Product Name
                    </label>
                    <input
                        type="text"
                        value={productName}
                        onChange={handleProductNameChange}
                        className="w-full p-2 border rounded text-black"
                        style={{ backgroundColor: 'white', color: 'black' }}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" style={{ color: 'black' }}>
                        Serial Number(s) (comma-separated)
                    </label>
                    <textarea
                        value={serialNumbers}
                        onChange={handleSerialNumbersChange}
                        className="w-full p-2 border rounded text-black"
                        rows="3"
                        placeholder="SN001, SN007, SN011..."
                        style={{ backgroundColor: 'white', color: 'black' }}
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:bg-gray-400"
                >
                    {loading ? 'Recording...' : 'Record Return'}
                </button>
            </form>
        </div>
    );
}
