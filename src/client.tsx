import './style.css';
import { createRoot } from 'react-dom/client';
import useSWRInfinite from 'swr/infinite';

const getKey = (pageIndex: number, previousPageData: any | null) => {
  if (previousPageData && !previousPageData.length) return null; // 最後に到達した
  return `/users?page=${pageIndex}&limit=10`; // SWR キー
};

type User = {
  id: number;
  name: string;
};
const fetcher = (args: string) =>
  fetch(args).then((res) => res.json() as Promise<User[]>);

function App() {
  const { data, size, setSize } = useSWRInfinite<User[]>(getKey, fetcher, {
    revalidateOnFocus: false,
  });
  if (!data) return 'loading';

  // これで、すべてのユーザー数を計算できます
  let totalUsers = 0;
  for (let i = 0; i < data.length; i++) {
    totalUsers += data[i].length;
  }

  return (
    <div>
      <p>{totalUsers} ユーザーがリストされています</p>
      {data.map((users) => {
        // `data` は、各ページの API レスポンスの配列です
        return users.map((user) => <div key={user.id}>{user.name}</div>);
      })}
      <button onClick={() => setSize(size + 1)}>さらに読み込む</button>
    </div>
  );
}

const domNode = document.getElementById('root')!;
const root = createRoot(domNode);
root.render(<App />);
