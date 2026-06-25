import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';

// ← Change this to your preferred PIN
const PIN = '1234';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const PRIORITY_LABELS = { high: '🔴 Must-have', medium: '🟡 Soon', low: '🟢 Nice to have' };
const PRIORITY_COLORS = { high: '#dc2626', medium: '#d97706', low: '#16a34a' };

// ── Persistence ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'home_page_state_v1';
const SHOP_STORAGE_KEY = 'home_shop_state_v1';

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

function saveState(st) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(st)); } catch {}
}

function loadShopState() {
  try { return JSON.parse(localStorage.getItem(SHOP_STORAGE_KEY) || '{}'); } catch { return {}; }
}

function saveShopState(st) {
  try { localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(st)); } catch {}
}

// ── PIN gate ──────────────────────────────────────────────────────────────────

function PinGate({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (pin === PIN) {
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setPin('');
      setTimeout(() => setShake(false), 600);
    }
  }

  return (
    <div style={s.pinOverlay}>
      <div style={{ ...s.pinBox, animation: shake ? 'shake 0.5s ease' : 'none' }}>
        <div style={s.pinEmoji}>🏠</div>
        <h2 style={s.pinTitle}>Our Home</h2>
        <p style={s.pinSub}>Enter PIN to continue</p>
        <form onSubmit={submit} style={s.pinForm}>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={e => { setPin(e.target.value); setError(false); }}
            style={{ ...s.pinInput, borderColor: error ? '#dc2626' : '#d1c4ae' }}
            autoFocus
            placeholder="••••"
          />
          {error && <p style={s.pinError}>Wrong PIN, try again</p>}
          <button type="submit" style={s.pinBtn}>Unlock</button>
        </form>
      </div>
    </div>
  );
}

// ── Timeline (always visible) ─────────────────────────────────────────────────

function Timeline({ items, state, toggle }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div style={s.tlWrap}>
      {items.map((item) => {
        const isPast = item.date < today;
        const isDone = state[item.id];
        const dotBg = isDone ? '#16a34a' : isPast ? '#d97706' : '#9ca3af';
        return (
          <div key={item.id} style={s.tlCard} onClick={() => toggle(item.id)} role="button" tabIndex={0}>
            <div style={{ ...s.tlDot, background: dotBg }}>
              {isDone ? '✓' : item.emoji}
            </div>
            <div style={s.tlMeta}>
              <span style={s.tlDate}>
                {item.date}{item.time ? ` · ${item.time}` : ''}
              </span>
              <span style={{
                ...s.tlLabel,
                textDecoration: isDone ? 'line-through' : 'none',
                color: isDone ? '#a8a29e' : '#1c1917',
              }}>
                {item.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────

function HomeApp() {
  const [data, setData] = useState(null);
  const [state, setState] = useState(loadState);
  const [shopState, setShopState] = useState(loadShopState);
  const [tab, setTab] = useState('rooms');

  useEffect(() => {
    fetch('/data/home-data.json')
      .then(r => r.json())
      .then(setData);
  }, []);

  function toggle(id) {
    const next = { ...state, [id]: !state[id] };
    setState(next);
    saveState(next);
  }

  function handleShopChange(next) {
    setShopState(next);
    saveShopState(next);
  }

  function handlePriorityChange(id, priority) {
    const next = { ...shopState, priorities: { ...(shopState.priorities || {}), [id]: priority } };
    setShopState(next);
    saveShopState(next);
  }

  if (!data) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8a29e', fontSize: 15 }}>
        Loading…
      </div>
    );
  }

  // Progress: only count non-owned items
  const allBuyItems = data.rooms.flatMap(r => r.items).filter(i => !i.owned);
  const doneCount = allBuyItems.filter(i => state[i.id]).length;
  const progress = Math.round((doneCount / allBuyItems.length) * 100);

  const shoppingItems = data.rooms
    .flatMap(r => r.items.map(i => ({ ...i, room: r.name })))
    .filter(i => !state[i.id] && (!i.owned || state['unowned:' + i.id]) && !state['owned:' + i.id])
    .map(i => ({ ...i, priority: i.owned ? (i.defaultPriority || 'medium') : i.priority }))
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  return (
    <div style={s.app}>
      {/* Header */}
      <div style={s.header}>
        <h1 style={s.headerTitle}>🏠 Our New Home</h1>
        <div style={s.progressBar}>
          <div style={{ ...s.progressFill, width: `${progress}%` }} />
        </div>
        <p style={s.progressLabel}>{doneCount} / {allBuyItems.length} items sorted ({progress}%)</p>
      </div>

      {/* Timeline — always visible */}
      <Timeline items={data.timeline} state={state} toggle={toggle} />

      {/* Tabs */}
      <div style={s.tabs}>
        {[['rooms', '🏠 Rooms'], ['shopping', '🛒 Shopping List']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{ ...s.tab, ...(tab === key ? s.tabActive : {}) }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'rooms'    && <RoomsTab rooms={data.rooms} utilities={data.utilities} state={state} toggle={toggle} shopState={shopState} onPriorityChange={handlePriorityChange} />}
      {tab === 'shopping' && <ShoppingTab items={shoppingItems} shopState={shopState} onShopChange={handleShopChange} toggle={toggle} />}
    </div>
  );
}

// ── Rooms tab ─────────────────────────────────────────────────────────────────

const PRIORITY_CYCLE = { high: 'medium', medium: 'low', low: 'high' };

function RoomsTab({ rooms, utilities, state, toggle, shopState, onPriorityChange }) {
  const [contextMenu, setContextMenu] = useState(null); // { id, label, type, originallyOwned, x, y }
  const [swipeDx, setSwipeDx] = useState({});
  const touchRef = useRef({});
  const [hoverItemId, setHoverItemId] = useState(null);

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [contextMenu]);

  function unownItem(id) {
    toggle('unowned:' + id);
    setContextMenu(null);
  }

  function handleTouchStart(e, id) {
    touchRef.current[id] = e.touches[0].clientX;
  }

  function handleTouchMove(e, id) {
    const startX = touchRef.current[id];
    if (startX == null) return;
    const dx = Math.max(-72, Math.min(0, e.touches[0].clientX - startX));
    setSwipeDx(prev => ({ ...prev, [id]: dx }));
  }

  function handleTouchEnd(id) {
    const dx = swipeDx[id] || 0;
    if (dx < -50) unownItem(id);
    setSwipeDx(prev => ({ ...prev, [id]: 0 }));
    delete touchRef.current[id];
  }

  return (
    <>
    <div style={s.grid}>
      {rooms.map(room => {
        const buyItems = room.items.filter(i => (!i.owned || state['unowned:' + i.id]) && !state['owned:' + i.id]);
        const ownedItems = room.items.filter(i => (i.owned && !state['unowned:' + i.id]) || state['owned:' + i.id]);
        const done = buyItems.filter(i => state[i.id]).length;
        return (
          <div key={room.id} style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardEmoji}>{room.emoji}</span>
              <div>
                <h3 style={s.cardTitle}>{room.name}</h3>
                {buyItems.length > 0
                  ? <span style={s.cardProgress}>{done}/{buyItems.length} done</span>
                  : <span style={{ ...s.cardProgress, color: '#16a34a' }}>All settled ✓</span>
                }
              </div>
            </div>

            {/* Items to buy (includes items moved back from "already have") */}
            {buyItems.length > 0 && (
              <ul style={s.itemList}>
                {buyItems.map(item => {
                  const effP = (shopState.priorities || {})[item.id]
                    || (item.owned ? (item.defaultPriority || 'medium') : item.priority);
                  return (
                    <li
                      key={item.id}
                      style={s.itemRow}
                      onMouseEnter={() => setHoverItemId(item.id)}
                      onMouseLeave={() => setHoverItemId(null)}
                    >
                      <span
                        style={{ ...s.checkbox, ...(state[item.id] ? s.checkboxDone : {}) }}
                        onClick={() => toggle(item.id)}
                      >
                        {state[item.id] ? '✓' : ''}
                      </span>
                      <div style={s.itemContent} onClick={() => toggle(item.id)}>
                        <span style={{ ...s.itemLabel, ...(state[item.id] ? s.itemLabelDone : {}) }}>
                          {item.label}
                        </span>
                        {item.reportUrl && !state[item.id] && (
                          <a
                            href={item.reportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={s.reportBtn}
                            onClick={e => e.stopPropagation()}
                          >
                            → View report
                          </a>
                        )}
                        {item.deliveryHint && !state[item.id] && (
                          <span style={s.deliveryHint}>⏱ {item.deliveryHint}</span>
                        )}
                      </div>
                      {!state[item.id] && (
                        <>
                          <span
                            style={{ ...s.badge, color: PRIORITY_COLORS[effP], borderColor: PRIORITY_COLORS[effP], cursor: 'pointer' }}
                            title="Click to change priority"
                            onClick={e => { e.stopPropagation(); onPriorityChange(item.id, PRIORITY_CYCLE[effP]); }}
                          >
                            {PRIORITY_LABELS[effP]}
                          </span>
                          {hoverItemId === item.id && (
                            <button
                              style={s.dotMenuBtn}
                              onClick={e => { e.stopPropagation(); setContextMenu({ id: item.id, label: item.label, type: 'moveToOwned', originallyOwned: !!item.owned, x: e.clientX, y: e.clientY }); }}
                            >⋯</button>
                          )}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Already owned items — right-click or swipe left to move back */}
            {ownedItems.length > 0 && (
              <div style={s.ownedSection}>
                <span style={s.ownedLabel}>
                  Already have
                  <span style={s.ownedHint}> · swipe ← or tap ⋯ to move back</span>
                </span>
                <ul style={s.ownedList}>
                  {ownedItems.map(item => {
                    const dx = swipeDx[item.id] || 0;
                    const isSwiping = touchRef.current[item.id] != null;
                    return (
                      <li
                        key={item.id}
                        style={{ ...s.ownedItem, position: 'relative', overflow: 'hidden', cursor: 'default' }}
                        onMouseEnter={() => setHoverItemId(item.id)}
                        onMouseLeave={() => setHoverItemId(null)}
                        onTouchStart={e => handleTouchStart(e, item.id)}
                        onTouchMove={e => handleTouchMove(e, item.id)}
                        onTouchEnd={() => handleTouchEnd(item.id)}
                      >
                        {/* Green action strip revealed on swipe */}
                        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, background: '#16a34a', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 11, fontWeight: 700, color: '#fff', opacity: dx < 0 ? 1 : 0 }}>
                          ↩ Need it
                        </div>
                        {/* Sliding content */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#faf8f3', position: 'relative', zIndex: 1, transform: `translateX(${dx}px)`, transition: isSwiping ? 'none' : 'transform 0.2s ease', width: '100%' }}>
                          <span style={s.ownedCheck}>✓</span>
                          <span style={{ ...s.ownedItemLabel, flex: 1 }}>{item.label}</span>
                          {hoverItemId === item.id && (
                            <button
                              style={s.dotMenuBtn}
                              onClick={e => { e.stopPropagation(); setContextMenu({ id: item.id, label: item.label, type: 'moveToList', x: e.clientX, y: e.clientY }); }}
                            >⋯</button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      {/* Utilities card */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardEmoji}>🔌</span>
          <div>
            <h3 style={s.cardTitle}>Utilities</h3>
            <span style={s.cardProgress}>
              {utilities.filter(u => u.status === 'included').length}/{utilities.length} sorted
            </span>
          </div>
        </div>
        <ul style={s.itemList}>
          {utilities.map(u => {
            const st = UTIL_STATUS[u.status];
            return (
              <li key={u.id} style={{ ...s.itemRow, cursor: 'default' }}>
                <div style={{ ...s.itemContent, pointerEvents: 'none' }}>
                  <span style={s.itemLabel}>{u.label}</span>
                  {u.note ? <span style={{ fontSize: 11, color: '#78716c' }}>{u.note}</span> : null}
                </div>
                {u.reportUrl && (
                  <a
                    href={u.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={s.reportBtn}
                  >
                    → View report
                  </a>
                )}
                <span style={{ ...s.utilBadge, background: st.bg, color: st.color }}>
                  {st.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>

    {/* Context menu */}
    {contextMenu && (
      <div
        style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 1000, background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.13)', padding: '4px 0', minWidth: 190 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '6px 14px 4px', fontSize: 11, color: '#a8a29e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {contextMenu.label}
        </div>
        {contextMenu.type === 'moveToList' && (
          <button
            style={{ display: 'block', width: '100%', padding: '8px 14px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#1c1917', fontWeight: 500 }}
            onClick={() => unownItem(contextMenu.id)}
          >
            ↩ Move to shopping list
          </button>
        )}
        {contextMenu.type === 'moveToOwned' && (
          <button
            style={{ display: 'block', width: '100%', padding: '8px 14px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#1c1917', fontWeight: 500 }}
            onClick={() => {
              if (contextMenu.originallyOwned) toggle('unowned:' + contextMenu.id);
              else toggle('owned:' + contextMenu.id);
              setContextMenu(null);
            }}
          >
            ✓ Move to Already have
          </button>
        )}
      </div>
    )}
    </>
  );
}

// ── Shopping tab ──────────────────────────────────────────────────────────────

function ShoppingTab({ items, shopState, onShopChange, toggle }) {
  const dragId = useRef(null);
  const dragPriority = useRef(null);
  const [dragOver, setDragOver] = useState(null);
  const [pending, setPending] = useState(null);
  const [shopCtx, setShopCtx] = useState(null); // { id, label, owned, x, y }
  const [shopSwipe, setShopSwipe] = useState({});
  const shopTouchRef = useRef({});
  const [hoverShopId, setHoverShopId] = useState(null);

  useEffect(() => {
    if (!shopCtx) return;
    const close = () => setShopCtx(null);
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [shopCtx]);

  function moveToAlreadyHave(item) {
    if (item.owned) toggle('unowned:' + item.id);
    else toggle('owned:' + item.id);
    setShopCtx(null);
  }

  function handleShopTouchStart(e, id) {
    shopTouchRef.current[id] = e.touches[0].clientX;
  }

  function handleShopTouchMove(e, id) {
    const startX = shopTouchRef.current[id];
    if (startX == null) return;
    const dx = Math.max(-72, Math.min(0, e.touches[0].clientX - startX));
    setShopSwipe(prev => ({ ...prev, [id]: dx }));
  }

  function handleShopTouchEnd(item) {
    const dx = shopSwipe[item.id] || 0;
    if (dx < -50) moveToAlreadyHave(item);
    setShopSwipe(prev => ({ ...prev, [item.id]: 0 }));
    delete shopTouchRef.current[item.id];
  }

  function effPriority(item) {
    return (shopState.priorities || {})[item.id] || item.priority;
  }

  function orderedGroup(priority, groupItems) {
    const order = (shopState.order || {})[priority] || [];
    if (!order.length) return groupItems;
    return [...groupItems].sort((a, b) => {
      const ai = order.indexOf(a.id);
      const bi = order.indexOf(b.id);
      if (ai < 0 && bi < 0) return 0;
      if (ai < 0) return 1;
      if (bi < 0) return -1;
      return ai - bi;
    });
  }

  const grouped = { high: [], medium: [], low: [] };
  items.forEach(i => grouped[effPriority(i)].push(i));

  function handleDragStart(e, item) {
    dragId.current = item.id;
    dragPriority.current = effPriority(item);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, item) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    if (dragOver?.id !== item.id || dragOver?.pos !== pos) setDragOver({ id: item.id, pos });
  }

  function handleDrop(e, targetItem) {
    e.preventDefault();
    const over = dragOver;
    setDragOver(null);
    if (!dragId.current || dragId.current === targetItem.id) { dragId.current = null; return; }

    const srcId = dragId.current;
    const srcPriority = dragPriority.current;
    const tgtPriority = effPriority(targetItem);
    dragId.current = null;
    dragPriority.current = null;

    const srcItem = items.find(i => i.id === srcId);
    if (!srcItem) return;

    if (srcPriority === tgtPriority) {
      const group = orderedGroup(srcPriority, grouped[srcPriority]);
      const without = group.filter(i => i.id !== srcId);
      const tgtIdx = without.findIndex(i => i.id === targetItem.id);
      const insertAt = over?.pos === 'before' ? tgtIdx : tgtIdx + 1;
      without.splice(Math.max(0, insertAt), 0, srcItem);
      onShopChange({
        ...shopState,
        order: { ...(shopState.order || {}), [srcPriority]: without.map(i => i.id) },
      });
    } else {
      setPending({ id: srcId, label: srcItem.label, from: srcPriority, to: tgtPriority, targetId: targetItem.id, pos: over?.pos });
    }
  }

  function confirmMove() {
    if (!pending) return;
    const { id, from, to, targetId, pos } = pending;
    const priorities = { ...(shopState.priorities || {}), [id]: to };
    const fromOrder = ((shopState.order || {})[from] || []).filter(x => x !== id);
    const toGroupItems = orderedGroup(to, grouped[to]);
    const toOrder = toGroupItems.map(i => i.id);
    const tgtIdx = toOrder.indexOf(targetId);
    if (tgtIdx >= 0) toOrder.splice(pos === 'before' ? tgtIdx : tgtIdx + 1, 0, id);
    else toOrder.push(id);
    onShopChange({
      ...shopState,
      priorities,
      order: { ...(shopState.order || {}), [from]: fromOrder, [to]: toOrder },
    });
    setPending(null);
  }

  if (items.length === 0) {
    return (
      <div style={s.allDone}>
        <span style={{ fontSize: 64 }}>🎉</span>
        <p style={{ fontSize: 20, fontWeight: 600, margin: '12px 0 0' }}>Everything's sorted!</p>
      </div>
    );
  }

  return (
    <>
    <div style={s.shopping}>
      {pending && (
        <div style={s.confirmBanner}>
          <p style={s.confirmText}>
            Move <strong>{pending.label}</strong> from{' '}
            <span style={{ color: PRIORITY_COLORS[pending.from] }}>{PRIORITY_LABELS[pending.from]}</span>
            {' → '}
            <span style={{ color: PRIORITY_COLORS[pending.to] }}>{PRIORITY_LABELS[pending.to]}</span>?
            <br />
            <span style={{ fontSize: 12, color: '#78716c' }}>This will change its priority.</span>
          </p>
          <div style={s.confirmButtons}>
            <button style={s.confirmCancel} onClick={() => setPending(null)}>Cancel</button>
            <button style={s.confirmOk} onClick={confirmMove}>Yes, change it</button>
          </div>
        </div>
      )}

      {Object.entries(grouped).filter(([, arr]) => arr.length > 0).map(([priority, arr]) => (
        <div key={priority} style={s.shopGroup}>
          <h3 style={{ ...s.shopGroupTitle, color: PRIORITY_COLORS[priority] }}>
            {PRIORITY_LABELS[priority]} <span style={s.shopCount}>({arr.length})</span>
          </h3>
          <ul style={s.shopList}>
            {orderedGroup(priority, arr).map(item => {
              const isOver = dragOver?.id === item.id;
              const dx = shopSwipe[item.id] || 0;
              const isSwiping = shopTouchRef.current[item.id] != null;
              return (
                <li
                  key={item.id}
                  draggable
                  onDragStart={e => handleDragStart(e, item)}
                  onDragOver={e => handleDragOver(e, item)}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={e => handleDrop(e, item)}
                  onDragEnd={() => { setDragOver(null); dragId.current = null; }}
                  onMouseEnter={() => setHoverShopId(item.id)}
                  onMouseLeave={() => setHoverShopId(null)}
                  onTouchStart={e => handleShopTouchStart(e, item.id)}
                  onTouchMove={e => handleShopTouchMove(e, item.id)}
                  onTouchEnd={() => handleShopTouchEnd(item)}
                  style={{
                    ...s.shopItem,
                    borderTop: isOver && dragOver.pos === 'before' ? '2px solid #2d6a4f' : '2px solid transparent',
                    borderBottom: isOver && dragOver.pos === 'after' ? '2px solid #2d6a4f' : '2px solid transparent',
                    opacity: dragId.current === item.id ? 0.4 : 1,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {/* Green strip revealed on swipe */}
                  <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, background: '#16a34a', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 11, fontWeight: 700, color: '#fff', opacity: dx < 0 ? 1 : 0 }}>
                    ✓ Already have
                  </div>
                  {/* Sliding content */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', background: '#fff', position: 'relative', zIndex: 1, transform: `translateX(${dx}px)`, transition: isSwiping ? 'none' : 'transform 0.2s ease', cursor: 'grab' }}>
                    <span style={s.dragHandle}>⠿</span>
                    <div style={s.shopItemLeft}>
                      <span style={s.shopItemLabel}>{item.label}</span>
                      {item.reportUrl && (
                        <a href={item.reportUrl} target="_blank" rel="noopener noreferrer" style={s.reportBtnShop}>
                          → Report
                        </a>
                      )}
                      {item.deliveryHint && (
                        <span style={s.deliveryHint}>⏱ {item.deliveryHint}</span>
                      )}
                    </div>
                    <span style={s.shopItemRoom}>{item.room}</span>
                    {hoverShopId === item.id && (
                      <button
                        style={s.dotMenuBtn}
                        onClick={e => { e.stopPropagation(); setShopCtx({ id: item.id, label: item.label, owned: item.owned, x: e.clientX, y: e.clientY }); }}
                      >⋯</button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>

    {/* Context menu for shopping list items */}
    {shopCtx && (
      <div
        style={{ position: 'fixed', top: shopCtx.y, left: shopCtx.x, zIndex: 1000, background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.13)', padding: '4px 0', minWidth: 190 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '6px 14px 4px', fontSize: 11, color: '#a8a29e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {shopCtx.label}
        </div>
        <button
          style={{ display: 'block', width: '100%', padding: '8px 14px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#1c1917', fontWeight: 500 }}
          onClick={() => moveToAlreadyHave(items.find(i => i.id === shopCtx.id))}
        >
          ✓ Move to Already have
        </button>
      </div>
    )}
  </>
  );
}

// ── Utilities tab ─────────────────────────────────────────────────────────────

const UTIL_STATUS = {
  included:    { label: '✓ Included',    bg: '#d3eae0', color: '#1a5438' },
  'in-progress': { label: '⟳ In progress', bg: '#fef3c7', color: '#92400e' },
  todo:        { label: '○ To do',       bg: '#f3f4f6', color: '#6b7280' },
};

function UtilitiesTab({ utilities }) {
  return (
    <div style={s.utilities}>
      {utilities.map(u => {
        const st = UTIL_STATUS[u.status];
        return (
          <div key={u.id} style={s.utilCard}>
            <div style={s.utilLeft}>
              <span style={s.utilLabel}>{u.label}</span>
              {u.note ? <span style={s.utilNote}>{u.note}</span> : null}
            </div>
            <span style={{ ...s.utilBadge, background: st.bg, color: st.color }}>
              {st.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  // PIN
  pinOverlay: { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f3' },
  pinBox: { background: '#fff', borderRadius: 20, padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: 320, width: '100%' },
  pinEmoji: { fontSize: 52, marginBottom: 8 },
  pinTitle: { margin: '0 0 4px', color: '#1c1917', fontSize: 24, fontWeight: 700 },
  pinSub: { color: '#78716c', margin: '0 0 20px', fontSize: 14 },
  pinForm: { display: 'flex', flexDirection: 'column', gap: 12 },
  pinInput: { fontSize: 28, textAlign: 'center', border: '2px solid', borderRadius: 12, padding: '10px 16px', outline: 'none', letterSpacing: 4, color: '#1c1917', background: '#faf8f3', width: '100%', boxSizing: 'border-box' },
  pinError: { color: '#dc2626', fontSize: 13, margin: 0 },
  pinBtn: { background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontSize: 16, fontWeight: 600, cursor: 'pointer' },
  // App shell
  app: { maxWidth: 960, margin: '0 auto', padding: '32px 16px' },
  header: { textAlign: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: 800, color: '#1c1917', margin: '0 0 16px' },
  progressBar: { height: 10, background: '#e7e5e4', borderRadius: 99, overflow: 'hidden', maxWidth: 400, margin: '0 auto 8px' },
  progressFill: { height: '100%', background: '#16a34a', borderRadius: 99, transition: 'width 0.4s ease' },
  progressLabel: { color: '#78716c', fontSize: 14, margin: 0 },
  // Timeline strip
  tlWrap: { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28, justifyContent: 'center' },
  tlCard: { display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #f0ebe3', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', userSelect: 'none', minWidth: 0, flexShrink: 0 },
  tlDot: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 700, flexShrink: 0 },
  tlMeta: { display: 'flex', flexDirection: 'column' },
  tlDate: { fontSize: 11, color: '#78716c', fontWeight: 600 },
  tlLabel: { fontSize: 13, fontWeight: 600 },
  // Tabs
  tabs: { display: 'flex', gap: 8, marginBottom: 28, justifyContent: 'center', flexWrap: 'wrap' },
  tab: { padding: '8px 20px', borderRadius: 99, border: '2px solid #e7e5e4', background: '#fff', color: '#78716c', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.15s' },
  tabActive: { background: '#2d6a4f', color: '#fff', borderColor: '#2d6a4f' },
  // Rooms grid
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: 20 },
  card: { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0ebe3' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
  cardEmoji: { fontSize: 32 },
  cardTitle: { margin: '0 0 2px', fontSize: 17, fontWeight: 700, color: '#1c1917' },
  cardProgress: { fontSize: 12, color: '#78716c' },
  itemList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 0 },
  itemRow: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 0', borderBottom: '1px solid #f5f0e8', userSelect: 'none' },
  checkbox: { width: 20, height: 20, borderRadius: 6, border: '2px solid #d1c4ae', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0, transition: 'all 0.15s', background: 'transparent', cursor: 'pointer', marginTop: 1 },
  checkboxDone: { background: '#16a34a', borderColor: '#16a34a' },
  itemContent: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer', minWidth: 0 },
  itemLabel: { fontSize: 14, color: '#1c1917' },
  itemLabelDone: { textDecoration: 'line-through', color: '#a8a29e' },
  reportBtn: { display: 'inline-block', fontSize: 11, fontWeight: 600, color: '#2d6a4f', border: '1px solid #2d6a4f', borderRadius: 99, padding: '2px 9px', textDecoration: 'none', alignSelf: 'flex-start' },
  deliveryHint: { fontSize: 11, color: '#78716c', fontStyle: 'italic', alignSelf: 'flex-start' },
  badge: { fontSize: 11, fontWeight: 600, border: '1px solid', borderRadius: 99, padding: '1px 7px', flexShrink: 0, marginTop: 2 },
  // Owned section
  ownedSection: { marginTop: 12, paddingTop: 10, borderTop: '1px dashed #e7e5e4' },
  ownedLabel: { fontSize: 10, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 6 },
  ownedHint: { fontSize: 9, fontWeight: 400, color: '#c4c0bb', textTransform: 'none', letterSpacing: 0 },
  dotMenuBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#78716c', padding: '0 4px', borderRadius: 4, lineHeight: 1, flexShrink: 0 },
  ownedList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 },
  ownedItem: { display: 'flex', alignItems: 'center', gap: 6 },
  ownedCheck: { fontSize: 12, color: '#16a34a', fontWeight: 700, flexShrink: 0 },
  ownedItemLabel: { fontSize: 13, color: '#a8a29e', textDecoration: 'line-through' },
  // Shopping
  shopping: { maxWidth: 680, margin: '0 auto' },
  shopGroup: { marginBottom: 28 },
  shopGroupTitle: { fontWeight: 700, marginBottom: 10, fontSize: 16 },
  shopCount: { fontWeight: 400, color: '#78716c' },
  shopList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 },
  shopItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, background: '#fff', border: '1px solid #f0ebe3', borderRadius: 10, padding: '10px 14px' },
  shopItemLeft: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  shopItemLabel: { fontSize: 14, color: '#1c1917', fontWeight: 500 },
  reportBtnShop: { display: 'inline-block', fontSize: 11, fontWeight: 600, color: '#2d6a4f', border: '1px solid #2d6a4f', borderRadius: 99, padding: '2px 9px', textDecoration: 'none', flexShrink: 0 },
  shopItemRoom: { fontSize: 12, color: '#78716c', background: '#f5f0e8', borderRadius: 99, padding: '2px 10px', flexShrink: 0, marginLeft: 'auto' },
  dragHandle: { fontSize: 14, color: '#d1c4ae', cursor: 'grab', flexShrink: 0, paddingRight: 6, userSelect: 'none' },
  confirmBanner: { background: '#fff', border: '1.5px solid #d97706', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  confirmText: { fontSize: 13, color: '#1c1917', lineHeight: 1.5, margin: 0 },
  confirmButtons: { display: 'flex', gap: 8, flexShrink: 0 },
  confirmCancel: { padding: '6px 14px', borderRadius: 8, border: '1px solid #e7e5e4', background: '#fff', color: '#78716c', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  confirmOk: { padding: '6px 14px', borderRadius: 8, border: 'none', background: '#d97706', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  // Utilities
  utilities: { maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 },
  utilCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #f0ebe3', borderRadius: 12, padding: '14px 18px', gap: 12, flexWrap: 'wrap' },
  utilLeft: { display: 'flex', flexDirection: 'column', gap: 2 },
  utilLabel: { fontSize: 15, fontWeight: 600, color: '#1c1917' },
  utilNote: { fontSize: 12, color: '#78716c' },
  utilBadge: { fontSize: 12, fontWeight: 700, borderRadius: 99, padding: '4px 12px', flexShrink: 0 },
  // All done
  allDone: { textAlign: 'center', padding: '60px 0', color: '#1c1917' },
};

// ── Page root ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('home_unlocked') === 'yes') {
      setUnlocked(true);
    }
  }, []);

  function handleUnlock() {
    sessionStorage.setItem('home_unlocked', 'yes');
    setUnlocked(true);
  }

  return (
    <Layout title="Our Home" description="">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-5px); }
          80%       { transform: translateX(5px); }
        }
      `}</style>
      {unlocked ? <HomeApp /> : <PinGate onUnlock={handleUnlock} />}
    </Layout>
  );
}
