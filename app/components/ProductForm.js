// src/components/ProductForm.js
import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ProductForm() {
  const [name, setName] = useState('');
  const [serialNumbers, setSerialNumbers] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // Convert comma-separated serial numbers to array
      const serialNumbersArray = serialNumbers
        .split(',')
        .map(sn => sn.trim())
        .filter(sn => sn !== '');
      
      // Calculate quantity based on unique serial numbers
      const uniqueSerialNumbers = [...new Set(serialNumbersArray)];
      const quantity = uniqueSerialNumbers.length;
      
      // Add document to Firestore
      await addDoc(collection(db, 'products'), {
        name,
        serialNumbers: uniqueSerialNumbers,
        quantity,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setMessage('Product added successfully!');
      setName('');
      setSerialNumbers('');
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
      
      {message && (
        <div className={`p-2 mb-4 rounded ${message.includes('Error') ? 'bg-red-100' : 'bg-green-100'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Serial Numbers (comma-separated)</label>
          <textarea
            value={serialNumbers}
            onChange={(e) => setSerialNumbers(e.target.value)}
            className="w-full p-2 border rounded"
            rows="4"
            placeholder="SN001, SN002, SN003..."
            required
          />
          {serialNumbers && (
            <p className="text-sm text-gray-500 mt-1">
              Detected {serialNumbers.split(',').filter(sn => sn.trim() !== '').length} serial numbers
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}