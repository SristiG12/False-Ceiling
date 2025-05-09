
export type CeilingType = 'plain' | 'peripheral' | 'island' | 'combined';

export type IslandShape = 
  | 'rectangle' 
  | 'circle' 
  | 'oval' 
  | 'rectangular-cutout' 
  | 'circular-cutout' 
  | 'oval-cutout';

export type PeripheralSides = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export interface RoomDimensions {
  width: number;
  length: number;
  height: number;
}

export type CoveLightPosition = 'inner' | 'outer';

export interface PlainCeilingConfig {
  width: number;
  length: number;
  topOffset: number;
  leftOffset: number;
  lightCount?: number; // Optional light count
  coveLight?: boolean; // Option for cove lighting
  coveLightPositions?: CoveLightPosition[]; // Array of cove light positions
}

export interface PeripheralCeilingConfig {
  width: number;
  sides: PeripheralSides;
  lightCount?: number; // Optional light count
  coveLight?: boolean; // Option for cove lighting
  coveLightPositions?: CoveLightPosition[]; // Array of cove light positions
}

export interface IslandCeilingConfig {
  shape: IslandShape;
  width: number;
  length?: number;
  radius?: number;
  radiusX?: number;
  radiusY?: number;
  topOffset: number;
  leftOffset: number;
  cutoutWidth?: number; // Width for cutout
  lightCount?: number; // Optional light count
  coveLight?: boolean; // Option for cove lighting
  coveLightPositions?: CoveLightPosition[]; // Array of cove light positions
}

export interface LightPosition {
  x: number;
  y: number;
  radius: number;
  type?: 'regular' | 'cove'; // Type of light (regular or cove)
}

export interface CombinedCeilingConfig {
  usePlain: boolean;
  usePeripheral: boolean;
  useIsland: boolean;
  plainConfig?: PlainCeilingConfig;
  peripheralConfig?: PeripheralCeilingConfig;
  islandConfig?: IslandCeilingConfig;
}

export interface CeilingConfig {
  roomDimensions: RoomDimensions;
  ceilingType: CeilingType;
  plainConfig?: PlainCeilingConfig;
  peripheralConfig?: PeripheralCeilingConfig;
  islandConfig?: IslandCeilingConfig;
  combinedConfig?: CombinedCeilingConfig;
}
