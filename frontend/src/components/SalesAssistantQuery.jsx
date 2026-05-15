import { useState } from 'react';

function normalizeBaseUrl(baseUrl) {
	return baseUrl?.replace(/\/$/, '') ?? '';
}

export default function SalesAssistantQuery() {
	const [query, setQuery] = useState('');
	const [answer, setAnswer] = useState('');
	const [sources, setSources] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	async function handleSubmit(event) {
		event.preventDefault();

		if (!query.trim()) {
			setError('Enter a question first.');
			return;
		}

		const baseUrl = normalizeBaseUrl(import.meta.env.PUBLIC_API_BASE_URL);

		if (!baseUrl) {
			setError('Set PUBLIC_API_BASE_URL in the frontend env.');
			return;
		}

		setLoading(true);
		setError('');
		setAnswer('');
		setSources([]);

		try {
			const url = new URL(`${baseUrl}/sales-assistant`);
			url.searchParams.set('query', query.trim());

			const response = await fetch(url.toString());

			if (!response.ok) {
				throw new Error(`Request failed with status ${response.status}`);
			}

			const data = await response.json();
			setAnswer(data.answer ?? 'No answer returned.');
			setSources(Array.isArray(data.results) ? data.results : []);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Something went wrong.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-lg shadow-black/10">
			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				<label className="text-sm font-medium text-slate-200" htmlFor="sales-assistant-query">
					Ask the sales assistant
				</label>
				<div className="flex flex-col gap-3 sm:flex-row">
					<input
						id="sales-assistant-query"
						className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
						type="text"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Ask about services, pricing, or fit"
					/>
					<button
						className="rounded-lg bg-cyan-400 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
						type="submit"
						disabled={loading}
					>
						{loading ? 'Sending...' : 'Send'}
					</button>
				</div>
			</form>

			{error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

			{answer ? (
				<div className="mt-4 space-y-3">
					<div>
						<p className="text-xs uppercase tracking-[0.25em] text-slate-400">Response</p>
						<p className="mt-1 whitespace-pre-wrap text-slate-100">{answer}</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-[0.25em] text-slate-400">Sources</p>
						<ul className="mt-2 space-y-2">
							{sources.map((source, index) => (
								<li key={`${source.path ?? source.title ?? index}`} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">
									<p className="font-medium text-slate-100">{source.title ?? source.path ?? `Source ${index + 1}`}</p>
									{source.path ? <p className="mt-1 text-slate-400">{source.path}</p> : null}
									{source.content_type ? <p className="mt-1 text-slate-500">{source.content_type}</p> : null}
									{source.relevance != null ? <p className="mt-1 text-slate-500">Relevance: {String(source.relevance)}</p> : null}
									{source.content ? <p className="mt-2 line-clamp-3 text-slate-400">{source.content}</p> : null}
								</li>
							))}
						</ul>
					</div>
				</div>
			) : null}
		</div>
	);
}
