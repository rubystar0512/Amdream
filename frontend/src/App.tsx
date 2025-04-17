import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { AuthProvider } from "./providers/AuthProvider";
import routes from "./route";

function App() {
  return (
    <AuthProvider>
      <main className="flex min-h-screen items-center justify-center gap-2 dark:bg-gray-800">
        <RouterProvider router={routes} />
        <ToastContainer />
      </main>
    </AuthProvider>
  );
}

export default App;
