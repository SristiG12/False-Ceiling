import React, { useRef, useEffect } from 'react';
import { CeilingConfig, LightPosition } from '@/types/ceiling';
import { calculateLightingPositions } from '@/utils/lightingCalculator';
import DownloadImageButton from './DownloadImageButton';

interface CeilingCanvasProps {
  config: CeilingConfig;
  scale?: number;
}

export const CeilingCanvas: React.FC<CeilingCanvasProps> = ({ config, scale = 30 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw the ceiling design
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const roomWidth = Math.max(1, config.roomDimensions.width * scale);
    const roomLength = Math.max(1, config.roomDimensions.length * scale);
    
    // Set canvas size
    canvas.width = roomWidth;
    canvas.height = roomLength;
    
    // Fill room background
    ctx.fillStyle = '#F1F0FB'; // Light gray for room
    ctx.fillRect(0, 0, roomWidth, roomLength);
    
    // Draw room outline
    ctx.strokeStyle = '#8A898C'; // Medium gray for room outline
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, roomWidth, roomLength);
    
    // Draw room dimension labels
    drawRoomDimensionLabels(ctx, config.roomDimensions.width, config.roomDimensions.length, scale);
    
    // Calculate lighting positions
    const lightPositions = calculateLightingPositions(config);
    
    // Draw ceiling based on type
    if (config.ceilingType === 'combined' && config.combinedConfig) {
      // Draw combined ceiling elements
      const { usePlain, usePeripheral, useIsland, plainConfig, peripheralConfig, islandConfig } = config.combinedConfig;
      
      // Draw peripheral first (lowest level)
      if (usePeripheral && peripheralConfig) {
        drawPeripheralCeiling(ctx, config.roomDimensions.width, config.roomDimensions.length, peripheralConfig, scale);
        
        // Draw cove lights for peripheral if enabled
        if (peripheralConfig.coveLight && peripheralConfig.coveLightPositions && peripheralConfig.coveLightPositions.length > 0) {
          drawCoveLights(ctx, config.roomDimensions.width, config.roomDimensions.length, 'peripheral', peripheralConfig, scale);
        }
      }
      
      // Draw plain next (middle level)
      if (usePlain && plainConfig) {
        drawPlainCeiling(ctx, plainConfig, scale);
        
        // Draw cove lights for plain if enabled
        if (plainConfig.coveLight && plainConfig.coveLightPositions && plainConfig.coveLightPositions.length > 0) {
          drawCoveLights(ctx, config.roomDimensions.width, config.roomDimensions.length, 'plain', plainConfig, scale);
        }
      }
      
      // Draw island last (top level)
      if (useIsland && islandConfig) {
        drawIslandCeiling(ctx, islandConfig, scale);
        
        // Draw cove lights for island if enabled
        if (islandConfig.coveLight && islandConfig.coveLightPositions && islandConfig.coveLightPositions.length > 0) {
          drawCoveLights(ctx, config.roomDimensions.width, config.roomDimensions.length, 'island', islandConfig, scale);
        }
      }
    } else {
      // Draw individual ceiling types
      switch(config.ceilingType) {
        case 'plain':
          if (config.plainConfig) {
            drawPlainCeiling(ctx, config.plainConfig, scale);
            
            // Draw cove lights for plain if enabled
            if (config.plainConfig.coveLight && config.plainConfig.coveLightPositions && config.plainConfig.coveLightPositions.length > 0) {
              drawCoveLights(ctx, config.roomDimensions.width, config.roomDimensions.length, 'plain', config.plainConfig, scale);
            }
          }
          break;
          
        case 'peripheral':
          if (config.peripheralConfig) {
            drawPeripheralCeiling(ctx, config.roomDimensions.width, config.roomDimensions.length, config.peripheralConfig, scale);
            
            // Draw cove lights for peripheral if enabled
            if (config.peripheralConfig.coveLight && config.peripheralConfig.coveLightPositions && config.peripheralConfig.coveLightPositions.length > 0) {
              drawCoveLights(ctx, config.roomDimensions.width, config.roomDimensions.length, 'peripheral', config.peripheralConfig, scale);
            }
          }
          break;
          
        case 'island':
          if (config.islandConfig) {
            drawIslandCeiling(ctx, config.islandConfig, scale);
            
            // Draw cove lights for island if enabled
            if (config.islandConfig.coveLight && config.islandConfig.coveLightPositions && config.islandConfig.coveLightPositions.length > 0) {
              drawCoveLights(ctx, config.roomDimensions.width, config.roomDimensions.length, 'island', config.islandConfig, scale);
            }
          }
          break;
      }
    }
    
    // Draw regular lights
    lightPositions.forEach((light) => {
      if (light.type !== 'cove') {
        // Ensure light radius is positive
        const lightRadiusPixels = Math.max(1, light.radius * scale); // Ensure minimum 1px radius
        
        // Draw regular lights
        ctx.beginPath();
        ctx.arc(
          light.x * scale, 
          light.y * scale, 
          lightRadiusPixels,
          0, 
          2 * Math.PI
        );
        ctx.fillStyle = '#FEF7CD'; // Soft yellow for lights
        ctx.fill();
        ctx.strokeStyle = '#F97316'; // Bright orange outline
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
    
  }, [config, scale]);

  // Helper function to draw cove lights
  const drawCoveLights = (
    ctx: CanvasRenderingContext2D, 
    roomWidth: number, 
    roomLength: number, 
    ceilingType: string, 
    ceilingConfig: any, 
    scale: number
  ) => {
    const coveWidth = 0.1; // Width of cove lights in feet
    const coveOffset = 0.05; // Offset from the edge in feet
    
    ctx.fillStyle = '#FFFACD'; // Light yellow for cove lights
    ctx.strokeStyle = '#FFCC00'; // Soft orange outline for cove lights
    ctx.lineWidth = 1;
    
    if (ceilingType === 'plain') {
      // For plain ceiling
      const { width, length, leftOffset, topOffset, coveLightPositions } = ceilingConfig;
      
      coveLightPositions.forEach(position => {
        if (position === 'outer') {
          // Draw a continuous cove light band around the entire perimeter
          ctx.save();
          // Draw the outer rectangle (cove band)
          ctx.beginPath();
          ctx.rect(
            (leftOffset - coveOffset) * scale,
            (topOffset - coveOffset) * scale,
            (width + 2 * coveOffset) * scale,
            (length + 2 * coveOffset) * scale
          );
          // Cut out the inner rectangle
          ctx.rect(
            (leftOffset + coveWidth + coveOffset) * scale,
            (topOffset + coveWidth + coveOffset) * scale,
            (width - 2 * (coveWidth + coveOffset)) * scale,
            (length - 2 * (coveWidth + coveOffset)) * scale
          );
          ctx.fillStyle = '#FFFACD';
          ctx.strokeStyle = '#FFCC00';
          ctx.lineWidth = 2;
          ctx.fill('evenodd');
          ctx.stroke();
          ctx.restore();
        } else if (position === 'inner') {
          // Inner cove lights for plain ceiling
          // Top edge
          ctx.fillRect(
            leftOffset * scale + coveOffset * scale,
            topOffset * scale + coveOffset * scale,
            width * scale - 2 * coveOffset * scale,
            coveWidth * scale
          );
          ctx.strokeRect(
            leftOffset * scale + coveOffset * scale,
            topOffset * scale + coveOffset * scale,
            width * scale - 2 * coveOffset * scale,
            coveWidth * scale
          );
          
          // Bottom edge
          ctx.fillRect(
            leftOffset * scale + coveOffset * scale,
            (topOffset + length - coveWidth - coveOffset) * scale,
            width * scale - 2 * coveOffset * scale,
            coveWidth * scale
          );
          ctx.strokeRect(
            leftOffset * scale + coveOffset * scale,
            (topOffset + length - coveWidth - coveOffset) * scale,
            width * scale - 2 * coveOffset * scale,
            coveWidth * scale
          );
          
          // Left edge
          ctx.fillRect(
            leftOffset * scale + coveOffset * scale,
            (topOffset + coveWidth + coveOffset) * scale,
            coveWidth * scale,
            (length - 2 * coveWidth - 2 * coveOffset) * scale
          );
          ctx.strokeRect(
            leftOffset * scale + coveOffset * scale,
            (topOffset + coveWidth + coveOffset) * scale,
            coveWidth * scale,
            (length - 2 * coveWidth - 2 * coveOffset) * scale
          );
          
          // Right edge
          ctx.fillRect(
            (leftOffset + width - coveWidth - coveOffset) * scale,
            (topOffset + coveWidth + coveOffset) * scale,
            coveWidth * scale,
            (length - 2 * coveWidth - 2 * coveOffset) * scale
          );
          ctx.strokeRect(
            (leftOffset + width - coveWidth - coveOffset) * scale,
            (topOffset + coveWidth + coveOffset) * scale,
            coveWidth * scale,
            (length - 2 * coveWidth - 2 * coveOffset) * scale
          );
        }
      });
    } else if (ceilingType === 'peripheral') {
      // For peripheral ceiling
      const { width, sides, coveLightPositions } = ceilingConfig;
      
      // Fix: Instead of using sides.forEach, check each side individually
      // and render cove lights for each selected position
      if (coveLightPositions && Array.isArray(coveLightPositions)) {
        coveLightPositions.forEach(position => {
          // Top side
          if (sides.top) {
            if (position === 'outer') {
              ctx.fillRect(0, 0, roomWidth * scale, coveWidth * scale);
              ctx.strokeRect(0, 0, roomWidth * scale, coveWidth * scale);
            }
            if (position === 'inner') {
              ctx.fillRect(width * scale, width * scale, (roomWidth - 2 * width) * scale, coveWidth * scale);
              ctx.strokeRect(width * scale, width * scale, (roomWidth - 2 * width) * scale, coveWidth * scale);
            }
          }
          
          // Bottom side
          if (sides.bottom) {
            if (position === 'outer') {
              ctx.fillRect(0, roomLength * scale - coveWidth * scale, roomWidth * scale, coveWidth * scale);
              ctx.strokeRect(0, roomLength * scale - coveWidth * scale, roomWidth * scale, coveWidth * scale);
            }
            if (position === 'inner') {
              ctx.fillRect(width * scale, roomLength * scale - width * scale, (roomWidth - 2 * width) * scale, coveWidth * scale);
              ctx.strokeRect(width * scale, roomLength * scale - width * scale, (roomWidth - 2 * width) * scale, coveWidth * scale);
            }
          }
          
          // Left side
          if (sides.left) {
            if (position === 'outer') {
              ctx.fillRect(0, 0, coveWidth * scale, roomLength * scale);
              ctx.strokeRect(0, 0, coveWidth * scale, roomLength * scale);
            }
            if (position === 'inner') {
              ctx.fillRect(width * scale - coveWidth * scale, width * scale, coveWidth * scale, (roomLength - 2 * width) * scale);
              ctx.strokeRect(width * scale - coveWidth * scale, width * scale, coveWidth * scale, (roomLength - 2 * width) * scale);
            }
          }
          
          // Right side
          if (sides.right) {
            if (position === 'outer') {
              ctx.fillRect(roomWidth * scale - coveWidth * scale, 0, coveWidth * scale, roomLength * scale);
              ctx.strokeRect(roomWidth * scale - coveWidth * scale, 0, coveWidth * scale, roomLength * scale);
            }
            if (position === 'inner') {
              ctx.fillRect(roomWidth * scale - width * scale, width * scale, coveWidth * scale, (roomLength - 2 * width) * scale);
              ctx.strokeRect(roomWidth * scale - width * scale, width * scale, coveWidth * scale, (roomLength - 2 * width) * scale);
            }
          }
        });
      }
    } else if (ceilingType === 'island') {
      // For island ceiling
      const { shape, width, length, radius, radiusX, radiusY, topOffset, leftOffset, coveLightPositions } = ceilingConfig;
      
      coveLightPositions.forEach(position => {
        if (shape === 'rectangle' || shape === 'rectangular-cutout') {
          if (position === 'outer') {
            // Outer cove lights for rectangular island
            // Top edge
            ctx.fillRect(
              leftOffset * scale - coveOffset * scale,
              topOffset * scale - coveOffset * scale,
              width * scale + 2 * coveOffset * scale,
              coveWidth * scale
            );
            ctx.strokeRect(
              leftOffset * scale - coveOffset * scale,
              topOffset * scale - coveOffset * scale,
              width * scale + 2 * coveOffset * scale,
              coveWidth * scale
            );
            
            // Bottom edge
            ctx.fillRect(
              leftOffset * scale - coveOffset * scale,
              (topOffset + length) * scale,
              width * scale + 2 * coveOffset * scale,
              coveWidth * scale
            );
            ctx.strokeRect(
              leftOffset * scale - coveOffset * scale,
              (topOffset + length) * scale,
              width * scale + 2 * coveOffset * scale,
              coveWidth * scale
            );
            
            // Left edge
            ctx.fillRect(
              leftOffset * scale - coveOffset * scale,
              topOffset * scale,
              coveWidth * scale,
              length * scale
            );
            ctx.strokeRect(
              leftOffset * scale - coveOffset * scale,
              topOffset * scale,
              coveWidth * scale,
              length * scale
            );
            
            // Right edge
            ctx.fillRect(
              (leftOffset + width) * scale,
              topOffset * scale,
              coveWidth * scale,
              length * scale
            );
            ctx.strokeRect(
              (leftOffset + width) * scale,
              topOffset * scale,
              coveWidth * scale,
              length * scale
            );
          } else if (position === 'inner') {
            // Inner cove lights for rectangular island
            if (shape === 'rectangular-cutout') {
              const cWidth = Math.max(0.1, ceilingConfig.cutoutWidth || 0.5);
              
              // Top edge
              ctx.fillRect(
                (leftOffset + cWidth + coveOffset) * scale,
                (topOffset + cWidth) * scale,
                (width - 2 * cWidth - 2 * coveOffset) * scale,
                coveWidth * scale
              );
              ctx.strokeRect(
                (leftOffset + cWidth + coveOffset) * scale,
                (topOffset + cWidth) * scale,
                (width - 2 * cWidth - 2 * coveOffset) * scale,
                coveWidth * scale
              );
              
              // Bottom edge
              ctx.fillRect(
                (leftOffset + cWidth + coveOffset) * scale,
                (topOffset + length - cWidth - coveWidth) * scale,
                (width - 2 * cWidth - 2 * coveOffset) * scale,
                coveWidth * scale
              );
              ctx.strokeRect(
                (leftOffset + cWidth + coveOffset) * scale,
                (topOffset + length - cWidth - coveWidth) * scale,
                (width - 2 * cWidth - 2 * coveOffset) * scale,
                coveWidth * scale
              );
              
              // Left edge
              ctx.fillRect(
                (leftOffset + cWidth) * scale,
                (topOffset + cWidth + coveWidth) * scale,
                coveWidth * scale,
                (length - 2 * cWidth - 2 * coveWidth) * scale
              );
              ctx.strokeRect(
                (leftOffset + cWidth) * scale,
                (topOffset + cWidth + coveWidth) * scale,
                coveWidth * scale,
                (length - 2 * cWidth - 2 * coveWidth) * scale
              );
              
              // Right edge
              ctx.fillRect(
                (leftOffset + width - cWidth - coveWidth) * scale,
                (topOffset + cWidth + coveWidth) * scale,
                coveWidth * scale,
                (length - 2 * cWidth - 2 * coveWidth) * scale
              );
              ctx.strokeRect(
                (leftOffset + width - cWidth - coveWidth) * scale,
                (topOffset + cWidth + coveWidth) * scale,
                coveWidth * scale,
                (length - 2 * cWidth - 2 * coveWidth) * scale
              );
            }
          }
        } else if (shape === 'circle' || shape === 'circular-cutout') {
          const centerX = (leftOffset + radius) * scale;
          const centerY = (topOffset + radius) * scale;
          const radiusPixels = Math.max(1, radius * scale);
          
          if (position === 'outer') {
            // Draw outer cove light circle
            ctx.beginPath();
            ctx.arc(
              centerX, 
              centerY, 
              radiusPixels + coveOffset * scale, 
              0, 
              2 * Math.PI
            );
            ctx.lineWidth = coveWidth * scale;
            ctx.strokeStyle = '#FFFACD';
            ctx.stroke();
            
            // Draw outline
            ctx.beginPath();
            ctx.arc(
              centerX, 
              centerY, 
              radiusPixels + coveOffset * scale, 
              0, 
              2 * Math.PI
            );
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#FFCC00';
            ctx.stroke();
          } else if (position === 'inner' && shape === 'circular-cutout') {
            const cWidth = Math.max(0.1, ceilingConfig.cutoutWidth || 0.5);
            const innerRadius = (radius - cWidth) * scale;
            
            // Draw inner cove light circle
            ctx.beginPath();
            ctx.arc(
              centerX, 
              centerY, 
              innerRadius - coveOffset * scale, 
              0, 
              2 * Math.PI
            );
            ctx.lineWidth = coveWidth * scale;
            ctx.strokeStyle = '#FFFACD';
            ctx.stroke();
            
            // Draw outline
            ctx.beginPath();
            ctx.arc(
              centerX, 
              centerY, 
              innerRadius - coveOffset * scale, 
              0, 
              2 * Math.PI
            );
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#FFCC00';
            ctx.stroke();
          }
        } else if (shape === 'oval' || shape === 'oval-cutout') {
          const rx = (radiusX || width / 2) * scale;
          const ry = (radiusY || (length ? length / 2 : width / 2)) * scale;
          const centerX = (leftOffset + (radiusX || width / 2)) * scale;
          const centerY = (topOffset + (radiusY || (length ? length / 2 : width / 2))) * scale;
          
          if (position === 'outer') {
            // Draw outer cove light oval
            ctx.beginPath();
            ctx.ellipse(
              centerX, 
              centerY, 
              rx + coveOffset * scale, 
              ry + coveOffset * scale, 
              0, 0, 2 * Math.PI
            );
            ctx.lineWidth = coveWidth * scale;
            ctx.strokeStyle = '#FFFACD';
            ctx.stroke();
            
            // Draw outline
            ctx.beginPath();
            ctx.ellipse(
              centerX, 
              centerY, 
              rx + coveOffset * scale, 
              ry + coveOffset * scale, 
              0, 0, 2 * Math.PI
            );
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#FFCC00';
            ctx.stroke();
          } else if (position === 'inner' && shape === 'oval-cutout') {
            const cWidth = Math.max(0.1, ceilingConfig.cutoutWidth || 0.5);
            const innerRx = rx - cWidth * scale;
            const innerRy = ry - cWidth * scale;
            
            // Draw inner cove light oval
            ctx.beginPath();
            ctx.ellipse(
              centerX, 
              centerY, 
              innerRx - coveOffset * scale, 
              innerRy - coveOffset * scale, 
              0, 0, 2 * Math.PI
            );
            ctx.lineWidth = coveWidth * scale;
            ctx.strokeStyle = '#FFFACD';
            ctx.stroke();
            
            // Draw outline
            ctx.beginPath();
            ctx.ellipse(
              centerX, 
              centerY, 
              innerRx - coveOffset * scale, 
              innerRy - coveOffset * scale, 
              0, 0, 2 * Math.PI
            );
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#FFCC00';
            ctx.stroke();
          }
        }
      });
    }
  };
  
  // Helper function to draw plain ceiling
  const drawPlainCeiling = (ctx: CanvasRenderingContext2D, plainConfig, scale: number) => {
    const { width, length, leftOffset, topOffset } = plainConfig;
    
    // Draw plain ceiling
    ctx.fillStyle = '#E5DEFF'; // Soft purple for ceiling
    ctx.fillRect(
      leftOffset * scale, 
      topOffset * scale, 
      width * scale, 
      length * scale
    );
    
    // Draw ceiling outline
    ctx.strokeStyle = '#8B5CF6'; // Vivid purple for ceiling outline
    ctx.lineWidth = 2;
    ctx.strokeRect(
      leftOffset * scale, 
      topOffset * scale, 
      width * scale, 
      length * scale
    );
    
    // Draw false ceiling dimension labels
    drawFalseCeilingDimensionLabels(ctx, leftOffset, topOffset, width, length, scale);
  };
  
  // Helper function to draw peripheral ceiling
  const drawPeripheralCeiling = (ctx: CanvasRenderingContext2D, roomWidth: number, roomLength: number, peripheralConfig, scale: number) => {
    const { width, sides } = peripheralConfig;

    // Fill the entire room with a lighter purple
    ctx.fillStyle = '#F6F3FF';
    ctx.fillRect(0, 0, roomWidth * scale, roomLength * scale);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#8B5CF6';

    // --- PRECISE BORDER LOGIC FOR PERIPHERAL FALSE CEILING ---
    // Draw the filled strips as before
    if (sides.top) {
      ctx.fillStyle = '#E5DEFF';
      ctx.fillRect(0, 0, roomWidth * scale, width * scale);
    }
    if (sides.right) {
      ctx.fillStyle = '#E5DEFF';
      ctx.fillRect(roomWidth * scale - width * scale, 0, width * scale, roomLength * scale);
    }
    if (sides.bottom) {
      ctx.fillStyle = '#E5DEFF';
      ctx.fillRect(0, roomLength * scale - width * scale, roomWidth * scale, width * scale);
    }
    if (sides.left) {
      ctx.fillStyle = '#E5DEFF';
      ctx.fillRect(0, 0, width * scale, roomLength * scale);
    }

    // Always draw a full outer border rectangle
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(0, 0, roomWidth * scale, roomLength * scale);
    ctx.stroke();

    // Draw the inner borders as before
    // Top strip inner border
    if (sides.top) {
      ctx.beginPath();
      if (!sides.left) {
        ctx.moveTo(0, width * scale);
        ctx.lineTo(width * scale, width * scale);
      }
      ctx.moveTo(width * scale, width * scale);
      ctx.lineTo(roomWidth * scale - width * scale, width * scale);
      if (!sides.right) {
        ctx.lineTo(roomWidth * scale, width * scale);
      }
      ctx.stroke();
    }
    // Right strip inner border
    if (sides.right) {
      ctx.beginPath();
      if (!sides.top) {
        ctx.moveTo(roomWidth * scale - width * scale, 0);
        ctx.lineTo(roomWidth * scale - width * scale, width * scale);
      }
      ctx.moveTo(roomWidth * scale - width * scale, width * scale);
      ctx.lineTo(roomWidth * scale - width * scale, roomLength * scale - width * scale);
      if (!sides.bottom) {
        ctx.lineTo(roomWidth * scale - width * scale, roomLength * scale);
      }
      ctx.stroke();
    }
    // Bottom strip inner border
    if (sides.bottom) {
      ctx.beginPath();
      if (!sides.left) {
        ctx.moveTo(0, roomLength * scale - width * scale);
        ctx.lineTo(width * scale, roomLength * scale - width * scale);
      }
      ctx.moveTo(width * scale, roomLength * scale - width * scale);
      ctx.lineTo(roomWidth * scale - width * scale, roomLength * scale - width * scale);
      if (!sides.right) {
        ctx.lineTo(roomWidth * scale, roomLength * scale - width * scale);
      }
      ctx.stroke();
    }
    // Left strip inner border
    if (sides.left) {
      ctx.beginPath();
      if (!sides.top) {
        ctx.moveTo(width * scale, 0);
        ctx.lineTo(width * scale, width * scale);
      }
      ctx.moveTo(width * scale, width * scale);
      ctx.lineTo(width * scale, roomLength * scale - width * scale);
      if (!sides.bottom) {
        ctx.lineTo(width * scale, roomLength * scale);
      }
      ctx.stroke();
    }

    // Draw width labels only for selected sides
    if (sides.top) {
      drawWidthLabel(ctx, width, roomWidth * scale / 2, width * scale / 2, scale);
    }
    if (sides.bottom) {
      drawWidthLabel(ctx, width, roomWidth * scale / 2, roomLength * scale - width * scale / 2, scale);
    }
    if (sides.left) {
      drawWidthLabel(ctx, width, width * scale / 2, roomLength * scale / 2, scale);
    }
    if (sides.right) {
      drawWidthLabel(ctx, width, roomWidth * scale - width * scale / 2, roomLength * scale / 2, scale);
    }
  };
  
  // Helper function to draw island ceiling
  const drawIslandCeiling = (ctx: CanvasRenderingContext2D, islandConfig, scale: number) => {
    const { 
      shape, 
      width, 
      length, 
      radius, 
      radiusX, 
      radiusY, 
      topOffset, 
      leftOffset,
      cutoutWidth
    } = islandConfig;
    
    ctx.fillStyle = '#E5DEFF'; // Soft purple for ceiling
    ctx.strokeStyle = '#8B5CF6'; // Vivid purple for ceiling outline
    ctx.lineWidth = 2;
    
    if (shape === 'rectangle' || shape === 'rectangular-cutout') {
      if (length) {
        if (shape === 'rectangle') {
          // Draw solid rectangle
          ctx.fillRect(
            leftOffset * scale, 
            topOffset * scale, 
            width * scale, 
            length * scale
          );
        } else {
          // For cutout, we'll draw the outer and inner rectangles
          const cWidth = Math.max(0.1, cutoutWidth || 0.5); // Default to 0.5ft if not specified, ensure minimum positive value
          
          // Draw using path to create a monolithic look with inner cutout
          ctx.beginPath();
          
          // Outer rectangle (clockwise)
          ctx.rect(
            leftOffset * scale, 
            topOffset * scale, 
            width * scale, 
            length * scale
          );
          
          // Inner rectangle (counterclockwise for cutout)
          ctx.rect(
            (leftOffset + cWidth) * scale, 
            (topOffset + cWidth) * scale, 
            (width - 2 * cWidth) * scale, 
            (length - 2 * cWidth) * scale
          );
          
          // Fill with even-odd winding rule
          ctx.fill("evenodd");
          
          // Draw outer rectangle outline
          ctx.strokeRect(
            leftOffset * scale, 
            topOffset * scale, 
            width * scale, 
            length * scale
          );
          
          // Draw inner rectangle outline
          ctx.strokeRect(
            (leftOffset + cWidth) * scale, 
            (topOffset + cWidth) * scale, 
            (width - 2 * cWidth) * scale, 
            (length - 2 * cWidth) * scale
          );
          
          // Draw cutout width labels
          drawWidthLabel(ctx, cWidth, leftOffset * scale + width * scale / 2, topOffset * scale + cWidth * scale / 2, scale);
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          drawWidthLabel(ctx, cWidth, (leftOffset + width - cWidth/2) * scale, topOffset * scale + length * scale / 2, scale);
        }
        
        // If it's not a rectangular cutout, we just need the outer rectangle stroke
        if (shape !== 'rectangular-cutout') {
          ctx.strokeRect(
            leftOffset * scale, 
            topOffset * scale, 
            width * scale, 
            length * scale
          );
        }
        
        // Draw false ceiling dimension labels
        drawFalseCeilingDimensionLabels(ctx, leftOffset, topOffset, width, length, scale);
      }
    } else if (shape === 'circle' || shape === 'circular-cutout') {
      if (radius && radius > 0) { // Ensure radius is positive
        const centerX = (leftOffset + radius) * scale;
        const centerY = (topOffset + radius) * scale;
        const radiusPixels = Math.max(1, radius * scale); // Ensure radius is at least 1 pixel
        
        if (shape === 'circle') {
          // Draw solid circle
          ctx.beginPath();
          ctx.arc(centerX, centerY, radiusPixels, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        } else {
          // For circular cutout
          const cWidth = Math.max(0.1, cutoutWidth || 0.5); // Default to 0.5ft if not specified, ensure minimum positive value
          
          // Draw outer circle (filled)
          ctx.beginPath();
          ctx.arc(centerX, centerY, radiusPixels, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          
          // Calculate inner radius, ensuring it's positive
          const innerRadius = Math.max(1, (radius - cWidth) * scale);
          
          // Clear inner circle for cutout
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath();
          ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
          ctx.fill();
          
          // Reset composite operation
          ctx.globalCompositeOperation = 'source-over';
          
          // Draw inner circle outline
          ctx.beginPath();
          ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
          ctx.stroke();
          
          // Draw cutout width label
          drawWidthLabel(ctx, cWidth, centerX, centerY - (radius - cWidth/2) * scale, scale);
        }
        
        // Draw position labels for the island
        drawIslandPositionLabels(ctx, leftOffset, topOffset, radius, centerX, centerY, scale);
      }
    } else if (shape === 'oval' || shape === 'oval-cutout') {
      const rx = Math.max(1, (radiusX || width / 2) * scale); // Ensure radius is at least 1 pixel
      const ry = Math.max(1, (radiusY || (length ? length / 2 : width / 2)) * scale); // Ensure radius is at least 1 pixel
      const centerX = (leftOffset + (radiusX || width / 2)) * scale;
      const centerY = (topOffset + (radiusY || (length ? length / 2 : width / 2))) * scale;
      
      if (shape === 'oval') {
        // Draw solid oval
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, rx, ry, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else {
        // For oval cutout
        const cWidth = Math.max(0.1, cutoutWidth || 0.5); // Default to 0.5ft if not specified, ensure minimum positive value
        
        // Draw outer oval (filled)
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, rx, ry, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Calculate inner radii, ensuring they're positive
        const innerRx = Math.max(1, rx - cWidth * scale);
        const innerRy = Math.max(1, ry - cWidth * scale);
        
        // Clear inner oval for cutout
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.ellipse(
          centerX, 
          centerY, 
          innerRx, 
          innerRy, 
          0, 0, 2 * Math.PI
        );
        ctx.fill();
        
        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
        
        // Draw inner oval outline
        ctx.beginPath();
        ctx.ellipse(
          centerX, 
          centerY, 
          innerRx, 
          innerRy, 
          0, 0, 2 * Math.PI
        );
        ctx.stroke();
        
        // Draw cutout width label
        drawWidthLabel(ctx, cWidth, centerX, centerY - (ry - cWidth * scale / 2), scale);
      }
      
      // Draw position labels
      drawIslandPositionLabels(ctx, leftOffset, topOffset, Math.max(radiusX || width/2, radiusY || (length ? length/2 : width/2)), centerX, centerY, scale);
    }
  };
  
  // Helper function to draw room dimension labels
  const drawRoomDimensionLabels = (ctx: CanvasRenderingContext2D, width: number, length: number, scale: number) => {
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw width label at top
    ctx.fillText(
      `Room width: ${width.toFixed(1)}ft`, 
      (width * scale) / 2, 
      -20
    );
    
    // Draw length label on left side
    ctx.save();
    ctx.translate(-20, (length * scale) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(
      `Room length: ${length.toFixed(1)}ft`, 
      0, 
      0
    );
    ctx.restore();
  };
  
  // Helper function to draw false ceiling dimension labels
  const drawFalseCeilingDimensionLabels = (
    ctx: CanvasRenderingContext2D, 
    leftOffset: number, 
    topOffset: number, 
    width: number, 
    length: number, 
    scale: number
  ) => {
    ctx.fillStyle = '#555555';
    ctx.font = '12px Arial';
    
    // Left offset
    ctx.textAlign = 'center';
    ctx.fillText(
      `${leftOffset.toFixed(1)}ft`, 
      leftOffset * scale / 2, 
      topOffset * scale + length * scale / 2
    );
    
    // Top offset
    ctx.fillText(
      `${topOffset.toFixed(1)}ft`, 
      leftOffset * scale + width * scale / 2, 
      topOffset * scale / 2
    );
    
    // Width
    ctx.textAlign = 'center';
    ctx.fillText(
      `${width.toFixed(1)}ft wide`, 
      leftOffset * scale + width * scale / 2, 
      topOffset * scale + 15
    );
    
    // Length
    ctx.textAlign = 'left';
    ctx.save();
    ctx.translate(
      leftOffset * scale + width * scale + 15, 
      topOffset * scale + length * scale / 2
    );
    ctx.rotate(Math.PI / 2);
    ctx.fillText(`${length.toFixed(1)}ft long`, 0, 0);
    ctx.restore();
  };
  
  // Helper function to draw island position labels
  const drawIslandPositionLabels = (
    ctx: CanvasRenderingContext2D,
    leftOffset: number,
    topOffset: number,
    radius: number,
    centerX: number,
    centerY: number,
    scale: number
  ) => {
    ctx.fillStyle = '#555555';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Left offset
    ctx.fillText(
      `${leftOffset.toFixed(1)}ft`, 
      leftOffset * scale / 2, 
      centerY
    );
    
    // Top offset
    ctx.fillText(
      `${topOffset.toFixed(1)}ft`, 
      centerX, 
      topOffset * scale / 2
    );
    
    // Draw radius or dimension label based on shape
    ctx.fillText(
      `${(radius*2).toFixed(1)}ft`, 
      centerX, 
      centerY - 15
    );
  };
  
  // Helper function to draw width labels for ceilings
  const drawWidthLabel = (
    ctx: CanvasRenderingContext2D,
    width: number,
    x: number,
    y: number,
    scale: number
  ) => {
    const originalFillStyle = ctx.fillStyle;
    const originalFont = ctx.font;
    const originalTextAlign = ctx.textAlign;
    const originalTextBaseline = ctx.textBaseline;
    
    ctx.fillStyle = '#555555';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText(
      `${width.toFixed(1)}ft`, 
      x, 
      y
    );
    
    // Restore original context properties
    ctx.fillStyle = originalFillStyle;
    ctx.font = originalFont;
    ctx.textAlign = originalTextAlign;
    ctx.textBaseline = originalTextBaseline;
  };
  
  return (
    <div className="relative w-full overflow-auto rounded-lg border border-gray-200 shadow-lg bg-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Ceiling Design Preview</h3>
        <DownloadImageButton targetElementId="ceiling-design-canvas" />
      </div>
      <div className="relative overflow-auto max-h-[500px]">
        <canvas 
          ref={canvasRef} 
          id="ceiling-design-canvas"
          className="border border-gray-300"
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-100 mr-2 border border-gray-400"></div>
          <span>Room</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#E5DEFF] mr-2 border border-[#8B5CF6]"></div>
          <span>False Ceiling</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#FEF7CD] mr-2 border border-[#F97316] rounded-full"></div>
          <span>Regular Lights</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#FFFACD] mr-2 border border-[#FFCC00] rounded-full"></div>
          <span>Cove Lights</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-white mr-2 border border-gray-400"></div>
          <span>Cutout (no ceiling)</span>
        </div>
      </div>
    </div>
  );
};
