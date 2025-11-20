import ErrorBoundary from "./Components/ErrorBoundary";
import AppRoutes from "./routes";
import { SnackbarProvider } from "notistack";
import { ConfigProvider } from "antd";

function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#da2c46", 
          },
        }}
      >
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
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
