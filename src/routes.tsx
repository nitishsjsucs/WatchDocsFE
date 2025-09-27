import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/components/Layout';
import NewWatch from '@/pages/NewWatch';
import WatchDetail from '@/pages/WatchDetail';

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
]);
