import { Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import AppRoutes from "./config/routes";

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white/70 text-lg animate-pulse">Loading QuickTalk...</div>
        </div>
      }>
        <AppRoutes /> 
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;