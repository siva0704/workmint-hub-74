
import { Task } from '@/types';

interface OfflineTaskData {
  taskId: string;
  completedQty: number;
  lastUpdated: string;
  synced: boolean;
}

interface OfflineStorage {
  saveDraftTask: (taskId: string, completedQty: number) => void;
  getDraftTask: (taskId: string) => OfflineTaskData | null;
  getAllDraftTasks: () => OfflineTaskData[];
  markTaskSynced: (taskId: string) => void;
  removeDraftTask: (taskId: string) => void;
  clearAllDrafts: () => void;
  isOnline: () => boolean;
}

const STORAGE_KEY = 'factory_offline_tasks';

export const offlineStorage: OfflineStorage = {
  saveDraftTask: (taskId: string, completedQty: number) => {
    try {
      const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const draftData: OfflineTaskData = {
        taskId,
        completedQty,
        lastUpdated: new Date().toISOString(),
        synced: false,
      };
      
      existingData[taskId] = draftData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
      
      console.log(`Draft saved for task ${taskId}: ${completedQty}`);
    } catch (error) {
      console.error('Failed to save draft task:', error);
    }
  },

  getDraftTask: (taskId: string) => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return data[taskId] || null;
    } catch (error) {
      console.error('Failed to get draft task:', error);
      return null;
    }
  },

  getAllDraftTasks: () => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return Object.values(data);
    } catch (error) {
      console.error('Failed to get all draft tasks:', error);
      return [];
    }
  },

  markTaskSynced: (taskId: string) => {
    try {
      const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (existingData[taskId]) {
        existingData[taskId].synced = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
      }
    } catch (error) {
      console.error('Failed to mark task as synced:', error);
    }
  },

  removeDraftTask: (taskId: string) => {
    try {
      const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      delete existingData[taskId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
    } catch (error) {
      console.error('Failed to remove draft task:', error);
    }
  },

  clearAllDrafts: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear all drafts:', error);
    }
  },

  isOnline: () => {
    return navigator.onLine;
  },
};

// Auto-sync functionality
export const setupAutoSync = () => {
  const syncDraftTasks = async () => {
    if (!offlineStorage.isOnline()) return;

    const draftTasks = offlineStorage.getAllDraftTasks().filter(task => !task.synced);
    
    for (const draft of draftTasks) {
      try {
        // In a real app, this would be an API call to your MongoDB backend
        console.log(`Syncing task ${draft.taskId} with quantity ${draft.completedQty}`);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        offlineStorage.markTaskSynced(draft.taskId);
        console.log(`Task ${draft.taskId} synced successfully`);
      } catch (error) {
        console.error(`Failed to sync task ${draft.taskId}:`, error);
      }
    }
  };

  // Listen for online events
  window.addEventListener('online', syncDraftTasks);
  
  // Periodic sync when online
  setInterval(() => {
    if (offlineStorage.isOnline()) {
      syncDraftTasks();
    }
  }, 30000); // Sync every 30 seconds when online

  return () => {
    window.removeEventListener('online', syncDraftTasks);
  };
};
