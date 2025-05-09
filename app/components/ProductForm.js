'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, increment, arrayUnion } from 'firebase/firestore';

export default function ProductForm({ onProductAdded }) {
  const [name, setName] = useState('');
  const [serialNumbersType, setSerialNumbersType] = useState('manual'); // 'manual' or 'series'
  const [manualSerialNumbers, setManualSerialNumbers] = useState('');
  const [startSerialNumber, setStartSerialNumber] = useState('');
  const [endSerialNumber, setEndSerialNumber] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [existingSerialNumbers, setExistingSerialNumbers] = useState([]);

  useEffect(() => {
    const fetchExistingSerials = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const allSerials = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.serialNumbers && Array.isArray(data.serialNumbers)) {
            allSerials.push(...data.serialNumbers);
          }
        });
        setExistingSerialNumbers(allSerials);
      } catch (error) {
        console.error('Error fetching existing serial numbers:', error);
        setMessage(`Error fetching existing serials: ${error.message}`);
      }
    };

    fetchExistingSerials();
  }, []);

  useEffect(() => {
    setQuantity(0); // Reset quantity when entry type or serials change
    setMessage(''); // Clear previous messages
  }, [serialNumbersType, manualSerialNumbers, startSerialNumber, endSerialNumber]);

  useEffect(() => {
    if (serialNumbersType === 'series') {
      console.log('useEffect - startSerialNumber:', startSerialNumber, 'endSerialNumber:', endSerialNumber);
      calculateQuantityFromSeries(startSerialNumber, endSerialNumber);
    }
  }, [startSerialNumber, endSerialNumber, serialNumbersType]);

  const handleSerialNumbersTypeChange = (e) => {
    setSerialNumbersType(e.target.value);
    setManualSerialNumbers('');
    setStartSerialNumber('');
    setEndSerialNumber('');
    setQuantity(0);
  };

  const handleManualSerialNumbersChange = (e) => {
    setManualSerialNumbers(e.target.value);
    const snArray = e.target.value.split(',').map(sn => sn.trim()).filter(sn => sn !== '');
    setQuantity([...new Set(snArray)].length);
  };

  const handleStartSerialNumberChange = (e) => {
    const newValue = e.target.value;
    setStartSerialNumber(newValue);
    console.log('handleStartSerialNumberChange - newValue:', newValue);
  };

  const handleEndSerialNumberChange = (e) => {
    const newValue = e.target.value;
    setEndSerialNumber(newValue);
    console.log('handleEndSerialNumberChange - newValue:', newValue);
  };

  const calculateQuantityFromSeries = (start, end) => {
    console.log('calculateQuantityFromSeries - Received Start:', start, 'Received End:', end);
    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);
    console.log('calculateQuantityFromSeries - Parsed Start:', startNum, 'Parsed End:', endNum);

    if (isNaN(startNum) || isNaN(endNum) || endNum < startNum) {
      setQuantity(0);
      console.log('calculateQuantityFromSeries - Setting quantity to 0 due to invalid input');
    } else {
      const calculatedQuantity = endNum - startNum + 1;
      setQuantity(calculatedQuantity);
      console.log('calculateQuantityFromSeries - Setting quantity to:', calculatedQuantity);
    }
  };

  const isSerialNumberTaken = (serial) => existingSerialNumbers.includes(serial);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    let serialNumbersArray = [];
    if (serialNumbersType === 'manual') {
      serialNumbersArray = manualSerialNumbers.split(',').map(sn => sn.trim()).filter(sn => sn !== '');
    } else if (serialNumbersType === 'series' && startSerialNumber && endSerialNumber) {
      const startNum = parseInt(startSerialNumber, 10);
      const endNum = parseInt(endSerialNumber, 10);
      if (!isNaN(startNum) && !isNaN(endNum) && endNum >= startNum) {
        for (let i = startNum; i <= endNum; i++) {
          serialNumbersArray.push(i.toString());
        }
      }
    }

    const uniqueNewSerials = [...new Set(serialNumbersArray)];
    const finalQuantityToAdd = serialNumbersType === 'series' ? quantity : uniqueNewSerials.length;

    if (finalQuantityToAdd === 0 && serialNumbersType === 'series' && (startSerialNumber || endSerialNumber)) {
      setMessage('Error: Invalid serial number range.');
      setLoading(false);
      return;
    }

    if (!name) {
      setMessage('Error: Product name is required.');
      setLoading(false);
      return;
    }

    if (finalQuantityToAdd === 0 && serialNumbersType === 'manual' && manualSerialNumbers.trim() !== '') {
      setMessage('Error: No valid serial numbers entered.');
      setLoading(false);
      return;
    }

    try {
      const productsRef = collection(db, 'products');
      const existingProductQuery = query(productsRef, where('name', '==', name));
      const existingProductSnapshot = await getDocs(existingProductQuery);

      if (!existingProductSnapshot.empty) {
        const existingProductData = existingProductSnapshot.docs[0].data();
        const existingSerials = existingProductData.serialNumbers || [];

        // Check if any of the new serials already exist
        const hasExistingSerial = uniqueNewSerials.some(serial => existingSerials.includes(serial));

        if (hasExistingSerial) {
          setMessage(`Warning: Some or all of the entered serial numbers already exist for product "${name}". No new items added for these serial numbers.`);
        } else if (finalQuantityToAdd > 0) {
          await updateDoc(existingProductSnapshot.docs[0].ref, {
            serialNumbers: arrayUnion(...uniqueNewSerials),
            quantity: increment(finalQuantityToAdd),
            updatedAt: serverTimestamp(),
          });
          setMessage(`Quantity and serial numbers updated for product "${name}".`);
        } else {
          setMessage(`No new serial numbers or quantity to add for product "${name}".`);
        }
      } else {
        await addDoc(productsRef, {
          name,
          serialNumbers: uniqueNewSerials,
          quantity: finalQuantityToAdd,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setMessage('Product added successfully!');
        if (onProductAdded) {
          onProductAdded(); // Notify the parent component to refresh the list
        }
        setName('');
        setManualSerialNumbers('');
        setStartSerialNumber('');
        setEndSerialNumber('');
        setQuantity(0);
        setSerialNumbersType('manual'); // Reset to default
      }
    } catch (error) {
      console.error('Error adding/updating product:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-md mx-auto p-4 rounded shadow"
      style={{ backgroundColor: 'white', color: 'black' }}
    >
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'black' }}>
        Add New Product
      </h2>

      {message && (
        <div
          className={`p-2 mb-4 rounded ${
            message.includes('Error') ? 'bg-red-100 text-black' : 'bg-yellow-100 text-black'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" style={{ color: 'black' }}>
            Product Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
              rows="4"
              placeholder="SN001, SN002, SN003..."
              style={{ backgroundColor: 'white', color: 'black' }}
            />
            {manualSerialNumbers && (
              <p className="text-sm text-gray-500 mt-1" style={{ color: 'black' }}>
                Detected {quantity} serial numbers
              </p>
            )}
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
            {startSerialNumber && endSerialNumber && quantity > 0 && (
              <p className="text-sm text-green-500 mt-1" style={{ color: 'black' }}>
                Quantity will be: {quantity}
              </p>
            )}
            {startSerialNumber && endSerialNumber && quantity === 0 && (
              <p className="text-sm text-red-500 mt-1" style={{ color: 'black' }}>
                Invalid number series.
              </p>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" style={{ color: 'black' }}>
            Quantity (Auto-calculated)
          </label>
          <input
            type="number"
            value={quantity}
            className="w-full p-2 border rounded text-black bg-gray-100"
            style={{ color: 'black' }}
            readOnly
          />
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
