
import React, { useState, useEffect } from 'react';
import { PeripheralCeilingConfig, RoomDimensions, PeripheralSides, CoveLightPosition } from '@/types/ceiling';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface PeripheralCeilingFormProps {
  roomDimensions: RoomDimensions;
  onSubmit: (config: PeripheralCeilingConfig) => void;
  initialConfig?: PeripheralCeilingConfig;
}

export const PeripheralCeilingForm: React.FC<PeripheralCeilingFormProps> = ({
  roomDimensions,
  onSubmit,
  initialConfig
}) => {
  const [config, setConfig] = useState<PeripheralCeilingConfig>(
    initialConfig || { 
      width: Math.min(2, Math.min(roomDimensions.width, roomDimensions.length) * 0.15), 
      sides: { top: true, right: true, bottom: true, left: true },
      lightCount: undefined,
      coveLight: false,
      coveLightPositions: []
    }
  );
  
  useEffect(() => {
    // Update config when room dimensions change if no initial config provided
    if (!initialConfig) {
      setConfig({
        width: Math.min(2, Math.min(roomDimensions.width, roomDimensions.length) * 0.15),
        sides: { top: true, right: true, bottom: true, left: true },
        lightCount: config.lightCount,
        coveLight: config.coveLight || false,
        coveLightPositions: config.coveLightPositions || []
      });
    }
  }, [roomDimensions, initialConfig]);
  
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
    
    if (isNaN(numValue)) {
      return;
    }
    
    // Max width is half the smallest room dimension
    const maxWidth = Math.min(roomDimensions.width, roomDimensions.length) / 2;
    
    setConfig(prev => ({
      ...prev,
      width: Math.min(numValue, maxWidth)
    }));
  };

  const handleLightCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseInt(value);
    
    setConfig(prev => ({
      ...prev,
      lightCount: value === '' ? undefined : Math.max(4, numValue)
    }));
  };
  
  const handleSideChange = (side: keyof PeripheralSides) => {
    setConfig(prev => ({
      ...prev,
      sides: {
        ...prev.sides,
        [side]: !prev.sides[side]
      }
    }));
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
    
    // Validate width
    if (config.width <= 0) {
      toast.error("Width must be a positive number");
      return;
    }
    
    // Validate at least one side is selected
    if (!config.sides.top && !config.sides.right && !config.sides.bottom && !config.sides.left) {
      toast.error("At least one side must be selected");
      return;
    }

    // Validate cove light positions if cove lights are enabled
    if (config.coveLight && (!config.coveLightPositions || config.coveLightPositions.length === 0)) {
      toast.error("Please select at least one position for cove lighting");
      return;
    }
    
    onSubmit(config);
    toast.success("Peripheral ceiling configuration updated");
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Peripheral False Ceiling</CardTitle>
        <CardDescription>
          Configure the width and sides of the peripheral ceiling
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="width">Width (ft)</Label>
            <Input
              id="width"
              name="width"
              type="number"
              step="0.1"
              min="0.1"
              max={Math.min(roomDimensions.width, roomDimensions.length) / 2}
              value={config.width}
              onChange={handleWidthChange}
            />
            <p className="text-xs text-muted-foreground">
              Maximum: {(Math.min(roomDimensions.width, roomDimensions.length) / 2).toFixed(1)} ft
            </p>
          </div>
          
          <div className="space-y-3">
            <Label>Select Sides</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="top"
                  checked={config.sides.top}
                  onCheckedChange={() => handleSideChange('top')}
                />
                <Label htmlFor="top" className="cursor-pointer">Top Side</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="right"
                  checked={config.sides.right}
                  onCheckedChange={() => handleSideChange('right')}
                />
                <Label htmlFor="right" className="cursor-pointer">Right Side</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="bottom"
                  checked={config.sides.bottom}
                  onCheckedChange={() => handleSideChange('bottom')}
                />
                <Label htmlFor="bottom" className="cursor-pointer">Bottom Side</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="left"
                  checked={config.sides.left}
                  onCheckedChange={() => handleSideChange('left')}
                />
                <Label htmlFor="left" className="cursor-pointer">Left Side</Label>
              </div>
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
              min="4"
              value={config.lightCount === undefined ? '' : config.lightCount}
              onChange={handleLightCountChange}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for automatic calculation based on ceiling dimensions
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
                      id="inner" 
                      checked={config.coveLightPositions?.includes('inner') || false}
                      onCheckedChange={(checked) => handleCoveLightPositionChange('inner', !!checked)}
                    />
                    <Label htmlFor="inner" className="cursor-pointer">
                      Inner Boundary
                    </Label>
                  </div>
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
            Update Peripheral Ceiling
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
