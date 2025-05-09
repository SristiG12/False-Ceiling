
import React, { useState, useEffect } from 'react';
import { PlainCeilingConfig, RoomDimensions, CoveLightPosition } from '@/types/ceiling';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface PlainCeilingFormProps {
  roomDimensions: RoomDimensions;
  onSubmit: (config: PlainCeilingConfig) => void;
  initialConfig?: PlainCeilingConfig;
}

export const PlainCeilingForm: React.FC<PlainCeilingFormProps> = ({
  roomDimensions,
  onSubmit,
  initialConfig
}) => {
  const [config, setConfig] = useState<PlainCeilingConfig>(
    initialConfig || { 
      width: roomDimensions.width * 0.8, 
      length: roomDimensions.length * 0.8,
      topOffset: roomDimensions.length * 0.1,
      leftOffset: roomDimensions.width * 0.1,
      lightCount: undefined, // default to auto calculation
      coveLight: false,
      coveLightPositions: []
    }
  );
  
  useEffect(() => {
    // Update config when room dimensions change
    if (!initialConfig) {
      setConfig({
        width: roomDimensions.width * 0.8, 
        length: roomDimensions.length * 0.8,
        topOffset: roomDimensions.length * 0.1,
        leftOffset: roomDimensions.width * 0.1,
        lightCount: config.lightCount,
        coveLight: config.coveLight || false,
        coveLightPositions: config.coveLightPositions || []
      });
    }
  }, [roomDimensions, initialConfig]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (name === 'lightCount') {
      // For lightCount, allow empty string to reset to default (automatic calculation)
      setConfig(prev => ({
        ...prev,
        [name]: value === '' ? undefined : Math.max(1, Math.floor(numValue))
      }));
    } else if (!isNaN(numValue)) {
      // For other numeric fields
      setConfig(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };

  const handleCoveLightChange = (checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      coveLight: checked,
      // Reset positions if turning off cove lights
      coveLightPositions: checked ? prev.coveLightPositions : []
    }));
  };

  const handleCoveLightPositionChange = (position: CoveLightPosition, checked: boolean) => {
    setConfig(prev => {
      const positions = [...(prev.coveLightPositions || [])];
      
      if (checked && !positions.includes(position)) {
        positions.push(position);
      } else if (!checked) {
        const index = positions.indexOf(position);
        if (index !== -1) {
          positions.splice(index, 1);
        }
      }
      
      return {
        ...prev,
        coveLightPositions: positions
      };
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dimensions
    if (config.width <= 0 || config.length <= 0) {
      toast.error("Dimensions must be positive numbers");
      return;
    }
    
    // Validate that ceiling fits within the room
    if (config.width + config.leftOffset > roomDimensions.width) {
      toast.error("Ceiling width plus left offset exceeds room width");
      return;
    }
    
    if (config.length + config.topOffset > roomDimensions.length) {
      toast.error("Ceiling length plus top offset exceeds room length");
      return;
    }

    // Validate cove light positions if cove lights are enabled
    if (config.coveLight && (!config.coveLightPositions || config.coveLightPositions.length === 0)) {
      toast.error("Please select at least one position for cove lighting");
      return;
    }
    
    onSubmit(config);
    toast.success("Plain ceiling configuration updated");
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Plain False Ceiling</CardTitle>
        <CardDescription>
          Configure dimensions and placement of the false ceiling
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width (ft)</Label>
              <Input
                id="width"
                name="width"
                type="number"
                step="0.1"
                min="0.1"
                max={roomDimensions.width}
                value={config.width}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                Maximum: {roomDimensions.width.toFixed(1)} ft
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Length (ft)</Label>
              <Input
                id="length"
                name="length"
                type="number"
                step="0.1"
                min="0.1"
                max={roomDimensions.length}
                value={config.length}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                Maximum: {roomDimensions.length.toFixed(1)} ft
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leftOffset">Distance from Left Wall (ft)</Label>
              <Input
                id="leftOffset"
                name="leftOffset"
                type="number"
                step="0.1"
                min="0"
                max={roomDimensions.width - config.width}
                value={config.leftOffset}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                Maximum: {(roomDimensions.width - config.width).toFixed(1)} ft
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topOffset">Distance from Top Wall (ft)</Label>
              <Input
                id="topOffset"
                name="topOffset"
                type="number"
                step="0.1"
                min="0"
                max={roomDimensions.length - config.length}
                value={config.topOffset}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                Maximum: {(roomDimensions.length - config.length).toFixed(1)} ft
              </p>
            </div>
          </div>

          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="lightCount">Number of Lights (Optional)</Label>
            <Input
              id="lightCount"
              name="lightCount"
              type="number"
              placeholder="Auto calculate"
              min="1"
              value={config.lightCount === undefined ? '' : config.lightCount}
              onChange={handleChange}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for automatic calculation based on ceiling size and lighting requirements (min 3ft between lights, min 2ft from walls)
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="coveLight" 
                checked={config.coveLight}
                onCheckedChange={handleCoveLightChange}
              />
              <Label htmlFor="coveLight" className="cursor-pointer">
                Add Cove Lighting
              </Label>
            </div>
            
            {config.coveLight && (
              <div className="space-y-2 pl-6">
                <Label>Cove Light Positions (Select all that apply)</Label>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="outer" 
                      checked={config.coveLightPositions?.includes('outer') || false}
                      onCheckedChange={(checked) => handleCoveLightPositionChange('outer', !!checked)}
                    />
                    <Label htmlFor="outer" className="cursor-pointer">
                      Outer Boundary
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Update Plain Ceiling
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
