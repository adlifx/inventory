'use client';

import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ProductForm({ onProductAdded }) {
  const [name, setName] = useState('');
  const [serialNumberRanges, setSerialNumberRanges] = useState('');
  const [calculatedQuantity, setCalculatedQuantity] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const parseRanges = (rangesString) => {
    const serialNumbers = new Set();
    const ranges = rangesString.split(',').map(r => r.trim()).filter(r => r !== '');

    for (const range of ranges) {
      if (range.includes('-')) {
        const [startStr, endStr] = range.split('-').map(s => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            serialNumbers.add(i.toString().padStart(startStr.length, '0')); // Keep leading zeros
          }
        } else {
          return { error: `Invalid range: ${range}` };
        }
      } else {
        const sn = range.trim();
        if (sn) {
          serialNumbers.add(sn);
        }
      }
    }
    return { serialNumbers: Array.from(serialNumbers) };
  };

  const handleSerialNumberChange = (e) => {
    const value = e.target.value;
    setSerialNumberRanges(value);
    const parsed = parseRanges(value);
    if (parsed.error) {
      setMessage(parsed.error);
      setCalculatedQuantity(0);
    } else {
      setMessage('');
      setCalculatedQuantity(parsed.serialNumbers.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!name) {
      setMessage('Please enter product name.');
      setLoading(false);
      return;
    }

    const parsed = parseRanges(serialNumberRanges);
    if (parsed.error) {
      setMessage(parsed.error);
      setLoading(false);
      return;
    }
    const serialNumbersArray = parsed.serialNumbers;

    if (serialNumbersArray.length === 0) {
      setMessage('Please enter at least one serial number or a valid range.');
      setLoading(false);
      return;
    }

    try {
      const productsRef = collection(db, 'products');
      await addDoc(productsRef, {
        name,
        quantity: serialNumbersArray.length, // Quantity is the number of serial numbers
        serialNumbers: serialNumbersArray,
        createdAt: serverTimestamp(),
      });

      setMessage(`Product "${name}" with ${serialNumbersArray.length} units added successfully.`);
      setName('');
      setSerialNumberRanges('');
      setCalculatedQuantity(0);
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
          <label htmlFor="serialNumberRanges" className="block text-sm font-medium mb-1">
            Serial Numbers / Ranges (comma-separated, e.g., SN001, 100-105, ABC01)
          </label>
          <textarea
            id="serialNumberRanges"
            className="w-full p-2 border rounded"
            value={serialNumberRanges}
            onChange={handleSerialNumberChange}
            rows="4"
            placeholder="SN001, 100-105, ABC01-ABC03, XYZ"
          />
          {calculatedQuantity > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              Calculated Quantity: {calculatedQuantity}
            </p>
          )}
        </div>
        {/* Removed Quantity input */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          disabled={loading || calculatedQuantity === 0}
        >
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}
