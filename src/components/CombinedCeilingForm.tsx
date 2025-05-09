import React, { useState, useEffect } from 'react';
import { CombinedCeilingConfig, RoomDimensions, IslandShape } from '@/types/ceiling';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlainCeilingForm } from './PlainCeilingForm';
import { PeripheralCeilingForm } from './PeripheralCeilingForm';
import { IslandCeilingForm } from './IslandCeilingForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, MultiSelect } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { CeilingCanvas } from './CeilingCanvas';

interface CombinedCeilingFormProps {
  roomDimensions: RoomDimensions;
  onSubmit: (config: CombinedCeilingConfig) => void;
  initialConfig?: CombinedCeilingConfig;
}

export const CombinedCeilingForm: React.FC<CombinedCeilingFormProps> = ({
  roomDimensions,
  onSubmit,
  initialConfig
}) => {
  const [config, setConfig] = useState<CombinedCeilingConfig>(
    initialConfig || {
      usePlain: true,
      usePeripheral: true,
      useIsland: false,
      plainConfig: {
        width: roomDimensions.width * 0.8,
        length: roomDimensions.length * 0.8,
        topOffset: roomDimensions.length * 0.1,
        leftOffset: roomDimensions.width * 0.1,
        lightCount: undefined,
        coveLight: false,
        coveLightPositions: []
      },
      peripheralConfig: {
        width: Math.min(2, Math.min(roomDimensions.width, roomDimensions.length) * 0.15),
        sides: { top: true, right: true, bottom: true, left: true },
        lightCount: undefined,
        coveLight: false,
        coveLightPositions: []
      }
    }
  );

  // Track which combinations are selected
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);

  // Ensure at least one active tab is selected
  const determineActiveTab = () => {
    if (config.usePlain) return 'plain';
    if (config.usePeripheral) return 'peripheral';
    if (config.useIsland) return 'island';
    return 'plain'; // Default
  };

  const [activeTab, setActiveTab] = useState<string>(determineActiveTab());
  
  useEffect(() => {
    // Update the active tab when no currently selected tab is valid
    if ((activeTab === 'plain' && !config.usePlain) ||
        (activeTab === 'peripheral' && !config.usePeripheral) ||
        (activeTab === 'island' && !config.useIsland)) {
      setActiveTab(determineActiveTab());
    }
  }, [config.usePlain, config.usePeripheral, config.useIsland, activeTab]);
  
  const handleTypeToggle = (type: 'usePlain' | 'usePeripheral' | 'useIsland') => {
    setConfig(prev => {
      const updated = { 
        ...prev,
        [type]: !prev[type]
      };
      
      // Initialize configs if they don't exist and the option is enabled
      if (type === 'usePlain' && updated.usePlain && !prev.plainConfig) {
        updated.plainConfig = {
          width: roomDimensions.width * 0.8,
          length: roomDimensions.length * 0.8,
          topOffset: roomDimensions.length * 0.1,
          leftOffset: roomDimensions.width * 0.1,
          lightCount: undefined,
          coveLight: false,
          coveLightPositions: []
        };
      }
      
      if (type === 'usePeripheral' && updated.usePeripheral && !prev.peripheralConfig) {
        updated.peripheralConfig = {
          width: Math.min(2, Math.min(roomDimensions.width, roomDimensions.length) * 0.15),
          sides: { top: true, right: true, bottom: true, left: true },
          lightCount: undefined,
          coveLight: false,
          coveLightPositions: []
        };
      }
      
      if (type === 'useIsland' && updated.useIsland && !prev.islandConfig) {
        updated.islandConfig = {
          shape: 'rectangle' as IslandShape,
          width: roomDimensions.width * 0.4,
          length: roomDimensions.length * 0.4,
          topOffset: roomDimensions.length * 0.3,
          leftOffset: roomDimensions.width * 0.3,
          lightCount: undefined,
          coveLight: false,
          coveLightPositions: []
        };
      }
      
      return updated;
    });
  };

  // Handle multi-select template selection
  const handleMultiTemplateSelect = (selectedItems: string[]) => {
    setSelectedTemplates(selectedItems);
    
    // Configure based on the selected templates
    const usePlain = selectedItems.some(item => 
      item === 'plain' || item === 'plain-island' || item === 'plain-peripheral' || item === 'all-three'
    );
    
    const usePeripheral = selectedItems.some(item => 
      item === 'peripheral' || item === 'plain-peripheral' || item === 'peripheral-island' || item === 'all-three'
    );
    
    const useIsland = selectedItems.some(item => 
      item === 'island' || item === 'plain-island' || item === 'peripheral-island' || item === 'all-three'
    );
    
    setConfig(prev => {
      const updated = {
        ...prev,
        usePlain,
        usePeripheral,
        useIsland,
      };
      
      // Initialize or update configs based on selections
      if (usePlain && (!prev.usePlain || !prev.plainConfig)) {
        updated.plainConfig = {
          width: roomDimensions.width * 0.8,
          length: roomDimensions.length * 0.8,
          topOffset: roomDimensions.length * 0.1,
          leftOffset: roomDimensions.width * 0.1,
          lightCount: prev.plainConfig?.lightCount,
          coveLight: prev.plainConfig?.coveLight || false,
          coveLightPositions: prev.plainConfig?.coveLightPositions || []
        };
      }
      
      if (usePeripheral && (!prev.usePeripheral || !prev.peripheralConfig)) {
        updated.peripheralConfig = {
          width: Math.min(2, Math.min(roomDimensions.width, roomDimensions.length) * 0.15),
          sides: { top: true, right: true, bottom: true, left: true },
          lightCount: prev.peripheralConfig?.lightCount,
          coveLight: prev.peripheralConfig?.coveLight || false,
          coveLightPositions: prev.peripheralConfig?.coveLightPositions || []
        };
      }
      
      if (useIsland && (!prev.useIsland || !prev.islandConfig)) {
        updated.islandConfig = {
          shape: 'rectangle' as IslandShape,
          width: roomDimensions.width * 0.4,
          length: roomDimensions.length * 0.4,
          topOffset: roomDimensions.length * 0.3,
          leftOffset: roomDimensions.width * 0.3,
          lightCount: prev.islandConfig?.lightCount,
          coveLight: prev.islandConfig?.coveLight || false,
          coveLightPositions: prev.islandConfig?.coveLightPositions || []
        };
      }
      
      return updated;
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    // Handle template selection
    switch(templateId) {
      case "plain-island":
        setConfig(prev => ({
          ...prev,
          usePlain: true,
          useIsland: true,
          usePeripheral: false,
          plainConfig: {
            ...(prev.plainConfig || {}),
            width: roomDimensions.width * 0.8,
            length: roomDimensions.length * 0.8,
            topOffset: roomDimensions.length * 0.1,
            leftOffset: roomDimensions.width * 0.1,
          },
          islandConfig: {
            ...(prev.islandConfig || {}),
            shape: 'rectangle' as IslandShape,
            width: roomDimensions.width * 0.4,
            length: roomDimensions.length * 0.4,
            topOffset: roomDimensions.length * 0.3,
            leftOffset: roomDimensions.width * 0.3,
            lightCount: prev.islandConfig?.lightCount,
            coveLight: prev.islandConfig?.coveLight || false,
            coveLightPositions: prev.islandConfig?.coveLightPositions || []
          }
        }));
        break;
      case "plain-peripheral":
        setConfig(prev => ({
          ...prev,
          usePlain: true,
          usePeripheral: true,
          useIsland: false,
          plainConfig: {
            ...(prev.plainConfig || {}),
            width: roomDimensions.width * 0.7,  // Smaller plain ceiling
            length: roomDimensions.length * 0.7,
            topOffset: roomDimensions.length * 0.15,
            leftOffset: roomDimensions.width * 0.15,
          },
          peripheralConfig: {
            ...(prev.peripheralConfig || {}),
            width: Math.min(2, Math.min(roomDimensions.width, roomDimensions.length) * 0.15),
            sides: { top: true, right: true, bottom: true, left: true }
          }
        }));
        break;
      case "peripheral-island":
        setConfig(prev => ({
          ...prev,
          usePlain: false,
          usePeripheral: true,
          useIsland: true,
          peripheralConfig: {
            ...(prev.peripheralConfig || {}),
            width: Math.min(2, Math.min(roomDimensions.width, roomDimensions.length) * 0.15),
            sides: { top: true, right: true, bottom: true, left: true }
          },
          islandConfig: {
            ...(prev.islandConfig || {}),
            shape: 'rectangle' as IslandShape,
            width: roomDimensions.width * 0.5,
            length: roomDimensions.length * 0.5,
            topOffset: roomDimensions.length * 0.25,
            leftOffset: roomDimensions.width * 0.25,
          }
        }));
        break;
      case "all-three":
        setConfig(prev => ({
          ...prev,
          usePlain: true,
          usePeripheral: true,
          useIsland: true,
          plainConfig: {
            ...(prev.plainConfig || {}),
            width: roomDimensions.width * 0.7,
            length: roomDimensions.length * 0.7,
            topOffset: roomDimensions.length * 0.15,
            leftOffset: roomDimensions.width * 0.15,
          },
          peripheralConfig: {
            ...(prev.peripheralConfig || {}),
            width: Math.min(2, Math.min(roomDimensions.width, roomDimensions.length) * 0.15),
            sides: { top: true, right: true, bottom: true, left: true }
          },
          islandConfig: {
            ...(prev.islandConfig || {}),
            shape: 'rectangle' as IslandShape,
            width: roomDimensions.width * 0.3,
            length: roomDimensions.length * 0.3,
            topOffset: roomDimensions.length * 0.35,
            leftOffset: roomDimensions.width * 0.35,
          }
        }));
        break;
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate at least one ceiling type is selected
    if (!config.usePlain && !config.usePeripheral && !config.useIsland) {
      toast({
        title: "Error",
        description: "At least one ceiling type must be selected",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit(config);
    toast({
      title: "Success", 
      description: "Combined ceiling configuration updated"
    });
  };

  // Define multi-select options
  const multiSelectOptions = [
    { value: "plain", label: "Plain" },
    { value: "peripheral", label: "Peripheral" },
    { value: "island", label: "Island" },
    { value: "plain-island", label: "Plain + Island" },
    { value: "plain-peripheral", label: "Plain + Peripheral" },
    { value: "peripheral-island", label: "Peripheral + Island" },
    { value: "all-three", label: "All Three Types" }
  ];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Combined False Ceiling</CardTitle>
            <CardDescription>
              Combine different ceiling types for a layered design
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Select Ceiling Types to Include</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="usePlain"
                  checked={config.usePlain}
                  onCheckedChange={() => handleTypeToggle('usePlain')}
                />
                <Label htmlFor="usePlain" className="cursor-pointer">Plain</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="usePeripheral"
                  checked={config.usePeripheral}
                  onCheckedChange={() => handleTypeToggle('usePeripheral')}
                />
                <Label htmlFor="usePeripheral" className="cursor-pointer">Peripheral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="useIsland"
                  checked={config.useIsland}
                  onCheckedChange={() => handleTypeToggle('useIsland')}
                />
                <Label htmlFor="useIsland" className="cursor-pointer">Island</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Ceiling Combination Templates</Label>
            <div className="flex justify-between items-center mb-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowMultiSelect(!showMultiSelect)}
              >
                {showMultiSelect ? "Use Single Select" : "Use Multi Select"}
              </Button>
            </div>
            
            {showMultiSelect ? (
              <MultiSelect
                options={multiSelectOptions}
                selected={selectedTemplates}
                onChange={handleMultiTemplateSelect}
                placeholder="Select combination templates"
              />
            ) : (
              <Select 
                onValueChange={handleTemplateSelect}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a design template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plain-island">Plain + Island</SelectItem>
                  <SelectItem value="plain-peripheral">Plain + Peripheral</SelectItem>
                  <SelectItem value="peripheral-island">Peripheral + Island</SelectItem>
                  <SelectItem value="all-three">All Three Types</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            <p className="text-sm text-muted-foreground">
              Select a preset template or customize each ceiling type individually
            </p>
          </div>
          
          <Separator />
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger 
                value="plain" 
                disabled={!config.usePlain}
              >
                Plain
              </TabsTrigger>
              <TabsTrigger 
                value="peripheral" 
                disabled={!config.usePeripheral}
              >
                Peripheral
              </TabsTrigger>
              <TabsTrigger 
                value="island" 
                disabled={!config.useIsland}
              >
                Island
              </TabsTrigger>
            </TabsList>
            
            {config.usePlain && (
              <TabsContent value="plain" className="border rounded-b-lg p-4 mt-2">
                <h4 className="font-medium mb-4">Plain Ceiling Settings</h4>
                <PlainCeilingForm 
                  roomDimensions={roomDimensions}
                  initialConfig={config.plainConfig}
                  onSubmit={plainConfig => setConfig({...config, plainConfig})}
                />
              </TabsContent>
            )}
            
            {config.usePeripheral && (
              <TabsContent value="peripheral" className="border rounded-b-lg p-4 mt-2">
                <h4 className="font-medium mb-4">Peripheral Ceiling Settings</h4>
                <PeripheralCeilingForm
                  roomDimensions={roomDimensions}
                  initialConfig={config.peripheralConfig}
                  onSubmit={peripheralConfig => setConfig({...config, peripheralConfig})}
                />
              </TabsContent>
            )}
            
            {config.useIsland && (
              <TabsContent value="island" className="border rounded-b-lg p-4 mt-2">
                <h4 className="font-medium mb-4">Island Ceiling Settings</h4>
                <IslandCeilingForm
                  roomDimensions={roomDimensions}
                  initialConfig={config.islandConfig}
                  onSubmit={islandConfig => setConfig({...config, islandConfig})}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Update Combined Ceiling
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
