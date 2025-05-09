import React from 'react';

export type CeilingType = 'POP' | 'Gypsum' | 'Metal' | 'Wood' | 'PVC';

interface CeilingTypeProps {
  onTypeChange: (type: CeilingType) => void;
  selectedType: CeilingType | null;
}

export const CeilingTypeSelector: React.FC<CeilingTypeProps> = ({ onTypeChange, selectedType }) => {
  const ceilingTypes: {
    id: CeilingType;
    name: string;
    description: string;
    pros: string[];
    cons: string[];
    pricePerSqFt: number;
  }[] = [
    {
      id: 'POP',
      name: 'Plaster of Paris (POP)',
      description: 'Traditional, versatile, and cost-effective option',
      pros: ['Highly customizable', 'Smooth finish', 'Cost-effective'],
      cons: ['Not water-resistant', 'Requires skilled labor'],
      pricePerSqFt: 85,
    },
    {
      id: 'Gypsum',
      name: 'Gypsum Board',
      description: 'Modern, lightweight, and easy to install',
      pros: ['Fire-resistant', 'Easy installation', 'Good sound insulation'],
      cons: ['Not suitable for wet areas', 'Can crack if not installed properly'],
      pricePerSqFt: 95,
    },
    {
      id: 'Metal',
      name: 'Metal Ceiling',
      description: 'Durable, modern, and perfect for commercial spaces',
      pros: ['Durable', 'Low maintenance', 'Modern look'],
      cons: ['Higher cost', 'Limited design options'],
      pricePerSqFt: 120,
    },
    {
      id: 'Wood',
      name: 'Wooden Ceiling',
      description: 'Natural, warm, and elegant option',
      pros: ['Natural look', 'Warm ambiance', 'Durable'],
      cons: ['Expensive', 'Requires regular maintenance'],
      pricePerSqFt: 150,
    },
    {
      id: 'PVC',
      name: 'PVC Ceiling',
      description: 'Waterproof, lightweight, and low maintenance',
      pros: ['Waterproof', 'Low maintenance', 'Lightweight'],
      cons: ['Limited design options', 'Not eco-friendly'],
      pricePerSqFt: 75,
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Select Ceiling Type</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ceilingTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`p-4 border rounded-lg transition-all ${
              selectedType === type.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                : 'hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            <div className="text-left">
              <h3 className="font-medium text-lg">{type.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{type.description}</p>
              
              <div className="mt-3">
                <h4 className="text-sm font-medium text-green-600">Pros:</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  {type.pros.map((pro, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-1">✓</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-2">
                <h4 className="text-sm font-medium text-red-600">Cons:</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  {type.cons.map((con, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-1">×</span> {con}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 text-sm">
                <span className="font-medium">Price:</span>{' '}
                <span className="text-blue-600">₹{type.pricePerSqFt}/sq.ft</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}; 