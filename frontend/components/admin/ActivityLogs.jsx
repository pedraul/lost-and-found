'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Download, RefreshCw, Search, X } from 'lucide-react';
import adminAPI from '../../services/admin.api';

const CATEGORIES = [
  { id: 'all', label: 'All activity' },
  { id: 'payment', label: 'Payments' },
  { id: 'account', label: 'Accounts' },
  { id: 'item', label: 'Items' },
  { id: 'found_item', label: 'Found items' },
  { id: 'match', label: 'Matches' },
  { id: 'verification', label: 'Verification' },
  { id: 'search', label: 'Searches' },
  { id: 'report', label: 'Reports' },
  { id: 'admin', label: 'Admin actions' },
  { id: 'security', label: 'Security' },
  { id: 'other', label: 'Other' },
];

const CATEGORY_STYLES = {
  payment: 'bg-emerald-100 text-emerald-800',
  account: 'bg-blue-100 text-blue-800',
  item: 'bg-indigo-100 text-indigo-800',
  found_item: 'bg-amber-100 text-amber-800',
  match: 'bg-purple-100 text-purple-800',
  verification: 'bg-cyan-100 text-cyan-800',
  search: 'bg-slate-100 text-slate-700',
  report: 'bg-slate-100 text-slate-700',
  admin: 'bg-orange-100 text-orange-800',
  security: 'bg-red-100 text-red-800',
  other: 'bg-gray-100 text-gray-700',
};

const ROLE_STYLES = {
  admin: 'bg-orange-50 text-orange-700 ring-orange-200',
  system: 'bg-violet-50 text-violet-700 ring-violet-200',
  guest: 'bg-gray-50 text-gray-600 ring-gray-200',
  user: 'bg-blue-50 text-blue-700 ring-blue-200',
};

const PAGE_SIZE = 50;
const EMPTY_FILTERS = { q: '', actor: '', outcome: 'all', role: 'all', action: '', from: '', to: '' };

const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label || id;
const humanize = (value) => String(value || '').replace(/_/g, ' ');

// For system events (Paypack, email, jobs) the linked user is who it concerned, not who did it.
const whoOf = (log) => {
  const isSystem = log.actor_role === 'system';
  const name = log.actor_name || (!isSystem && log.user?.full_name) || null;
  const email = log.actor_email || (!isSystem && log.user?.email) || null;
  return {
    name: name || email || (log.actor_role === 'guest' ? 'Guest visitor' : 'Unknown'),
    email: name && email ? email : null,
    concerning: isSystem && log.user ? (log.user.full_name || log.user.email) : null,
  };
};

function CategoryBadge({ category }) {
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_STYLES[category] || CATEGORY_STYLES.other}`}>{categoryLabel(category)}</span>;
}

function OutcomeBadge({ log }) {
  return log.outcome === 'failure'
    ? <span className="whitespace-nowrap rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">Failed{log.status_code ? ` · ${log.status_code}` : ''}</span>
    : <span className="whitespace-nowrap rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">Success</span>;
}

function RoleBadge({ role }) {
  return <span className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset ${ROLE_STYLES[role] || ROLE_STYLES.user}`}>{role}</span>;
}

function DetailValue({ value }) {
  if (value === null || value === undefined || value === '') return <span className="text-gray-400">—</span>;
  if (typeof value === 'object') {
    return <pre className="whitespace-pre-wrap break-all font-mono text-xs text-gray-700">{JSON.stringify(value, null, 2)}</pre>;
  }
  return <span className="break-all">{String(value)}</span>;
}

function LogDetails({ log }) {
  const metadata = log.metadata && typeof log.metadata === 'object' ? log.metadata : {};
  const rows = [
    ['Log ID', log.id],
    ['Exact time', format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')],
    ['Action code', log.action_type],
    ['Resource', log.resource_id ? `${humanize(log.resource_type)} · ${log.resource_id}` : humanize(log.resource_type)],
    ['Request', log.http_method ? `${log.http_method} ${log.path || ''}` : null],
    ['HTTP status', log.status_code],
    ['IP address', log.ip_address],
    ['Device / browser', log.user_agent],
  ];
  return (
    <div className="grid gap-6 bg-slate-50 px-6 py-5 text-sm md:grid-cols-2">
      <dl className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[130px_1fr] gap-3">
            <dt className="font-medium text-gray-500">{label}</dt>
            <dd className="text-gray-800"><DetailValue value={value} /></dd>
          </div>
        ))}
      </dl>
      <div>
        <p className="mb-2 font-medium text-gray-500">Details</p>
        {Object.keys(metadata).length === 0 ? (
          <p className="text-gray-400">No extra details recorded.</p>
        ) : (
          <dl className="space-y-2 rounded-lg border border-gray-200 bg-white p-3">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="grid grid-cols-[150px_1fr] gap-3">
                <dt className="font-medium capitalize text-gray-500">{humanize(key)}</dt>
                <dd className="text-gray-800"><DetailValue value={value} /></dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

/**
 * Admin audit trail: every payment event, account action, item change, admin
 * action and security event, with filters, search, paging and CSV export.
 *
 * Props:
 *   initialCategory – category to open on (e.g. 'payment')
 *   scope           – optional fixed filter, e.g. { resource_id, label } for one payment
 *   onClearScope    – called when the admin removes that fixed filter
 */
export default function ActivityLogs({ initialCategory = 'all', scope = null, onClearScope }) {
  const [category, setCategory] = useState(initialCategory);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [debounced, setDebounced] = useState(EMPTY_FILTERS);
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState({ logs: [], pagination: { total: 0 }, summary: { failures: 0, categories: {} } });
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [live, setLive] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState(null);
  const requestId = useRef(0);

  useEffect(() => setCategory(initialCategory), [initialCategory]);

  // Typing in the search boxes waits for a pause before querying.
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(filters), 350);
    return () => window.clearTimeout(timer);
  }, [filters]);

  useEffect(() => setOffset(0), [category, debounced, scope]);

  const query = useMemo(() => ({
    ...debounced,
    category,
    resource_id: scope?.resource_id,
    user_id: scope?.user_id,
  }), [debounced, category, scope]);

  const load = useCallback(async ({ quiet = false } = {}) => {
    const id = ++requestId.current;
    if (!quiet) setLoading(true);
    try {
      const result = await adminAPI.getLogs({ ...query, limit: PAGE_SIZE, offset });
      if (id !== requestId.current) return; // a newer request has started
      setData(result);
      setError(null);
    } catch (err) {
      if (id === requestId.current) setError(err.message || 'Could not load activity logs.');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [query, offset]);

  useEffect(() => {
    load();
  }, [load]);

  // Live mode: refresh the first page every 15 seconds while the tab is visible.
  useEffect(() => {
    if (!live || offset !== 0) return undefined;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') load({ quiet: true });
    }, 15000);
    return () => window.clearInterval(timer);
  }, [live, offset, load]);

  useEffect(() => {
    adminAPI.getLogActions().then((result) => setActions(result.actions || [])).catch(() => {});
  }, []);

  const actionOptions = useMemo(
    () => actions.filter((a) => category === 'all' || a.category === category),
    [actions, category]
  );

  const setFilter = (key) => (event) => setFilters((current) => ({ ...current, [key]: event.target.value }));
  const hasFilters = Object.entries(filters).some(([key, value]) => value !== EMPTY_FILTERS[key]);
  const { total } = data.pagination;
  const totalAll = Object.values(data.summary.categories || {}).reduce((sum, n) => sum + n, 0);

  const handleExport = async () => {
    setExporting(true);
    setNotice(null);
    try {
      const { truncated } = await adminAPI.exportLogs(query);
      setNotice(truncated ? 'Export limited to the newest 10,000 entries. Narrow the filters to export the rest.' : null);
    } catch (err) {
      setNotice(err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Activity Logs</h2>
          <p className="mt-1 text-sm text-gray-500">
            Every payment, account, item and admin action on the platform, plus security events. Newest first.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} className="h-4 w-4 accent-blue-600" />
            Live
            {live && offset === 0 && <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" aria-hidden="true" />}
          </label>
          <button type="button" onClick={() => load()} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" /> Refresh
          </button>
          <button type="button" onClick={handleExport} disabled={exporting || total === 0} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" aria-hidden="true" /> {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {notice && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">{notice}</p>}

      {scope && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-900">
          Showing only: <span className="font-semibold">{scope.label}</span>
          <button type="button" onClick={onClearScope} className="ml-auto inline-flex items-center gap-1 rounded px-2 py-1 text-blue-700 hover:bg-blue-100">
            <X className="h-4 w-4" aria-hidden="true" /> Show all
          </button>
        </div>
      )}

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Log category">
        {CATEGORIES.map(({ id, label }) => {
          const count = id === 'all' ? totalAll : data.summary.categories?.[id] || 0;
          if (id !== 'all' && id !== category && count === 0 && !['payment', 'account', 'item', 'admin', 'security'].includes(id)) return null;
          const active = category === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => { setCategory(id); setFilters((f) => ({ ...f, action: '' })); }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${active ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
            >
              {label}
              <span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>{count.toLocaleString()}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative sm:col-span-2">
          <span className="sr-only">Search logs</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input value={filters.q} onChange={setFilter('q')} placeholder="Search description, Paypack reference, path…" className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm" />
        </label>
        <input value={filters.actor} onChange={setFilter('actor')} placeholder="Person (name or email)" aria-label="Filter by person" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        <select value={filters.action} onChange={setFilter('action')} aria-label="Filter by action" className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
          <option value="">Any action</option>
          {actionOptions.map((a) => <option key={`${a.category}:${a.action_type}`} value={a.action_type}>{humanize(a.action_type)} ({a.count})</option>)}
        </select>
        <select value={filters.outcome} onChange={setFilter('outcome')} aria-label="Filter by outcome" className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
          <option value="all">Success and failure</option>
          <option value="success">Successful only</option>
          <option value="failure">Failed only</option>
        </select>
        <select value={filters.role} onChange={setFilter('role')} aria-label="Filter by who" className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
          <option value="all">Anyone</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
          <option value="guest">Guests</option>
          <option value="system">System (Paypack, email, jobs)</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600">From
          <input type="date" value={filters.from} onChange={setFilter('from')} className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">To
          <input type="date" value={filters.to} onChange={setFilter('to')} className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        </label>
        <div className="flex items-center justify-between gap-3 sm:col-span-2 lg:col-span-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{total.toLocaleString()}</span> {total === 1 ? 'entry' : 'entries'}
            {data.summary.failures > 0 && (
              <button type="button" onClick={() => setFilters((f) => ({ ...f, outcome: 'failure' }))} className="ml-2 font-semibold text-red-700 hover:underline">
                · {data.summary.failures.toLocaleString()} failed
              </button>
            )}
          </p>
          {hasFilters && (
            <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="text-sm font-semibold text-blue-700 hover:underline">Clear filters</button>
          )}
        </div>
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {/* Log table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Phones: one card per entry */}
        <ul className="divide-y divide-gray-100 md:hidden">
          {data.logs.map((log) => {
            const open = expanded === log.id;
            const who = whoOf(log);
            return (
              <li key={log.id}>
                <button type="button" aria-expanded={open} onClick={() => setExpanded(open ? null : log.id)} className="block w-full px-4 py-3 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-gray-900">{log.description || humanize(log.action_type)}</p>
                    {open ? <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" /> : <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {who.name}{who.concerning ? ` · for ${who.concerning}` : ''} · {format(new Date(log.created_at), 'MMM d, HH:mm')}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <CategoryBadge category={log.category} />
                    <OutcomeBadge log={log} />
                    <RoleBadge role={log.actor_role} />
                  </div>
                </button>
                {open && <LogDetails log={log} />}
              </li>
            );
          })}
        </ul>

        {/* Tablets and up: table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="w-8 px-3 py-3"><span className="sr-only">Expand</span></th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">Who</th>
                <th className="px-4 py-3 font-semibold">What happened</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.logs.map((log) => {
                const open = expanded === log.id;
                const who = whoOf(log);
                return (
                  <Fragment key={log.id}>
                    <tr
                      className={`cursor-pointer align-top hover:bg-gray-50 ${open ? 'bg-gray-50' : ''}`}
                      onClick={() => setExpanded(open ? null : log.id)}
                    >
                      <td className="px-3 py-3 text-gray-400">
                        <button type="button" aria-expanded={open} aria-label={open ? 'Hide details' : 'Show details'} onClick={(e) => { e.stopPropagation(); setExpanded(open ? null : log.id); }}>
                          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600" title={format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}>
                        <p>{format(new Date(log.created_at), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-gray-400">{format(new Date(log.created_at), 'HH:mm:ss')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{who.name}</p>
                        {who.email && <p className="text-xs text-gray-500">{who.email}</p>}
                        {who.concerning && <p className="text-xs text-gray-500">for {who.concerning}</p>}
                        <div className="mt-1"><RoleBadge role={log.actor_role} /></div>
                      </td>
                      <td className="max-w-md px-4 py-3">
                        <p className="text-gray-900">{log.description || humanize(log.action_type)}</p>
                        <p className="mt-0.5 font-mono text-xs text-gray-400">{log.action_type}</p>
                      </td>
                      <td className="px-4 py-3"><CategoryBadge category={log.category} /></td>
                      <td className="px-4 py-3"><OutcomeBadge log={log} /></td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={6} className="p-0"><LogDetails log={log} /></td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && data.logs.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            {hasFilters || category !== 'all' || scope ? 'No activity matches these filters.' : 'No activity recorded yet. Actions on the platform will appear here as they happen.'}
          </p>
        )}
        {loading && data.logs.length === 0 && <p className="p-8 text-center text-gray-500">Loading activity…</p>}
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600">
            Showing {(offset + 1).toLocaleString()}–{Math.min(offset + PAGE_SIZE, total).toLocaleString()} of {total.toLocaleString()}
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={offset === 0} onClick={() => setOffset(Math.max(offset - PAGE_SIZE, 0))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40">Newer</button>
            <button type="button" disabled={offset + PAGE_SIZE >= total} onClick={() => setOffset(offset + PAGE_SIZE)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40">Older</button>
          </div>
        </div>
      )}
    </div>
  );
}
