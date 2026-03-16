import * as React from 'react';
import { useState, useEffect } from 'react';
import { RFQ, Quote, Business, Project, UserProfile, Site, ProjectStatus, SavedSearch } from '../types';
import { Icon } from './Icon';
import { LOGO_URL } from '../assets/logo';
import { getRecommendations } from '../services/geminiService';
import { RecommendationCard } from './RecommendationCard';
import { dataService } from '../services/dataService';
import { auth } from '../firebase';

const RfqCard: React.FC<{ rfq: RFQ; onUpdateStatus: (id: string, status: RFQ['status']) => void; userProfile: UserProfile; sites: Site[] }> = ({ rfq, onUpdateStatus, userProfile, sites }) => {
    const [expanded, setExpanded] = useState(rfq.status === 'Awaiting Approval');
    
    // Check against saved takeoffs for this site
    const site = sites.find(s => s.id === rfq.siteId);
    const hasTakeoff = site?.savedCalculations?.some(c => c.query.toLowerCase().includes('takeoff'));
    
    // Simulate finding excessive quantity (Mock logic: if any qty > 500 without a validated takeoff)
    const isSuspicious = !hasTakeoff && rfq.items.some(i => parseFloat(i.quantity) > 500);

    return (
        <div className={`bg-slate-900 rounded-2xl shadow-lg border transition-all ${rfq.status === 'Awaiting Approval' ? 'border-orange-500 ring-4 ring-orange-500/10' : 'border-slate-800'} overflow-hidden`}>
            <div className="p-6 cursor-pointer hover:bg-slate-800/30 flex justify-between items-center" onClick={() => setExpanded(!expanded)}>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${rfq.status === 'Awaiting Approval' ? 'bg-orange-500 text-white' : rfq.status === 'Pending' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{rfq.status}</span>
                        <h3 className="text-white font-bold">{rfq.id} - Site: {site?.name || rfq.siteLocation || 'Unknown'}</h3>
                    </div>
                    <p className="text-slate-500 text-xs tracking-tight">Requested by {rfq.requestedBy || 'Unknown'} • {new Date(rfq.submittedAt).toLocaleDateString()}</p>
                </div>
                <Icon name="chevron-down" className={`h-5 w-5 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </div>

            {expanded && (
                <div className="p-6 border-t border-slate-800 bg-slate-950/20 space-y-6">
                    {isSuspicious && (userProfile.role === 'Contractor' || userProfile.role === 'Project Manager') && (
                        <div className="p-4 bg-orange-900/20 border border-orange-500/50 rounded-xl flex gap-3">
                            <Icon name="bolt" className="h-5 w-5 text-orange-500 shrink-0" />
                            <div><p className="text-orange-400 font-bold text-xs uppercase">Takeoff Discrepancy Alert</p><p className="text-slate-400 text-[10px] mt-0.5">Requested quantities exceed typical estimates and no Quantity Takeoff was found for this site. Verify before approving.</p></div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Specs</p>
                            <p className="text-xs text-white">RMC: <strong>{rfq.rmcType || 'N/A'}</strong></p>
                            <p className="text-xs text-white">Pump: <strong>{rfq.pumpRequired ? rfq.pumpType : 'None'}</strong></p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Logistics</p>
                            <p className="text-xs text-white">Date: <strong>{rfq.deliveryDate}</strong></p>
                            <p className="text-xs text-white">Height: <strong>{rfq.projectHeight || 'G+0'}</strong></p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Items</p>
                            {rfq.items.map((i, idx) => <p key={idx} className="text-xs text-white truncate">• {i.description} ({i.quantity})</p>)}
                        </div>
                    </div>

                    {rfq.status === 'Awaiting Approval' && (userProfile.role === 'Contractor' || userProfile.role === 'Project Manager') && (
                        <div className="flex gap-4 pt-4">
                            <button onClick={() => onUpdateStatus(rfq.id, 'Pending')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95">Approve & Notify Suppliers</button>
                            <button onClick={() => onUpdateStatus(rfq.id, 'Rejected')} className="px-6 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white py-3 rounded-xl font-bold text-xs transition-all">Reject</button>
                        </div>
                    )}
                    
                    {rfq.status === 'Pending' && userProfile.role === 'Supplier' && (
                        <div className="flex gap-4 pt-4">
                            <button onClick={() => console.log('Submit Quote flow to be implemented')} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95">Submit Quote</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const DashboardPage: React.FC<{
    rfqs: RFQ[];
    onNavigate: (page: '/' | 'directory' | 'dashboard' | 'business' | 'calculator') => void;
    onLogout: () => void;
    favorites: Business[];
    onToggleFavorite: (business: Business) => void;
    userProfile: UserProfile;
    onUpdateRfqStatus: (id: string, status: RFQ['status']) => void;
}> = ({ rfqs, onNavigate, onLogout, favorites, onToggleFavorite, userProfile, onUpdateRfqStatus }) => {
    const [recommendations, setRecommendations] = useState<Business[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(true);
    const [recommendationError, setRecommendationError] = useState<string | null>(null);
    const [sites, setSites] = useState<Site[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (userProfile.role !== 'Contractor' && userProfile.role !== 'Client') {
                setLoadingRecommendations(false);
                return; // Only fetch recommendations for Contractors and Clients
            }
            setLoadingRecommendations(true);
            setRecommendationError(null);
            try {
                const recs = await getRecommendations(userProfile, null); 
                setRecommendations(recs);
            } catch (error) {
                console.error("Failed to load recommendations", error);
                setRecommendationError(error instanceof Error ? error.message : "Failed to load recommendations.");
            } finally {
                setLoadingRecommendations(false);
            }
        };
        
        const fetchSitesAndProjects = async () => {
            const user = auth.currentUser;
            if (user) {
                const fetchedSites = await dataService.getSites(user.uid);
                setSites(fetchedSites);
                const fetchedProjects = await dataService.getProjects(user.uid);
                setProjects(fetchedProjects);
            }
        };

        fetchRecommendations();
        fetchSitesAndProjects();
    }, [userProfile]);

    const renderAdminDashboard = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total Users</h3>
                        <Icon name="user" className="h-5 w-5 text-emerald-500" />
                    </div>
                    <p className="text-4xl font-black text-white">1,248</p>
                    <p className="text-emerald-400 text-xs mt-2">+12% this month</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest">Active RFQs</h3>
                        <Icon name="document-text" className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-4xl font-black text-white">342</p>
                    <p className="text-blue-400 text-xs mt-2">89 pending quotes</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest">Platform Revenue</h3>
                        <Icon name="chart-bar" className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="text-4xl font-black text-white">₹4.2L</p>
                    <p className="text-purple-400 text-xs mt-2">+5% this week</p>
                </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Icon name="check" className="h-5 w-5 text-emerald-400" /> Recent System Activity</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-800 rounded-lg"><Icon name="user" className="h-4 w-4 text-slate-400" /></div>
                                <div>
                                    <p className="text-sm font-bold text-white">New Supplier Registration</p>
                                    <p className="text-xs text-slate-500">ABC Cements Ltd. joined the platform.</p>
                                </div>
                            </div>
                            <span className="text-xs text-slate-500">2 hours ago</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderFavoritesSection = () => (
        <div className="mt-12">
            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Icon name="heart" className="h-5 w-5 text-red-500" /> 
                Saved Businesses
            </h2>
            {favorites && favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((business, idx) => (
                        <RecommendationCard key={idx} business={business} />
                    ))}
                </div>
            ) : (
                <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-xl text-center">
                    <p className="text-slate-500 text-sm">You haven't saved any businesses yet. Browse the marketplace to add favorites.</p>
                </div>
            )}
        </div>
    );

    const renderClientDashboard = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Icon name="building" className="h-5 w-5 text-emerald-400" /> My Projects</h2>
                    {projects && projects.length > 0 ? (
                        <div className="space-y-4">
                            {projects.map(p => (
                                <div key={p.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-white">{p.name}</h3>
                                        <span className="text-[10px] uppercase px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">{p.status}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3">{p.description}</p>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 text-right">45% Completed</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <p className="text-sm">No active projects.</p>
                        </div>
                    )}
                </div>
                
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Icon name="document-text" className="h-5 w-5 text-blue-400" /> Recent Invoices</h2>
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                <div>
                                    <p className="text-sm font-bold text-white">INV-2026-{100+i}</p>
                                    <p className="text-xs text-slate-500">From: BuildNet Contractors</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white">₹45,000</p>
                                    <span className="text-[10px] uppercase text-orange-400">Pending</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* AI Recommendations Section for Client */}
            <div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Icon name="star" className="h-5 w-5 text-purple-400" /> 
                    Recommended Professionals
                </h2>
                {loadingRecommendations ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-slate-900/50 border border-slate-800 rounded-xl p-4 h-32"></div>
                        ))}
                    </div>
                ) : recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendations.map((rec, idx) => (
                            <RecommendationCard key={idx} business={rec} />
                        ))}
                    </div>
                ) : (
                    <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-xl text-center">
                        <p className="text-slate-500 text-sm">No specific recommendations yet.</p>
                    </div>
                )}
            </div>

            {renderFavoritesSection()}
        </div>
    );

    const renderSupplierDashboard = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">New RFQs</h3>
                    <p className="text-4xl font-black text-white">{rfqs.filter(r => r.status === 'Pending').length}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Quotes Submitted</h3>
                    <p className="text-4xl font-black text-white">12</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Profile Views</h3>
                    <p className="text-4xl font-black text-white">84</p>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Icon name="chat" className="h-5 w-5 text-blue-400" /> Received RFQs</h2>
                <div className="space-y-4">
                    {rfqs.filter(r => r.status === 'Pending').length > 0 ? (
                        rfqs.filter(r => r.status === 'Pending').map(r => <RfqCard key={r.id} rfq={r} onUpdateStatus={onUpdateRfqStatus} userProfile={userProfile} sites={sites} />)
                    ) : (
                        <div className="p-12 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl text-center"><p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No new requests for quotation</p></div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderContractorDashboard = () => (
        <div className="space-y-12">
            {/* AI Recommendations Section */}
            <div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Icon name="star" className="h-5 w-5 text-purple-400" /> 
                    AI Suggested for You
                </h2>
                {loadingRecommendations ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-slate-900/50 border border-slate-800 rounded-xl p-4 h-32">
                                <div className="h-4 bg-slate-800 rounded w-3/4 mb-3"></div>
                                <div className="h-3 bg-slate-800 rounded w-1/2 mb-4"></div>
                                <div className="h-12 bg-slate-800 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : recommendationError ? (
                    <div className="p-8 bg-red-900/20 border border-red-500/30 rounded-xl text-center">
                        <p className="text-red-400 text-sm font-bold">{recommendationError}</p>
                    </div>
                ) : recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendations.map((rec, idx) => (
                            <RecommendationCard key={idx} business={rec} />
                        ))}
                    </div>
                ) : (
                    <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-xl text-center">
                        <p className="text-slate-500 text-sm">No specific recommendations yet. Start searching or adding projects to get AI suggestions.</p>
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Icon name="bolt" className="h-5 w-5 text-emerald-400" /> Pending Site Requests</h2>
                <div className="space-y-4">
                    {rfqs.filter(r => r.status === 'Awaiting Approval').length > 0 ? (
                        rfqs.filter(r => r.status === 'Awaiting Approval').map(r => <RfqCard key={r.id} rfq={r} onUpdateStatus={onUpdateRfqStatus} userProfile={userProfile} sites={sites} />)
                    ) : (
                        <div className="p-12 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl text-center"><p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No pending approvals from site in-charge</p></div>
                    )}
                </div>
            </div>

            {renderFavoritesSection()}
        </div>
    );

    const renderProjectManagerDashboard = () => (
        <div className="space-y-12">
            <div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Icon name="building" className="h-5 w-5 text-emerald-400" /> Project Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Active Projects</h3>
                        <p className="text-4xl font-black text-white">{projects?.length || 0}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Pending RFQs</h3>
                        <p className="text-4xl font-black text-white">{rfqs.filter(r => r.status === 'Awaiting Approval').length}</p>
                    </div>
                </div>
            </div>
            <div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Icon name="bolt" className="h-5 w-5 text-emerald-400" /> Pending Site Requests</h2>
                <div className="space-y-4">
                    {rfqs.filter(r => r.status === 'Awaiting Approval').length > 0 ? (
                        rfqs.filter(r => r.status === 'Awaiting Approval').map(r => <RfqCard key={r.id} rfq={r} onUpdateStatus={onUpdateRfqStatus} userProfile={userProfile} sites={sites} />)
                    ) : (
                        <div className="p-12 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl text-center"><p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No pending approvals from site in-charge</p></div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderSiteEngineerDashboard = () => (
        <div className="space-y-12">
            <div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Icon name="location" className="h-5 w-5 text-emerald-400" /> My Sites</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Assigned Sites</h3>
                        <p className="text-4xl font-black text-white">{sites?.length || 0}</p>
                    </div>
                </div>
            </div>
            <div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Icon name="document-text" className="h-5 w-5 text-blue-400" /> My RFQs</h2>
                <div className="space-y-4">
                    {rfqs.filter(r => r.requestedBy === userProfile.businessName).length > 0 ? (
                        rfqs.filter(r => r.requestedBy === userProfile.businessName).map(r => <RfqCard key={r.id} rfq={r} onUpdateStatus={onUpdateRfqStatus} userProfile={userProfile} sites={sites} />)
                    ) : (
                        <div className="p-12 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl text-center"><p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No RFQs submitted</p></div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderFinanceDashboard = () => (
        <div className="space-y-12">
            <div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Icon name="chart-bar" className="h-5 w-5 text-purple-400" /> Financial Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Pending Invoices</h3>
                        <p className="text-4xl font-black text-white">5</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Total Outstanding</h3>
                        <p className="text-4xl font-black text-white">₹2.5L</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <header className="bg-slate-900 border-b border-slate-800 p-6 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
                        <img src={LOGO_URL} className="h-8 w-8" alt="Logo" />
                        <span className="text-xl font-bold hidden sm:inline">BuildNet AI <span className="text-emerald-400">Dashboard</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-800 rounded-full">{userProfile.role}</span>
                    </div>
                </div>
            </header>
            <main className="max-w-6xl mx-auto p-6 md:p-12">
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                        {userProfile.role === 'Admin' ? 'System Overview' : 
                         userProfile.role === 'Client' ? 'My Dashboard' :
                         userProfile.role === 'Supplier' ? 'Supplier Portal' :
                         userProfile.role === 'Project Manager' ? 'Project Oversight' :
                         userProfile.role === 'Site Engineer' ? 'Site Operations' :
                         userProfile.role === 'Finance' ? 'Financial Control' :
                         'Contractor Dashboard'}
                    </h1>
                    <p className="text-slate-500">
                        {userProfile.role === 'Admin' ? 'Monitor platform activity and metrics.' : 
                         userProfile.role === 'Client' ? 'Track your projects and invoices.' :
                         userProfile.role === 'Supplier' ? 'Manage incoming requests and quotes.' :
                         userProfile.role === 'Project Manager' ? 'Monitor site requests, verify takeoff budgets, and manage supplier quotes.' :
                         userProfile.role === 'Site Engineer' ? 'Manage site activities and submit material requests.' :
                         userProfile.role === 'Finance' ? 'Review invoices and manage project budgets.' :
                         'Monitor site requests, verify takeoff budgets, and manage supplier quotes.'}
                    </p>
                </div>
                
                {userProfile.role === 'Admin' && renderAdminDashboard()}
                {userProfile.role === 'Client' && renderClientDashboard()}
                {userProfile.role === 'Supplier' && renderSupplierDashboard()}
                {userProfile.role === 'Contractor' && renderContractorDashboard()}
                {userProfile.role === 'Project Manager' && renderProjectManagerDashboard()}
                {userProfile.role === 'Site Engineer' && renderSiteEngineerDashboard()}
                {userProfile.role === 'Finance' && renderFinanceDashboard()}
            </main>
        </div>
    );
};
