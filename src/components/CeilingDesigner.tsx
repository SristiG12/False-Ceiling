import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomDimensionsForm } from './RoomDimensionsForm';
import { CeilingTypeSelector } from './CeilingTypeSelector';
import { PlainCeilingForm } from './PlainCeilingForm';
import { PeripheralCeilingForm } from './PeripheralCeilingForm';
import { IslandCeilingForm } from './IslandCeilingForm';
import { CombinedCeilingForm } from './CombinedCeilingForm';
import { CeilingCanvas } from './CeilingCanvas';
import { CeilingConfig, CeilingType, RoomDimensions } from '@/types/ceiling';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const CeilingDesigner: React.FC = () => {
  const [config, setConfig] = useState<CeilingConfig>({
    roomDimensions: { width: 12, length: 15, height: 9 },
    ceilingType: 'plain',
    plainConfig: {
      width: 9.6, // 80% of room width
      length: 12, // 80% of room length
      topOffset: 1.5, // 10% of room length
      leftOffset: 1.2 // 10% of room width
    }
  });
  
  const handleRoomDimensionsChange = (dimensions: RoomDimensions) => {
    // Update room dimensions and adjust ceiling config if needed
    setConfig(prevConfig => {
      const newConfig: CeilingConfig = {
        ...prevConfig,
        roomDimensions: dimensions
      };
      
      // Adjust plain config to stay proportional
      if (prevConfig.ceilingType === 'plain' && prevConfig.plainConfig) {
        newConfig.plainConfig = {
          ...prevConfig.plainConfig,
          width: dimensions.width * 0.8,
          length: dimensions.length * 0.8,
          topOffset: dimensions.length * 0.1,
          leftOffset: dimensions.width * 0.1
        };
      }

      // If combined, update all configs that exist
      if (prevConfig.ceilingType === 'combined' && prevConfig.combinedConfig) {
        if (prevConfig.combinedConfig.plainConfig) {
          newConfig.combinedConfig = {
            ...prevConfig.combinedConfig,
            plainConfig: {
              ...prevConfig.combinedConfig.plainConfig,
              width: dimensions.width * 0.8,
              length: dimensions.length * 0.8,
              topOffset: dimensions.length * 0.1,
              leftOffset: dimensions.width * 0.1
            }
          };
        }

        if (prevConfig.combinedConfig.islandConfig) {
          newConfig.combinedConfig = {
            ...newConfig.combinedConfig!,
            islandConfig: {
              ...prevConfig.combinedConfig.islandConfig,
              width: dimensions.width * 0.4,
              length: dimensions.length * 0.4,
              topOffset: dimensions.length * 0.3,
              leftOffset: dimensions.width * 0.3
            }
          };
        }

        if (prevConfig.combinedConfig.peripheralConfig) {
          newConfig.combinedConfig = {
            ...newConfig.combinedConfig!,
            peripheralConfig: {
              ...prevConfig.combinedConfig.peripheralConfig,
              width: Math.min(2, Math.min(dimensions.width, dimensions.length) * 0.15)
            }
          };
        }
      }
      
      return newConfig;
    });
  };
  
  const handleCeilingTypeChange = (type: CeilingType) => {
    setConfig(prev => {
      const newConfig: CeilingConfig = {
        ...prev,
        ceilingType: type
      };
      
      // Set default configs when switching types
      switch (type) {
        case 'plain':
          newConfig.plainConfig = {
            width: prev.roomDimensions.width * 0.8,
            length: prev.roomDimensions.length * 0.8,
            topOffset: prev.roomDimensions.length * 0.1,
            leftOffset: prev.roomDimensions.width * 0.1,
            coveLight: false,
            coveLightPositions: []
          };
          break;
        case 'peripheral':
          newConfig.peripheralConfig = {
            width: Math.min(2, Math.min(prev.roomDimensions.width, prev.roomDimensions.length) * 0.15),
            sides: { top: true, right: true, bottom: true, left: true },
            coveLight: false,
            coveLightPositions: []
          };
          break;
        case 'island':
          newConfig.islandConfig = {
            shape: 'rectangle',
            width: prev.roomDimensions.width * 0.4,
            length: prev.roomDimensions.length * 0.4,
            topOffset: prev.roomDimensions.length * 0.3,
            leftOffset: prev.roomDimensions.width * 0.3,
            coveLight: false,
            coveLightPositions: []
          };
          break;
        case 'combined':
          newConfig.combinedConfig = {
            usePlain: true,
            usePeripheral: true,
            useIsland: false,
            plainConfig: {
              width: prev.roomDimensions.width * 0.8,
              length: prev.roomDimensions.length * 0.8,
              topOffset: prev.roomDimensions.length * 0.1,
              leftOffset: prev.roomDimensions.width * 0.1,
              coveLight: false,
              coveLightPositions: []
            },
            peripheralConfig: {
              width: Math.min(2, Math.min(prev.roomDimensions.width, prev.roomDimensions.length) * 0.15),
              sides: { top: true, right: true, bottom: true, left: true },
              coveLight: false,
              coveLightPositions: []
            }
          };
          break;
      }
      
      return newConfig;
    });
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <RoomDimensionsForm
            initialDimensions={config.roomDimensions}
            onSubmit={handleRoomDimensionsChange}
          />
          <CeilingTypeSelector 
            value={config.ceilingType}
            onChange={handleCeilingTypeChange}
          />
          
          {config.ceilingType === 'plain' && (
            <PlainCeilingForm 
              roomDimensions={config.roomDimensions} 
              onSubmit={plainConfig => setConfig({...config, plainConfig})}
              initialConfig={config.plainConfig}
            />
          )}
          
          {config.ceilingType === 'peripheral' && (
            <PeripheralCeilingForm 
              roomDimensions={config.roomDimensions} 
              onSubmit={peripheralConfig => setConfig({...config, peripheralConfig})}
              initialConfig={config.peripheralConfig}
            />
          )}
          
          {config.ceilingType === 'island' && (
            <IslandCeilingForm 
              roomDimensions={config.roomDimensions} 
              onSubmit={islandConfig => setConfig({...config, islandConfig})}
              initialConfig={config.islandConfig}
            />
          )}
          
          {config.ceilingType === 'combined' && (
            <CombinedCeilingForm
              roomDimensions={config.roomDimensions}
              onSubmit={combinedConfig => setConfig({...config, combinedConfig})}
              initialConfig={config.combinedConfig}
            />
          )}
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Ceiling Layout</h3>
          </div>
          
          <CeilingCanvas config={config} />
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Design Information</h3>
            <Separator className="my-4" />
            
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Room Dimensions:</span>
                <span>{config.roomDimensions.width.toFixed(1)} ft × {config.roomDimensions.length.toFixed(1)} ft</span>
                
                <span className="font-medium">Room Height:</span>
                <span>{config.roomDimensions.height.toFixed(1)} ft</span>
                
                <span className="font-medium">Ceiling Type:</span>
                <span className="capitalize">{config.ceilingType.replace('-', ' ')}</span>
                
                {config.ceilingType === 'combined' && config.combinedConfig && (
                  <React.Fragment>
                    <span className="font-medium">Components:</span>
                    <span>
                      {[
                        config.combinedConfig.usePlain ? 'Plain' : null,
                        config.combinedConfig.usePeripheral ? 'Peripheral' : null,
                        config.combinedConfig.useIsland ? 'Island' : null
                      ].filter(Boolean).join(', ')}
                    </span>
                  </React.Fragment>
                )}
                
                {config.ceilingType === 'plain' && config.plainConfig && (
                  <React.Fragment>
                    <span className="font-medium">Plain Ceiling Size:</span>
                    <span>{config.plainConfig.width.toFixed(1)} ft × {config.plainConfig.length.toFixed(1)} ft</span>
                    
                    {config.plainConfig.lightCount && (
                      <React.Fragment>
                        <span className="font-medium">Light Count:</span>
                        <span>{config.plainConfig.lightCount}</span>
                      </React.Fragment>
                    )}
                    
                    {config.plainConfig.coveLight && (
                      <React.Fragment>
                        <span className="font-medium">Cove Lighting:</span>
                        <span>
                          {config.plainConfig.coveLightPositions && config.plainConfig.coveLightPositions.length > 0
                            ? config.plainConfig.coveLightPositions.join(', ')
                            : 'none'} boundary
                        </span>
                      </React.Fragment>
                    )}
                  </React.Fragment>
                )}
                
                {config.ceilingType === 'peripheral' && config.peripheralConfig && (
                  <React.Fragment>
                    <span className="font-medium">Peripheral Width:</span>
                    <span>{config.peripheralConfig.width.toFixed(1)} ft</span>
                    
                    <span className="font-medium">Active Sides:</span>
                    <span>
                      {Object.entries(config.peripheralConfig.sides)
                        .filter(([_, active]) => active)
                        .map(([side]) => side.charAt(0).toUpperCase() + side.slice(1))
                        .join(', ')}
                    </span>
                    
                    {config.peripheralConfig.lightCount && (
                      <React.Fragment>
                        <span className="font-medium">Light Count:</span>
                        <span>{config.peripheralConfig.lightCount}</span>
                      </React.Fragment>
                    )}
                    
                    {config.peripheralConfig.coveLight && (
                      <React.Fragment>
                        <span className="font-medium">Cove Lighting:</span>
                        <span>
                          {config.peripheralConfig.coveLightPositions && config.peripheralConfig.coveLightPositions.length > 0
                            ? config.peripheralConfig.coveLightPositions.join(', ')
                            : 'none'} boundary
                        </span>
                      </React.Fragment>
                    )}
                  </React.Fragment>
                )}
                
                {config.ceilingType === 'island' && config.islandConfig && (
                  <React.Fragment>
                    <span className="font-medium">Island Shape:</span>
                    <span className="capitalize">
                      {config.islandConfig.shape.replace('-', ' ')}
                    </span>
                    
                    {(config.islandConfig.shape === 'rectangle' || 
                      config.islandConfig.shape === 'rectangular-cutout') && (
                      <React.Fragment>
                        <span className="font-medium">Island Size:</span>
                        <span>
                          {config.islandConfig.width.toFixed(1)} ft × {config.islandConfig.length?.toFixed(1)} ft
                        </span>
                        
                        {config.islandConfig.shape === 'rectangular-cutout' && (
                          <React.Fragment>
                            <span className="font-medium">Cutout Width:</span>
                            <span>{config.islandConfig.cutoutWidth?.toFixed(1) || '0.5'} ft</span>
                          </React.Fragment>
                        )}
                      </React.Fragment>
                    )}
                    
                    {(config.islandConfig.shape === 'circle' || 
                      config.islandConfig.shape === 'circular-cutout') && (
                      <React.Fragment>
                        <span className="font-medium">Circle Radius:</span>
                        <span>{config.islandConfig.radius?.toFixed(1)} ft</span>
                        
                        {config.islandConfig.shape === 'circular-cutout' && (
                          <React.Fragment>
                            <span className="font-medium">Cutout Width:</span>
                            <span>{config.islandConfig.cutoutWidth?.toFixed(1) || '0.5'} ft</span>
                          </React.Fragment>
                        )}
                      </React.Fragment>
                    )}
                    
                    {(config.islandConfig.shape === 'oval' || 
                      config.islandConfig.shape === 'oval-cutout') && (
                      <React.Fragment>
                        <span className="font-medium">Oval Dimensions:</span>
                        <span>
                          {(config.islandConfig.radiusX! * 2).toFixed(1)} ft × {(config.islandConfig.radiusY! * 2).toFixed(1)} ft
                        </span>
                        
                        {config.islandConfig.shape === 'oval-cutout' && (
                          <React.Fragment>
                            <span className="font-medium">Cutout Width:</span>
                            <span>{config.islandConfig.cutoutWidth?.toFixed(1) || '0.5'} ft</span>
                          </React.Fragment>
                        )}
                      </React.Fragment>
                    )}
                    
                    {config.islandConfig.lightCount && (
                      <React.Fragment>
                        <span className="font-medium">Light Count:</span>
                        <span>{config.islandConfig.lightCount}</span>
                      </React.Fragment>
                    )}
                    
                    {config.islandConfig.coveLight && (
                      <React.Fragment>
                        <span className="font-medium">Cove Lighting:</span>
                        <span>
                          {config.islandConfig.coveLightPositions && config.islandConfig.coveLightPositions.length > 0
                            ? config.islandConfig.coveLightPositions.join(', ')
                            : 'none'} boundary
                        </span>
                      </React.Fragment>
                    )}
                  </React.Fragment>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
