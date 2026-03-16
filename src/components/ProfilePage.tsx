import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { UserProfile, Site, Business, SavedCalculation, Project, ROLE_PERMISSIONS } from '../types';
import { KERALA_DISTRICTS } from '../data/categories';
import { LOGO_URL } from '../assets/logo';
import { authService } from '../services/authService';
import { reviewService } from '../services/reviewService';
import { dataService } from '../services/dataService';
import { auth } from '../firebase';

const ConfirmModal: React.FC<{ isOpen: boolean; message: string; onConfirm: () => void; onCancel: () => void }> = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Confirm Action</h3>
                <p className="text-slate-300 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-400 transition-colors">Confirm</button>
                </div>
            </div>
        </div>
    );
};

const AlertModal: React.FC<{ isOpen: boolean; message: string; onClose: () => void }> = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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

const BusinessHeader: React.FC<{
    onNavigate: (page: '/' | 'directory' | 'dashboard' | 'business' | 'calculator') => void;
    onLogout: () => void;
}> = ({ onNavigate, onLogout }) => {
     const [isMenuOpen, setIsMenuOpen] = useState(false);
     const menuBtnClasses = "w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all font-semibold flex items-center gap-3 group";

     return (
         <header className="bg-slate-900/80 backdrop-blur-xl sticky top-0 z-[60] border-b border-slate-800/60 h-16 md:h-20 flex items-center">
            <div className="container mx-auto px-6 flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onNavigate('/')}>
                    <img src={LOGO_URL} alt="BuildNet AI" className="h-8 w-8 md:h-9 md:w-9 group-hover:scale-110 transition-transform" />
                    <span className="text-white text-xl font-black tracking-tighter">BuildNet <span className="text-emerald-400">AI</span></span>
                </div>
                
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all shadow-xl">
                        <Icon name={isMenuOpen ? 'x-mark' : 'menu'} className="h-6 w-6" />
                    </button>
                </div>
            </div>
             {isMenuOpen && (
                <div className="absolute top-full right-6 w-72 bg-[#0a0f1c] shadow-2xl border border-slate-800 p-3 flex flex-col space-y-1 z-[70] animate-slide-up rounded-2xl ring-1 ring-white/5 mt-2">
                     <button onClick={() => { onNavigate('/'); setIsMenuOpen(false); }} className={menuBtnClasses}>
                        <Icon name="bolt" className="h-4 w-4 text-emerald-500 group-hover:animate-pulse"/> Home
                     </button>
                     <button onClick={() => { onNavigate('dashboard'); setIsMenuOpen(false); }} className={menuBtnClasses}>
                        <Icon name="apps" className="h-4 w-4 text-orange-400"/> Dashboard
                     </button>
                     <button onClick={() => { onNavigate('calculator'); setIsMenuOpen(false); }} className={menuBtnClasses}>
                        <Icon name="calculator" className="h-4 w-4 text-purple-400"/> Calculators
                     </button>
                     <div className="pt-2 border-t border-slate-800 mt-2">
                        <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className={`${menuBtnClasses} text-red-400 hover:text-red-300 hover:bg-red-500/10`}>
                            <Icon name="x-mark" className="h-4 w-4" /> Sign Out
                        </button>
                     </div>
                </div>
            )}
         </header>
     );
}

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  disabled?: boolean;
  options?: string[];
  placeholder?: string;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, id, type = 'text', value, onChange, disabled, options, placeholder, error }) => (
  <div className="w-full">
    <label htmlFor={id} className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">{label}</label>
    {options ? (
        <div className="relative">
            <select
                id={id}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full px-4 py-3.5 bg-slate-950 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'} text-white rounded-xl focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-emerald-500'} disabled:opacity-50 appearance-none outline-none text-sm transition-all`}
            >
                <option value="">Select {label}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><Icon name="chevron-down" className="h-3 w-3" /></div>
        </div>
    ) : (
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full px-4 py-3.5 bg-slate-950 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'} text-white rounded-xl focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-emerald-500'} disabled:opacity-50 text-sm outline-none transition-all placeholder:text-slate-700`}
        />
    )}
    {error && <p className="text-red-400 text-[10px] font-bold mt-1.5 ml-1">{error}</p>}
  </div>
);

interface ProfilePageProps {
    onNavigate: (page: '/' | 'directory' | 'dashboard' | 'business' | 'calculator') => void;
    onLogout: () => void;
    profile: UserProfile;
    onProfileChange: (profile: UserProfile) => void;
    onToggleFavorite?: (business: Business) => void;
    selectedSuppliers: Business[];
    onSelectSupplier: (business: Business) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, onLogout, profile, onProfileChange, onToggleFavorite, selectedSuppliers, onSelectSupplier }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserProfile>(profile);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    
    const [showAddSite, setShowAddSite] = useState(false);
    const [editingSiteId, setEditingSiteId] = useState<number | null>(null);
    const [newSite, setNewSite] = useState<Partial<Site>>({ 
        name: '', 
        location: '', 
        contactNumber: '', 
        mapUrl: '', 
        inchargeName: '', 
        inchargeContact: '',
        attachments: []
    });
    const [siteErrors, setSiteErrors] = useState<{[key: string]: string}>({});
    
    const [showAddProject, setShowAddProject] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [newProject, setNewProject] = useState<Partial<Project>>({
        name: '',
        startDate: '',
        estimatedCompletionDate: '',
        status: 'Planning',
        description: '',
        estimatedCost: undefined
    });
    const [projectErrors, setProjectErrors] = useState<{[key: string]: string}>({});

    const projectFormRef = useRef<HTMLFormElement>(null);
    const siteFormRef = useRef<HTMLFormElement>(null);

    const permissions = ROLE_PERMISSIONS[profile.role] || ROLE_PERMISSIONS['Client'];

    const [reviews, setReviews] = useState<any[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({ isOpen: false, message: '', onConfirm: () => {} });
    const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

    useEffect(() => {
        setFormData(profile);
        if (profile.role === 'Supplier' || profile.role === 'Contractor') {
            reviewService.getReviews(profile.businessName).then(setReviews);
        }
        
        const fetchSitesAndProjects = async () => {
            const user = auth.currentUser;
            if (user) {
                const fetchedSites = await dataService.getSites(user.uid);
                setSites(fetchedSites);
                const fetchedProjects = await dataService.getProjects(user.uid);
                setProjects(fetchedProjects);
            }
        };
        fetchSitesAndProjects();
    }, [profile]);

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone: string) => phone.replace(/\D/g, '').length >= 10;
    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleChange = (field: keyof UserProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [field]: e.target.value });
        if (formErrors[field]) {
            setFormErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSave = () => {
        const errors: {[key: string]: string} = {};
        if (!formData.businessName.trim()) errors.businessName = "Business Name is required";
        if (!isValidEmail(formData.email)) errors.email = "Invalid email address";
        if (!isValidPhone(formData.phone)) errors.phone = "Phone number must have at least 10 digits";
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        onProfileChange(formData);
        authService.updateProfile(formData);
        setIsEditing(false);
        setFormErrors({});
    };

    const handleCancel = () => {
        setFormData(profile);
        setIsEditing(false);
        setFormErrors({});
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setNewSite(prev => ({
                        ...prev,
                        attachments: [...(prev.attachments || []), {
                            name: file.name,
                            data: reader.result as string,
                            type: file.type
                        }]
                    }));
                };
                reader.readAsDataURL(file);
            });
            // Clear the input value so the same file can be selected again
            e.target.value = '';
        }
    };

    const removeAttachment = (index: number) => {
        setNewSite(prev => ({
            ...prev,
            attachments: (prev.attachments || []).filter((_, i) => i !== index)
        }));
    };

    const handleAddSite = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const errors: {[key: string]: string} = {};
        if (!newSite.name?.trim()) {
            errors.name = "Site Name is required";
        } else if (newSite.name.trim().length < 3) {
            errors.name = "Site Name must be at least 3 characters";
        }

        if (!newSite.location?.trim()) {
            errors.location = "Physical Address is required";
        }

        if (!newSite.contactNumber?.trim()) {
            errors.contactNumber = "Site Contact Number is required";
        } else if (!isValidPhone(newSite.contactNumber)) {
            errors.contactNumber = "Invalid phone number (min 10 digits)";
        }

        if (newSite.mapUrl && !isValidUrl(newSite.mapUrl)) {
            errors.mapUrl = "Please enter a valid URL (e.g., https://maps.google.com/...)";
        }

        if (!newSite.inchargeName?.trim()) {
            errors.inchargeName = "Contact Person is required";
        }

        if (!newSite.inchargeContact?.trim()) {
            errors.inchargeContact = "Contact Person Number is required";
        } else if (!isValidEmail(newSite.inchargeContact) && !isValidPhone(newSite.inchargeContact)) {
             errors.inchargeContact = "Must be a valid email or phone number";
        }

        if (Object.keys(errors).length > 0) {
            setSiteErrors(errors);
            return;
        }

        const user = auth.currentUser;
        if (!user) return;

        const siteData = {
            name: newSite.name || '',
            location: newSite.location || '',
            contactNumber: newSite.contactNumber || '',
            mapUrl: newSite.mapUrl || '',
            inchargeName: newSite.inchargeName || '',
            inchargeContact: newSite.inchargeContact || '',
            attachments: newSite.attachments || []
        };

        if (editingSiteId) {
            const updatedSite = { ...sites.find(s => s.id === editingSiteId)!, ...siteData };
            await dataService.updateSite(updatedSite);
            setSites(sites.map(s => s.id === editingSiteId ? updatedSite : s));
        } else {
            const site: Site = {
                id: Date.now(),
                userId: user.uid,
                ...siteData,
                savedCalculations: []
            };
            await dataService.saveSite(site);
            setSites([...sites, site]);
        }
        
        setNewSite({ name: '', location: '', contactNumber: '', mapUrl: '', inchargeName: '', inchargeContact: '', attachments: [] });
        setShowAddSite(false);
        setEditingSiteId(null);
        setSiteErrors({});
    }

    const handleEditSite = (site: Site) => {
        setNewSite({
            name: site.name,
            location: site.location,
            contactNumber: site.contactNumber || '',
            mapUrl: site.mapUrl || '',
            inchargeName: site.inchargeName || '',
            inchargeContact: site.inchargeContact || '',
            attachments: site.attachments || []
        });
        setEditingSiteId(site.id);
        setShowAddSite(true);
        setSiteErrors({});
        setTimeout(() => {
             siteFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const handleDeleteSite = (id: number) => {
        setConfirmModal({
            isOpen: true,
            message: "Are you sure you want to delete this project site?",
            onConfirm: async () => {
                await dataService.deleteSite(id);
                setSites(sites.filter(s => s.id !== id));
                setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
            }
        });
    }

    const handleCancelSiteForm = () => {
        setShowAddSite(false);
        setEditingSiteId(null);
        setNewSite({ name: '', location: '', contactNumber: '', mapUrl: '', inchargeName: '', inchargeContact: '', attachments: [] });
        setSiteErrors({});
    };

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors: {[key: string]: string} = {};
        if (!newProject.name?.trim()) errors.name = "Project Name is required";
        if (!newProject.status) errors.status = "Status is required";
        if (!newProject.startDate) errors.startDate = "Start Date is required";
        if (!newProject.estimatedCompletionDate) errors.estimatedCompletionDate = "Completion Date is required";
        if (!newProject.description?.trim()) errors.description = "Description is required";
        
        if (newProject.startDate && newProject.estimatedCompletionDate) {
            const start = new Date(newProject.startDate);
            const end = new Date(newProject.estimatedCompletionDate);
            if (end < start) {
                errors.estimatedCompletionDate = "Completion Date cannot be before Start Date";
            }
        }

        if (Object.keys(errors).length > 0) {
            setProjectErrors(errors);
            return;
        }

        const user = auth.currentUser;
        if (!user) return;

        const projectData: Project = {
            id: editingProjectId || Date.now().toString(),
            userId: user.uid,
            name: newProject.name || '',
            startDate: newProject.startDate || '',
            estimatedCompletionDate: newProject.estimatedCompletionDate || '',
            status: newProject.status as any,
            description: newProject.description || '',
            estimatedCost: newProject.estimatedCost,
            stages: [],
            milestones: []
        };

        if (editingProjectId) {
            const updatedProject = { ...projects.find(p => p.id === editingProjectId)!, ...projectData };
            await dataService.updateProject(updatedProject);
            setProjects(projects.map(p => p.id === editingProjectId ? updatedProject : p));
        } else {
            await dataService.saveProject(projectData);
            setProjects([...projects, projectData]);
        }

        setNewProject({ name: '', startDate: '', estimatedCompletionDate: '', status: 'Planning', description: '', estimatedCost: undefined });
        setShowAddProject(false);
        setEditingProjectId(null);
    };

    const handleEditProject = (project: Project) => {
        setNewProject({
            name: project.name,
            startDate: project.startDate,
            estimatedCompletionDate: project.estimatedCompletionDate,
            status: project.status,
            description: project.description,
            estimatedCost: project.estimatedCost
        });
        setEditingProjectId(project.id);
        setShowAddProject(true);
        setTimeout(() => {
             projectFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const handleDeleteProject = (id: string) => {
        setConfirmModal({
            isOpen: true,
            message: "Are you sure you want to delete this project?",
            onConfirm: async () => {
                await dataService.deleteProject(id);
                setProjects(projects.filter(p => p.id !== id));
                setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
            }
        });
    };

    const handleCancelProjectForm = () => {
        setShowAddProject(false);
        setEditingProjectId(null);
        setNewProject({ name: '', startDate: '', estimatedCompletionDate: '', status: 'Planning', description: '', estimatedCost: undefined });
        setProjectErrors({});
    };

    const handleToggleCalcLock = async (siteId: number, calcId: string) => {
        const updatedSites = sites.map(site => {
            if (site.id === siteId) {
                const updatedCalcs = (site.savedCalculations || []).map(calc => 
                    calc.id === calcId ? { ...calc, isLocked: !calc.isLocked } : calc
                );
                return { ...site, savedCalculations: updatedCalcs };
            }
            return site;
        });
        
        const updatedSite = updatedSites.find(s => s.id === siteId);
        if (updatedSite) {
            await dataService.updateSite(updatedSite);
            setSites(updatedSites);
        }
    };

    const handleDeleteCalc = (siteId: number, calcId: string) => {
        const site = sites.find(s => s.id === siteId);
        const calc = site?.savedCalculations?.find(c => c.id === calcId);
        
        if (calc?.isLocked) {
            setAlertModal({ isOpen: true, message: "This version is LOCKED. Please unlock it before attempting deletion." });
            return;
        }

        setConfirmModal({
            isOpen: true,
            message: "Delete this estimate version?",
            onConfirm: async () => {
                const updatedSites = sites.map(s => {
                    if (s.id === siteId) {
                        return { ...s, savedCalculations: s.savedCalculations?.filter(c => c.id !== calcId) };
                    }
                    return s;
                });
                
                const updatedSite = updatedSites.find(s => s.id === siteId);
                if (updatedSite) {
                    await dataService.updateSite(updatedSite);
                    setSites(updatedSites);
                }
                setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30">
            <BusinessHeader onNavigate={onNavigate} onLogout={onLogout} />
            
            <main className="container mx-auto px-6 py-12">
                <div className="max-w-5xl mx-auto space-y-12">
                    
                    {/* Business Profile Section */}
                    <div className="bg-[#0a0f1c] rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
                        <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 h-40 relative">
                             <div className="absolute -bottom-14 left-10">
                                <div className="h-28 w-28 bg-[#0a0f1c] rounded-[2rem] shadow-2xl p-1.5 border border-slate-800 ring-4 ring-black/20">
                                    <div className="h-full w-full bg-slate-900 rounded-[1.75rem] flex items-center justify-center text-slate-700 overflow-hidden group">
                                        {formData.logoUrl ? (
                                            <img src={formData.logoUrl} className="h-full w-full object-cover group-hover:scale-110 transition-transform" alt="Logo" />
                                        ) : (
                                            <Icon name="building" className="h-12 w-12"/>
                                        )}
                                    </div>
                                </div>
                             </div>
                        </div>
                        
                        <div className="pt-20 pb-10 px-10">
                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                <div>
                                    <h1 className="text-3xl font-black text-white tracking-tight leading-none uppercase">{profile.businessName}</h1>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                            profile.role === 'Admin' ? 'bg-red-900/30 text-red-400 border border-red-500/30' :
                                            profile.role === 'Supplier' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' :
                                            profile.role === 'Client' ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30' :
                                            'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30'
                                        }`}>
                                            {profile.role || 'Contractor'}
                                        </span>
                                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] self-center">{profile.category} • {profile.district}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    {isEditing ? (
                                        <>
                                            <button onClick={handleCancel} className="flex-1 md:flex-none px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl transition-all">Cancel</button>
                                            <button onClick={handleSave} className="flex-1 md:flex-none px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 rounded-2xl transition-all shadow-xl shadow-emerald-900/20">Save Profile</button>
                                        </>
                                    ) : (
                                        <button onClick={() => setIsEditing(true)} className="w-full md:w-auto px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 rounded-2xl transition-all flex items-center justify-center gap-3">
                                            <Icon name="cog" className="h-4 w-4"/> Edit Information
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <FormField label="Business Name" id="businessName" value={formData.businessName} onChange={handleChange('businessName')} disabled={!isEditing} error={formErrors.businessName} />
                                <FormField label="Email Address" id="email" value={formData.email} onChange={handleChange('email')} disabled={!isEditing} error={formErrors.email} />
                                <FormField label="Phone Number" id="phone" value={formData.phone} onChange={handleChange('phone')} disabled={!isEditing} error={formErrors.phone} />
                                <FormField label="GST Number" id="gst" value={formData.gst} onChange={handleChange('gst')} disabled={!isEditing} />
                                <FormField label="Region" id="district" value={formData.district} onChange={handleChange('district')} disabled={!isEditing} options={KERALA_DISTRICTS} />
                                <FormField label="Service Class" id="category" value={formData.category} onChange={handleChange('category')} disabled={!isEditing} />
                            </div>
                        </div>
                    </div>

                    {/* Project Sites Management Section */}
                    {permissions.canViewSites && (
                        <div className="bg-[#0a0f1c] rounded-[3rem] border border-slate-800 p-10 shadow-2xl space-y-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                <div className="flex items-center gap-6">
                                <div className="p-5 bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 rounded-3xl">
                                    <Icon name="building" className="h-8 w-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Project Sites</h2>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Global Site & In-Charge Registry</p>
                                </div>
                            </div>
                            {permissions.canEditSites && (
                                <button 
                                    onClick={() => { 
                                        if (showAddSite) handleCancelSiteForm();
                                        else {
                                            setShowAddSite(true);
                                            setTimeout(() => siteFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                                        }
                                    }} 
                                    className={`w-full sm:w-auto text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 px-8 py-4 rounded-2xl shadow-2xl transition-all active:scale-95 ${showAddSite ? 'bg-slate-800 hover:bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'}`}
                                >
                                    <Icon name={showAddSite ? 'x-mark' : 'plus'} className="h-4 w-4" /> 
                                    {showAddSite ? 'Close Form' : 'Register New Site'}
                                </button>
                            )}
                         </div>
                         
                         {showAddSite && (
                             <form ref={siteFormRef} onSubmit={handleAddSite} className="bg-slate-950/50 p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-inner animate-fade-in relative space-y-8">
                                 <div className="flex items-center gap-3 mb-2">
                                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                     <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">{editingSiteId ? 'Modify Registration' : 'New Site Registration'}</h3>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                     <FormField label="Site Name / Code" id="sname" placeholder="e.g., SkyTower Phase II" value={newSite.name} onChange={e => setNewSite({...newSite, name: e.target.value})} error={siteErrors.name} />
                                     <FormField label="Site Physical Address" id="sloc" placeholder="e.g., MG Road, Kochi" value={newSite.location} onChange={e => setNewSite({...newSite, location: e.target.value})} error={siteErrors.location} />
                                     <FormField label="Site Contact Number" id="sphone" placeholder="+91 00000 00000" value={newSite.contactNumber} onChange={e => setNewSite({...newSite, contactNumber: e.target.value})} error={siteErrors.contactNumber} />
                                     <FormField label="Map URL / Geolocation" id="smap" placeholder="Google Maps Link" value={newSite.mapUrl} onChange={e => setNewSite({...newSite, mapUrl: e.target.value})} error={siteErrors.mapUrl} />
                                     <FormField label="Contact Person" id="sinch" placeholder="Chief Engineer / Supervisor" value={newSite.inchargeName} onChange={e => setNewSite({...newSite, inchargeName: e.target.value})} error={siteErrors.inchargeName} />
                                     <FormField label="Contact Person Number" id="sinchc" placeholder="Email or WhatsApp" value={newSite.inchargeContact} onChange={e => setNewSite({...newSite, inchargeContact: e.target.value})} error={siteErrors.inchargeContact} />
                                     <div className="md:col-span-2 lg:col-span-3">
                                         <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Site Documents & Photos</label>
                                         <div className="flex items-center gap-4">
                                             <label htmlFor="site-files" className="cursor-pointer bg-slate-900 border border-slate-800 text-slate-400 px-6 py-3 rounded-xl text-xs font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2">
                                                 <Icon name="paper-clip" className="h-4 w-4" /> Attach Files
                                             </label>
                                             <input id="site-files" type="file" multiple className="hidden" onChange={handleFileChange} />
                                             <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{newSite.attachments?.length || 0} Files Selected</span>
                                         </div>
                                         {newSite.attachments && newSite.attachments.length > 0 && (
                                             <div className="flex flex-wrap gap-2 mt-4">
                                                 {newSite.attachments.map((file, idx) => (
                                                     <div key={idx} className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                                                         <Icon name="document" className="h-3 w-3 text-emerald-500" />
                                                         <span className="text-[10px] text-slate-300 truncate max-w-[100px]">{file.name}</span>
                                                         <button type="button" onClick={() => removeAttachment(idx)} className="text-slate-600 hover:text-red-400"><Icon name="x-mark" className="h-3 w-3" /></button>
                                                     </div>
                                                 ))}
                                             </div>
                                         )}
                                     </div>
                                 </div>
                                 <div className="flex gap-4 pt-4">
                                     <button type="submit" className="bg-emerald-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20 flex-1 sm:flex-none">
                                         {editingSiteId ? 'Update Registration' : 'Confirm Registration'}
                                     </button>
                                     <button type="button" onClick={handleCancelSiteForm} className="bg-slate-900 border border-slate-800 text-slate-500 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 hover:text-slate-300 transition-all flex-1 sm:flex-none">Cancel</button>
                                 </div>
                             </form>
                         )}

                         <div className="grid grid-cols-1 gap-8">
                             {sites && sites.length > 0 ? sites.map(site => (
                                 <div key={site.id} className="group flex flex-col p-8 border border-slate-800 rounded-[2.5rem] bg-slate-950/40 hover:border-emerald-500/20 transition-all duration-500 shadow-xl relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                         <Icon name="building" className="h-48 w-48" />
                                     </div>
                                     
                                     <div className="flex flex-col lg:flex-row justify-between gap-8 mb-10 relative z-10">
                                         <div className="flex items-start gap-5">
                                             <div className="p-4 bg-slate-900 rounded-2xl text-emerald-500 border border-slate-800 shrink-0 shadow-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                 <Icon name="location" className="h-6 w-6" />
                                             </div>
                                             <div className="min-w-0">
                                                 <h3 className="text-2xl font-black text-white truncate tracking-tight uppercase">{site.name}</h3>
                                                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">{site.location}</p>
                                                 
                                                 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                                     {site.contactNumber && (
                                                         <div className="flex items-center gap-2 text-slate-400">
                                                             <Icon name="phone" className="h-3 w-3 text-emerald-500" />
                                                             <span className="text-xs font-bold">{site.contactNumber}</span>
                                                         </div>
                                                     )}
                                                     {site.inchargeName && (
                                                         <div className="flex items-center gap-2 text-slate-400">
                                                             <Icon name="user" className="h-3 w-3 text-emerald-500" />
                                                             <span className="text-xs font-bold">{site.inchargeName}</span>
                                                             {site.inchargeContact && <span className="text-[10px] text-slate-600">({site.inchargeContact})</span>}
                                                         </div>
                                                     )}
                                                     {site.mapUrl && (
                                                         <div className="md:col-span-2 mt-4">
                                                             <div className="flex items-center gap-2 text-slate-400 mb-2">
                                                                 <Icon name="map" className="h-3 w-3 text-emerald-500" />
                                                                 <a href={site.mapUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-400 hover:underline truncate max-w-[200px]">View on Maps</a>
                                                             </div>
                                                             {/* Map View */}
                                                             <div className="w-full h-48 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 relative group">
                                                                 <iframe 
                                                                     src={site.mapUrl.includes('embed') ? site.mapUrl : `https://maps.google.com/maps?q=${encodeURIComponent(site.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                                                     width="100%" 
                                                                     height="100%" 
                                                                     style={{ border: 0 }} 
                                                                     allowFullScreen 
                                                                     loading="lazy" 
                                                                     referrerPolicy="no-referrer-when-downgrade"
                                                                     className="opacity-60 group-hover:opacity-100 transition-opacity"
                                                                 />
                                                                 <div className="absolute inset-0 pointer-events-none border border-emerald-500/10 rounded-xl"></div>
                                                             </div>
                                                         </div>
                                                     )}
                                                     
                                                     {/* Attachments */}
                                                     {site.attachments && site.attachments.length > 0 && (
                                                         <div className="md:col-span-2 mt-4">
                                                             <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Site Documents</h4>
                                                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                                 {site.attachments.map((file, idx) => (
                                                                     <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-3 group hover:border-emerald-500/30 transition-all cursor-pointer" onClick={() => {
                                                                         const win = window.open();
                                                                         win?.document.write(`<iframe src="${file.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                                                     }}>
                                                                         <div className="p-2 bg-slate-950 rounded-lg text-emerald-500">
                                                                             <Icon name={file.type.includes('image') ? 'photo' : 'document'} className="h-4 w-4" />
                                                                         </div>
                                                                         <div className="min-w-0">
                                                                             <p className="text-[10px] font-bold text-slate-300 truncate group-hover:text-white transition-colors">{file.name}</p>
                                                                             <p className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">View File</p>
                                                                         </div>
                                                                     </div>
                                                                 ))}
                                                             </div>
                                                         </div>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>
                                         {permissions.canEditSites && (
                                             <div className="flex flex-wrap gap-3">
                                                 <button onClick={() => handleEditSite(site)} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-900 border border-slate-800 rounded-xl hover:text-white transition-all">Edit Site</button>
                                                 <button onClick={() => handleDeleteSite(site.id)} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-red-400 transition-all">Delete</button>
                                             </div>
                                         )}
                                     </div>

                                     {/* Saved Calculations Sub-section */}
                                     <div className="bg-[#0f172a]/50 rounded-3xl p-6 border border-slate-800 relative z-10">
                                         <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><Icon name="calculator" className="h-4 w-4 text-purple-500" /> Site Calculations & Versions</h4>
                                            <span className="text-[9px] font-bold text-slate-600 px-2 py-1 bg-slate-900 rounded-lg">{site.savedCalculations?.length || 0} Saved</span>
                                         </div>
                                         
                                         {site.savedCalculations && site.savedCalculations.length > 0 ? (
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 {site.savedCalculations.map(calc => (
                                                     <div key={calc.id} className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${calc.isLocked ? 'bg-slate-900 border-emerald-500/30' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                                                         <div className="flex justify-between items-start mb-3">
                                                             <div className="min-w-0">
                                                                 <div className="flex items-center gap-2 mb-1">
                                                                     {calc.isLocked && <Icon name="check" className="h-3 w-3 text-emerald-500" />}
                                                                     <p className={`text-xs font-black uppercase tracking-tight truncate ${calc.isLocked ? 'text-emerald-400' : 'text-white'}`}>{calc.title}</p>
                                                                 </div>
                                                                 <p className="text-[9px] font-bold text-slate-600">{new Date(calc.date).toLocaleDateString()} • {new Date(calc.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                             </div>
                                                             <button 
                                                                onClick={() => handleToggleCalcLock(site.id, calc.id)} 
                                                                className={`p-2 rounded-lg transition-all ${calc.isLocked ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                                                                title={calc.isLocked ? 'Unlock Version' : 'Lock Version'}
                                                             >
                                                                 <Icon name={calc.isLocked ? "check" : "bookmark"} className="h-3.5 w-3.5" />
                                                             </button>
                                                         </div>
                                                         
                                                         <div className="flex gap-2 pt-3 border-t border-slate-800/50">
                                                             <button 
                                                                onClick={() => onNavigate('calculator')} // In a real app, this would pass the calc ID to load it
                                                                className="flex-1 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-900 rounded-lg hover:bg-slate-800 hover:text-white transition-all"
                                                             >
                                                                 View Full
                                                             </button>
                                                             <button 
                                                                onClick={() => handleDeleteCalc(site.id, calc.id)}
                                                                disabled={calc.isLocked}
                                                                className={`p-2 rounded-lg transition-all ${calc.isLocked ? 'opacity-20 cursor-not-allowed' : 'text-slate-600 hover:text-red-400'}`}
                                                             >
                                                                 <Icon name="x-mark" className="h-4 w-4" />
                                                             </button>
                                                         </div>
                                                     </div>
                                                 ))}
                                             </div>
                                         ) : (
                                             <div className="py-8 text-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                                                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">No estimates archived for this site</p>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             )) : (
                                 <div className="text-center py-20 bg-slate-950/20 rounded-[3rem] border-2 border-dashed border-slate-800/50">
                                     <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 w-fit mx-auto mb-6 opacity-40"><Icon name="building" className="h-8 w-8 text-slate-500" /></div>
                                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">No project sites archived</p>
                                 </div>
                             )}
                         </div>
                    </div>
                    )}

                    {/* Projects Section */}
                    {permissions.canViewProjects && (
                    <div className="bg-[#0a0f1c] rounded-[3rem] border border-slate-800 p-10 shadow-2xl space-y-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-purple-900/20 border border-purple-500/20 text-purple-400 rounded-3xl">
                                    <Icon name="briefcase" className="h-8 w-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Projects</h2>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Manage Your Construction Projects</p>
                                </div>
                            </div>
                            {permissions.canEditProjects && (
                                <button 
                                    onClick={() => { 
                                        if (showAddProject) handleCancelProjectForm();
                                        else {
                                            setShowAddProject(true);
                                            setTimeout(() => projectFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                                        }
                                    }} 
                                    className={`w-full sm:w-auto text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 px-8 py-4 rounded-2xl shadow-2xl transition-all active:scale-95 ${showAddProject ? 'bg-slate-800 hover:bg-slate-700' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20'}`}
                                >
                                    <Icon name={showAddProject ? 'x-mark' : 'plus'} className="h-4 w-4" /> 
                                    {showAddProject ? 'Close Form' : 'Add New Project'}
                                </button>
                            )}
                         </div>
                         
                         {showAddProject && (
                             <form ref={projectFormRef} onSubmit={handleAddProject} className="bg-slate-950/50 p-8 rounded-[2.5rem] border border-purple-500/20 shadow-inner animate-fade-in relative space-y-8">
                                 <div className="flex items-center gap-3 mb-2">
                                     <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                     <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em]">{editingProjectId ? 'Edit Project' : 'New Project'}</h3>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                     <FormField label="Project Name" id="pname" placeholder="e.g., Luxury Villa" value={newProject.name || ''} onChange={e => setNewProject({...newProject, name: e.target.value})} error={projectErrors.name} />
                                     <FormField label="Status" id="pstatus" value={newProject.status || 'Planning'} onChange={e => setNewProject({...newProject, status: e.target.value as any})} options={['Planning', 'In Progress', 'On Hold', 'Completed']} error={projectErrors.status} />
                                     <FormField label="Start Date" id="pstart" type="date" value={newProject.startDate || ''} onChange={e => setNewProject({...newProject, startDate: e.target.value})} error={projectErrors.startDate} />
                                     <FormField label="Est. Completion" id="pend" type="date" value={newProject.estimatedCompletionDate || ''} onChange={e => setNewProject({...newProject, estimatedCompletionDate: e.target.value})} error={projectErrors.estimatedCompletionDate} />
                                     <FormField label="Est. Cost" id="pcost" type="number" placeholder="Optional" value={newProject.estimatedCost?.toString() || ''} onChange={e => setNewProject({...newProject, estimatedCost: e.target.value ? parseFloat(e.target.value) : undefined})} />
                                     <div className="md:col-span-2 lg:col-span-3">
                                        <label htmlFor="pdesc" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Description</label>
                                        <textarea 
                                            id="pdesc"
                                            value={newProject.description || ''}
                                            onChange={e => setNewProject({...newProject, description: e.target.value})}
                                            className={`w-full px-4 py-3.5 bg-slate-950 border ${projectErrors.description ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-purple-500'} text-white rounded-xl focus:ring-2 ${projectErrors.description ? 'focus:ring-red-500' : 'focus:ring-purple-500'} text-sm outline-none transition-all placeholder:text-slate-700 min-h-[100px]`}
                                            placeholder="Project details..."
                                        />
                                        {projectErrors.description && <p className="text-red-400 text-[10px] font-bold mt-1.5 ml-1">{projectErrors.description}</p>}
                                     </div>
                                 </div>
                                 <div className="flex gap-4 pt-4">
                                     <button type="submit" className="bg-purple-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-xl shadow-purple-900/20 flex-1 sm:flex-none">
                                         {editingProjectId ? 'Update Project' : 'Create Project'}
                                     </button>
                                     <button type="button" onClick={handleCancelProjectForm} className="bg-slate-900 border border-slate-800 text-slate-500 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 hover:text-slate-300 transition-all flex-1 sm:flex-none">Cancel</button>
                                 </div>
                             </form>
                         )}

                         <div className="grid grid-cols-1 gap-8">
                             {projects && projects.length > 0 ? projects.map(project => (
                                 <div key={project.id} className="group flex flex-col p-8 border border-slate-800 rounded-[2.5rem] bg-slate-950/40 hover:border-purple-500/20 transition-all duration-500 shadow-xl relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                         <Icon name="briefcase" className="h-48 w-48" />
                                     </div>
                                     
                                     <div className="flex flex-col lg:flex-row justify-between gap-8 mb-6 relative z-10">
                                         <div className="flex items-start gap-5">
                                             <div className="p-4 bg-slate-900 rounded-2xl text-purple-500 border border-slate-800 shrink-0 shadow-xl group-hover:bg-purple-600 group-hover:text-white transition-all">
                                                 <Icon name="briefcase" className="h-6 w-6" />
                                             </div>
                                             <div className="min-w-0">
                                                 <div className="flex items-center gap-3 mb-2">
                                                     <h3 className="text-2xl font-black text-white truncate tracking-tight uppercase">{project.name}</h3>
                                                     <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                         project.status === 'Completed' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' :
                                                         project.status === 'In Progress' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' :
                                                         project.status === 'On Hold' ? 'bg-orange-900/30 text-orange-400 border border-orange-500/30' :
                                                         'bg-slate-800 text-slate-400 border border-slate-700'
                                                     }`}>
                                                         {project.status}
                                                     </span>
                                                 </div>
                                                 <p className="text-slate-400 text-sm line-clamp-2">{project.description}</p>
                                                 
                                                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2">
                                                     <div className="flex items-center gap-2 text-slate-500">
                                                         <Icon name="calendar" className="h-3 w-3 text-purple-500" />
                                                         <span className="text-[10px] font-bold uppercase tracking-wider">Start: <span className="text-slate-300">{project.startDate || 'N/A'}</span></span>
                                                     </div>
                                                     <div className="flex items-center gap-2 text-slate-500">
                                                         <Icon name="calendar" className="h-3 w-3 text-purple-500" />
                                                         <span className="text-[10px] font-bold uppercase tracking-wider">End: <span className="text-slate-300">{project.estimatedCompletionDate || 'N/A'}</span></span>
                                                     </div>
                                                     {project.estimatedCost && (
                                                         <div className="flex items-center gap-2 text-slate-500">
                                                             <Icon name="calculator" className="h-3 w-3 text-purple-500" />
                                                             <span className="text-[10px] font-bold uppercase tracking-wider">Est. Cost: <span className="text-emerald-400">₹{project.estimatedCost.toLocaleString()}</span></span>
                                                         </div>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>
                                         {permissions.canEditProjects && (
                                             <div className="flex flex-wrap gap-3 h-fit">
                                                 <button onClick={() => handleEditProject(project)} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-900 border border-slate-800 rounded-xl hover:text-white transition-all">Edit</button>
                                                 <button onClick={() => handleDeleteProject(project.id)} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-red-400 transition-all">Delete</button>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             )) : (
                                 <div className="text-center py-20 bg-slate-950/20 rounded-[3rem] border-2 border-dashed border-slate-800/50">
                                     <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 w-fit mx-auto mb-6 opacity-40"><Icon name="briefcase" className="h-8 w-8 text-slate-500" /></div>
                                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">No projects added yet</p>
                                 </div>
                             )}
                         </div>
                    </div>
                    )}
                    
                    {/* Saved Businesses Section */}
                    <div className="bg-[#0a0f1c] rounded-[3rem] border border-slate-800 p-10 shadow-2xl space-y-10 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                         <div className="flex items-center gap-6">
                            <div className="p-5 bg-red-900/20 border border-red-500/20 text-red-400 rounded-3xl">
                                <Icon name="heart" className="h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Saved Businesses</h2>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Your favorite professionals</p>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {formData.favorites && formData.favorites.length > 0 ? formData.favorites.map((business, idx) => (
                                 <div key={idx} className="bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800 hover:border-red-500/30 transition-all flex flex-col justify-between">
                                     <div>
                                         <div className="flex justify-between items-start mb-4">
                                             <h3 className="text-lg font-black text-white truncate tracking-tight uppercase">{business.name}</h3>
                                             <button 
                                                onClick={() => onToggleFavorite && onToggleFavorite(business)} 
                                                className="text-red-500 hover:text-red-400 transition-all"
                                             >
                                                 <Icon name="heart" className="h-5 w-5 fill-current" />
                                             </button>
                                         </div>
                                         <div className="flex flex-wrap gap-2 mb-4">
                                             <span className="px-3 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg text-[9px] font-black uppercase tracking-widest">{business.category}</span>
                                             <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-[9px] font-black uppercase tracking-widest">{business.location}</span>
                                         </div>
                                     </div>
                                     <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800/50">
                                         <p className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">{business.phone}</p>
                                         <button 
                                            onClick={() => onNavigate('directory')} 
                                            className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-all flex items-center gap-1"
                                         >
                                             View Directory <Icon name="arrow-right" className="h-3 w-3" />
                                         </button>
                                     </div>
                                 </div>
                             )) : (
                                 <div className="col-span-full text-center py-20 bg-slate-950/20 rounded-[3rem] border-2 border-dashed border-slate-800/50">
                                     <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 w-fit mx-auto mb-6 opacity-40"><Icon name="heart" className="h-8 w-8 text-slate-500" /></div>
                                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">No saved businesses yet</p>
                                 </div>
                             )}
                         </div>
                    </div>

                    {/* Saved Searches Section */}
                    <div className="bg-[#0a0f1c] rounded-[3rem] border border-slate-800 p-10 shadow-2xl space-y-10 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                         <div className="flex items-center gap-6">
                            <div className="p-5 bg-blue-900/20 border border-blue-500/20 text-blue-400 rounded-3xl">
                                <Icon name="search" className="h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Saved Searches</h2>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Your recent directory queries</p>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {formData.savedSearches && formData.savedSearches.length > 0 ? formData.savedSearches.map(search => (
                                 <div key={search.id} className="bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800 hover:border-blue-500/30 transition-all flex flex-col justify-between">
                                     <div>
                                         <div className="flex justify-between items-start mb-4">
                                             <h3 className="text-lg font-black text-white truncate tracking-tight uppercase">{search.title || search.query}</h3>
                                             <button 
                                                onClick={() => {
                                                    setConfirmModal({
                                                        isOpen: true,
                                                        message: "Delete this saved search?",
                                                        onConfirm: () => {
                                                            const updatedProfile = { ...formData, savedSearches: (formData.savedSearches || []).filter(s => s.id !== search.id) };
                                                            setFormData(updatedProfile);
                                                            onProfileChange(updatedProfile);
                                                            authService.updateProfile(updatedProfile);
                                                            setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
                                                        }
                                                    });
                                                }} 
                                                className="text-slate-600 hover:text-red-400 transition-all"
                                             >
                                                 <Icon name="x-mark" className="h-5 w-5" />
                                             </button>
                                         </div>
                                         <div className="flex flex-wrap gap-2 mb-4">
                                             <span className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-500/30 rounded-lg text-[9px] font-black uppercase tracking-widest">{search.mainCategory}</span>
                                             {search.category && <span className="px-3 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg text-[9px] font-black uppercase tracking-widest">{search.category}</span>}
                                             <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-[9px] font-black uppercase tracking-widest">{search.district}</span>
                                         </div>
                                     </div>
                                     <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800/50">
                                         <p className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">{new Date(search.date).toLocaleDateString()}</p>
                                         <button 
                                            onClick={() => onNavigate('directory')} 
                                            className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-all flex items-center gap-1"
                                         >
                                             Run Search <Icon name="arrow-right" className="h-3 w-3" />
                                         </button>
                                     </div>
                                 </div>
                             )) : (
                                 <div className="col-span-full text-center py-20 bg-slate-950/20 rounded-[3rem] border-2 border-dashed border-slate-800/50">
                                     <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 w-fit mx-auto mb-6 opacity-40"><Icon name="search" className="h-8 w-8 text-slate-500" /></div>
                                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">No saved searches yet</p>
                                 </div>
                             )}
                         </div>
                    </div>

                    {/* Reviews Section (Only for Suppliers/Contractors) */}
                    {(profile.role === 'Supplier' || profile.role === 'Contractor') && (
                        <div className="bg-[#0a0f1c] rounded-[3rem] border border-slate-800 p-10 shadow-2xl space-y-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                             <div className="flex items-center gap-6">
                                <div className="p-5 bg-yellow-900/20 border border-yellow-500/20 text-yellow-400 rounded-3xl">
                                    <Icon name="star" className="h-8 w-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Client Reviews</h2>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Feedback from your customers</p>
                                </div>
                             </div>
                             
                             {reviews.length > 0 ? (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     {reviews.map((review) => (
                                         <div key={review.id} className="bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800 hover:border-yellow-500/30 transition-all">
                                             <div className="flex justify-between items-start mb-4">
                                                 <div className="flex items-center gap-3">
                                                     <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 font-bold uppercase border border-slate-800">
                                                         {review.userName.charAt(0)}
                                                     </div>
                                                     <div>
                                                         <h4 className="text-white font-bold text-sm">{review.userName}</h4>
                                                         <p className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">{new Date(review.date).toLocaleDateString()}</p>
                                                     </div>
                                                 </div>
                                                 <div className="flex text-yellow-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                                                     {[...Array(5)].map((_, i) => (
                                                         <Icon key={i} name="star" className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-slate-800'}`} />
                                                     ))}
                                                 </div>
                                             </div>
                                             <p className="text-slate-400 text-sm leading-relaxed italic">"{review.comment}"</p>
                                         </div>
                                     ))}
                                 </div>
                             ) : (
                                 <div className="text-center py-20 bg-slate-950/20 rounded-[3rem] border-2 border-dashed border-slate-800/50">
                                     <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 w-fit mx-auto mb-6 opacity-40"><Icon name="star" className="h-8 w-8 text-slate-500" /></div>
                                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">No reviews received yet</p>
                                 </div>
                             )}
                        </div>
                    )}
                </div>
            </main>
            
            <ConfirmModal 
                isOpen={confirmModal.isOpen} 
                message={confirmModal.message} 
                onConfirm={confirmModal.onConfirm} 
                onCancel={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })} 
            />
            <AlertModal 
                isOpen={alertModal.isOpen} 
                message={alertModal.message} 
                onClose={() => setAlertModal({ isOpen: false, message: '' })} 
            />
        </div>
    );
};
