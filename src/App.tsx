import React from 'react';
import { RoomDimensions } from './components/RoomDimensions';
import { CeilingTypeSelector, CeilingType } from './components/CeilingType';
import { LightingLayout, Light } from './components/LightingLayout';
import { Toaster as SonnerToaster } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  const [dimensions, setDimensions] = React.useState({
    length: 0,
    width: 0,
    height: 0,
  });
  const [ceilingType, setCeilingType] = React.useState<CeilingType | null>(null);
  const [lights, setLights] = React.useState<Light[]>([]);

  const calculateArea = () => {
    return dimensions.length * dimensions.width;
  };

  const calculateEstimatedCost = () => {
    if (!ceilingType || !dimensions.length || !dimensions.width) return 0;

    const area = calculateArea();
    const baseRates = {
      POP: 85,
      Gypsum: 95,
      Metal: 120,
      Wood: 150,
      PVC: 75,
    };

    const lightCost = lights.length * 1500; // Assuming average cost per light
    return area * baseRates[ceilingType] + lightCost;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SonnerToaster />
        <Toaster />
        <div className="min-h-screen bg-gray-100">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900">Ceiling Design Wizard</h1>
            </div>
          </header>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="grid grid-cols-1 gap-6">
                <RoomDimensions onDimensionsChange={setDimensions} />
                
                {dimensions.length > 0 && dimensions.width > 0 && (
                  <>
                    <CeilingTypeSelector 
                      onTypeChange={setCeilingType} 
                      selectedType={ceilingType}
                    />
                    
                    <LightingLayout
                      roomWidth={dimensions.width}
                      roomLength={dimensions.length}
                      onLayoutChange={setLights}
                    />

                    <div className="p-6 bg-white rounded-lg shadow-md">
                      <h2 className="text-2xl font-semibold mb-4">Project Summary</h2>
                      <div className="space-y-2">
                        <p>Room Area: {calculateArea().toFixed(2)} sq. ft.</p>
                        <p>Ceiling Type: {ceilingType || 'Not selected'}</p>
                        <p>Number of Lights: {lights.length}</p>
                        <p className="text-xl font-semibold mt-4">
                          Estimated Cost: ₹{calculateEstimatedCost().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
