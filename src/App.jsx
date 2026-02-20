import { Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import JoinCreateChat from "./components/JoinCreateChat";



function App() {

  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white/70 text-lg">Loading...</div >
        </div>
      }>
        <JoinCreateChat />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App