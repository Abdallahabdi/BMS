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

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingInner}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#10b981' }} />
          <p style={{ color: '#64748b', marginTop: 16, fontSize: 14 }}>Loading verification data…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isReturned = item?.status === 'returned';

  /* ── Main UI ─────────────────────────────────────────────── */
  return (
    <div style={styles.root}>
      <style>{globalStyles}</style>

      {/* ════ LEFT PANEL ════ */}
      <div style={styles.left}>

        {/* Top bar */}
        <div style={styles.topBar}>
          <button style={styles.iconBtn} onClick={() => navigate('/admin')}>
            <ArrowLeft size={18} />
          </button>
          <button style={{ ...styles.iconBtn, display: 'none' }} className="mobile-menu-btn" onClick={toggleSidebar}>
            <Menu size={18} />
          </button>
          <div>
            <h1 style={styles.pageTitle}>Verification Hub</h1>
            <p style={styles.pageSubtitle}>Identity &amp; Item Check</p>
          </div>

          {/* Status badge */}
          {isReturned && (
            <div style={styles.returnedBadge}>
              <CheckCircle2 size={14} />
              Returned
            </div>
          )}
        </div>

        {/* Item card */}
        <div style={styles.itemCard}>
          {/* Glow ring behind image */}
          <div style={styles.imageWrap}>
            <div style={styles.imageGlow} />
            <div style={styles.imageBox}>
              {item?.image ? (
                <img src={getImageUrl(item.image)} alt={item.itemName} style={styles.itemImg} />
              ) : (
                <Archive size={64} style={{ color: '#334155' }} />
              )}
            </div>
          </div>

          <h2 style={styles.itemName}>{item?.itemName}</h2>

          <div style={styles.categoryPill}>
            <Sparkles size={12} />
            {item?.category}
          </div>

          {/* Token (if present) */}
          {claim?.pickupToken && (
            <div style={styles.tokenBox}>
              <p style={styles.tokenLabel}>Pickup Token</p>
              <p style={styles.tokenValue}>{claim.pickupToken}</p>
            </div>
          )}

          {/* Meta chips */}
          <div style={styles.metaRow}>
            <div style={styles.metaChip}>
              <MapPin size={13} style={{ color: '#10b981' }} />
              <span>{item?.parkZone || '—'}</span>
            </div>
            <div style={styles.metaChip}>
              <Clock size={13} style={{ color: '#a78bfa' }} />
              <span>{item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════ RIGHT PANEL ════ */}
      <div style={styles.right}>

        {/* Owner card */}
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Owner Identification</p>

          {item?.reportedBy ? (
            <div style={styles.ownerCard}>
              <div style={styles.avatarRing}>
                {item.reportedBy.profileImage ? (
                  <img src={getImageUrl(item.reportedBy.profileImage)} alt="" style={styles.avatarImg} />
                ) : (
                  <User size={36} style={{ color: '#475569' }} />
                )}
              </div>
              <div style={styles.ownerInfo}>
                <p style={styles.ownerName}>{item.reportedBy.name}</p>
                <p style={styles.ownerPhone}>{item.reportedBy.phone || 'No phone on file'}</p>
                <p style={styles.ownerEmail}>{item.reportedBy.email}</p>
              </div>
              <span style={styles.reporterBadge}>Reporter</span>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <AlertCircle size={36} style={{ color: '#334155' }} />
              <p style={{ color: '#475569', fontSize: 13 }}>No owner data found</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={styles.section}>
          <div style={styles.progressHeader}>
            <p style={styles.sectionLabel}>Verification Checklist</p>
            <span style={styles.progressCount}>{passedCount} / {CHECKS.length}</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Checklist */}
        <div style={styles.checklistWrap}>
          {CHECKS.map(({ key, label, icon: Icon }) => {
            const checked = verificationChecks[key];
            return (
              <label key={key} style={{ ...styles.checkRow, ...(checked ? styles.checkRowActive : {}) }}>
                <div style={{ ...styles.checkIcon, ...(checked ? styles.checkIconActive : {}) }}>
                  <Icon size={15} />
                </div>
                <span style={styles.checkLabel}>{label}</span>
                <div style={{ ...styles.customCheck, ...(checked ? styles.customCheckActive : {}) }}>
                  {checked && <CheckCircle2 size={16} style={{ color: '#10b981' }} />}
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCheck(key)}
                  style={{ display: 'none' }}
                />
              </label>
            );
          })}
        </div>

        {/* Handover button */}
        <button
          onClick={handleCompleteHandover}
          disabled={!allChecksPassed || isReturned || submitting}
          style={{
            ...styles.handoverBtn,
            ...(allChecksPassed && !isReturned ? styles.handoverBtnActive : {}),
            ...(isReturned ? styles.handoverBtnDone : {}),
          }}
        >
          {submitting ? (
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
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

/* ── Styles ───────────────────────────────────────────────── */
const styles = {
  root: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
    background: '#070B12',
    color: '#cbd5e1',
    fontFamily: "'Inter', sans-serif",
  },
  left: {
    flex: 1,
    padding: '40px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
    borderRight: '1px solid #1e293b',
  },
  right: {
    width: 440,
    flexShrink: 0,
    background: '#0B0F18',
    padding: '40px 36px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },

  /* Top bar */
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 12,
    background: '#1e293b',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    transition: 'background .2s',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 900,
    color: '#f1f5f9',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: 10,
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    margin: 0,
  },
  returnedBadge: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(16,185,129,.15)',
    color: '#10b981',
    fontSize: 12,
    fontWeight: 700,
    padding: '6px 14px',
    borderRadius: 99,
    border: '1px solid rgba(16,185,129,.3)',
  },

  /* Item card */
  itemCard: {
    flex: 1,
    background: 'linear-gradient(145deg, #0f1724 0%, #111827 100%)',
    borderRadius: 36,
    border: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 32px',
    gap: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  imageWrap: {
    position: 'relative',
    marginBottom: 28,
  },
  imageGlow: {
    position: 'absolute',
    inset: -24,
    background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  imageBox: {
    width: 240,
    height: 240,
    borderRadius: 28,
    overflow: 'hidden',
    background: '#1e293b',
    border: '2px solid #334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: '0 0 60px rgba(16,185,129,0.12)',
  },
  itemImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemName: {
    fontSize: 30,
    fontWeight: 900,
    color: '#f1f5f9',
    textAlign: 'center',
    margin: '0 0 10px',
  },
  categoryPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(16,185,129,.12)',
    color: '#10b981',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '5px 14px',
    borderRadius: 99,
    border: '1px solid rgba(16,185,129,.25)',
    marginBottom: 24,
  },
  tokenBox: {
    background: 'linear-gradient(135deg, #0f2027, #1a2a1a)',
    border: '1px solid rgba(16,185,129,.35)',
    borderRadius: 20,
    padding: '16px 32px',
    textAlign: 'center',
    marginBottom: 24,
    boxShadow: '0 0 24px rgba(16,185,129,.1)',
  },
  tokenLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    margin: '0 0 6px',
  },
  tokenValue: {
    fontSize: 26,
    fontWeight: 900,
    color: '#10b981',
    letterSpacing: '0.08em',
    margin: 0,
    fontFamily: 'monospace',
  },
  metaRow: {
    display: 'flex',
    gap: 12,
  },
  metaChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 12,
    padding: '8px 14px',
    fontSize: 13,
    color: '#94a3b8',
  },

  /* Right panel */
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  sectionLabel: {
    fontSize: 10,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 700,
    margin: 0,
  },
  ownerCard: {
    background: 'linear-gradient(135deg, #0f172a, #131d2e)',
    border: '1px solid #1e293b',
    borderRadius: 24,
    padding: '20px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    position: 'relative',
  },
  avatarRing: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    border: '2.5px solid #10b981',
    overflow: 'hidden',
    background: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 0 18px rgba(16,185,129,.25)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  ownerInfo: {
    flex: 1,
    minWidth: 0,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 800,
    color: '#f1f5f9',
    margin: '0 0 2px',
  },
  ownerPhone: {
    fontSize: 13,
    color: '#94a3b8',
    margin: '0 0 2px',
  },
  ownerEmail: {
    fontSize: 12,
    color: '#64748b',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  reporterBadge: {
    position: 'absolute',
    top: 14,
    right: 16,
    fontSize: 10,
    fontWeight: 700,
    color: '#10b981',
    background: 'rgba(16,185,129,.12)',
    padding: '3px 10px',
    borderRadius: 99,
    border: '1px solid rgba(16,185,129,.25)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '28px 0',
    background: '#0f172a',
    borderRadius: 20,
    border: '1px solid #1e293b',
  },

  /* Progress */
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCount: {
    fontSize: 12,
    fontWeight: 700,
    color: '#10b981',
  },
  progressTrack: {
    height: 5,
    background: '#1e293b',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #059669, #10b981)',
    borderRadius: 99,
    transition: 'width .4s cubic-bezier(.4,0,.2,1)',
  },

  /* Checklist */
  checklistWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '13px 16px',
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: 18,
    cursor: 'pointer',
    transition: 'border-color .2s, background .2s',
  },
  checkRowActive: {
    background: 'rgba(16,185,129,.07)',
    borderColor: 'rgba(16,185,129,.35)',
  },
  checkIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    flexShrink: 0,
    transition: 'background .2s, color .2s',
  },
  checkIconActive: {
    background: 'rgba(16,185,129,.18)',
    color: '#10b981',
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
    color: '#cbd5e1',
  },
  customCheck: {
    width: 28,
    height: 28,
    borderRadius: 8,
    border: '1.5px solid #334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color .2s',
  },
  customCheckActive: {
    borderColor: '#10b981',
  },

  /* Handover button */
  handoverBtn: {
    marginTop: 'auto',
    width: '100%',
    padding: '18px 0',
    borderRadius: 20,
    border: 'none',
    cursor: 'not-allowed',
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: '#475569',
    background: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all .3s cubic-bezier(.4,0,.2,1)',
  },
  handoverBtnActive: {
    background: 'linear-gradient(135deg, #059669, #10b981)',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(16,185,129,.35)',
  },
  handoverBtnDone: {
    background: 'rgba(16,185,129,.12)',
    color: '#10b981',
    cursor: 'default',
    border: '1px solid rgba(16,185,129,.3)',
  },

  /* Loading */
  loadingWrap: {
    minHeight: '100vh',
    background: '#070B12',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap');
  * { box-sizing: border-box; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 900px) {
    .mobile-menu-btn { display: flex !important; }
  }
`;

export default AdminVerificationView;