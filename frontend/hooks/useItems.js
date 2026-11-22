'use client';

import { useState, useEffect } from 'react';
import { getMyItems, getItemById, registerItem as registerItemApi, updateItem as updateItemApi, deleteItem as deleteItemApi, getDeviceTypes, getManufacturersByDeviceType } from '../services/items.api';

export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async (query = {}) => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyItems(query);
      setItems(data.data?.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData) => {
    setError('');
    try {
      const data = await registerItemApi(itemData);
      setItems((prev) => [...prev, data.data?.item]);
      return {
        item: data.data?.item,
        verificationCode: data.verification_code
      };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateItem = async (id, itemData) => {
    setError('');
    try {
      const data = await updateItemApi(id, itemData);
      setItems((prev) => prev.map((item) => (item.id === id ? data.data?.item : item)));
      return data.data?.item;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeItem = async (id) => {
    setError('');
    try {
      await deleteItemApi(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { items, loading, error, fetchItems, createItem, updateItem, removeItem };
}

export function useDeviceTypes() {
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDeviceTypes = async () => {
      try {
        const data = await getDeviceTypes();
        setDeviceTypes(data.data?.deviceTypes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDeviceTypes();
  }, []);

  return { deviceTypes, loading, error };
}

export function useManufacturers(deviceTypeId) {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!deviceTypeId) {
      setManufacturers([]);
      setLoading(false);
      return;
    }
    const fetchManufacturers = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getManufacturersByDeviceType(deviceTypeId);
        setManufacturers(data.data?.manufacturers || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchManufacturers();
  }, [deviceTypeId]);

  return { manufacturers, loading, error };
}
