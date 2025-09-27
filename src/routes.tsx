import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/components/Layout';
import NewWatch from '@/pages/NewWatch';
import WatchDetail from '@/pages/WatchDetail';
import WatchPage from '@/pages/WatchPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <NewWatch />,
      },
      {
        path: 'watch/new',
        element: <NewWatch />,
      },
      {
        path: 'watch/:id',
        element: <WatchDetail />,
      },
    ],
  },
  {
    path: '/watch/:id/live',
    element: <WatchPage />,
  },
]);
