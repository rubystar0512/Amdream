import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { AuthProvider } from "./providers/AuthProvider";
import routes from "./route";
import { ClassModalProvider } from "./contexts/ClassModalContext";

function App() {
  return (
    <AuthProvider>
      <ClassModalProvider>
        <main className="flex min-h-screen items-center justify-center gap-2 dark:bg-gray-800">
          <RouterProvider router={routes} />
          <ToastContainer />
        </main>
      </ClassModalProvider>
    </AuthProvider>
  );
}

export default App;
