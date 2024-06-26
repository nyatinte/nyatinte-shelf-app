import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

import { LinkCard, LinkCardSkeleton } from './components/link-card'
import type { Article } from './schema'

const queryClient = new QueryClient()

const LIMIT = 10
async function fetchPage(
  limit: number,
  offset = 0,
): Promise<{ articles: Article[]; nextOffset: number }> {
  const url = new URL('/api/articles', window.location.origin)
  url.searchParams.set('page', offset.toString())
  url.searchParams.set('limit', limit.toString())

  const articles = (await fetch(url.toString()).then((res) =>
    res.json(),
  )) as Article[]

  return { articles, nextOffset: offset + 1 }
}

function App() {
  const {
    status,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<Awaited<ReturnType<typeof fetchPage>>>({
    // TODO: QueryKeyを使ってFilter機能を実装する
    queryKey: ['articles'],
    initialPageParam: 0,
    queryFn: (ctx) =>
      fetchPage(LIMIT, typeof ctx.pageParam === 'number' ? ctx.pageParam : 0),
    getNextPageParam: (_lastGroup, groups) =>
      // 10個ずつ取得しているので、次のページがあるかどうかは LIMIT で割り切れるかどうかで判断する
      groups.length % LIMIT === 0 ? groups.length : undefined,
  })
  const allArticles = data ? data.pages.flatMap((d) => d.articles) : []

  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allArticles.length + 1 : allArticles.length,
    getScrollElement: () => parentRef.current,
    gap: 16,
    // 推定されるアイテムの高さ
    estimateSize: () => 128,
    // 10 → 10個前のアイテムが表示された時点で追加のアイテムをフェッチする
    overscan: LIMIT,
  })

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse()

    if (!lastItem) {
      return
    }

    if (
      lastItem.index >= allArticles.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allArticles.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems,
  ])

  return (
    <div className="container">
      {status === 'pending' ? (
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Skeletonのため、indexをkeyとして使用している
            <LinkCardSkeleton key={i} />
          ))}
        </div>
      ) : status === 'error' ? (
        <span>Error: {error.message}</span>
      ) : (
        <div
          ref={parentRef}
          className="h-full w-full overflow-y-auto bg-background"
        >
          <div
            className="relative flex w-full flex-col items-center justify-center"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const isLoaderRow = virtualRow.index > allArticles.length - 1
              const article = allArticles[virtualRow.index]

              return (
                <div
                  key={virtualRow.index}
                  className="absolute top-0 left-0 w-full"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {isLoaderRow ? (
                    hasNextPage ? (
                      <div className="space-y-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: Skeletonのため、indexをkeyとして使用している
                          <LinkCardSkeleton key={i} />
                        ))}
                      </div>
                    ) : (
                      'Nothing more to load'
                    )
                  ) : (
                    <LinkCard {...article} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// biome-ignore lint/style/noNonNullAssertion: index.tsxにて、<div id="root">が存在することを保証している
const domNode = document.getElementById('root')!
const root = createRoot(domNode)
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
)
