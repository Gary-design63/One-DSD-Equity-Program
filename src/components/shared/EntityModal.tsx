import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getAppData } from '@/data/appData';

function nextId(prefix: string, arr: { id: string }[]): string {
  const nums = arr.map(i => parseInt(i.id.replace(/\D/g, ''), 10) || 0);
  const max = nums.length ? Math.max(...nums) : 0;
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

interface FieldOption { value: string; label: string; }

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'date' | 'number' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: (string | FieldOption)[];
  rows?: number;
  min?: number;
  max?: number;
  step?: number | string;
  checkLabel?: string;
}

interface EntityModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  initialData?: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => void;
}

export function EntityModal({ open, onClose, title, fields, initialData = {}, onSave }: EntityModalProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);

  React.useEffect(() => {
    setFormData(initialData);
  }, [open]);

  const handleChange = (name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {fields.map(f => (
            <div key={f.name} className="space-y-1">
              <Label htmlFor={`field-${f.name}`}>
                {f.label}
                {f.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {f.type === 'textarea' ? (
                <Textarea
                  id={`field-${f.name}`}
                  rows={f.rows || 3}
                  required={f.required}
                  placeholder={f.placeholder || ''}
                  value={String(formData[f.name] || '')}
                  onChange={e => handleChange(f.name, e.target.value)}
                />
              ) : f.type === 'select' ? (
                <select
                  id={`field-${f.name}`}
                  required={f.required}
                  value={String(formData[f.name] || '')}
                  onChange={e => handleChange(f.name, e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {f.placeholder && <option value="">{f.placeholder}</option>}
                  {(f.options || []).map(opt => {
                    const v = typeof opt === 'string' ? opt : opt.value;
                    const l = typeof opt === 'string' ? opt : opt.label;
                    return <option key={v} value={v}>{l}</option>;
                  })}
                </select>
              ) : f.type === 'checkbox' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id={`field-${f.name}`}
                    checked={Boolean(formData[f.name])}
                    onChange={e => handleChange(f.name, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{f.checkLabel || f.label}</span>
                </label>
              ) : f.type === 'date' ? (
                <Input
                  id={`field-${f.name}`}
                  type="date"
                  required={f.required}
                  value={String(formData[f.name] || '')}
                  onChange={e => handleChange(f.name, e.target.value)}
                />
              ) : f.type === 'number' ? (
                <Input
                  id={`field-${f.name}`}
                  type="number"
                  required={f.required}
                  value={String(formData[f.name] ?? '')}
                  min={f.min}
                  max={f.max}
                  step={f.step || 'any'}
                  onChange={e => handleChange(f.name, e.target.value ? parseFloat(e.target.value) : null)}
                />
              ) : (
                <Input
                  id={`field-${f.name}`}
                  type="text"
                  required={f.required}
                  placeholder={f.placeholder || ''}
                  value={String(formData[f.name] || '')}
                  onChange={e => handleChange(f.name, e.target.value)}
                />
              )}
            </div>
          ))}
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{title.startsWith('Edit') ? 'Save Changes' : title.startsWith('Add') ? title : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  entityType: string;
  entityName: string;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({ open, onClose, entityType, entityName, onConfirm }: ConfirmDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {entityType}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-4 gap-3">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <p className="text-center">Are you sure you want to delete <strong>{entityName}</strong>?</p>
          <p className="text-center text-sm text-gray-500">This action cannot be undone.</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── CRUD Hooks ─────────────────────────────────────────────────────────────────

export function useCRUD() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const D = getAppData();

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    toast({ title: message, variant: type === 'error' ? 'destructive' : 'default' });
  }, [toast]);

  // Actions
  const saveAction = useCallback((data: Record<string, unknown>, existing?: { id: string }) => {
    if (existing) {
      Object.assign(existing, data);
      showToast('Action updated successfully');
    } else {
      const newItem = { ...data, id: nextId('ACT', D.actions), linkedKPIs: [], linkedWorkflows: [] };
      D.actions.push(newItem as typeof D.actions[0]);
      showToast('Action added successfully');
    }
  }, [D, showToast]);

  const deleteAction = useCallback((id: string) => {
    const idx = D.actions.findIndex(a => a.id === id);
    if (idx >= 0) { D.actions.splice(idx, 1); showToast('Action deleted'); }
  }, [D, showToast]);

  // Risks
  const saveRisk = useCallback((data: Record<string, unknown>, existing?: { id: string }) => {
    if (existing) {
      Object.assign(existing, data);
      showToast('Risk updated successfully');
    } else {
      const newItem = { ...data, id: nextId('RISK', D.risks), linkedKPIs: [], linkedWorkflows: [], linkedActions: [] };
      D.risks.push(newItem as typeof D.risks[0]);
      showToast('Risk added successfully');
    }
  }, [D, showToast]);

  const deleteRisk = useCallback((id: string) => {
    const idx = D.risks.findIndex(r => r.id === id);
    if (idx >= 0) { D.risks.splice(idx, 1); showToast('Risk deleted'); }
  }, [D, showToast]);

  // Documents
  const saveDocument = useCallback((data: Record<string, unknown>, existing?: { id: string }) => {
    if (existing) {
      Object.assign(existing, { ...data, authorityRank: parseInt(String(data.authorityRank), 10) || 5 });
      showToast('Document updated successfully');
    } else {
      const newItem = {
        ...data,
        id: nextId('DOC', D.documents),
        authorityRank: parseInt(String(data.authorityRank), 10) || 5,
        format: 'Web',
        audience: '',
        processingStatus: 'Tagged',
        programRelevance: '',
        equityMethod: '',
        institutionalScope: '',
        geographicScope: '',
        notes: '',
      };
      D.documents.push(newItem as typeof D.documents[0]);
      showToast('Document added successfully');
    }
  }, [D, showToast]);

  const deleteDocument = useCallback((id: string, onAfter?: () => void) => {
    const idx = D.documents.findIndex(d => d.id === id);
    if (idx >= 0) {
      D.documents.splice(idx, 1);
      showToast('Document deleted');
      if (onAfter) onAfter();
      else navigate('/knowledge-base');
    }
  }, [D, navigate, showToast]);

  // Templates
  const saveTemplate = useCallback((data: Record<string, unknown>, existing?: { id: string }) => {
    if (existing) {
      Object.assign(existing, data);
      showToast('Template updated successfully');
    } else {
      const newItem = { ...data, id: nextId('TMPL', D.templates), linkedWorkflows: [], linkedDocs: [] };
      D.templates.push(newItem as typeof D.templates[0]);
      showToast('Template added successfully');
    }
  }, [D, showToast]);

  const deleteTemplate = useCallback((id: string, onAfter?: () => void) => {
    const idx = D.templates.findIndex(t => t.id === id);
    if (idx >= 0) {
      D.templates.splice(idx, 1);
      showToast('Template deleted');
      if (onAfter) onAfter();
      else navigate('/templates');
    }
  }, [D, navigate, showToast]);

  // Workflow Runs
  const saveRun = useCallback((data: Record<string, unknown>, existing?: { id: string }) => {
    if (existing) {
      Object.assign(existing, data);
      showToast('Workflow run updated');
    } else {
      const newItem = { ...data, id: nextId('RUN', D.workflowRuns), linkedDocs: [], linkedTemplates: [], notes: '' };
      D.workflowRuns.push(newItem as typeof D.workflowRuns[0]);
      showToast('Workflow run started');
    }
  }, [D, showToast]);

  const deleteRun = useCallback((id: string, onAfter?: () => void) => {
    const idx = D.workflowRuns.findIndex(r => r.id === id);
    if (idx >= 0) {
      D.workflowRuns.splice(idx, 1);
      showToast('Workflow run deleted');
      if (onAfter) onAfter();
      else navigate('/workflows');
    }
  }, [D, navigate, showToast]);

  // Learning Assets
  const saveLearningAsset = useCallback((data: Record<string, unknown>, existing?: { id: string }) => {
    if (existing) {
      Object.assign(existing, data);
      showToast('Learning asset updated successfully');
    } else {
      const newItem = { ...data, id: nextId('LA', D.learningAssets), audience: [], sourceDocs: [], linkedWorkflows: [], linkedTemplates: [] };
      D.learningAssets.push(newItem as typeof D.learningAssets[0]);
      showToast('Learning asset added successfully');
    }
  }, [D, showToast]);

  const deleteLearningAsset = useCallback((id: string, onAfter?: () => void) => {
    const idx = D.learningAssets.findIndex(a => a.id === id);
    if (idx >= 0) {
      D.learningAssets.splice(idx, 1);
      showToast('Learning asset deleted');
      if (onAfter) onAfter();
      else navigate('/learning');
    }
  }, [D, navigate, showToast]);

  // Roles
  const saveRole = useCallback((data: Record<string, unknown>, existing?: { id: string }) => {
    if (existing) {
      Object.assign(existing, data);
      showToast('Role updated successfully');
    } else {
      const newItem = { ...data, id: nextId('ROLE', D.roles), responsibilities: [], decisionAuthority: [], reviewScope: [] };
      D.roles.push(newItem as typeof D.roles[0]);
      showToast('Role added successfully');
    }
  }, [D, showToast]);

  const deleteRole = useCallback((id: string, onAfter?: () => void) => {
    const idx = D.roles.findIndex(r => r.id === id);
    if (idx >= 0) {
      D.roles.splice(idx, 1);
      showToast('Role deleted');
      if (onAfter) onAfter();
      else navigate('/roles');
    }
  }, [D, navigate, showToast]);

  // KPIs
  const saveKPI = useCallback((data: Record<string, unknown>, kpi: { id: string; currentValue: number }) => {
    const prev = kpi.currentValue;
    Object.assign(kpi, { ...data, previousValue: prev });
    showToast('KPI updated successfully');
  }, [showToast]);

  return {
    saveAction, deleteAction,
    saveRisk, deleteRisk,
    saveDocument, deleteDocument,
    saveTemplate, deleteTemplate,
    saveRun, deleteRun,
    saveLearningAsset, deleteLearningAsset,
    saveRole, deleteRole,
    saveKPI,
  };
}
