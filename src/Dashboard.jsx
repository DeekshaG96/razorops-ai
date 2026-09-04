import React, { useState } from 'react';
import reportData from './reconciliation_report.json';

export default function RazorOpsDashboard() {
  const [data] = useState(reportData);

  if (!data) return <div className="p-8 text-gray-500">Loading RazorOps Engine...</div>;

  const { metrics, exception_list } = data;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <header className="mb-8 border-b pb-4 border-gray-200">
        <h1 className="text-3xl font-bold text-blue-900 tracking-tight">RazorOps AI</h1>
        <p className="text-sm text-gray-500 mt-1">Multi-Agent Dispute & Cashflow Controller</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Records Processed" value={metrics.total_records_processed} color="border-gray-200" />
        <MetricCard title="Successful Matches" value={metrics.successful_matches} color="border-green-200" valueColor="text-green-600" />
        <MetricCard title="Exceptions Flagged" value={metrics.exceptions_flagged} color="border-red-200" valueColor="text-red-600" />
        <MetricCard
          title="Match Rate"
          value={`${metrics.match_rate_percentage}%`}
          color={metrics.match_rate_percentage > 90 ? "border-green-200" : "border-yellow-200"}
          valueColor={metrics.match_rate_percentage > 90 ? "text-green-600" : "text-yellow-600"}
        />
      </section>

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">AI-Flagged Exceptions</h2>
          <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded">Requires Attention</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Transaction ID</th>
                <th className="px-6 py-3 font-medium">Exception Type</th>
                <th className="px-6 py-3 font-medium">AI Root Cause Analysis</th>
                <th className="px-6 py-3 font-medium">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {exception_list.map((exc, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-600">{exc.transaction_id}</td>
                  <td className="px-6 py-4"><ExceptionBadge type={exc.exception_type} /></td>
                  <td className="px-6 py-4 text-gray-700 w-1/3">{exc.root_cause}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm text-left">
                      {exc.recommended_action} &rarr;
                    </button>
                  </td>
                </tr>
              ))}
              {exception_list.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No exceptions found. The books are perfectly balanced.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ title, value, color, valueColor = "text-gray-800" }) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${color}`}>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}

function ExceptionBadge({ type }) {
  const styles = {
    MDR_VARIANCE: "bg-yellow-100 text-yellow-800 border-yellow-200",
    TIMING_CUTOFF: "bg-purple-100 text-purple-800 border-purple-200",
    PARTIAL_REFUND: "bg-orange-100 text-orange-800 border-orange-200",
    UNKNOWN_ERROR: "bg-red-100 text-red-800 border-red-200",
    AI_PROCESSING_ERROR: "bg-red-100 text-red-800 border-red-200",
  };
  const activeStyle = styles[type] || styles.UNKNOWN_ERROR;
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded border ${activeStyle}`}>
      {type.replace(/_/g, ' ')}
    </span>
  );
}
