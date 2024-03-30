import { FC } from 'react';
import { Skeleton } from './ui/skeleton';
import { Article } from '@/schema';

type LinkCardProps = Article;
const LinkCard: FC<LinkCardProps> = (props) => {
  return (
    <a
      href={props.url}
      className='w-full border rounded-lg h-32 shadow-sm p-4 flex justify-between'
    >
      <div className='flex-1 space-y-1'>
        <h2 className='font-semibold'>{props.title}</h2>
        <p className='text-sm'>{props.description}</p>
      </div>
      <img className='h-full object-contain' src={props.image || ''} alt='' />
    </a>
  );
};

const LinkCardSkeleton: FC = () => {
  return (
    <div className='w-full border rounded-lg h-32 shadow-sm p-4 flex justify-between'>
      <div className='flex-1 space-y-1'>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-4 w-48' />
      </div>
      <Skeleton className='h-full w-32' />
    </div>
  );
};

export { LinkCard, LinkCardSkeleton };
