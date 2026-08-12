import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './assets/modalStyles.css';
import './assets/styles.css';
import { getApiUrl, getAuthHeaders } from './auth';

export default function SharedCartInviteFloating({ inline = false }) {
  const [open, setOpen] = useState(false);
  const [invite, setInvite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleJoin = async () => {
    setError('');
    if (!invite || invite.trim().length === 0) { setError('Enter invite link or share ID'); return; }
    setLoading(true);
    try {
      const shareId = invite.includes('/shared-cart/') ? invite.split('/shared-cart/').pop() : invite.trim();
      const res = await fetch(getApiUrl('/api/shared-cart/join'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ shareId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || `Request failed: ${res.status}`);
      }
      setOpen(false);
      navigate(`/shared-cart/${encodeURIComponent(shareId)}`);
    } catch (err) {
      setError(err.message || 'Unable to join shared cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!inline && (
        <button
          title="Join shared cart"
          className="shared-invite-button"
          onClick={() => setOpen(true)}
        >
          🤝
        </button>
      )}

      {/* Inline header button (small) */}
      {inline && (
        <button className="shared-invite-header-btn" onClick={() => setOpen(true)} type="button">Join Cart</button>
      )}

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <button className="modal-close-btn" onClick={() => setOpen(false)}>&times;</button>

            <h2 style={{ margin: 0 }}>Join Shared Cart</h2>
            <p style={{ marginTop: 8, marginBottom: 12, color: 'var(--text-muted)' }}>Enter an invite link or share ID to join someone's cart.</p>

            <div className="modal-form">
              <label className="modal-form-item">
                <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Invite link or ID</span>
                <input
                  value={invite}
                  onChange={(e) => setInvite(e.target.value)}
                  placeholder="https://.../shared-cart/abc123 or abc123"
                />
              </label>

              {error && <div style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</div>}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="secondary-button" type="button" onClick={() => setOpen(false)}>Cancel</button>
                <button className="form-button" type="button" onClick={handleJoin} disabled={loading}>{loading ? 'Joining…' : 'Join'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
