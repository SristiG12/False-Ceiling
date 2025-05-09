import React from 'react';

export type LightType = 'Spot' | 'Panel' | 'Chandelier' | 'Track' | 'Recessed';

export interface Light {
  id: string;
  type: LightType;
  x: number;
  y: number;
}

interface LightingLayoutProps {
  roomWidth: number;
  roomLength: number;
  onLayoutChange: (lights: Light[]) => void;
}

export const LightingLayout: React.FC<LightingLayoutProps> = ({
  roomWidth,
  roomLength,
  onLayoutChange,
}) => {
  const [lights, setLights] = React.useState<Light[]>([]);
  const [selectedType, setSelectedType] = React.useState<LightType>('Spot');

  const lightTypes: { id: LightType; name: string }[] = [
    { id: 'Spot', name: 'Spot Light' },
    { id: 'Panel', name: 'LED Panel' },
    { id: 'Chandelier', name: 'Chandelier' },
    { id: 'Track', name: 'Track Light' },
    { id: 'Recessed', name: 'Recessed Light' },
  ];

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newLight: Light = {
      id: Date.now().toString(),
      type: selectedType,
      x,
      y,
    };

    const newLights = [...lights, newLight];
    setLights(newLights);
    onLayoutChange(newLights);
  };

  const removeLight = (id: string) => {
    const newLights = lights.filter((light) => light.id !== id);
    setLights(newLights);
    onLayoutChange(newLights);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Lighting Layout</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Light Type
        </label>
        <div className="flex gap-2">
          {lightTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-md ${
                selectedType === type.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      <div
        className="relative border-2 border-gray-300 rounded-lg"
        style={{ aspectRatio: `${roomWidth}/${roomLength}` }}
        onClick={handleCanvasClick}
      >
        {lights.map((light) => (
          <div
            key={light.id}
            className="absolute w-4 h-4 bg-blue-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${light.x}%`, top: `${light.y}%` }}
            onClick={(e) => {
              e.stopPropagation();
              removeLight(light.id);
            }}
          />
        ))}
      </div>

      <p className="mt-2 text-sm text-gray-500">
        Click on the grid to add lights. Click on a light to remove it.
      </p>
    </div>
  );
}; 