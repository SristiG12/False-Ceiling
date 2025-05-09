import React from 'react';

interface RoomDimensionsProps {
  onDimensionsChange: (dimensions: {
    length: number;
    width: number;
    height: number;
  }) => void;
}

export const RoomDimensions: React.FC<RoomDimensionsProps> = ({ onDimensionsChange }) => {
  const [dimensions, setDimensions] = React.useState({
    length: 0,
    width: 0,
    height: 0,
  });

  const [errors, setErrors] = React.useState({
    length: '',
    width: '',
    height: '',
  });

  const validateDimension = (value: number, field: string): string => {
    if (value <= 0) return `${field} must be greater than 0`;
    if (value > 100) return `${field} cannot exceed 100 feet`;
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    
    const newDimensions = {
      ...dimensions,
      [name]: numValue,
    };

    const newErrors = {
      ...errors,
      [name]: validateDimension(numValue, name.charAt(0).toUpperCase() + name.slice(1)),
    };

    setDimensions(newDimensions);
    setErrors(newErrors);

    // Only call onDimensionsChange if there are no errors
    if (!Object.values(newErrors).some(error => error !== '')) {
      onDimensionsChange(newDimensions);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Room Dimensions</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="length" className="block text-sm font-medium text-gray-700">
            Length (feet)
          </label>
          <input
            type="number"
            id="length"
            name="length"
            value={dimensions.length || ''}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.length ? 'border-red-300' : 'border-gray-300'
            }`}
            min="0"
            step="0.1"
            placeholder="Enter length"
          />
          {errors.length && (
            <p className="mt-1 text-sm text-red-600">{errors.length}</p>
          )}
        </div>
        <div>
          <label htmlFor="width" className="block text-sm font-medium text-gray-700">
            Width (feet)
          </label>
          <input
            type="number"
            id="width"
            name="width"
            value={dimensions.width || ''}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.width ? 'border-red-300' : 'border-gray-300'
            }`}
            min="0"
            step="0.1"
            placeholder="Enter width"
          />
          {errors.width && (
            <p className="mt-1 text-sm text-red-600">{errors.width}</p>
          )}
        </div>
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700">
            Height (feet)
          </label>
          <input
            type="number"
            id="height"
            name="height"
            value={dimensions.height || ''}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.height ? 'border-red-300' : 'border-gray-300'
            }`}
            min="0"
            step="0.1"
            placeholder="Enter height"
          />
          {errors.height && (
            <p className="mt-1 text-sm text-red-600">{errors.height}</p>
          )}
        </div>
        {dimensions.length > 0 && dimensions.width > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              Room Area: {(dimensions.length * dimensions.width).toFixed(2)} sq. ft.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 