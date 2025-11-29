import { useEffect } from 'react';
import type { ResourceCard } from '@/lib/api';
import { fetchResources } from '@/lib/api';
import { resourcesSocket } from '@/lib/socket';
import { useResourceStore } from '@/store/useResourceStore';

export const useResourcesRealtime = () => {
  const setResources = useResourceStore((state) => state.setResources);
  const upsertResource = useResourceStore((state) => state.upsertResource);
  const bulkUpdate = useResourceStore((state) => state.bulkUpdate);
  const addCriticalAlert = useResourceStore((state) => state.addCriticalAlert);
  const setConnectionStatus = useResourceStore(
    (state) => state.setConnectionStatus,
  );

  useEffect(() => {
    let mounted = true;

    const loadInitial = async () => {
      try {
        const data = await fetchResources();
        if (mounted) {
          setResources(data);
        }
      } catch (error) {
        if (mounted) {
          setConnectionStatus('error');
          console.error('Failed to load resources', error);
        }
      }
    };

    setConnectionStatus('connecting');
    loadInitial();

    const handleInitialState = (data: ResourceCard[]) => {
      if (mounted) {
        setResources(data);
      }
    };
    const handleResourceUpdate = (resource: ResourceCard) => {
      if (mounted) {
        upsertResource(resource);
      }
    };
    const handleBulkUpdate = (resources: ResourceCard[]) => {
      if (mounted) {
        bulkUpdate(resources);
      }
    };
    const handleCriticalAlert = (resource: ResourceCard) => {
      if (mounted) {
        upsertResource(resource);
        addCriticalAlert(resource);
      }
    };

    resourcesSocket.connect();
    resourcesSocket.emit('join');

    resourcesSocket.on('initialState', handleInitialState);
    resourcesSocket.on('resourceUpdate', handleResourceUpdate);
    resourcesSocket.on('bulkUpdate', handleBulkUpdate);
    resourcesSocket.on('criticalAlert', handleCriticalAlert);
    resourcesSocket.on('connect', () => setConnectionStatus('connected'));
    resourcesSocket.on('disconnect', () => setConnectionStatus('disconnected'));
    resourcesSocket.on('error', () => setConnectionStatus('error'));

    return () => {
      mounted = false;
      resourcesSocket.off('initialState', handleInitialState);
      resourcesSocket.off('resourceUpdate', handleResourceUpdate);
      resourcesSocket.off('bulkUpdate', handleBulkUpdate);
      resourcesSocket.off('criticalAlert', handleCriticalAlert);
      resourcesSocket.off('connect');
      resourcesSocket.off('disconnect');
      resourcesSocket.off('error');
      resourcesSocket.disconnect();
    };
  }, [
    addCriticalAlert,
    bulkUpdate,
    setConnectionStatus,
    setResources,
    upsertResource,
  ]);
};
