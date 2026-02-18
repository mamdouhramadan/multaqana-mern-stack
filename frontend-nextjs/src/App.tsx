import { RouterProvider } from "react-router-dom";
import { NuqsAdapter } from 'nuqs/adapters/react-router';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SettingsDocumentHead } from "@/components/SettingsDocumentHead";
import router from "./routers";

function App() {
  return (
    <ThemeProvider>
      <SettingsDocumentHead />
      <NuqsAdapter>
        <RouterProvider router={router} />
      </NuqsAdapter>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
      />
    </ThemeProvider>
  );
}

export default App;
