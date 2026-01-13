import { Suspense } from 'react';
// third party
import { RouterProvider } from 'react-router-dom';

// project imports
import router from 'routes';
import Loader from 'components/Loader/Loader';

// -----------------------|| APP ||-----------------------//

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
