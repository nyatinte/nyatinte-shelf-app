import './style.css';
import { createRoot } from 'react-dom/client';
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef } from 'react';

const queryClient = new QueryClient();

type User = {
  id: number;
  name: string;
};
async function fetchPage(
  limit: number,
  offset: number = 0
): Promise<{ rows: User[]; nextOffset: number }> {
  const rows = (await fetch(`/users?page=${offset}&limit=${limit}`).then(
    (res) => res.json()
  )) as User[];

  await new Promise((r) => setTimeout(r, 500));

  return { rows, nextOffset: offset + 1 };
}

function App() {
  const {
    status,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<{ rows: User[]; nextOffset: number }>({
    queryKey: ['articles'],
    initialPageParam: 0,
    queryFn: (ctx) =>
      fetchPage(10, typeof ctx.pageParam === 'number' ? ctx.pageParam : 0),
    getNextPageParam: (_lastGroup, groups) => groups.length,
  });
  const allRows = data ? data.pages.flatMap((d) => d.rows) : [];

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    // 推定されるアイテムの高さ
    estimateSize: () => 100,
    // 10 → 10個前のアイテムが表示された時点で追加のアイテムをフェッチする
    overscan: 0,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= allRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allRows.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  return (
    <div>
      {status === 'pending' ? (
        <div className='space-y-20'>
          {Array.from({ length: 10 }).map(() => (
            <Skeleton />
          ))}
        </div>
      ) : status === 'error' ? (
        <span>Error: {error.message}</span>
      ) : (
        <div
          ref={parentRef}
          className='h-full w-full overflow-y-auto bg-background'
        >
          <div
            className='relative flex flex-col items-center justify-center w-full'
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const isLoaderRow = virtualRow.index > allRows.length - 1;
              const post = allRows[virtualRow.index];

              return (
                <div
                  key={virtualRow.index}
                  className='absolute top-0 left-0 w-full'
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {isLoaderRow ? (
                    hasNextPage ? (
                      <div className='space-y-20'>
                        {Array.from({ length: 10 }).map(() => (
                          <Skeleton />
                        ))}
                      </div>
                    ) : (
                      'Nothing more to load'
                    )
                  ) : (
                    JSON.stringify(post)
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const Skeleton = () => {
  return <div className='animate-pulse h-4 w-32 bg-slate-600' />;
};

const domNode = document.getElementById('root')!;
const root = createRoot(domNode);
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
