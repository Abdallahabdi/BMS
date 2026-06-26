import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Clock,
  ArrowLeft,
  Menu,
  Loader2,
  Archive,
  AlertCircle,
  CheckCircle2,
  Shield,
  Tag,
  Fingerprint,
  PackageCheck,
  Sparkles
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import API, { getImageUrl } from '../api/api';
import { toast } from 'react-toastify';

const CHECKS = [
  { key: 'tokenMatched',   label: 'Pickup Token Matched', icon: Tag },
  { key: 'ownerConfirmed', label: 'Owner Identity Confirmed', icon: Fingerprint },
  { key: 'itemMatched',    label: 'Item Details Match',   icon: PackageCheck },
  { key: 'idVerified',     label: 'Government ID Verified', icon: Shield },
];

const AdminVerificationView = ({ toggleSidebar }) => {
  const { itemId } = useParams();
  const navigate   = useNavigate();

  const [item,    setItem]    = useState(null);
  const [claim,   setClaim]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [verificationChecks, setVerificationChecks] = useState(
    Object.fromEntries(CHECKS.map(c => [c.key, false]))
  );

  useEffect(() => { fetchData(); }, [itemId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemRes, claimsRes] = await Promise.all([
        API.get(`/items/${itemId}`),
        API.get(`/claims`),
      ]);
      setItem(itemRes.data);
      const claimData = Array.isArray(claimsRes.data)
        ? claimsRes.data
        : claimsRes.data?.claims || [];
      setClaim(claimData.find(c => c.item?._id === itemId && c.status === 'approved'));
    } catch {
      toast.error('Soo shubista faahfaahinta ayaa fashilantay.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = key =>
    setVerificationChecks(prev => ({ ...prev, [key]: !prev[key] }));

  const passedCount   = Object.values(verificationChecks).filter(Boolean).length;
  const allChecksPassed = passedCount === CHECKS.length;
  const progressPct   = (passedCount / CHECKS.length) * 100;

  const handleCompleteHandover = async () => {
    try {
      setSubmitting(true);
      const res = await API.patch(`/items/${itemId}/handover`);
      const { lostItemUpdated } = res.data;
      toast.success(
        lostItemUpdated
          ? `Waa la wareejiyay! Alaabtii "${lostItemUpdated.itemName}" sidoo kale waa la soo celiyay.`
          : 'Alaabta si guul leh ayaa loo wareejiyay!'
      );
      navigate('/admin');
    } catch {
      toast.error('Geeddi-socodka wareejinta ayaa fashilmay.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading State ────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B12] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 size={40} className="animate-spin text-emerald-500" />
          <p className="text-slate-500 mt-4 text-sm">Loading verification data…</p>
        </div>
      </div>
    );
  }

  const isReturned = item?.status === 'returned';

  /* ── Main UI ─────────────────────────────────────────────── */
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070B12] text-slate-300 font-sans">
      
      {/* ════ LEFT PANEL ════ */}
      <div className="flex-1 p-6 md:p-12 flex flex-col gap-7 border-b md:border-b-0 md:border-r border-slate-800">

        {/* Top bar */}
        <div className="flex items-center gap-3.5">
          <button 
            className="flex items-center justify-center w-10 height-10 aspect-square rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft size={18} />
          </button>
          
          <button 
            className="flex md:hidden items-center justify-center w-10 height-10 aspect-square rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors" 
            onClick={toggleSidebar}
          >
            <Menu size={18} />
          </button>
          
          <div>
            <h1 className="text-xl font-black text-slate-100 m-0">Verification Hub</h1>
            <p className="text-[10px] text-emerald-500 uppercase tracking-widest m-0">Identity &amp; Item Check</p>
          </div>

          {/* Status badge */}
          {isReturned && (
            <div className="ml-auto flex items-center gap-1.5 bg-emerald-500/15 text-emerald-500 text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-500/30">
              <CheckCircle2 size={14} />
              Returned
            </div>
          )}
        </div>

        {/* Item card */}
        <div className="flex-1 bg-gradient-to-br from-[#0f1724] to-[#111827] rounded-[36px] border border-slate-800 flex flex-col items-center justify-center p-8 md:p-12 relative overflow-hidden">
          
          {/* Glow ring behind image */}
          <div className="relative mb-7">
            <div className="absolute -inset-6 bg-[radial-gradient(circle,rgba(16,185,129,0.18)_0%,transparent_70%)] rounded-full pointer-events-none" />
            <div className="w-48 h-48 md:w-60 md:h-60 rounded-[28px] overflow-hidden bg-slate-800 border-2 border-slate-700 flex items-center justify-center relative shadow-[0_0_60px_rgba(16,185,129,0.12)]">
              {item?.image ? (
                <img src={getImageUrl(item.image)} alt={item.itemName} className="w-full h-full object-cover" />
              ) : (
                <Archive size={64} className="text-slate-700" />
              )}
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-100 text-center mb-2.5">{item?.itemName}</h2>

          <div className="inline-flex items-center gap-1.5 bg-emerald-500/12 text-emerald-500 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-emerald-500/25 mb-6">
            <Sparkles size={12} />
            {item?.category}
          </div>

          {/* Token (if present) */}
          {claim?.pickupToken && (
            <div className="bg-gradient-to-br from-[#0f2027] to-[#1a2a1a] border border-emerald-500/35 rounded-20px p-4 px-8 text-center mb-6 shadow-[0_0_24px_rgba(16,185,129,0.1)]">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Pickup Token</p>
              <p className="text-2xl font-black text-emerald-500 tracking-wider m-0 font-mono">{claim.pickupToken}</p>
            </div>
          )}

          {/* Meta chips */}
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-400">
              <MapPin size={13} className="text-emerald-500" />
              <span>{item?.parkZone || '—'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-400">
              <Clock size={13} className="text-violet-400" />
              <span>{item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════ RIGHT PANEL ════ */}
      <div className="w-full md:w-[440px] shrink-0 bg-[#0B0F18] p-6 md:p-9 flex flex-col gap-6">

        {/* Owner card */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold m-0">Owner Identification</p>

          {item?.reportedBy ? (
            <div className="bg-gradient-to-br from-[#0f172a] to-[#131d2e] border border-slate-800 rounded-3xl p-5 flex items-center gap-4 relative">
              <div className="w-14 h-14 rounded-full border-[2.5px] border-emerald-500 overflow-hidden bg-slate-800 flex items-center justify-center shrink-0 shadow-[0_0_18px_rgba(16,185,129,0.25)]">
                {item.reportedBy.profileImage ? (
                  <img src={getImageUrl(item.reportedBy.profileImage)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={36} className="text-slate-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-extrabold text-slate-100 mb-0.5">{item.reportedBy.name}</p>
                <p className="text-sm text-slate-400 mb-0.5">{item.reportedBy.phone || 'No phone on file'}</p>
                <p className="text-xs text-slate-500 m-0 overflow-hidden text-ellipsis whitespace-nowrap">{item.reportedBy.email}</p>
              </div>
              <span className="absolute top-3.5 right-4 text-[10px] font-bold text-emerald-500 bg-emerald-500/12 px-2.5 py-0.5 rounded-full border border-emerald-500/25 uppercase tracking-wider">
                Reporter
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5 py-7 bg-[#0f172a] rounded-2xl border border-slate-800">
              <AlertCircle size={36} className="text-slate-700" />
              <p className="text-slate-400 text-xs">No owner data found</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold m-0">Verification Checklist</p>
            <span className="text-xs font-bold text-emerald-500">{passedCount} / {CHECKS.length}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full transition-all duration-400 ease-out" 
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="flex flex-col gap-2.5">
          {CHECKS.map(({ key, label, icon: Icon }) => {
            const checked = verificationChecks[key];
            return (
              <label 
                key={key} 
                className={`flex items-center gap-3.5 p-3 px-4 bg-[#0f172a] border rounded-[18px] cursor-pointer transition-colors ${
                  checked ? 'bg-emerald-500/5 border-emerald-500/35' : 'border-slate-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 transition-colors ${
                  checked ? 'bg-emerald-500/18 text-emerald-500' : ''
                }`}>
                  <Icon size={15} />
                </div>
                <span className="flex-1 text-sm font-medium text-slate-300">{label}</span>
                <div className={`w-7 h-7 rounded-lg border-1.5 flex items-center justify-center transition-colors ${
                  checked ? 'border-emerald-500' : 'border-slate-700'
                }`}>
                  {checked && <CheckCircle2 size={16} className="text-emerald-500" />}
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCheck(key)}
                  className="hidden"
                />
              </label>
            );
          })}
        </div>

        {/* Handover button */}
        <button
          onClick={handleCompleteHandover}
          disabled={!allChecksPassed || isReturned || submitting}
          className={`mt-auto w-full py-4.5 rounded-2xl border-none font-extrabold tracking-wide uppercase text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
            submitting
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : isReturned
              ? 'bg-emerald-500/12 text-emerald-500 border border-emerald-500/30 cursor-default'
              : allChecksPassed
              ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white cursor-pointer shadow-[0_8px_32px_rgba(16,185,129,0.35)] hover:opacity-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isReturned ? (
            <><CheckCircle2 size={18} /> HANDOVER COMPLETED</>
          ) : allChecksPassed ? (
            <><PackageCheck size={18} /> COMPLETE HANDOVER</>
          ) : (
            `VERIFY ALL CHECKS (${passedCount}/${CHECKS.length})`
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminVerificationView;