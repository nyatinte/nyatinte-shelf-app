import type { Article } from '@/schema'
import type { FC } from 'react'
import { Skeleton } from './ui/skeleton'

type LinkCardProps = Article
const LinkCard: FC<LinkCardProps> = (props) => {
  return (
    <a
      href={props.url}
      className="flex h-32 w-full justify-between rounded-lg border p-4 shadow-sm"
    >
      <div className="flex-1 space-y-1">
        <h2 className="font-semibold">{props.title}</h2>
        <p className="text-sm">{props.description}</p>
      </div>
      <img className="h-full object-contain" src={props.image || ''} alt="" />
    </a>
  )
}

const LinkCardSkeleton: FC = () => {
  return (
    <div className="flex h-32 w-full justify-between rounded-lg border p-4 shadow-sm">
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-full w-32" />
    </div>
  )
}

export { LinkCard, LinkCardSkeleton }
