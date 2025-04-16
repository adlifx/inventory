// src/app/return-product/components/ReturnedProductList.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
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

export default function ReturnedProductList() {
    const [returnedProducts, setReturnedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

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

    useEffect(() => {
        const filterProducts = () => {
            let filtered = returnedProducts;

            if (selectedMonth) {
                filtered = filtered.filter(product => {
                    const date = new Date(product.returnedAt?.seconds * 1000);
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    return month === selectedMonth;
                });
            }

            if (selectedYear) {
                filtered = filtered.filter(product => {
                    const date = new Date(product.returnedAt?.seconds * 1000);
                    const year = date.getFullYear().toString();
                    return year === selectedYear;
                });
            }

            setFilteredProducts(filtered);
        };

        filterProducts();
    }, [returnedProducts, selectedMonth, selectedYear]);

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    if (loading) {
        return <p className="text-white">Loading returned product records...</p>;
    }

    if (error) {
        return <p className="text-red-500">Error: {error}</p>;
    }

    return (
        <div className="mt-8 text-white">
            <div className="mb-4 flex justify-between items-center"> {/* Flex container for title and button */}
                <h2 className="text-xl font-semibold">Returned Product Records</h2>
                <Link href="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Go Back to Add Product
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

            {filteredProducts.length === 0 && !loading && !error && (
                <p>No returned products match the selected month and year.</p>
            )}

            {filteredProducts.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-800 border rounded shadow-md">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="py-2 px-4 border-b font-semibold text-left text-white">Product Name</th>
                                <th className="py-2 px-4 border-b font-semibold text-left text-white">Quantity</th>
                                <th className="py-2 px-4 border-b font-semibold text-left text-white">Serial Numbers</th>
                                <th className="py-2 px-4 border-b font-semibold text-left text-white">Returned On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
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

            {/* Removed the button from the bottom */}
        </div>
    );
}
