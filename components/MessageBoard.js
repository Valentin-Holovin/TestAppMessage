import { readDraft, saveDraft, clearDraft, sessionStore } from "../lib/board-draft";
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from './auth/AuthProvider';
import { authenticatedFetch } from '../lib/firebase/client';
import { Button } from './ui/button';
import { PLANS, PAGE_SIZE } from '../lib/board-plans';

const money = (cents) => `$${(cents / 100).toFixed(2)}`;
const date = (value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function MessageBoard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState('live');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [claimSlot, setClaimSlot] = useState(null);
  const [planId, setPlanId] = useState('day');
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [shareNotice, setShareNotice] = useState('');
  const restoredDraft = useRef(false);
  const generation = useRef(0);
  const dialogRef = useRef(null);
  const lastFocus = useRef(null);
  const plans = data?.plans || PLANS;
  const plan = plans.find((item) => item.id === planId);
  const modalOpen = claimSlot !== null || selected !== null;

  const load = useCallback(async (background = false) => {
    const version = ++generation.current;
    if (background !== true) setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/board?mode=${mode}&page=${page}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      if (version === generation.current) setData({ ...body, receivedAt: Date.now() });
    } catch (err) {
      if (version === generation.current) setError(err.message || 'Unable to load board.');
    } finally { if (version === generation.current) setLoading(false); }
  }, [mode, page]);

  useEffect(() => { setData(null); load(); return () => { ++generation.current; }; }, [load]);
  useEffect(() => {
    // Expired placements disappear at their actual expiry, without a visible countdown.
    if (!data || mode !== 'live') return;
    const expiries = data.items.map((item) => item.expires_at).filter(Boolean);
    if (!expiries.length) return;
    const delay = Math.min(Math.max(0, Math.min(...expiries) - data.serverNow - (Date.now() - data.receivedAt) + 100), 2147483647);
    const timer = setTimeout(() => load(true), delay);
    return () => clearTimeout(timer);
  }, [data, mode, load]);
  useEffect(() => {
    function refresh() { load(true); }
    window.addEventListener('focus', refresh);
    window.addEventListener('onemessage:board-update', refresh);
    return () => { window.removeEventListener('focus', refresh); window.removeEventListener('onemessage:board-update', refresh); };
  }, [load]);

  useEffect(() => {
    if (!router.isReady || router.query.compose !== '1' || restoredDraft.current) return;
    restoredDraft.current = true;
    const draft = readDraft(sessionStore());
    if (!draft) return;
    setMode(draft.mode); setPage(Math.floor(draft.slot / PAGE_SIZE)); setClaimSlot(draft.slot);
    setPlanId(draft.planId); setText(draft.text);
    setNotice('Your draft is ready. Review the cell and publish when you are happy with it.');
  }, [router.isReady, router.query.compose]);

  useEffect(() => {
    if (claimSlot === null) return;
    saveDraft(sessionStore(), { mode, slot: claimSlot, planId, text });
  }, [claimSlot, mode, planId, text]);

  useEffect(() => {
    if (!router.isReady || !router.query.message) return;
    const controller = new AbortController();
    async function openSharedMessage() {
      try {
        const res = await fetch(`/api/board/${encodeURIComponent(router.query.message)}`, { signal: controller.signal });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error);
        if (controller.signal.aborted) return;
        const item = body.placement;
        setClaimSlot(null); setSelected(item); setShareNotice('');
        setMode(item.expired ? 'archive' : item.mode);
        setPage(item.expired ? 0 : Math.floor(item.slot / PAGE_SIZE));
      } catch (err) { if (!controller.signal.aborted) setNotice(err.message || 'Unable to open message.'); }
    }
    openSharedMessage();
    return () => controller.abort();
  }, [router.isReady, router.query.message]);

  async function share(item) {
    const link = `${window.location.origin}/?message=${item.id}#boards`;
    try { await navigator.clipboard.writeText(link); setShareNotice('Link copied. Your message can be shared even after its placement ends.'); }
    catch { setShareNotice(`Copy this link: ${link}`); }
  }

  function close() {
    if (saving) return;
    setSelected(null); setClaimSlot(null); setFormError(''); setShareNotice('');
    if (router.query.compose) setNotice('');
    if (router.query.message || router.query.compose) router.replace('/#boards', undefined, { shallow: true, scroll: false });
  }
  useEffect(() => {
    if (!modalOpen) return;
    lastFocus.current = document.activeElement;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('button, textarea')?.focus();
    return () => { document.body.style.overflow = previous; lastFocus.current?.focus(); };
  }, [modalOpen]);

  function changeMode(next) {
    setMode(next); setPage(0); setData(null); setSelected(null); setNotice('');
    setPlanId(next === 'permanent' ? 'forever' : 'day');
  }
  function openCell(slot, item) {
    setFormError(''); setNotice(''); setShareNotice('');
    if (item) { setSelected(item); return; }
    const draft = readDraft(sessionStore());
    setClaimSlot(slot); setText(draft?.mode === mode ? draft.text : '');
    setPlanId(draft?.mode === mode ? draft.planId : mode === 'permanent' ? 'forever' : 'day');
  }
  async function reserve(e) {
    e.preventDefault();
    if (!user) {
      saveDraft(sessionStore(), { mode, slot: claimSlot, planId, text });
      router.push({ pathname: '/login', query: { next: '/?compose=1#boards' } });
      return;
    }
    setSaving(true); setFormError('');
    try {
      const res = await authenticatedFetch('/api/board/reserve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot: claimSlot, planId, text: text.trim(), expectedPriceCents: plan.priceCents }),
      });
      const body = await res.json();
      if (!res.ok) {
        if (res.status === 409) load();
        throw new Error(body.error || 'Unable to publish.');
      }
      clearDraft(sessionStore());
      setClaimSlot(null);
      setSelected(body.placement);
      setNotice(`Message published in cell #${body.placement.slot + 1}. Demo placement — no money charged.`);
      await load();
    } catch (err) { setFormError(err.message || 'Unable to publish.'); }
    finally { setSaving(false); }
  }
  function trapFocus(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key !== 'Tab') return;
    const elements = [...dialogRef.current.querySelectorAll('button:not(:disabled), a[href], textarea:not(:disabled), input:not(:disabled), select:not(:disabled)')];
    const first = elements[0]; const last = elements[elements.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  }
  const occupied = new Map((data?.items || []).map((item) => [item.slot, item]));

  return (
    <section id="boards" className="boards-section" aria-labelledby="boards-title">
      <div className="board-section-header">
        <div><p className="eyebrow">PICK A PIXEL. LEAVE A MESSAGE.</p><h2 id="boards-title">A little space.<br /><span>A lasting impression.</span></h2></div>
        <p className="board-description">Stay for a day. Or leave a mark forever.<br />Your own cell, your own words.</p>
      </div>
      <div className="board-tabs" role="group" aria-label="Choose a board">
        <button type="button" aria-pressed={mode === 'live'} onClick={() => changeMode('live')}>01 / Live board <span>from {money(plans.find((item) => item.id === "day").priceCents)}</span></button>
        <button type="button" aria-pressed={mode === 'permanent'} onClick={() => changeMode('permanent')}>02 / Permanent wall <span>{money(plans.find((item) => item.id === "forever").priceCents)}</span></button>
        <button type="button" aria-pressed={mode === 'archive'} onClick={() => changeMode('archive')}>03 / Past messages <span>expired placements</span></button>
      </div>
      <div className="board-layout">
        <div className="board-canvas glass">
          <div className="board-toolbar"><span>{mode === 'live' ? 'LIVE BOARD / 8 × 8' : mode === 'permanent' ? 'PERMANENT WALL' : 'MESSAGE ARCHIVE'}</span><button type="button" onClick={load} disabled={loading} aria-label="Refresh board">{loading ? 'Loading…' : 'Refresh ↻'}</button></div>
          {mode !== 'archive' && <div className="board-start"><p>{!data ? 'Finding available places…' : data.items.length ? 'Read a message, or make room for your own voice.' : 'No messages here yet. Be the first to leave a little mark.'}</p><Button variant="gradient" size="sm" disabled={loading || !!error || !data || occupied.size === PAGE_SIZE} onClick={() => {
            const index = Array.from({ length: PAGE_SIZE }, (_, i) => page * PAGE_SIZE + i).find((slot) => !occupied.has(slot));
            if (index !== undefined) openCell(index);
          }}>{occupied.size === PAGE_SIZE ? 'This page is full' : 'Choose a free cell ↗'}</Button></div>}
          {notice && <p role="status" className="board-notice">{notice}</p>}
          {error ? <div role="alert" className="board-empty"><p>{error}</p><Button variant="outline" className="mt-4" onClick={load}>Try again</Button></div>
            : loading && !data ? <p className="board-empty" role="status">Loading the board…</p>
            : mode === 'archive' ? (
              data?.items.length ? <div className="board-archive">{data.items.map((item) => <button key={item.id} onClick={() => setSelected(item)}><span className="text-xs text-white/40">CELL #{item.slot + 1} · {date(item.created_at)}</span><p>{item.text}</p><span className="text-xs text-lime-300">{item.nickname} ↗</span></button>)}</div> : <div className="board-empty"><span>▤</span><h3>The story is just beginning.</h3><p>When a temporary placement ends, its message stays here.</p></div>
            ) : (
              <div className="pixel-board" aria-label={mode === 'live' ? 'Live message cells' : 'Permanent message cells'} aria-busy={loading}>
                {Array.from({ length: PAGE_SIZE }, (_, i) => {
                  const slot = page * PAGE_SIZE + i;
                  const item = occupied.get(slot);
                  return <button key={slot} type="button" className={`board-cell ${item ? 'is-occupied' : ''} ${mode === 'permanent' ? 'is-permanent' : ''}`} disabled={loading}
                    aria-label={item ? `Cell ${slot + 1}: ${item.text}, by ${item.nickname}` : `Choose empty cell ${slot + 1}`}
                    onClick={() => openCell(slot, item)}>
                    <span className="cell-number">{String(slot + 1).padStart(2, '0')}</span>
                    {item ? <><span className="cell-text">{item.text}</span><span className="cell-owner">{item.nickname}</span></> : <span className="cell-plus">+</span>}
                  </button>;
                })}
              </div>
            )}
          {mode !== 'archive' && !!data?.items.length && <div className="board-recent"><h3>Latest voices on this page</h3>{[...data.items].sort((a, b) => b.created_at - a.created_at).slice(0, 3).map((item) => <button key={item.id} onClick={() => { setShareNotice(''); setSelected(item); }}><p>{item.text}</p><span>{item.nickname} · cell #{item.slot + 1} ↗</span></button>)}</div>}
          {(data?.pages || 1) > 1 && <div className="board-pagination"><Button variant="ghost" size="sm" disabled={loading || page === 0} onClick={() => setPage(page - 1)}>← Previous</Button><span>Page {page + 1} / {data.pages}</span><Button variant="ghost" size="sm" disabled={loading || page + 1 >= data.pages} onClick={() => setPage(page + 1)}>Next →</Button></div>}
          <div className="board-legend">{mode !== "archive" && <><span><i /> Available</span><span><i className="filled" /> Published</span></>}<span>{mode === 'archive' ? `${data?.total || 0} archived` : `${data?.items.length || 0} / 64 occupied on this page`}</span></div>
        </div>
        <aside className="board-guide glass">
          <p className="eyebrow">YOUR WORDS. YOUR CHOICE.</p>
          <h3>{mode === 'permanent' ? 'Leave a permanent mark.' : mode === 'archive' ? 'Gone from the grid. Kept in the story.' : 'Here for a good time.'}</h3>
          <p>{mode === 'permanent' ? 'One payment. No expiry date. The wall grows with new pages as places fill up.' : mode === 'archive' ? 'Expired messages remain readable. Their cells become available for someone new.' : 'Choose a free cell and a duration. Your message stays until its placement ends, then moves to the archive.'}</p>
          {mode !== "archive" && <div className="board-plan-list">{plans.filter((item) => item.mode === (mode === 'permanent' ? 'permanent' : 'live')).map((item) => <div key={item.id}><span>{item.label}</span><strong>{money(item.priceCents)}</strong></div>)}</div>}
          <p className="board-small">All cells have equal size. Up to 280 characters. Open an occupied cell to read the full message.</p>
          {mode === 'permanent' && <p className="board-small">“Forever” means for the lifetime of the service, subject to content rules.</p>}
          <div className="board-demo"><strong>DEMO MODE</strong><p>Try a placement for free. Payments are not connected; the prices above are the planned rates.</p></div>
        </aside>
      </div>
      {modalOpen && <div className="board-modal-backdrop" onClick={close}>
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="board-dialog-title" className="board-modal glass-strong" onClick={(e) => e.stopPropagation()} onKeyDown={trapFocus}>
          <div className="board-modal-header"><span className="eyebrow">CELL #{(selected?.slot ?? claimSlot) + 1}</span><button type="button" onClick={close} disabled={saving} aria-label="Close dialog">✕</button></div>
          <h2 id="board-dialog-title">{selected ? 'Words on the wall.' : 'Make this space yours.'}</h2>
          {selected ? <>
            <p className="board-full-message">{selected.text}</p>
            <Button variant="outline" size="sm" onClick={() => share(selected)}>Copy message link ↗</Button>
            {shareNotice && <p role="status" className="board-small mt-3 break-words">{shareNotice}</p>}
            <p className="board-small mt-3">{selected.expired || selected.expires_at && selected.expires_at <= Date.now() ? 'This placement has ended. The message stays in the archive.' : 'Published on the board.'}</p>
            <Link href={`/profile/${selected.owner_id}`} className="text-lime-300">By {selected.nickname} ↗</Link>
            <dl className="board-message-details"><div><dt>Published</dt><dd>{date(selected.created_at)} UTC</dd></div><div><dt>Placement</dt><dd>{selected.mode === 'permanent' ? 'Forever' : `Until ${new Date(selected.expires_at).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC`}</dd></div><div><dt>Listed price</dt><dd>{money(selected.price_cents)} · demo</dd></div></dl>
          </> : <form onSubmit={reserve}>
            <fieldset className="board-plan-picker"><legend>Choose your placement</legend>{plans.filter((item) => item.mode === mode).map((item) => <label key={item.id} className={planId === item.id ? 'is-selected' : ''}><input type="radio" name="plan" value={item.id} checked={planId === item.id} disabled={saving} onChange={() => setPlanId(item.id)} /><span>{item.label}</span><strong>{money(item.priceCents)}</strong></label>)}</fieldset>
            {!text.trim() && <div className="board-prompts"><span>Need a first line?</span>{['A tiny win today:', 'Dear future visitor,', 'An unpopular opinion:'].map((prompt) => <button type="button" key={prompt} disabled={saving} onClick={() => { setText(prompt + ' '); dialogRef.current?.querySelector('textarea')?.focus(); }}>{prompt}</button>)}</div>}
            <label htmlFor="board-text" className="block text-sm mb-2">Your message</label>
            <textarea id="board-text" value={text} disabled={saving} onChange={(e) => setText(e.target.value)} maxLength={280} required rows={4} placeholder="A thought, a joke, a little piece of you…" className="w-full px-4 py-3" />
            {!!text.trim() && <div className="board-live-preview"><span>YOUR MESSAGE PREVIEW</span><p>{text}</p><small>By {user?.nickname || 'you'} · cell #{claimSlot + 1}</small></div>}
            <p className="board-character-count">{text.length} / 280</p>
            <div className="board-checkout"><span>{plan?.label} · cell #{claimSlot + 1}</span><strong>{money(plan?.priceCents || 0)}</strong></div>
            <p className="board-small mt-3">{mode === 'permanent' ? 'No expiry, for the lifetime of the service and subject to content rules.' : 'The placement starts when you publish. The cell becomes available after the selected duration.'} This is a demo: no money will be charged.</p>
            {formError && <p role="alert" className="my-4 text-sm text-red-300">{formError}</p>}
            <Button type="submit" variant="gradient" className="mt-5 w-full" disabled={saving || authLoading || (user && !text.trim())}>{saving ? 'Publishing…' : !user ? 'Sign in to publish' : 'Publish demo · no charge'}</Button>
          </form>}
        </div>
      </div>}
    </section>
  );
}
