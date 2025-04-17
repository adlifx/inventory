// src/components/ProductForm.js
'use client';

import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ProductForm({ onProductAdded }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [serialNumbersInput, setSerialNumbersInput] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const serialNumbersArray = serialNumbersInput.split(',').map(sn => sn.trim()).filter(sn => sn !== '');

    if (!name || !quantity) {
      setMessage('Please enter product name and quantity.');
      setLoading(false);
      return;
    }

    try {
      const productsRef = collection(db, 'products');
      await addDoc(productsRef, {
        name,
        quantity: parseInt(quantity, 10),
        serialNumbers: serialNumbersArray,
        createdAt: serverTimestamp(),
      });

      setMessage(`Product "${name}" added successfully.`);
      setName('');
      setQuantity('');
      setSerialNumbersInput('');
      if (onProductAdded) {
        onProductAdded();
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage(`Failed to add product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 rounded shadow mt-8 bg-white text-black">
      <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
      {message && (
        <div className={`p-2 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            id="name"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="quantity" className="block text-sm font-medium mb-1">Quantity</label>
          <input
            type="number"
            id="quantity"
            className="w-full p-2 border rounded"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="serialNumbers" className="block text-sm font-medium mb-1">Serial Numbers (comma-separated)</label>
          <textarea
            id="serialNumbers"
            className="w-full p-2 border rounded"
            value={serialNumbersInput}
            onChange={(e) => setSerialNumbersInput(e.target.value)}
            rows="3"
            placeholder="SN001, SN002, SN003..."
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}
