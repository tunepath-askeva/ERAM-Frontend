import ErrorBoundary from "./Components/ErrorBoundary";
import AppRoutes from "./routes";
import { SnackbarProvider } from "notistack";

function App() {
  return (
    <ErrorBoundary>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        autoHideDuration={3000}
        preventDuplicate
      >
        <AppRoutes />
      </SnackbarProvider>
    </ErrorBoundary>
  );
}

export default App;
