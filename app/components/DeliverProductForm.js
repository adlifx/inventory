// src/components/DeliverProductForm.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, arrayRemove, serverTimestamp, doc, addDoc } from 'firebase/firestore';

export default function DeliverProductForm() {
    const [productName, setProductName] = useState('');
    const [serialNumbersType, setSerialNumbersType] = useState('manual'); // 'manual' or 'series'
    const [manualSerialNumbers, setManualSerialNumbers] = useState('');
    const [startSerialNumber, setStartSerialNumber] = useState('');
    const [endSerialNumber, setEndSerialNumber] = useState('');
    const [quantityToDeliver, setQuantityToDeliver] = useState(0);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [existingProduct, setExistingProduct] = useState(null);

    useEffect(() => {
        let qty = 0;
        if (serialNumbersType === 'manual') {
            const snArray = manualSerialNumbers.split(',').map(sn => sn.trim()).filter(sn => sn !== '');
            qty = [...new Set(snArray)].length;
        } else if (serialNumbersType === 'series' && startSerialNumber && endSerialNumber) {
            const startNum = parseInt(startSerialNumber, 10);
            const endNum = parseInt(endSerialNumber, 10);
            if (!isNaN(startNum) && !isNaN(endNum) && endNum >= startNum) {
                qty = endNum - startNum + 1;
            }
        }
        setQuantityToDeliver(qty);
    }, [serialNumbersType, manualSerialNumbers, startSerialNumber, endSerialNumber]);

    const handleProductNameChange = async (e) => {
        const name = e.target.value;
        setProductName(name);
        setExistingProduct(null);
        setMessage('');

        if (name) {
            const productsRef = collection(db, 'products');
            const q = query(productsRef, where('name', '==', name));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                setExistingProduct(snapshot.docs[0].data());
            } else {
                setMessage('Product name does not exist.');
            }
        }
    };

    const handleSerialNumbersTypeChange = (e) => {
        setSerialNumbersType(e.target.value);
        setManualSerialNumbers('');
        setStartSerialNumber('');
        setEndSerialNumber('');
    };

    const handleManualSerialNumbersChange = (e) => {
        setManualSerialNumbers(e.target.value);
    };

    const handleStartSerialNumberChange = (e) => {
        setStartSerialNumber(e.target.value);
    };

    const handleEndSerialNumberChange = (e) => {
        setEndSerialNumber(e.target.value);
    };

    const handleDeliverProduct = async (e) => {
        e.preventDefault();
        if (!existingProduct) {
            setMessage('Please enter a valid product name.');
            return;
        }

        setLoading(true);
        setMessage('');

        let serialsToDeliver = [];
        if (serialNumbersType === 'manual') {
            serialsToDeliver = manualSerialNumbers.split(',').map(sn => sn.trim()).filter(sn => sn !== '');
        } else if (serialNumbersType === 'series' && startSerialNumber && endSerialNumber) {
            const startNum = parseInt(startSerialNumber, 10);
            const endNum = parseInt(endSerialNumber, 10);
            if (!isNaN(startNum) && !isNaN(endNum) && endNum >= startNum) {
                for (let i = startNum; i <= endNum; i++) {
                    serialsToDeliver.push(i.toString());
                }
            }
        }

        const uniqueSerialsToDeliver = [...new Set(serialsToDeliver)];

        if (uniqueSerialsToDeliver.length === 0) {
            setMessage('Please enter serial numbers to deliver.');
            setLoading(false);
            return;
        }

        const productRef = collection(db, 'products');
        const q = query(productRef, where('name', '==', productName));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            setMessage('Product name does not exist.');
            setLoading(false);
            return;
        }

        const productDoc = snapshot.docs[0];
        const productData = productDoc.data();
        const productSerialNumbers = productData.serialNumbers || [];

        const validSerialsToDeliver = uniqueSerialsToDeliver.filter(sn => productSerialNumbers.includes(sn));

        if (validSerialsToDeliver.length !== uniqueSerialsToDeliver.length) {
            const invalidSerials = uniqueSerialsToDeliver.filter(sn => !productSerialNumbers.includes(sn));
            setMessage(`Error: The following serial numbers do not exist for this product: ${invalidSerials.join(', ')}`);
            setLoading(false);
            return;
        }

        if (productData.quantity < validSerialsToDeliver.length) {
            setMessage(`Error: Not enough quantity in stock to deliver ${validSerialsToDeliver.length} units.`);
            setLoading(false);
            return;
        }

        try {
            // Update product quantity and remove delivered serial numbers
            await updateDoc(productDoc.ref, {
                quantity: productData.quantity - validSerialsToDeliver.length,
                serialNumbers: productSerialNumbers.filter(sn => !validSerialsToDeliver.includes(sn)),
                updatedAt: serverTimestamp()
            });

            // Optional: Add delivery record to a 'deliveries' collection
            const deliveriesRef = collection(db, 'deliveries');
            await addDoc(deliveriesRef, {
                productName,
                serialNumbers: validSerialsToDeliver,
                deliveredAt: serverTimestamp()
                // You might want to add more details like delivered by, etc.
            });

            setMessage(`Successfully delivered ${validSerialsToDeliver.length} units of ${productName} (Serial Numbers: ${validSerialsToDeliver.join(', ')})`);
            setProductName('');
            setSerialNumbersType('manual');
            setManualSerialNumbers('');
            setStartSerialNumber('');
            setEndSerialNumber('');
        } catch (error) {
            console.error('Error delivering product:', error);
            setMessage(`Success Update!`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 rounded shadow mt-8" style={{ backgroundColor: 'white', color: 'black' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'black' }}>Deliver Product</h2>
            {message && (
                <div className={`p-2 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-black' : 'bg-green-100 text-black'}`}>
                    {message}
                </div>
            )}
            <form onSubmit={handleDeliverProduct}>
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
                        Serial Number Entry Type
                    </label>
                    <select
                        value={serialNumbersType}
                        onChange={handleSerialNumbersTypeChange}
                        className="w-full p-2 border rounded text-black"
                        style={{ backgroundColor: 'white', color: 'black' }}
                    >
                        <option value="manual">Manual Entry (comma-separated)</option>
                        <option value="series">Number Series (Start - End)</option>
                    </select>
                </div>

                {serialNumbersType === 'manual' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" style={{ color: 'black' }}>
                            Serial Numbers
                        </label>
                        <textarea
                            value={manualSerialNumbers}
                            onChange={handleManualSerialNumbersChange}
                            className="w-full p-2 border rounded text-black"
                            rows="3"
                            placeholder="SN001, SN003, SN005..."
                            style={{ backgroundColor: 'white', color: 'black' }}
                            required
                        />
                    </div>
                )}

                {serialNumbersType === 'series' && (
                    <div className="mb-4">
                        <div className="flex space-x-2">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium mb-1" style={{ color: 'black' }}>
                                    Start Number
                                </label>
                                <input
                                    type="number"
                                    value={startSerialNumber}
                                    onChange={handleStartSerialNumberChange}
                                    className="w-full p-2 border rounded text-black"
                                    style={{ backgroundColor: 'white', color: 'black' }}
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium mb-1" style={{ color: 'black' }}>
                                    End Number
                                </label>
                                <input
                                    type="number"
                                    value={endSerialNumber}
                                    onChange={handleEndSerialNumberChange}
                                    className="w-full p-2 border rounded text-black"
                                    style={{ backgroundColor: 'white', color: 'black' }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" style={{ color: 'black' }}>
                        Quantity to Deliver
                    </label>
                    <input
                        type="number"
                        value={quantityToDeliver}
                        className="w-full p-2 border rounded text-black bg-gray-100"
                        style={{ color: 'black' }}
                        readOnly
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !existingProduct || quantityToDeliver === 0}
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {loading ? 'Delivering...' : 'Deliver Product'}
                </button>
            </form>
        </div>
    );
}
