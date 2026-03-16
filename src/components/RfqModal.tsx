
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { Business, RfqItem, UserProfile, Site, RFQ } from '../types';

const AlertModal: React.FC<{ isOpen: boolean; message: string; onClose: () => void }> = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Alert</h3>
                <p className="text-slate-300 mb-6">{message}</p>
                <div className="flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-500 text-white hover:bg-blue-400 transition-colors">OK</button>
                </div>
            </div>
        </div>
    );
};

interface RfqModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Business[];
  onSubmit: (data: Partial<RFQ>) => void;
  userProfile: UserProfile | null;
  onAddSite: (siteToAdd: Partial<Site>) => void;
  initialItems?: { description: string, quantity: string }[];
}

const RMC_TYPES = ['M20', 'M25', 'M30', 'M35', 'M40', 'Self-Compacting', 'Fiber Reinforced'];
const PUMP_TYPES = ['Boom Pump', 'Line Pump', 'Static Pump'];

export const RfqModal: React.FC<RfqModalProps> = ({ isOpen, onClose, suppliers, onSubmit, userProfile, onAddSite, initialItems = [] }) => {
  const [gstNo, setGstNo] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [siteId, setSiteId] = useState<number | undefined>(undefined);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [items, setItems] = useState<RfqItem[]>([{ id: 1, description: '', quantity: '' }]);
  const [rmcType, setRmcType] = useState('');
  const [pumpRequired, setPumpRequired] = useState(false);
  const [pumpType, setPumpType] = useState('');
  const [pipeLength, setPipeLength] = useState('');
  const [projectHeight, setProjectHeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewSiteForm, setShowNewSiteForm] = useState(false);
  const [newSite, setNewSite] = useState({ name: '', location: '', inchargeName: '', inchargeContact: '' });
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  useEffect(() => {
    if (isOpen) {
        if (userProfile?.gst) setGstNo(userProfile.gst);
        if (initialItems.length > 0) {
            setItems(initialItems.map((it, idx) => ({ id: idx + 1, description: it.description, quantity: it.quantity })));
        } else {
            setItems([{ id: 1, description: '', quantity: '' }]);
        }
    }
    if (!isOpen) {
        setRmcType(''); setPumpRequired(false); setPumpType(''); setPipeLength(''); setProjectHeight('');
        setShowNewSiteForm(false); setIsSubmitting(false);
    }
  }, [isOpen, userProfile, initialItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId && !showNewSiteForm) { setAlertModal({ isOpen: true, message: "Please select a site." }); return; }
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        suppliers, items: items.filter(i => i.description.trim()), gstNo, siteLocation, siteId, deliveryDate,
        rmcType, pumpRequired, pumpType: pumpType as any, pipeLength, projectHeight,
        status: 'Awaiting Approval', requestedBy: userProfile?.businessName || 'Staff'
      });
    }, 1000);
  };

  const handleAddNewSite = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSite.name || !newSite.location) return;
      onAddSite(newSite);
      setShowNewSiteForm(false);
      setAlertModal({ isOpen: true, message: "Site details registered." });
  };

  const updateItem = (id: number, field: keyof RfqItem, value: string) => {
      setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const addItem = () => {
      setItems([...items, { id: Date.now(), description: '', quantity: '' }]);
  };

  const removeItem = (id: number) => {
      if (items.length === 1) return;
      setItems(items.filter(i => i.id !== id));
  };

  const fieldClasses = "w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-6 md:p-10 w-full max-w-3xl max-h-[95vh] overflow-y-auto relative border border-slate-800" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><Icon name="x-mark" className="h-7 w-7" /></button>
        
        <div className="flex items-center gap-6 mb-10">
            <div className="bg-emerald-900/20 p-5 rounded-3xl border border-emerald-500/20 text-emerald-400"><Icon name="document-text" className="h-10 w-10" /></div>
            <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Material Request</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Convert estimate to verified sourcing RFQ</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Project Site Selection</label>
                    <select value={siteId || (showNewSiteForm ? 'new' : '')} onChange={e => { if(e.target.value === 'new') setShowNewSiteForm(true); else { setShowNewSiteForm(false); setSiteId(Number(e.target.value)); } }} className={fieldClasses}>
                        <option value="">Select a Site...</option>
                        {userProfile?.sites?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        <option value="new" className="text-emerald-400 font-bold">+ Register New Site</option>
                    </select>
                </div>
                <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Requested Delivery Date</label><input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className={`${fieldClasses} [color-scheme:dark]`} required /></div>
            </div>

            {showNewSiteForm && (
                <div className="p-8 bg-slate-950/50 border border-emerald-500/20 rounded-[2rem] animate-fade-in space-y-6">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">QUICK SITE REGISTRATION</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input placeholder="Site Name" className={fieldClasses} value={newSite.name} onChange={e => setNewSite({...newSite, name: e.target.value})} />
                        <input placeholder="Site Location" className={fieldClasses} value={newSite.location} onChange={e => setNewSite({...newSite, location: e.target.value})} />
                    </div>
                    <button type="button" onClick={handleAddNewSite} className="w-full bg-emerald-600/20 text-emerald-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">Confirm New Site</button>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bill of Materials</p>
                    <button type="button" onClick={addItem} className="text-emerald-400 text-[9px] font-black uppercase tracking-widest hover:text-emerald-300 transition-colors">+ Add Item</button>
                </div>
                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-3 group">
                            <input placeholder="Description (e.g. Cement OPC 53)" className={`${fieldClasses} flex-[3]`} value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                            <input placeholder="Qty" className={`${fieldClasses} flex-1`} value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} />
                            <button type="button" onClick={() => removeItem(item.id)} className="p-3 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Icon name="x-mark" className="h-5 w-5"/></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-800 space-y-8">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Logistics & RMC Pump Requirements</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div><label className="block text-[10px] text-slate-500 mb-3 uppercase tracking-widest">Concrete Grade / RMC Spec</label><select value={rmcType} onChange={e => setRmcType(e.target.value)} className={fieldClasses}><option value="">None / Manual Mix</option>{RMC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    <div><label className="block text-[10px] text-slate-500 mb-3 uppercase tracking-widest">Total Project Vertical Height</label><input placeholder="e.g. G+4 Floors (approx 15m)" className={fieldClasses} value={projectHeight} onChange={e => setProjectHeight(e.target.value)} /></div>
                </div>
                
                <div className="flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        checked={pumpRequired} 
                        onChange={e => setPumpRequired(e.target.checked)} 
                        className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/50" 
                        id="pump_req" 
                    />
                    <label htmlFor="pump_req" className="text-xs font-bold text-slate-300 uppercase tracking-widest cursor-pointer flex items-center gap-2">
                        <Icon name="tractor" className="h-4 w-4 text-emerald-500" />
                        External Concrete Pump Service Required
                    </label>
                </div>

                {pumpRequired && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in p-6 bg-slate-950/30 rounded-2xl border border-slate-800">
                        <div>
                            <label className="block text-[10px] text-slate-500 mb-3 uppercase tracking-widest">Required Pump Category</label>
                            <select value={pumpType} onChange={e => setPumpType(e.target.value)} className={fieldClasses}>
                                <option value="">Select Category...</option>
                                {PUMP_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 mb-3 uppercase tracking-widest">Pipeline Reach (Total Horizontal + Vertical)</label>
                            <input 
                                placeholder="e.g. 60 meters" 
                                className={fieldClasses} 
                                value={pipeLength} 
                                onChange={e => setPipeLength(e.target.value)} 
                            />
                            <p className="mt-2 text-[8px] text-slate-600 uppercase font-black tracking-widest">Include lead from truck park to pump site</p>
                        </div>
                    </div>
                )}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50 shadow-emerald-900/20">
                {isSubmitting ? 'Processing Collaboration Flow...' : 'Send Request to Dashboard'}
            </button>
        </form>
      </div>
      <AlertModal isOpen={alertModal.isOpen} message={alertModal.message} onClose={() => setAlertModal({ isOpen: false, message: '' })} />
    </div>
  );
};
