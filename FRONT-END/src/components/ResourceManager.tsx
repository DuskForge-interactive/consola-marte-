import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  createResource,
  deleteResource,
  updateResource,
  type ResourceCard,
} from '@/lib/api';
import { useResourceStore } from '@/store/useResourceStore';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type CreateFormState = {
  code: string;
  displayName: string;
  currentPercentage: string;
  criticalPercentage: string;
  consumptionRatePerMinute: string;
  isCritical: boolean;
};

type EditFormState = {
  displayName: string;
  currentPercentage: string;
  criticalPercentage: string;
  consumptionRatePerMinute: string;
  isCritical: boolean;
};

const defaultCreateState: CreateFormState = {
  code: '',
  displayName: '',
  currentPercentage: '',
  criticalPercentage: '',
  consumptionRatePerMinute: '',
  isCritical: false,
};

const defaultEditState: EditFormState = {
  displayName: '',
  currentPercentage: '',
  criticalPercentage: '',
  consumptionRatePerMinute: '',
  isCritical: false,
};

const parseNumberInput = (value: string) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error('Ingresa valores numéricos válidos.');
  }
  return parsed;
};

export const ResourceManager = () => {
  const resourcesRecord = useResourceStore((state) => state.resources);
  const upsertResource = useResourceStore((state) => state.upsertResource);
  const removeResource = useResourceStore((state) => state.removeResource);
  const { toast } = useToast();

  const resourceList = useMemo<ResourceCard[]>(
    () =>
      Object.values(resourcesRecord).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [resourcesRecord],
  );

  const [createForm, setCreateForm] = useState<CreateFormState>(
    defaultCreateState,
  );
  const [editForm, setEditForm] = useState<EditFormState>(defaultEditState);
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedResource = resourceList.find(
    (resource) => resource.id === selectedCode,
  );

  useEffect(() => {
    if (!selectedResource) {
      setEditForm(defaultEditState);
      return;
    }

    setEditForm({
      displayName: selectedResource.name,
      currentPercentage: selectedResource.currentPercentage.toString(),
      criticalPercentage: selectedResource.criticalPercentage.toString(),
      consumptionRatePerMinute:
        selectedResource.consumptionRatePerMinute.toString(),
      isCritical: selectedResource.isCritical,
    });
  }, [selectedResource]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setCreating(true);
      const payload = {
        code: createForm.code.trim().toUpperCase(),
        displayName: createForm.displayName.trim(),
        currentPercentage: parseNumberInput(createForm.currentPercentage),
        criticalPercentage: parseNumberInput(createForm.criticalPercentage),
        consumptionRatePerMinute: parseNumberInput(
          createForm.consumptionRatePerMinute,
        ),
        isCritical: createForm.isCritical,
      };

      const resource = await createResource(payload);
      upsertResource(resource);
      toast({
        title: 'Recurso creado',
        description: `${resource.name} se añadió correctamente.`,
      });
      setCreateForm(defaultCreateState);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error al crear',
        description:
          error instanceof Error ? error.message : 'Inténtalo nuevamente.',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedResource) {
      toast({
        variant: 'destructive',
        title: 'Selecciona un recurso',
        description: 'Elige un recurso para editar o eliminar.',
      });
      return;
    }

    try {
      setUpdating(true);
      const payload = {
        displayName: editForm.displayName.trim(),
        currentPercentage: parseNumberInput(editForm.currentPercentage),
        criticalPercentage: parseNumberInput(editForm.criticalPercentage),
        consumptionRatePerMinute: parseNumberInput(
          editForm.consumptionRatePerMinute,
        ),
        isCritical: editForm.isCritical,
      };

      const updated = await updateResource(selectedResource.id, payload);
      upsertResource(updated);
      toast({
        title: 'Recurso actualizado',
        description: `${updated.name} se actualizó correctamente.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description:
          error instanceof Error ? error.message : 'Inténtalo nuevamente.',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedResource) {
      toast({
        variant: 'destructive',
        title: 'Selecciona un recurso',
        description: 'Elige un recurso a eliminar.',
      });
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar ${selectedResource.name}?`,
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteResource(selectedResource.id);
      removeResource(selectedResource.id);
      toast({
        title: 'Recurso eliminado',
        description: `${selectedResource.name} ya no está en el panel.`,
      });
      setSelectedCode('');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error al eliminar',
        description:
          error instanceof Error ? error.message : 'Inténtalo nuevamente.',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="glass rounded-xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestión de recursos</h2>
          <p className="text-sm text-muted-foreground">
            Crea, actualiza o elimina recursos directamente desde la consola.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Crear recurso</h3>
            <p className="text-xs text-muted-foreground">
              Define un recurso nuevo y su estado inicial.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="space-y-2">
              <Label htmlFor="create-code">Código</Label>
              <Input
                id="create-code"
                value={createForm.code}
                placeholder="EJ: OXYGEN"
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    code: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-name">Nombre</Label>
              <Input
                id="create-name"
                value={createForm.displayName}
                placeholder="Oxígeno (O₂)"
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    displayName: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-current">% actual</Label>
                <Input
                  id="create-current"
                  value={createForm.currentPercentage}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      currentPercentage: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-critical">% crítico</Label>
                <Input
                  id="create-critical"
                  value={createForm.criticalPercentage}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      criticalPercentage: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-consumption">Consumo %/min</Label>
                <Input
                  id="create-consumption"
                  value={createForm.consumptionRatePerMinute}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      consumptionRatePerMinute: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Crítico actualmente
                  <Switch
                    checked={createForm.isCritical}
                    onCheckedChange={(checked) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        isCritical: checked,
                      }))
                    }
                  />
                </Label>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={creating}
            >
              {creating ? 'Creando...' : 'Crear recurso'}
            </Button>
          </form>
        </Card>

        <Card className="p-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Actualizar / Eliminar</h3>
            <p className="text-xs text-muted-foreground">
              Selecciona un recurso existente para editar sus datos o eliminarlo.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Selecciona recurso</Label>
            <Select value={selectedCode} onValueChange={setSelectedCode}>
              <SelectTrigger>
                <SelectValue placeholder="Elige un recurso" />
              </SelectTrigger>
              <SelectContent>
                {resourceList.map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.name} ({resource.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <form className="space-y-4" onSubmit={handleUpdate}>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={editForm.displayName}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    displayName: event.target.value,
                  }))
                }
                disabled={!selectedResource}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-current">% actual</Label>
                <Input
                  id="edit-current"
                  value={editForm.currentPercentage}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      currentPercentage: event.target.value,
                    }))
                  }
                  disabled={!selectedResource}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-critical">% crítico</Label>
                <Input
                  id="edit-critical"
                  value={editForm.criticalPercentage}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      criticalPercentage: event.target.value,
                    }))
                  }
                  disabled={!selectedResource}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-consumption">Consumo %/min</Label>
                <Input
                  id="edit-consumption"
                  value={editForm.consumptionRatePerMinute}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      consumptionRatePerMinute: event.target.value,
                    }))
                  }
                  disabled={!selectedResource}
                  required
                />
              </div>
              <div className="space-y-2 flex items-center justify-between">
                <Label>Crítico actualmente</Label>
                <Switch
                  checked={editForm.isCritical}
                  onCheckedChange={(checked) =>
                    setEditForm((prev) => ({
                      ...prev,
                      isCritical: checked,
                    }))
                  }
                  disabled={!selectedResource}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                className="flex-1"
                disabled={!selectedResource || updating}
              >
                {updating ? 'Guardando...' : 'Actualizar'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
                disabled={!selectedResource || deleting}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
};
