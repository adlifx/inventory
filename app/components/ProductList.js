// src/components/ProductList.js
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
            serialNumbersDisplay: formatSerialNumbers(data.serialNumbers), // New display format
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
  }, []);

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

      {products.length === 0 ? (
        <p className="text-gray-500">No products added yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border text-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border text-left">Name</th>
                <th className="py-2 px-4 border text-left">Quantity</th>
                <th className="py-2 px-4 border text-left">Serial Numbers</th>
                <th className="py-2 px-4 border text-left">Added On</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{product.name}</td>
                  <td className="py-2 px-4 border">{product.quantity}</td>
                  <td className="py-2 px-4 border">
                    <div className="max-h-24 overflow-y-auto">
                      {product.serialNumbersDisplay} {/* Display the formatted serial numbers */}
                    </div>
                  </td>
                  <td className="py-2 px-4 border">{product.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
