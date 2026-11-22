'use client';

import { useEffect, useMemo, useState } from 'react';
import adminAPI from '../../services/admin.api';

const REPORTS = {
  users: {
    label: 'Users',
    columns: [['name', 'Name'], ['email', 'Email'], ['role', 'Role'], ['status', 'Account status'], ['registeredItems', 'Registered items'], ['foundItems', 'Found reports'], ['createdAt', 'Joined']],
  },
  registered: {
    label: 'Registered items',
    columns: [['name', 'Item'], ['owner', 'Owner'], ['email', 'Owner email'], ['status', 'Status'], ['verified', 'Verified'], ['createdAt', 'Registered']],
  },
  found: {
    label: 'Found-item reports',
    columns: [['name', 'Item'], ['category', 'Category'], ['reporter', 'Reporter'], ['email', 'Reporter email'], ['status', 'Status'], ['location', 'Location'], ['createdAt', 'Reported']],
  },
  payments: {
    label: 'Payments',
    columns: [['name', 'User'], ['email', 'Email'], ['amount', 'Amount'], ['status', 'Status'], ['createdAt', 'Date']],
  },
};

const date = (value) => value ? new Date(value).toLocaleDateString() : '—';
const clean = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
const download = (contents, type, name) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([contents], { type }));
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};

function makePdf(title, columns, rows) {
  const lines = [title, `Created: ${new Date().toLocaleString()}`, '', columns.map(([, label]) => label).join(' | '), ...rows.map((row) => columns.map(([key]) => clean(row[key])).join(' | '))]
    .flatMap((line) => line.match(/.{1,95}/g) || ['']);
  const content = lines.map((line, index) => `BT /F1 8 Tf 40 ${800 - index * 11} Td (${line.replace(/[\\()]/g, '\\$&').replace(/[^\x20-\x7E]/g, '?')}) Tj ET`).join('\n');
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${content.length} >>\nstream\n${content}\nendstream`];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const start = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return pdf;
}

export default function ReportCenter({ users, registeredItems, foundItems, payments }) {
  const [source, setSource] = useState('registered');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'createdAt', direction: 'desc' });
  const [databaseRecords, setDatabaseRecords] = useState(null);
  const [loadError, setLoadError] = useState('');
  const columns = REPORTS[source].columns;
  const previewData = {
    users: users.map((user) => ({ name: user.full_name, email: user.email, role: user.role, status: user.account_status, registeredItems: user.registeredItemsCount, foundItems: user.foundItemsCount, createdAt: date(user.created_at) })),
    registered: registeredItems.map((item) => ({ name: item.item_name, owner: item.owner?.full_name, email: item.owner?.email, status: item.status, verified: item.is_verified ? 'Yes' : 'No', createdAt: date(item.created_at) })),
    found: foundItems.map((item) => ({ name: item.item_name, category: item.item_category, reporter: item.reporter?.full_name || item.reporter_name, email: item.reporter?.email || item.reporter_email, status: item.status, location: item.found_location, createdAt: date(item.created_at) })),
    payments: payments.map((payment) => ({ name: payment.user?.full_name, email: payment.user?.email, amount: `${payment.amount} ${payment.currency}`, status: payment.status, createdAt: date(payment.created_at) })),
  }[source];
  useEffect(() => {
    setDatabaseRecords(null);
    setLoadError('');
    adminAPI.getReportData(source)
      .then((response) => setDatabaseRecords(response.records || []))
      .catch(() => setLoadError('Could not refresh the full database report. Showing the dashboard preview instead.'));
  }, [source]);
  const data = databaseRecords === null ? previewData : {
    users: databaseRecords.map((user) => ({ name: user.full_name, email: user.email, role: user.role, status: user.account_status, registeredItems: '', foundItems: '', createdAt: date(user.created_at) })),
    registered: databaseRecords.map((item) => ({ name: item.item_name, owner: item.owner?.full_name, email: item.owner?.email, status: item.status, verified: item.is_verified ? 'Yes' : 'No', createdAt: date(item.created_at) })),
    found: databaseRecords.map((item) => ({ name: item.item_name, category: item.item_category, reporter: item.reporter?.full_name || item.reporter_name, email: item.reporter?.email || item.reporter_email, status: item.status, location: item.found_location, createdAt: date(item.created_at) })),
    payments: databaseRecords.map((payment) => ({ name: payment.user?.full_name, email: payment.user?.email, amount: `${payment.amount} ${payment.currency}`, status: payment.status, createdAt: date(payment.created_at) })),
  }[source];
  const rows = useMemo(() => data.filter((row) => Object.values(row).some((value) => clean(value).toLowerCase().includes(query.toLowerCase()))).sort((left, right) => clean(left[sort.key]).localeCompare(clean(right[sort.key]), undefined, { numeric: true }) * (sort.direction === 'asc' ? 1 : -1)), [data, query, sort]);
  const toggleSort = (key) => setSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));
  const title = `${REPORTS[source].label} report`;
  const exportCsv = () => download([columns.map(([, label]) => `"${label}"`).join(','), ...rows.map((row) => columns.map(([key]) => `"${clean(row[key]).replace(/"/g, '""')}"`).join(','))].join('\n'), 'text/csv;charset=utf-8', `${source}-report.csv`);
  const exportExcel = () => download(`<table><thead><tr>${columns.map(([, label]) => `<th>${label}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${columns.map(([key]) => `<td>${clean(row[key])}</td>`).join('')}</tr>`).join('')}</tbody></table>`, 'application/vnd.ms-excel', `${source}-report.xls`);

  return <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-xl font-bold text-gray-900">Standard platform report</h2><p className="mt-1 text-sm text-gray-500">Filter, sort, and export the current platform data.</p></div><div className="flex flex-wrap gap-2"><button onClick={exportCsv} className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white">CSV</button><button onClick={exportExcel} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white">Excel</button><button onClick={() => download(makePdf(title, columns, rows), 'application/pdf', `${source}-report.pdf`)} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white">PDF</button></div></div><div className="mt-6 grid gap-3 sm:grid-cols-[12rem_1fr]"><label className="text-sm font-semibold text-gray-700">Report type<select value={source} onChange={(event) => { setSource(event.target.value); setQuery(''); }} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-normal">{Object.entries(REPORTS).map(([key, report]) => <option key={key} value={key}>{report.label}</option>)}</select></label><label className="text-sm font-semibold text-gray-700">Search every field<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this report" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" /></label></div>{loadError && <p className="mt-3 text-sm text-amber-700">{loadError}</p>}<p className="mt-4 text-sm text-gray-500">{databaseRecords === null ? 'Loading full database report… ' : ''}{rows.length} record{rows.length === 1 ? '' : 's'} in this report.</p><div className="mt-3 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-gray-50"><tr>{columns.map(([key, label]) => <th key={key} className="whitespace-nowrap px-4 py-3"><button onClick={() => toggleSort(key)} className="font-semibold text-gray-700">{label}{sort.key === key ? (sort.direction === 'asc' ? ' ↑' : ' ↓') : ''}</button></th>)}</tr></thead><tbody className="divide-y divide-gray-100">{rows.map((row, index) => <tr key={`${source}-${index}`}>{columns.map(([key]) => <td key={key} className="px-4 py-3 text-gray-600">{row[key] ?? '—'}</td>)}</tr>)}</tbody></table></div></section>;
}
