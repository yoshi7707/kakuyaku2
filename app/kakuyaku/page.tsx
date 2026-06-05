"use client";

import { useEffect, useState } from "react";

export default function KakuyakuPage() {
  const [status, setStatus] = useState("保存準備中...");
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function saveAll() {
    setLoading(true);
    setStatus("保存中...");
    setError(null);

    try {
      const response = await fetch("/api/submit/direct");
      const data = await response.json();

      if (response.ok) {
        setCount(data.count);
        setStatus(`保存完了: ${data.count} 件を MongoDB に保存しました`);
      } else {
        setError(data.error || response.statusText || "保存に失敗しました");
        setStatus("保存エラー");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("ネットワークエラー");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    saveAll();
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold mb-6">全データを MongoDB に保存</h1>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          このページではフォームを表示せず、公開中の全データを直接保存します。
        </p>
        <p className="text-base">{status}</p>
        {count !== null && <p>保存件数: {count}</p>}
        {error && <p className="text-red-600">エラー: {error}</p>}
        <button
          type="button"
          onClick={saveAll}
          disabled={loading}
          className="inline-flex justify-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          再試行
        </button>
      </div>
    </main>
  );
}
