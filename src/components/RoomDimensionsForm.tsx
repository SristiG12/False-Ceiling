
import React from 'react';
import { useState } from 'react';
import { RoomDimensions } from '@/types/ceiling';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RoomDimensionsFormProps {
  onSubmit: (dimensions: RoomDimensions) => void;
  initialDimensions?: RoomDimensions;
}

export const RoomDimensionsForm: React.FC<RoomDimensionsFormProps> = ({ 
  onSubmit, 
  initialDimensions 
}) => {
  const [dimensions, setDimensions] = useState<RoomDimensions>(
    initialDimensions || { width: 12, length: 15, height: 9 }
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue <= 0) {
      return;
    }
    
    setDimensions(prev => ({
      ...prev,
      [name]: numValue
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dimensions
    if (dimensions.width <= 0 || dimensions.length <= 0 || dimensions.height <= 0) {
      toast.error("All dimensions must be positive numbers");
      return;
    }
    
    onSubmit(dimensions);
    toast.success("Room dimensions updated");
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Room Dimensions</CardTitle>
        <CardDescription>
          Enter the dimensions of your room in feet
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width (ft)</Label>
              <Input
                id="width"
                name="width"
                type="number"
                step="0.1"
                min="1"
                value={dimensions.width}
                onChange={handleChange}
                placeholder="Enter width"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Length (ft)</Label>
              <Input
                id="length"
                name="length"
                type="number"
                step="0.1"
                min="1"
                value={dimensions.length}
                onChange={handleChange}
                placeholder="Enter length"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (ft)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                step="0.1"
                min="1"
                value={dimensions.height}
                onChange={handleChange}
                placeholder="Enter height"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Update Room
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
