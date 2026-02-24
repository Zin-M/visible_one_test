interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    totalItems: number;
    onPageSizeChange: (size: number) => void;
}

const PAGE_SIZES = [5, 10, 20, 50];

export const Pagination = ({
    page,
    totalPages,
    onPageChange,
    pageSize,
    totalItems,
    onPageSizeChange,
}: PaginationProps) => {
    const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalItems);

    return (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
                <span>Rows per page:</span>
                <select
                    value={pageSize}
                    onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
                    className="border border-gray-300 rounded px-2 py-0.5 text-sm bg-white outline-none focus:border-blue-400"
                >
                    {PAGE_SIZES.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <span className="text-gray-500">
                {start}–{end} of {totalItems}
            </span>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={page === 1}
                    className="px-2 py-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                    aria-label="First page"
                >
                    «
                </button>
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-2 py-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                    aria-label="Previous page"
                >
                    ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                    }, [])
                    .map((p, i) =>
                        p === '...' ? (
                            <span key={`ellipsis-${i}`} className="px-2 py-1 text-gray-400 text-xs">…</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onPageChange(p as number)}
                                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${p === page
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {p}
                            </button>
                        )
                    )}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages || totalPages === 0}
                    className="px-2 py-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                    aria-label="Next page"
                >
                    ›
                </button>
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={page === totalPages || totalPages === 0}
                    className="px-2 py-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                    aria-label="Last page"
                >
                    »
                </button>
            </div>
        </div>
    );
};
