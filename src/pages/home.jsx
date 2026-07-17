import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '@theme/Layout';
import { ref, onValue, update, set } from 'firebase/database';
import { db, HOME_STATE_PATH } from '../lib/firebase';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const PRIORITY_LABELS = { high: '🔴 Must', medium: '🟡 Soon', low: '🟢 Nice to have' };
const PRIORITY_COLORS = { high: '#dc2626', medium: '#d97706', low: '#16a34a' };

const RETAILERS = ['amazon', 'ikea', 'ebay', 'obi', 'other'];
const RETAILER_LABELS = { amazon: '📦 Amazon', ikea: '🟦 IKEA', ebay: '🛍️ eBay', obi: '🧰 Obi', other: '🏪 Other' };
const RETAILER_COLORS = { amazon: '#ff9900', ikea: '#0058a3', ebay: '#e53238', obi: '#e2001a', other: '#78716c' };
const RETAILER_UNSET_LABEL = '🏷️ Pick retailer';
const RETAILER_UNSET_COLOR = '#a8a29e';

function retailerLabel(r) {
  return r && r !== 'unset' ? RETAILER_LABELS[r] : RETAILER_UNSET_LABEL;
}

function retailerStyle(r) {
  const color = r && r !== 'unset' ? RETAILER_COLORS[r] : RETAILER_UNSET_COLOR;
  return { color, borderColor: color };
}

function formatLink(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const path = u.pathname !== '/' ? u.pathname.replace(/\/$/, '') : '';
    return { host, path };
  } catch {
    return { host: url, path: '' };
  }
}

const HOSTNAME_PATTERN = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

function normalizeUrl(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withProtocol);
    if (!HOSTNAME_PATTERN.test(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

// ── Link chips (shared by Rooms and Shopping tabs) ─────────────────────────────

function LinkChips({ urls, onRemove }) {
  if (!urls.length) return null;
  return (
    <div style={s.linksRow}>
      {urls.map(url => {
        const { host, path } = formatLink(url);
        return (
          <span key={url} style={s.linkChip}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={s.linkChipLink}
              onClick={e => e.stopPropagation()}
              title={url}
            >
              <span style={s.linkChipHost}>{host}</span>
              {path && <span style={s.linkChipPath}>{path}</span>}
            </a>
            <button
              style={s.linkChipRemove}
              title="Remove link"
              onClick={e => { e.stopPropagation(); onRemove(url); }}
            >×</button>
          </span>
        );
      })}
    </div>
  );
}

function AddLinkCard({ card, onAdd, onClose }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  function submit() {
    const normalized = normalizeUrl(value);
    if (!normalized) { setError(true); return; }
    onAdd(card.id, normalized);
    onClose();
  }

  return (
    <div
      style={{ position: 'fixed', top: card.y, left: card.x, zIndex: 1000, background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.13)', padding: '10px 14px', minWidth: 240 }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ fontSize: 11, color: '#a8a29e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
        {card.label}
      </div>
      <input
        autoFocus
        value={value}
        onChange={e => { setValue(e.target.value); setError(false); }}
        onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        placeholder="Paste a product link…"
        style={s.linkAddInput}
      />
      {error && <div style={s.linkAddError}>That doesn't look like a valid URL.</div>}
      <div style={s.linkAddActions}>
        <button style={s.wizardBtnGhost} onClick={onClose}>Cancel</button>
        <button style={s.wizardBtnPrimary} onClick={submit}>Add link</button>
      </div>
    </div>
  );
}

function CategoryPickerCard({ card, rooms, onMove, onClose }) {
  return (
    <div
      style={{ position: 'fixed', top: card.y, left: card.x, zIndex: 1000, background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.13)', padding: '10px 14px', minWidth: 200 }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ fontSize: 11, color: '#a8a29e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
        {card.label}
      </div>
      <div style={s.wizardOptionList}>
        {rooms.filter(r => r.id !== card.currentRoomId).map(room => (
          <button
            key={room.id}
            style={s.wizardOptionBtn}
            onClick={() => { onMove(card.item, room.id); onClose(); }}
          >
            {room.emoji} {room.name}
          </button>
        ))}
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
  const [shared, setShared] = useState(null);
  const [tab, setTab] = useState('rooms');

  useEffect(() => {
    fetch('/data/home-data.json')
      .then(r => r.json())
      .then(setData);
  }, []);

  // Live-synced shared state — everyone with the page open sees the same
  // tree and gets pushed updates within ~1s of any write (Firebase Realtime
  // Database `onValue`), replacing the old per-browser localStorage copy.
  useEffect(() => {
    const sharedRef = ref(db, HOME_STATE_PATH);
    const unsubscribe = onValue(sharedRef, snap => setShared(snap.val() || {}));
    return () => unsubscribe();
  }, []);

  // Each mutation targets a single sub-path so two people editing different
  // items concurrently never clobber each other's unrelated writes.
  function toggleChecked(id) {
    const current = (shared.checked || {})[id];
    update(ref(db, `${HOME_STATE_PATH}/checked`), { [id]: !current });
  }

  function setOwnedOverride(id, isOwned) {
    update(ref(db, `${HOME_STATE_PATH}/ownedOverride`), { [id]: isOwned });
  }

  function handlePriorityChange(id, priority) {
    update(ref(db, `${HOME_STATE_PATH}/priorities`), { [id]: priority });
  }

  function setRetailer(id, retailer) {
    update(ref(db, `${HOME_STATE_PATH}/retailers`), { [id]: retailer });
  }

  function setUtilStatus(id, status) {
    update(ref(db, `${HOME_STATE_PATH}/utilStatus`), { [id]: status });
  }

  function addLink(id, url) {
    const current = (shared.links || {})[id] || [];
    if (current.includes(url)) return;
    set(ref(db, `${HOME_STATE_PATH}/links/${id}`), [...current, url]);
  }

  function removeLink(id, url) {
    const current = (shared.links || {})[id] || [];
    set(ref(db, `${HOME_STATE_PATH}/links/${id}`), current.filter(u => u !== url));
  }

  function addCategory({ name, emoji }) {
    const id = `category_${crypto.randomUUID()}`;
    update(ref(db, `${HOME_STATE_PATH}/customRooms`), { [id]: { name, emoji, createdAt: Date.now() } });
  }

  function moveItemToRoom(item, roomId) {
    if (item.isCustom) {
      update(ref(db, `${HOME_STATE_PATH}/customItems/${item.id}`), { roomId });
    } else {
      update(ref(db, `${HOME_STATE_PATH}/roomOverride`), { [item.id]: roomId });
    }
  }

  function reorderShoppingGroup(priority, orderedIds) {
    set(ref(db, `${HOME_STATE_PATH}/order/${priority}`), orderedIds);
  }

  // Unlike the single-subpath setters above, addItem/deleteCustomItem
  // create or destroy a multi-field entity, so each uses one atomic
  // multi-path update() — a partial write here (e.g. a customItems entry
  // with no matching priorities entry) would break rendering, not just
  // leave things untidy.
  function addItem({ label, roomId, priority, retailer }) {
    const id = `custom_${crypto.randomUUID()}`;
    const updates = {
      [`customItems/${id}`]: { label, roomId, createdAt: Date.now() },
      [`priorities/${id}`]: priority,
    };
    if (retailer) updates[`retailers/${id}`] = retailer;
    update(ref(db, HOME_STATE_PATH), updates);
  }

  function deleteCustomItem(id) {
    const currentOrder = shared.order || {};
    const updates = {
      [`customItems/${id}`]: null,
      [`checked/${id}`]: null,
      [`ownedOverride/${id}`]: null,
      [`priorities/${id}`]: null,
      [`retailers/${id}`]: null,
      [`links/${id}`]: null,
    };
    ['high', 'medium', 'low'].forEach(p => {
      if ((currentOrder[p] || []).includes(id)) {
        updates[`order/${p}`] = currentOrder[p].filter(x => x !== id);
      }
    });
    update(ref(db, HOME_STATE_PATH), updates);
  }

  // Fold user-added items and categories (Firebase-only) into the static
  // room catalog so everything downstream (progress count, buy/owned
  // filters, shopping list, priority/retailer grouping) treats them
  // identically to catalog items/rooms — no other changes needed in
  // RoomsTab/ShoppingTab for this. `roomOverride` lets a static catalog
  // item be reassigned to any room even though its room membership is
  // otherwise implicit in the JSON nesting; custom items already carry a
  // mutable `roomId` field, so they don't need an override.
  // Computed unconditionally (before the loading gate below) since hooks
  // must run in the same order on every render.
  const mergedRooms = useMemo(() => {
    if (!data) return [];
    const customItems = (shared && shared.customItems) || {};
    const customRooms = (shared && shared.customRooms) || {};
    const roomOverride = (shared && shared.roomOverride) || {};

    const allRooms = [
      ...data.rooms.map(({ items, ...room }) => room),
      ...Object.entries(customRooms).map(([id, c]) => ({ id, name: c.name, emoji: c.emoji })),
    ];

    const allItems = [
      ...data.rooms.flatMap(room =>
        room.items.map(item => ({ ...item, roomId: roomOverride[item.id] || room.id }))),
      ...Object.entries(customItems).map(([id, c]) => ({ id, label: c.label, isCustom: true, roomId: c.roomId })),
    ];

    return allRooms.map(room => ({ ...room, items: allItems.filter(i => i.roomId === room.id) }));
  }, [data, shared]);

  if (!data || shared === null) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8a29e', fontSize: 15 }}>
        Loading…
      </div>
    );
  }

  const checked = shared.checked || {};
  const ownedOverride = shared.ownedOverride || {};
  const priorities = shared.priorities || {};
  const order = shared.order || {};
  const retailers = shared.retailers || {};
  const utilStatuses = shared.utilStatus || {};
  const links = shared.links || {};

  // Progress: only count non-owned items
  const allBuyItems = mergedRooms.flatMap(r => r.items).filter(i => !i.owned);
  const doneCount = allBuyItems.filter(i => checked[i.id]).length;
  const progress = Math.round((doneCount / allBuyItems.length) * 100);

  const shoppingItems = mergedRooms
    .flatMap(r => r.items.map(i => ({ ...i, room: r.name, roomId: r.id })))
    .filter(i => !checked[i.id] && (!i.owned || ownedOverride[i.id] === false) && ownedOverride[i.id] !== true)
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
      <Timeline items={data.timeline} state={checked} toggle={toggleChecked} />

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

      {tab === 'rooms' && (
        <RoomsTab
          rooms={mergedRooms}
          utilities={data.utilities}
          checked={checked}
          ownedOverride={ownedOverride}
          toggleChecked={toggleChecked}
          setOwnedOverride={setOwnedOverride}
          priorities={priorities}
          onPriorityChange={handlePriorityChange}
          retailers={retailers}
          setRetailer={setRetailer}
          utilStatuses={utilStatuses}
          setUtilStatus={setUtilStatus}
          links={links}
          addLink={addLink}
          removeLink={removeLink}
          addItem={addItem}
          deleteCustomItem={deleteCustomItem}
          moveItemToRoom={moveItemToRoom}
          addCategory={addCategory}
        />
      )}
      {tab === 'shopping' && (
        <ShoppingTab
          items={shoppingItems}
          priorities={priorities}
          order={order}
          onPriorityChange={handlePriorityChange}
          reorderShoppingGroup={reorderShoppingGroup}
          setOwnedOverride={setOwnedOverride}
          retailers={retailers}
          setRetailer={setRetailer}
          links={links}
          addLink={addLink}
          removeLink={removeLink}
          deleteCustomItem={deleteCustomItem}
          rooms={mergedRooms}
          moveItemToRoom={moveItemToRoom}
        />
      )}
    </div>
  );
}

// ── Rooms tab ─────────────────────────────────────────────────────────────────

const PRIORITY_CYCLE = { high: 'medium', medium: 'low', low: 'high' };

function RoomsTab({ rooms, utilities, checked, ownedOverride, toggleChecked, setOwnedOverride, priorities, onPriorityChange, retailers, setRetailer, utilStatuses, setUtilStatus, links, addLink, removeLink, addItem, deleteCustomItem, moveItemToRoom, addCategory }) {
  const [contextMenu, setContextMenu] = useState(null); // { id, label, type, roomId, isCustom, x, y }
  const [retailerCard, setRetailerCard] = useState(null); // { id, label, x, y }
  const [utilStatusCard, setUtilStatusCard] = useState(null); // { id, label, x, y }
  const [linkCard, setLinkCard] = useState(null); // { id, label, x, y }
  const [categoryCard, setCategoryCard] = useState(null); // { item, label, currentRoomId, x, y }
  const [swipeDx, setSwipeDx] = useState({});
  const touchRef = useRef({});
  const [hoverItemId, setHoverItemId] = useState(null);

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [contextMenu]);

  useEffect(() => {
    if (!retailerCard) return;
    const close = () => setRetailerCard(null);
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [retailerCard]);

  useEffect(() => {
    if (!utilStatusCard) return;
    const close = () => setUtilStatusCard(null);
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [utilStatusCard]);

  useEffect(() => {
    if (!linkCard) return;
    const close = () => setLinkCard(null);
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [linkCard]);

  useEffect(() => {
    if (!categoryCard) return;
    const close = () => setCategoryCard(null);
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [categoryCard]);

  function unownItem(id) {
    setOwnedOverride(id, false);
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
        const buyItems = room.items.filter(i => (!i.owned || ownedOverride[i.id] === false) && ownedOverride[i.id] !== true);
        const ownedItems = room.items.filter(i => (i.owned && ownedOverride[i.id] !== false) || ownedOverride[i.id] === true);
        const done = buyItems.filter(i => checked[i.id]).length;
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
                  const effP = priorities[item.id]
                    || (item.owned ? (item.defaultPriority || 'medium') : item.priority);
                  const effR = retailers[item.id] || 'unset';
                  return (
                    <li
                      key={item.id}
                      style={s.itemRow}
                      onMouseEnter={() => setHoverItemId(item.id)}
                      onMouseLeave={() => setHoverItemId(null)}
                    >
                      <span
                        style={{ ...s.checkbox, ...(checked[item.id] ? s.checkboxDone : {}) }}
                        onClick={() => toggleChecked(item.id)}
                      >
                        {checked[item.id] ? '✓' : ''}
                      </span>
                      <div style={s.itemContent} onClick={() => toggleChecked(item.id)}>
                        <span style={{ ...s.itemLabel, ...(checked[item.id] ? s.itemLabelDone : {}) }}>
                          {item.label}
                        </span>
                        {item.reportUrl && !checked[item.id] && (
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
                        {item.deliveryHint && !checked[item.id] && (
                          <span style={s.deliveryHint}>⏱ {item.deliveryHint}</span>
                        )}
                        {!checked[item.id] && (
                          <LinkChips
                            urls={links[item.id] || []}
                            onRemove={url => removeLink(item.id, url)}
                          />
                        )}
                      </div>
                      {!checked[item.id] && (
                        <>
                          <span
                            style={{ ...s.badge, color: PRIORITY_COLORS[effP], borderColor: PRIORITY_COLORS[effP], cursor: 'pointer' }}
                            title="Click to change priority"
                            onClick={e => { e.stopPropagation(); onPriorityChange(item.id, PRIORITY_CYCLE[effP]); }}
                          >
                            {PRIORITY_LABELS[effP]}
                          </span>
                          <span
                            style={{ ...s.retailerBadge, ...retailerStyle(effR) }}
                            title="Click to set retailer"
                            onClick={e => { e.stopPropagation(); setRetailerCard({ id: item.id, label: item.label, x: e.clientX, y: e.clientY }); }}
                          >
                            {retailerLabel(effR)}
                          </span>
                          {hoverItemId === item.id && (
                            <button
                              style={s.dotMenuBtn}
                              onClick={e => { e.stopPropagation(); setContextMenu({ id: item.id, label: item.label, type: 'moveToOwned', isCustom: !!item.isCustom, roomId: room.id, x: e.clientX, y: e.clientY }); }}
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
                              onClick={e => { e.stopPropagation(); setContextMenu({ id: item.id, label: item.label, type: 'moveToList', isCustom: !!item.isCustom, roomId: room.id, x: e.clientX, y: e.clientY }); }}
                            >⋯</button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Add a new item to this category — inline step-by-step flow, no modal */}
            <AddItemCard roomId={room.id} addItem={addItem} />
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
              {utilities.filter(u => (utilStatuses[u.id] || u.status) === 'included').length}/{utilities.length} sorted
            </span>
          </div>
        </div>
        <ul style={s.itemList}>
          {utilities.map(u => {
            const effStatus = utilStatuses[u.id] || u.status;
            const st = UTIL_STATUS[effStatus];
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
                <span
                  style={{ ...s.utilBadge, background: st.bg, color: st.color, cursor: 'pointer' }}
                  title="Click to change status"
                  onClick={e => { e.stopPropagation(); setUtilStatusCard({ id: u.id, label: u.label, x: e.clientX, y: e.clientY }); }}
                >
                  {st.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Add a new category — inline step-by-step flow, no modal */}
      <AddCategoryCard addCategory={addCategory} />
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
              setOwnedOverride(contextMenu.id, true);
              setContextMenu(null);
            }}
          >
            ✓ Move to Already have
          </button>
        )}
        <button
          style={{ display: 'block', width: '100%', padding: '8px 14px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#1c1917', fontWeight: 500 }}
          onClick={() => {
            setLinkCard({ id: contextMenu.id, label: contextMenu.label, x: contextMenu.x, y: contextMenu.y });
            setContextMenu(null);
          }}
        >
          🔗 Add link
        </button>
        <button
          style={{ display: 'block', width: '100%', padding: '8px 14px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#1c1917', fontWeight: 500 }}
          onClick={() => {
            setCategoryCard({
              item: { id: contextMenu.id, isCustom: contextMenu.isCustom },
              label: contextMenu.label,
              currentRoomId: contextMenu.roomId,
              x: contextMenu.x,
              y: contextMenu.y,
            });
            setContextMenu(null);
          }}
        >
          ↔ Move to category
        </button>
        {contextMenu.isCustom && (
          <>
            <div style={s.menuDivider} />
            <button
              style={s.menuDangerItem}
              onClick={() => { deleteCustomItem(contextMenu.id); setContextMenu(null); }}
            >
              🗑 Delete item
            </button>
          </>
        )}
      </div>
    )}

    {/* Retailer picker card */}
    {retailerCard && (
      <div
        style={{ position: 'fixed', top: retailerCard.y, left: retailerCard.x, zIndex: 1000, background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.13)', padding: '10px 14px', minWidth: 200 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 11, color: '#a8a29e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
          {retailerCard.label}
        </div>
        <select
          value={retailers[retailerCard.id] || ''}
          onChange={e => { setRetailer(retailerCard.id, e.target.value); setRetailerCard(null); }}
          style={s.retailerSelect}
          autoFocus
        >
          <option value="" disabled>Pick retailer…</option>
          {RETAILERS.map(r => <option key={r} value={r}>{RETAILER_LABELS[r]}</option>)}
        </select>
      </div>
    )}

    {/* Utility status picker card */}
    {utilStatusCard && (
      <div
        style={{ position: 'fixed', top: utilStatusCard.y, left: utilStatusCard.x, zIndex: 1000, background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.13)', padding: '10px 14px', minWidth: 200 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 11, color: '#a8a29e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
          {utilStatusCard.label}
        </div>
        <select
          value={utilStatuses[utilStatusCard.id] || ''}
          onChange={e => { setUtilStatus(utilStatusCard.id, e.target.value); setUtilStatusCard(null); }}
          style={s.retailerSelect}
          autoFocus
        >
          <option value="" disabled>Pick status…</option>
          {Object.keys(UTIL_STATUS).map(key => <option key={key} value={key}>{UTIL_STATUS[key].label}</option>)}
        </select>
      </div>
    )}

    {/* Add-link card */}
    {linkCard && (
      <AddLinkCard card={linkCard} onAdd={addLink} onClose={() => setLinkCard(null)} />
    )}

    {/* Category picker card */}
    {categoryCard && (
      <CategoryPickerCard card={categoryCard} rooms={rooms} onMove={moveItemToRoom} onClose={() => setCategoryCard(null)} />
    )}
    </>
  );
}

// ── Add item wizard (inline, no modal) ────────────────────────────────────────

const ADD_ITEM_STEP_LABELS = ['Name', 'Priority', 'Retailer', 'Review'];

function AddItemCard({ roomId, addItem }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({ label: '', priority: 'medium', retailer: null });

  function reset() {
    setOpen(false);
    setStep(0);
    setDraft({ label: '', priority: 'medium', retailer: null });
  }

  function submit() {
    addItem({ ...draft, roomId });
    reset();
  }

  if (!open) {
    return (
      <button style={s.addItemRow} onClick={() => setOpen(true)}>
        <span style={s.addItemPlus}>+</span>
        Add item
      </button>
    );
  }

  const canNext = step === 0 ? draft.label.trim().length > 0 : true;

  return (
    <div style={s.wizardInline}>
      <div style={s.wizardHeader}>
        <span style={s.wizardStepLabel}>{ADD_ITEM_STEP_LABELS[step]} · {step + 1}/4</span>
        <button style={s.wizardClose} onClick={reset} title="Cancel">×</button>
      </div>

      {step === 0 && (
        <input
          autoFocus
          value={draft.label}
          onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
          placeholder="e.g. Standing desk lamp"
          style={s.wizardInput}
        />
      )}

      {step === 1 && (
        <div style={s.wizardOptionList}>
          {['high', 'medium', 'low'].map(p => (
            <button
              key={p}
              style={{
                ...s.wizardOptionBtn,
                ...(draft.priority === p ? { ...s.wizardOptionBtnActive, borderColor: PRIORITY_COLORS[p], color: PRIORITY_COLORS[p] } : {}),
              }}
              onClick={() => setDraft(d => ({ ...d, priority: p }))}
            >
              {PRIORITY_LABELS[p]}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div style={s.wizardOptionList}>
          {RETAILERS.map(r => (
            <button
              key={r}
              style={{
                ...s.wizardOptionBtn,
                ...(draft.retailer === r ? { ...s.wizardOptionBtnActive, borderColor: RETAILER_COLORS[r], color: RETAILER_COLORS[r] } : {}),
              }}
              onClick={() => setDraft(d => ({ ...d, retailer: r }))}
            >
              {RETAILER_LABELS[r]}
            </button>
          ))}
          <button
            style={{ ...s.wizardOptionBtn, ...(draft.retailer === null ? s.wizardOptionBtnActive : {}) }}
            onClick={() => setDraft(d => ({ ...d, retailer: null }))}
          >
            {RETAILER_UNSET_LABEL}
          </button>
        </div>
      )}

      {step === 3 && (
        <div style={s.wizardReview}>
          <p style={s.wizardReviewLabel}>{draft.label}</p>
          <div style={s.wizardReviewBadges}>
            <span style={{ ...s.badge, color: PRIORITY_COLORS[draft.priority], borderColor: PRIORITY_COLORS[draft.priority] }}>
              {PRIORITY_LABELS[draft.priority]}
            </span>
            <span style={{ ...s.retailerBadge, ...retailerStyle(draft.retailer || 'unset') }}>
              {retailerLabel(draft.retailer || 'unset')}
            </span>
          </div>
        </div>
      )}

      <div style={s.wizardNav}>
        {step > 0 && <button style={s.wizardBtnGhost} onClick={() => setStep(x => x - 1)}>← Back</button>}
        {step < 3 && (
          <button
            style={{ ...s.wizardBtnPrimary, ...(canNext ? {} : s.wizardBtnDisabled) }}
            disabled={!canNext}
            onClick={() => setStep(x => x + 1)}
          >
            Next →
          </button>
        )}
        {step === 3 && (
          <button style={s.wizardBtnPrimary} onClick={submit}>✓ Add item</button>
        )}
      </div>
    </div>
  );
}

// ── Add category wizard (inline, no modal) ────────────────────────────────────

const ADD_CATEGORY_STEP_LABELS = ['Name', 'Emoji', 'Review'];

function AddCategoryCard({ addCategory }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({ name: '', emoji: '' });

  function reset() {
    setOpen(false);
    setStep(0);
    setDraft({ name: '', emoji: '' });
  }

  function submit() {
    addCategory(draft);
    reset();
  }

  if (!open) {
    return (
      <button style={s.addItemTile} onClick={() => setOpen(true)}>
        <span style={s.addItemPlus}>+</span>
        Add category
      </button>
    );
  }

  const canNext = step === 0 ? draft.name.trim().length > 0 : step === 1 ? draft.emoji.trim().length > 0 : true;

  return (
    <div style={s.card}>
      <div style={s.wizardHeader}>
        <span style={s.wizardStepLabel}>{ADD_CATEGORY_STEP_LABELS[step]} · {step + 1}/3</span>
        <button style={s.wizardClose} onClick={reset} title="Cancel">×</button>
      </div>

      {step === 0 && (
        <input
          autoFocus
          value={draft.name}
          onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
          placeholder="e.g. Balcony"
          style={s.wizardInput}
        />
      )}

      {step === 1 && (
        <input
          autoFocus
          value={draft.emoji}
          onChange={e => setDraft(d => ({ ...d, emoji: e.target.value }))}
          placeholder="🪴"
          style={s.wizardInput}
        />
      )}

      {step === 2 && (
        <div style={s.wizardReview}>
          <p style={s.wizardReviewLabel}>{draft.emoji} {draft.name}</p>
        </div>
      )}

      <div style={s.wizardNav}>
        {step > 0 && <button style={s.wizardBtnGhost} onClick={() => setStep(x => x - 1)}>← Back</button>}
        {step < 2 && (
          <button
            style={{ ...s.wizardBtnPrimary, ...(canNext ? {} : s.wizardBtnDisabled) }}
            disabled={!canNext}
            onClick={() => setStep(x => x + 1)}
          >
            Next →
          </button>
        )}
        {step === 2 && (
          <button style={s.wizardBtnPrimary} onClick={submit}>✓ Add category</button>
        )}
      </div>
    </div>
  );
}

// ── Shopping tab ──────────────────────────────────────────────────────────────

function ShoppingTab({ items, priorities, order, onPriorityChange, reorderShoppingGroup, setOwnedOverride, retailers, setRetailer, links, addLink, removeLink, deleteCustomItem, rooms, moveItemToRoom }) {
  const dragId = useRef(null);
  const dragPriority = useRef(null);
  const [dragOver, setDragOver] = useState(null);
  const [pending, setPending] = useState(null);
  const [shopCtx, setShopCtx] = useState(null); // { id, label, owned, roomId, isCustom, x, y }
  const [retailerCard, setRetailerCard] = useState(null); // { id, label, x, y }
  const [linkCard, setLinkCard] = useState(null); // { id, label, x, y }
  const [categoryCard, setCategoryCard] = useState(null); // { item, label, currentRoomId, x, y }
  const [retailerFilter, setRetailerFilter] = useState('all');
  const [shopSwipe, setShopSwipe] = useState({});
  const shopTouchRef = useRef({});
  const [hoverShopId, setHoverShopId] = useState(null);

  useEffect(() => {
    if (!shopCtx) return;
    const close = () => setShopCtx(null);
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [shopCtx]);

  useEffect(() => {
    if (!retailerCard) return;
    const close = () => setRetailerCard(null);
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [retailerCard]);

  useEffect(() => {
    if (!linkCard) return;
    const close = () => setLinkCard(null);
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [linkCard]);

  useEffect(() => {
    if (!categoryCard) return;
    const close = () => setCategoryCard(null);
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [categoryCard]);

  function moveToAlreadyHave(item) {
    setOwnedOverride(item.id, true);
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
    return priorities[item.id] || item.priority;
  }

  function effRetailer(item) {
    return retailers[item.id] || 'unset';
  }

  function orderedGroup(priority, groupItems) {
    const groupOrder = order[priority] || [];
    if (!groupOrder.length) return groupItems;
    return [...groupItems].sort((a, b) => {
      const ai = groupOrder.indexOf(a.id);
      const bi = groupOrder.indexOf(b.id);
      if (ai < 0 && bi < 0) return 0;
      if (ai < 0) return 1;
      if (bi < 0) return -1;
      return ai - bi;
    });
  }

  // Retailer filter narrows the item set; Must/Soon/Nice-to-have grouping
  // below is unchanged and simply applies to the (possibly narrower) set.
  const filteredItems = retailerFilter === 'all'
    ? items
    : items.filter(i => effRetailer(i) === retailerFilter);

  const grouped = { high: [], medium: [], low: [] };
  filteredItems.forEach(i => grouped[effPriority(i)].push(i));

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
      reorderShoppingGroup(srcPriority, without.map(i => i.id));
    } else {
      setPending({ id: srcId, label: srcItem.label, from: srcPriority, to: tgtPriority, targetId: targetItem.id, pos: over?.pos });
    }
  }

  function confirmMove() {
    if (!pending) return;
    const { id, from, to, targetId, pos } = pending;
    const fromOrder = (order[from] || []).filter(x => x !== id);
    const toGroupItems = orderedGroup(to, grouped[to]);
    const toOrder = toGroupItems.map(i => i.id);
    const tgtIdx = toOrder.indexOf(targetId);
    if (tgtIdx >= 0) toOrder.splice(pos === 'before' ? tgtIdx : tgtIdx + 1, 0, id);
    else toOrder.push(id);
    onPriorityChange(id, to);
    reorderShoppingGroup(from, fromOrder);
    reorderShoppingGroup(to, toOrder);
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
      {/* Retailer filter — narrows the list below while keeping priority groups */}
      <div style={s.filterBar}>
        {[['all', 'All'], ...RETAILERS.map(r => [r, RETAILER_LABELS[r]])].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setRetailerFilter(key)}
            style={{ ...s.filterBtn, ...(retailerFilter === key ? s.filterBtnActive : {}) }}
          >
            {label}
          </button>
        ))}
      </div>

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

      {filteredItems.length === 0 && (
        <p style={{ textAlign: 'center', color: '#a8a29e', fontSize: 14, margin: '24px 0' }}>
          No items for this retailer yet.
        </p>
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
              const effR = effRetailer(item);
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
                      <LinkChips
                        urls={links[item.id] || []}
                        onRemove={url => removeLink(item.id, url)}
                      />
                    </div>
                    <span
                      style={{ ...s.retailerBadge, ...retailerStyle(effR), marginLeft: 'auto' }}
                      title="Click to set retailer"
                      onClick={e => { e.stopPropagation(); setRetailerCard({ id: item.id, label: item.label, x: e.clientX, y: e.clientY }); }}
                    >
                      {retailerLabel(effR)}
                    </span>
                    <span style={s.shopItemRoom}>{item.room}</span>
                    {hoverShopId === item.id && (
                      <button
                        style={s.dotMenuBtn}
                        onClick={e => { e.stopPropagation(); setShopCtx({ id: item.id, label: item.label, owned: item.owned, isCustom: !!item.isCustom, roomId: item.roomId, x: e.clientX, y: e.clientY }); }}
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
        <button
          style={{ display: 'block', width: '100%', padding: '8px 14px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#1c1917', fontWeight: 500 }}
          onClick={() => {
            setLinkCard({ id: shopCtx.id, label: shopCtx.label, x: shopCtx.x, y: shopCtx.y });
            setShopCtx(null);
          }}
        >
          🔗 Add link
        </button>
        <button
          style={{ display: 'block', width: '100%', padding: '8px 14px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#1c1917', fontWeight: 500 }}
          onClick={() => {
            setCategoryCard({
              item: { id: shopCtx.id, isCustom: shopCtx.isCustom },
              label: shopCtx.label,
              currentRoomId: shopCtx.roomId,
              x: shopCtx.x,
              y: shopCtx.y,
            });
            setShopCtx(null);
          }}
        >
          ↔ Move to category
        </button>
        {shopCtx.isCustom && (
          <>
            <div style={s.menuDivider} />
            <button
              style={s.menuDangerItem}
              onClick={() => { deleteCustomItem(shopCtx.id); setShopCtx(null); }}
            >
              🗑 Delete item
            </button>
          </>
        )}
      </div>
    )}

    {/* Retailer picker card */}
    {retailerCard && (
      <div
        style={{ position: 'fixed', top: retailerCard.y, left: retailerCard.x, zIndex: 1000, background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.13)', padding: '10px 14px', minWidth: 200 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 11, color: '#a8a29e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
          {retailerCard.label}
        </div>
        <select
          value={retailers[retailerCard.id] || ''}
          onChange={e => { setRetailer(retailerCard.id, e.target.value); setRetailerCard(null); }}
          style={s.retailerSelect}
          autoFocus
        >
          <option value="" disabled>Pick retailer…</option>
          {RETAILERS.map(r => <option key={r} value={r}>{RETAILER_LABELS[r]}</option>)}
        </select>
      </div>
    )}

    {/* Add-link card */}
    {linkCard && (
      <AddLinkCard card={linkCard} onAdd={addLink} onClose={() => setLinkCard(null)} />
    )}

    {/* Category picker card */}
    {categoryCard && (
      <CategoryPickerCard card={categoryCard} rooms={rooms} onMove={moveItemToRoom} onClose={() => setCategoryCard(null)} />
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
  // App shell
  app: { maxWidth: 1280, margin: '0 auto', padding: '32px 16px' },
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(360px, 100%), 1fr))', gap: 20 },
  card: { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0ebe3' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
  cardEmoji: { fontSize: 32 },
  cardTitle: { margin: '0 0 2px', fontSize: 17, fontWeight: 700, color: '#1c1917' },
  cardProgress: { fontSize: 12, color: '#78716c' },
  itemList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 0 },
  itemRow: { display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, padding: '10px 0', borderBottom: '1px solid #f5f0e8', userSelect: 'none' },
  checkbox: { width: 20, height: 20, borderRadius: 6, border: '2px solid #d1c4ae', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0, transition: 'all 0.15s', background: 'transparent', cursor: 'pointer', marginTop: 1 },
  checkboxDone: { background: '#16a34a', borderColor: '#16a34a' },
  itemContent: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer', minWidth: 0 },
  itemLabel: { fontSize: 14, color: '#1c1917' },
  itemLabelDone: { textDecoration: 'line-through', color: '#a8a29e' },
  reportBtn: { display: 'inline-block', fontSize: 11, fontWeight: 600, color: '#2d6a4f', border: '1px solid #2d6a4f', borderRadius: 99, padding: '2px 9px', textDecoration: 'none', alignSelf: 'flex-start' },
  deliveryHint: { fontSize: 11, color: '#78716c', fontStyle: 'italic', alignSelf: 'flex-start' },
  badge: { fontSize: 11, fontWeight: 600, border: '1px solid', borderRadius: 99, padding: '1px 7px', flexShrink: 0, marginTop: 2 },
  retailerBadge: { fontSize: 11, fontWeight: 600, border: '1px solid', borderRadius: 99, padding: '1px 7px', flexShrink: 0, marginTop: 2, cursor: 'pointer' },
  retailerSelect: { fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '1px solid #d1c4ae', background: '#faf8f3', color: '#1c1917', width: '100%', boxSizing: 'border-box' },
  linksRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  linkChip: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, border: '1px solid #d1c4ae', borderRadius: 99, padding: '2px 4px 2px 9px', background: '#faf8f3' },
  linkChipLink: { display: 'inline-flex', alignItems: 'center', gap: 4, color: '#57534e', textDecoration: 'none', maxWidth: 180, overflow: 'hidden' },
  linkChipHost: { color: '#2d6a4f', fontWeight: 700, whiteSpace: 'nowrap' },
  linkChipPath: { color: '#a8a29e', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 },
  linkChipRemove: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#a8a29e', lineHeight: 1, padding: '0 4px', flexShrink: 0 },
  linkAddInput: { fontSize: 13, padding: '8px 10px', borderRadius: 8, border: '1px solid #d1c4ae', background: '#faf8f3', color: '#1c1917', width: '100%', boxSizing: 'border-box' },
  linkAddError: { fontSize: 11, color: '#dc2626', marginTop: 4 },
  linkAddActions: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  menuDivider: { height: 1, background: '#f0ebe3', margin: '4px 0' },
  menuDangerItem: { display: 'block', width: '100%', padding: '8px 14px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#dc2626', fontWeight: 500 },
  // Add-item wizard
  addItemTile: { background: '#fff', borderRadius: 16, padding: 20, border: '2px dashed #d1c4ae', color: '#78716c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', minHeight: 84 },
  addItemRow: { width: '100%', background: 'none', borderTop: '1px dashed #e7e5e4', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', color: '#78716c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '10px 0 0', marginTop: 10 },
  addItemPlus: { fontSize: 20, lineHeight: 1 },
  wizardInline: { marginTop: 10, paddingTop: 12, borderTop: '1px dashed #e7e5e4' },
  wizardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  wizardStepLabel: { fontSize: 12, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '.06em' },
  wizardClose: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#78716c', lineHeight: 1, padding: 0 },
  wizardInput: { fontSize: 15, padding: '10px 12px', borderRadius: 10, border: '1px solid #d1c4ae', background: '#faf8f3', color: '#1c1917', width: '100%', boxSizing: 'border-box' },
  wizardOptionList: { display: 'flex', flexDirection: 'column', gap: 8 },
  wizardOptionBtn: { padding: '10px 14px', borderRadius: 10, border: '2px solid #e7e5e4', background: '#fff', color: '#1c1917', cursor: 'pointer', fontSize: 14, fontWeight: 500, textAlign: 'left' },
  wizardOptionBtnActive: { borderColor: '#2d6a4f', background: '#f0f7f3' },
  wizardReview: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 4 },
  wizardReviewLabel: { fontSize: 16, fontWeight: 700, color: '#1c1917', margin: 0 },
  wizardReviewLine: { fontSize: 13, color: '#78716c', margin: 0 },
  wizardReviewBadges: { display: 'flex', gap: 8, marginTop: 4 },
  wizardNav: { display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 18 },
  wizardBtnGhost: { padding: '8px 16px', borderRadius: 8, border: '1px solid #e7e5e4', background: '#fff', color: '#78716c', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  wizardBtnPrimary: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2d6a4f', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginLeft: 'auto' },
  wizardBtnDisabled: { opacity: 0.45, cursor: 'not-allowed' },
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
  filterBar: { display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center', flexWrap: 'wrap' },
  filterBtn: { padding: '6px 16px', borderRadius: 99, border: '2px solid #e7e5e4', background: '#fff', color: '#78716c', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.15s' },
  filterBtnActive: { background: '#2d6a4f', color: '#fff', borderColor: '#2d6a4f' },
  shopGroup: { marginBottom: 28 },
  shopGroupTitle: { fontWeight: 700, marginBottom: 10, fontSize: 16 },
  shopCount: { fontWeight: 400, color: '#78716c' },
  shopList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 },
  shopItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, background: '#fff', border: '1px solid #f0ebe3', borderRadius: 10, padding: '10px 14px' },
  shopItemLeft: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  shopItemLabel: { fontSize: 14, color: '#1c1917', fontWeight: 500 },
  reportBtnShop: { display: 'inline-block', fontSize: 11, fontWeight: 600, color: '#2d6a4f', border: '1px solid #2d6a4f', borderRadius: 99, padding: '2px 9px', textDecoration: 'none', flexShrink: 0 },
  shopItemRoom: { fontSize: 12, color: '#78716c', background: '#f5f0e8', borderRadius: 99, padding: '2px 10px', flexShrink: 0 },
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
  return (
    <Layout title="Our Home" description="">
      <HomeApp />
    </Layout>
  );
}
