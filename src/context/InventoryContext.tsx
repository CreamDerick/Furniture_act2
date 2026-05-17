import React, { createContext, useContext, useState, useEffect } from 'react';
import { furnitureAPI, activityAPI, FurnitureItem, ActivityLog } from '../services/api';
import { useAuth } from './AuthContext';

interface InventoryContextType {
  furniture: FurnitureItem[];
  logs: ActivityLog[];
  isLoading: boolean;
  refreshInventory: () => Promise<void>;
  refreshLogs: () => Promise<void>;
  createFurniture: (item: Omit<FurnitureItem, 'id' | 'is_hidden' | 'created_at'>) => Promise<string | null>;
  updateFurniture: (id: string, updates: Partial<Omit<FurnitureItem, 'id' | 'created_at'>>) => Promise<string | null>;
  softDeleteFurniture: (id: string) => Promise<string | null>;
  hardDeleteFurniture: (id: string) => Promise<string | null>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshInventory = async () => {
    setIsLoading(true);
    try {
      const data = await furnitureAPI.list();
      setFurniture(data);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLogs = async () => {
    if (!user || user.role !== 'admin') return;
    try {
      const data = await activityAPI.list();
      setLogs(data);
    } catch (err) {
      console.error('Failed to pull system activity logs', err);
    }
  };

  // Automatically refresh inventory on mount or when user role changes
  useEffect(() => {
    refreshInventory();
    if (user && user.role === 'admin') {
      refreshLogs();
    }
  }, [user]);

  const createFurniture = async (item: Omit<FurnitureItem, 'id' | 'is_hidden' | 'created_at'>): Promise<string | null> => {
    if (!user || user.role !== 'admin') return 'Unauthorized action.';
    try {
      await furnitureAPI.create(item, user);
      await refreshInventory();
      await refreshLogs();
      return null;
    } catch (err: any) {
      return err.message || 'Failed to add item to catalog.';
    }
  };

  const updateFurniture = async (id: string, updates: Partial<Omit<FurnitureItem, 'id' | 'created_at'>>): Promise<string | null> => {
    if (!user || user.role !== 'admin') return 'Unauthorized action.';
    try {
      await furnitureAPI.update(id, updates, user);
      await refreshInventory();
      await refreshLogs();
      return null;
    } catch (err: any) {
      return err.message || 'Failed to edit item details.';
    }
  };

  const softDeleteFurniture = async (id: string): Promise<string | null> => {
    if (!user || user.role !== 'admin') return 'Unauthorized action.';
    try {
      await furnitureAPI.softDelete(id, user);
      await refreshInventory();
      await refreshLogs();
      return null;
    } catch (err: any) {
      return err.message || 'Failed to hide selected item.';
    }
  };

  const hardDeleteFurniture = async (id: string): Promise<string | null> => {
    if (!user || user.role !== 'admin') return 'Unauthorized action.';
    try {
      await furnitureAPI.hardDelete(id, user);
      await refreshInventory();
      await refreshLogs();
      return null;
    } catch (err: any) {
      return err.message || 'Failed to permanently delete selected item.';
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        furniture,
        logs,
        isLoading,
        refreshInventory,
        refreshLogs,
        createFurniture,
        updateFurniture,
        softDeleteFurniture,
        hardDeleteFurniture
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be called within an InventoryProvider scope.');
  }
  return context;
};
