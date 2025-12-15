import { RouterProvider } from 'react-router-dom';
import { router } from './lib/router';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { FacilityProvider } from './contexts/FacilityContext';

function App() {
  return (
    <AuthProvider>
      <FacilityProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </FacilityProvider>
    </AuthProvider>
  );
}

export default App;
