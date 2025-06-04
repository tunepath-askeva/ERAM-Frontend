import AppRoutes from "./routes";
import { SnackbarProvider } from "notistack";

function App() {
  return (
    <>
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
    </>
  );
}

export default App;
