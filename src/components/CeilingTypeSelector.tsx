
import React from 'react';
import { CeilingType } from '@/types/ceiling';
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface CeilingTypeSelectorProps {
  value: CeilingType;
  onChange: (type: CeilingType) => void;
}

export const CeilingTypeSelector: React.FC<CeilingTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <Card className="w-full p-5">
      <div className="space-y-3">
        <h3 className="font-medium text-lg">Ceiling Type</h3>
        <p className="text-sm text-muted-foreground">
          Select the type of false ceiling for your design
        </p>
        <RadioGroup 
          value={value}
          onValueChange={(val) => onChange(val as CeilingType)}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3"
        >
          <div className="flex flex-col gap-2 items-center">
            <div className="border-2 border-primary/50 rounded-md h-16 w-32 bg-ceiling-DEFAULT flex items-center justify-center">
              <div className="bg-ceiling-light h-2 w-2 rounded-full" />
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="plain" id="plain" />
              <Label htmlFor="plain">Plain</Label>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 items-center">
            <div className="border-2 border-primary/50 rounded-md h-16 w-32 bg-ceiling-room p-2">
              <div className="border-2 border-ceiling-DEFAULT h-full w-full flex items-center justify-center">
                <div className="bg-ceiling-light h-2 w-2 rounded-full" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="peripheral" id="peripheral" />
              <Label htmlFor="peripheral">Peripheral</Label>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 items-center">
            <div className="border-2 border-primary/50 rounded-md h-16 w-32 bg-ceiling-room flex items-center justify-center">
              <div className="bg-ceiling-DEFAULT h-12 w-12 rounded-md flex items-center justify-center">
                <div className="bg-ceiling-light h-2 w-2 rounded-full" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="island" id="island" />
              <Label htmlFor="island">Island</Label>
            </div>
          </div>
        </RadioGroup>
      </div>
    </Card>
  );
};
