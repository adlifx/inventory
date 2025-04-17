'use client'; // Add this line at the very top
// src/components/ProductList.js
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';

const months = [
  { value: '', label: 'All Months' },
  { value: '01', label: 'January' }, { value: '02', label: 'February' }, { value: '03', label: 'March' },
  { value: '04', label: 'April' }, { value: '05', label: 'May' }, { value: '06', label: 'June' },
  { value: '07', label: 'July' }, { value: '08', label: 'August' }, { value: '09', label: 'September' },
  { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' },
];

const years = Array.from({ length: new Date().getFullYear() - 2020 + 1 }, (_, i) => ({
  value: (2020 + i).toString(),
  label: (2020 + i).toString(),
})).reverse();
years.unshift({ value: '', label: 'All Years' });

export default function ProductList({ refresh }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productQuantities, setProductQuantities] = useState({});
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    setLoading(true);
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
            createdAtDate: data.createdAt?.toDate(), // Store Date object for filtering
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
  }, [refresh]);

  useEffect(() => {
    const calculateTotalQuantities = () => {
      const quantities = {};
      products.forEach(product => {
        quantities[product.name] = (quantities[product.name] || 0) + product.quantity;
      });
      setProductQuantities(quantities);
    };

    calculateTotalQuantities();
  }, [products]);

  useEffect(() => {
    const filterProducts = () => {
      let filtered = products;

      if (selectedMonth) {
        filtered = filtered.filter(product => {
          const month = (product.createdAtDate?.getMonth() + 1).toString().padStart(2, '0');
          return month === selectedMonth;
        });
      }

      if (selectedYear) {
        filtered = filtered.filter(product => {
          const year = product.createdAtDate?.getFullYear().toString();
          return year === selectedYear;
        });
      }

      setFilteredProducts(filtered);
    };

    filterProducts();
  }, [products, selectedMonth, selectedYear]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Inventory</h2>
        <Link href="/return-product" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Go to Return Product Page
        </Link>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <div>
          <label htmlFor="month" className="mr-2">Filter by Month:</label>
          <select id="month" value={selectedMonth} onChange={handleMonthChange} className="bg-gray-700 text-white rounded py-1 px-2">
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="year" className="mr-2">Filter by Year:</label>
          <select id="year" value={selectedYear} onChange={handleYearChange} className="bg-gray-700 text-white rounded py-1 px-2">
            {years.map(year => (
              <option key={year.value} value={year.value}>{year.label}</option>
            ))}
          </select>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">Total Quantity by Product:</h3>
      <ul>
        {Object.entries(productQuantities).map(([name, total]) => (
          <li key={name} className="mb-1">
            <span className="font-semibold">{name}:</span> {total}
          </li>
        ))}
      </ul>

      {filteredProducts.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <h3 className="text-lg font-semibold mb-2">All Products:</h3>
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
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{product.name}</td>
                  <td className="py-2 px-4 border">{product.quantity}</td>
                  <td className="py-2 px-4 border">
                    <div className="max-h-24 overflow-y-auto">
                      {product.serialNumbersDisplay}
                    </div>
                  </td>
                  <td className="py-2 px-4 border">{product.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filteredProducts.length === 0 && !loading && !error && products.length > 0 && (
        <p className="mt-4">No products match the selected month and year.</p>
      )}
      {products.length === 0 && !loading && !error && (
        <p className="mt-4">No products recorded yet.</p>
      )}
    </div>
  );
}
