
import React, { useState, useEffect } from 'react';
import { IslandCeilingConfig, RoomDimensions, IslandShape, CoveLightPosition } from '@/types/ceiling';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface IslandCeilingFormProps {
  roomDimensions: RoomDimensions;
  onSubmit: (config: IslandCeilingConfig) => void;
  initialConfig?: IslandCeilingConfig;
}

export const IslandCeilingForm: React.FC<IslandCeilingFormProps> = ({
  roomDimensions,
  onSubmit,
  initialConfig
}) => {
  const defaultConfig: IslandCeilingConfig = {
    shape: 'rectangle',
    width: roomDimensions.width * 0.4,
    length: roomDimensions.length * 0.4,
    topOffset: roomDimensions.length * 0.3,
    leftOffset: roomDimensions.width * 0.3,
    cutoutWidth: 0.5, // Default cutout width
    lightCount: undefined, // Default to auto calculation
    coveLight: false,
    coveLightPositions: []
  };
  
  const [config, setConfig] = useState<IslandCeilingConfig>(initialConfig || defaultConfig);
  
  useEffect(() => {
    // Update config when room dimensions change if no initial config provided
    if (!initialConfig) {
      setConfig({
        shape: 'rectangle',
        width: roomDimensions.width * 0.4,
        length: roomDimensions.length * 0.4,
        topOffset: roomDimensions.length * 0.3,
        leftOffset: roomDimensions.width * 0.3,
        cutoutWidth: 0.5, // Default cutout width
        lightCount: config.lightCount,
        coveLight: config.coveLight || false,
        coveLightPositions: config.coveLightPositions || []
      });
    }
  }, [roomDimensions, initialConfig]);
  
  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (name === 'lightCount') {
      // For lightCount, allow empty string to reset to default (automatic calculation)
      setConfig(prev => ({
        ...prev,
        [name]: value === '' ? undefined : Math.max(1, Math.floor(numValue))
      }));
      return;
    }
    
    if (isNaN(numValue)) {
      return;
    }
    
    setConfig(prev => ({
      ...prev,
      [name]: numValue
    }));
  };
  
  const handleShapeChange = (shape: IslandShape) => {
    let updatedConfig: IslandCeilingConfig;
    
    // Adjust dimensions based on shape
    if (shape === 'circle' || shape === 'circular-cutout') {
      const radius = Math.min(config.width, config.length || config.width) / 2;
      
      // Set a sensible default light count for circular shapes
      // For circular-cutout, we'll use even fewer lights to increase spacing
      const defaultLightCount = shape === 'circular-cutout' ? 5 : 7;
      
      updatedConfig = {
        ...config,
        shape,
        radius,
        // Center the circle
        topOffset: config.topOffset + (config.length ? (config.length / 2 - radius) : 0),
        leftOffset: config.leftOffset + (config.width / 2 - radius),
        // Set default light count for circular shapes
        lightCount: defaultLightCount
      };
      
    } else if (shape === 'oval' || shape === 'oval-cutout') {
      updatedConfig = {
        ...config,
        shape,
        radiusX: config.width / 2,
        radiusY: config.length ? config.length / 2 : config.width / 2
      };
      
    } else {
      // Rectangle shapes
      updatedConfig = {
        ...config,
        shape
      };
    }
    
    setConfig(updatedConfig);
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
    
    // Basic validation
    if (config.width <= 0) {
      toast.error("Width must be a positive number");
      return;
    }
    
    if ((config.shape === 'rectangle' || config.shape === 'rectangular-cutout' || 
         config.shape === 'oval' || config.shape === 'oval-cutout') && 
        (!config.length || config.length <= 0)) {
      toast.error("Length must be a positive number for this shape");
      return;
    }
    
    if ((config.shape === 'circle' || config.shape === 'circular-cutout') && 
        (!config.radius || config.radius <= 0)) {
      toast.error("Radius must be a positive number for circular shapes");
      return;
    }

    // Validate cutout width
    if ((config.shape === 'rectangular-cutout' || config.shape === 'circular-cutout' || config.shape === 'oval-cutout') && 
        (!config.cutoutWidth || config.cutoutWidth <= 0)) {
      toast.error("Cutout width must be a positive number");
      return;
    }
    
    // Validate cove light positions if cove lights are enabled
    if (config.coveLight && (!config.coveLightPositions || config.coveLightPositions.length === 0)) {
      toast.error("Please select at least one position for cove lighting");
      return;
    }
    
    // Check if island fits within room
    let islandWidth = 0;
    let islandLength = 0;
    
    if (config.shape === 'circle' || config.shape === 'circular-cutout') {
      islandWidth = islandLength = config.radius! * 2;
    } else if (config.shape === 'oval' || config.shape === 'oval-cutout') {
      islandWidth = config.radiusX! * 2;
      islandLength = config.radiusY! * 2;
    } else {
      islandWidth = config.width;
      islandLength = config.length!;
    }
    
    if (config.leftOffset + islandWidth > roomDimensions.width) {
      toast.error("Island exceeds room width");
      return;
    }
    
    if (config.topOffset + islandLength > roomDimensions.length) {
      toast.error("Island exceeds room length");
      return;
    }
    
    onSubmit(config);
    toast.success("Island ceiling configuration updated");
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Island False Ceiling</CardTitle>
        <CardDescription>
          Configure the shape and dimensions of the island ceiling
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Island Shape</Label>
            <RadioGroup 
              value={config.shape} 
              onValueChange={(value) => handleShapeChange(value as IslandShape)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rectangle" id="rectangle" />
                <Label htmlFor="rectangle">Rectangle</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rectangular-cutout" id="rectangular-cutout" />
                <Label htmlFor="rectangular-cutout">Rectangular Cutout</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="circle" id="circle" />
                <Label htmlFor="circle">Circle</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="circular-cutout" id="circular-cutout" />
                <Label htmlFor="circular-cutout">Circular Cutout</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oval" id="oval" />
                <Label htmlFor="oval">Oval</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oval-cutout" id="oval-cutout" />
                <Label htmlFor="oval-cutout">Oval Cutout</Label>
              </div>
            </RadioGroup>
          </div>
          
          {(config.shape === 'rectangle' || config.shape === 'rectangular-cutout') && (
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
                  onChange={handleNumChange}
                />
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
                  onChange={handleNumChange}
                />
              </div>
            </div>
          )}
          
          {(config.shape === 'circle' || config.shape === 'circular-cutout') && (
            <div className="space-y-2">
              <Label htmlFor="radius">Radius (ft)</Label>
              <Input
                id="radius"
                name="radius"
                type="number"
                step="0.1"
                min="0.1"
                max={Math.min(roomDimensions.width, roomDimensions.length) / 2}
                value={config.radius}
                onChange={handleNumChange}
              />
            </div>
          )}
          
          {(config.shape === 'oval' || config.shape === 'oval-cutout') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="radiusX">Horizontal Radius (ft)</Label>
                <Input
                  id="radiusX"
                  name="radiusX"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={roomDimensions.width / 2}
                  value={config.radiusX}
                  onChange={handleNumChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="radiusY">Vertical Radius (ft)</Label>
                <Input
                  id="radiusY"
                  name="radiusY"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={roomDimensions.length / 2}
                  value={config.radiusY}
                  onChange={handleNumChange}
                />
              </div>
            </div>
          )}
          
          {/* Add cutout width field for cutout shapes */}
          {(config.shape === 'rectangular-cutout' || config.shape === 'circular-cutout' || config.shape === 'oval-cutout') && (
            <div className="space-y-2">
              <Label htmlFor="cutoutWidth">Cutout Width (ft)</Label>
              <Input
                id="cutoutWidth"
                name="cutoutWidth"
                type="number"
                step="0.1"
                min="0.1"
                value={config.cutoutWidth}
                onChange={handleNumChange}
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leftOffset">Distance from Left Wall (ft)</Label>
              <Input
                id="leftOffset"
                name="leftOffset"
                type="number"
                step="0.1"
                min="0"
                value={config.leftOffset}
                onChange={handleNumChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topOffset">Distance from Top Wall (ft)</Label>
              <Input
                id="topOffset"
                name="topOffset"
                type="number"
                step="0.1"
                min="0"
                value={config.topOffset}
                onChange={handleNumChange}
              />
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
              onChange={handleNumChange}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for automatic calculation based on ceiling size and shape
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
            Update Island Ceiling
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
