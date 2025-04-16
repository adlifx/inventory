// src/components/ProductList.js
'use client'; // Mark this component as a Client Component

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function ProductList({ refresh }) { // Receive the refresh prop
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalQuantity, setTotalQuantity] = useState(0);

  useEffect(() => {
    setLoading(true); // Set loading to true on every refresh
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            quantity: data.quantity,
            serialNumbers: Array.isArray(data.serialNumbers) ? data.serialNumbers : [],
            createdAt: data.createdAt?.toDate().toLocaleString() || 'Unknown',
            serialNumbersDisplay: formatSerialNumbers(data.serialNumbers),
          };
        });
        setProducts(productData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [refresh]); // Re-run the effect when the refresh prop changes

  useEffect(() => {
    const calculateTotalQuantity = () => {
      const total = products.reduce((sum, product) => sum + product.quantity, 0);
      setTotalQuantity(total);
    };

    calculateTotalQuantity();
  }, [products]);

  const formatSerialNumbers = (serialNumbers) => {
    if (!Array.isArray(serialNumbers) || serialNumbers.length === 0) {
      return '';
    }

    const numbers = serialNumbers.map(Number).sort((a, b) => a - b);
    const ranges = [];
    let start = numbers[0];
    let end = numbers[0];

    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] === end + 1) {
        end = numbers[i];
      } else {
        if (start === end) {
          ranges.push(start);
        } else {
          ranges.push(`${start}-${end}`);
        }
        start = numbers[i];
        end = numbers[i];
      }
    }

    if (start === end) {
      ranges.push(start);
    } else {
      ranges.push(`${start}-${end}`);
    }

    return ranges.join(', ');
  };

  if (loading) return <div className="text-center p-4 text-white">Loading products...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="mt-8 text-white">
      <h2 className="text-xl font-semibold mb-4">Product Inventory</h2>
      <p className="mb-2">Total Quantity: <span className="font-bold">{totalQuantity}</span></p>

      {/* ... (your existing table rendering logic) */}
    </div>
  );
}
