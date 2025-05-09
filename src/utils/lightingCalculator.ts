import { CeilingConfig, LightPosition } from '@/types/ceiling';

export const calculateLightingPositions = (config: CeilingConfig): LightPosition[] => {
  const lightPositions: LightPosition[] = [];
  
  // Calculate based on ceiling type
  if (config.ceilingType === 'combined' && config.combinedConfig) {
    const { usePlain, usePeripheral, useIsland, plainConfig, peripheralConfig, islandConfig } = config.combinedConfig;
    
    if (usePlain && plainConfig) {
      const plainLights = calculatePlainCeilingLights(plainConfig, config.roomDimensions.width, config.roomDimensions.length);
      lightPositions.push(...plainLights);
    }
    
    if (usePeripheral && peripheralConfig) {
      const peripheralLights = calculatePeripheralCeilingLights(peripheralConfig, config.roomDimensions.width, config.roomDimensions.length);
      lightPositions.push(...peripheralLights);
    }
    
    if (useIsland && islandConfig) {
      const islandLights = calculateIslandCeilingLights(islandConfig);
      lightPositions.push(...islandLights);
    }
  } else {
    // Handle individual ceiling types
    switch(config.ceilingType) {
      case 'plain':
        if (config.plainConfig) {
          const plainLights = calculatePlainCeilingLights(config.plainConfig, config.roomDimensions.width, config.roomDimensions.length);
          lightPositions.push(...plainLights);
        }
        break;
      case 'peripheral':
        if (config.peripheralConfig) {
          const peripheralLights = calculatePeripheralCeilingLights(config.peripheralConfig, config.roomDimensions.width, config.roomDimensions.length);
          lightPositions.push(...peripheralLights);
        }
        break;
      case 'island':
        if (config.islandConfig) {
          const islandLights = calculateIslandCeilingLights(config.islandConfig);
          lightPositions.push(...islandLights);
        }
        break;
    }
  }
  
  return lightPositions;
};

// Calculate lights for plain ceiling
const calculatePlainCeilingLights = (plainConfig, roomWidth: number, roomLength: number): LightPosition[] => {
  const { width, length, leftOffset, topOffset, lightCount: customLightCount } = plainConfig;
  
  const positions: LightPosition[] = [];
  const lightRadius = 0.3; // Light radius in feet
  
  // Constants for spacing requirements
  const MIN_WALL_DISTANCE = 2; // Minimum 2ft from walls
  const MIN_LIGHT_SPACING = 3; // Minimum 3ft between lights
  const MAX_LIGHT_SPACING = 4; // Maximum 4ft between lights
  
  // Check if ceiling is large enough for proper spacing
  const effectiveWidth = Math.max(0, width - (2 * MIN_WALL_DISTANCE));
  const effectiveLength = Math.max(0, length - (2 * MIN_WALL_DISTANCE));
  
  // If ceiling is too small for even minimum spacing requirements
  if (effectiveWidth <= 0 || effectiveLength <= 0) {
    // Just place one light in the center if ceiling is too small
    positions.push({
      type: 'regular',
      x: leftOffset + width / 2,
      y: topOffset + length / 2,
      radius: lightRadius
    });
    return positions;
  }
  
  // Calculate max number of lights based on spacing constraints
  const maxColsByWidth = Math.floor(effectiveWidth / MIN_LIGHT_SPACING) + 1;
  const maxRowsByLength = Math.floor(effectiveLength / MIN_LIGHT_SPACING) + 1;
  
  // Calculate min number of lights based on spacing constraints
  const minColsByWidth = Math.ceil(effectiveWidth / MAX_LIGHT_SPACING) + 1;
  const minRowsByLength = Math.ceil(effectiveLength / MAX_LIGHT_SPACING) + 1;
  
  // Determine rows and columns based on aspect ratio and symmetry
  let rows: number;
  let cols: number;
  
  // Check if the room is approximately square (within 10% difference)
  const isSquare = Math.abs(width - length) < Math.min(width, length) * 0.1;
  
  if (customLightCount) {
    if (isSquare) {
      // For square rooms, try to make a perfect square grid
      const sideCount = Math.ceil(Math.sqrt(customLightCount));
      rows = sideCount;
      cols = sideCount;
      
      // If we're significantly over the requested light count, reduce one dimension
      if (rows * cols > customLightCount * 1.5) {
        if (rows > 1) rows--;
        else if (cols > 1) cols--;
      }
    } else {
      // For non-square rooms, calculate based on aspect ratio as before
      const aspectRatio = length / width;
      
      // Determine number of rows and columns based on aspect ratio
      if (length > width) {
        // Room is longer than wider - should have more rows than columns
        rows = Math.ceil(Math.sqrt(customLightCount * aspectRatio));
        cols = Math.ceil(customLightCount / rows);
        
        // Make sure we don't have more columns than rows for a longer room
        if (cols > rows && length > width * 1.2) {
          // Swap rows and columns to ensure more lights along the longer dimension
          const temp = rows;
          rows = cols;
          cols = temp;
        }
      } else {
        // Room is wider than longer - should have more columns than rows
        cols = Math.ceil(Math.sqrt(customLightCount / aspectRatio));
        rows = Math.ceil(customLightCount / cols);
        
        // Make sure we don't have more rows than columns for a wider room
        if (rows > cols && width > length * 1.2) {
          // Swap rows and columns to ensure more lights along the wider dimension
          const temp = rows;
          rows = cols;
          cols = temp;
        }
      }
      
      // Ensure we're getting close to the target light count
      while (rows * cols > customLightCount + 1) {
        if (length > width && rows > cols && rows > 1) {
          // For longer rooms, prefer reducing columns first if we have more rows than columns
          cols--;
        } else if (width > length && cols > rows && cols > 1) {
          // For wider rooms, prefer reducing rows first if we have more columns than rows
          rows--;
        } else if (rows > 1) {
          // Default case, reduce rows first
          rows--;
        } else if (cols > 1) {
          // If rows is already 1, reduce columns
          cols--;
        } else {
          break;
        }
      }
      
      // Final adjustment to match exact count if possible
      let closestRows = rows;
      let closestCols = cols;
      let closestDiff = Math.abs(rows * cols - customLightCount);
      
      // Try adjacent configurations to see if we can get closer to the target count
      // while maintaining the proper aspect ratio (more rows for longer rooms, more cols for wider rooms)
      for (let r = Math.max(1, rows - 1); r <= rows + 1; r++) {
        for (let c = Math.max(1, cols - 1); c <= cols + 1; c++) {
          const diff = Math.abs(r * c - customLightCount);
          // Prioritize configurations that follow the room's aspect ratio
          const followsAspectRatio = (length > width && r >= c) || (width > length && c >= r) || (Math.abs(width - length) < 0.5);
          
          if ((diff < closestDiff && followsAspectRatio) || 
              (diff === closestDiff && followsAspectRatio && !((length > width && closestRows >= closestCols) || (width > length && closestCols >= closestRows)))) {
            closestRows = r;
            closestCols = c;
            closestDiff = diff;
          }
        }
      }
      
      rows = closestRows;
      cols = closestCols;
      
      // Ensure rows is for the length dimension and cols is for the width dimension
      if ((length > width && rows < cols) || (width > length && cols < rows)) {
        const temp = rows;
        rows = cols;
        cols = temp;
      }
    }
    
    // Make final adjustment to ensure we exactly match customLightCount
    if (rows * cols > customLightCount) {
      // Remove lights from the configuration while trying to maintain aspect ratio
      const toRemove = (rows * cols) - customLightCount;
      
      // Create a grid to track which positions to keep
      const grid: boolean[][] = [];
      for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
          grid[r][c] = true; // Initially keep all positions
        }
      }
      
      // Strategy: Try to remove in a pattern that maintains the overall distribution
      // For simplicity, remove from corners or edges first
      let removed = 0;
      if (toRemove <= 4) {
        // Remove from corners if possible
        const corners = [
          [0, 0], [0, cols-1], [rows-1, 0], [rows-1, cols-1]
        ];
        
        for (let i = 0; i < Math.min(toRemove, corners.length); i++) {
          const [r, c] = corners[i];
          grid[r][c] = false;
          removed++;
        }
      }
      
      // If we still need to remove more, do it evenly across the grid
      if (removed < toRemove) {
        // Try to remove evenly from the grid
        // For simplicity, we'll use a checkerboard-like pattern
        for (let r = 0; r < rows && removed < toRemove; r++) {
          for (let c = (r % 2); c < cols && removed < toRemove; c += 2) {
            if (grid[r][c]) {
              grid[r][c] = false;
              removed++;
            }
          }
        }
      }
      
      // Now create positions based on the grid
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c]) {
            const x = leftOffset + MIN_WALL_DISTANCE + (c * effectiveWidth / (cols > 1 ? cols - 1 : 1));
            const y = topOffset + MIN_WALL_DISTANCE + (r * effectiveLength / (rows > 1 ? rows - 1 : 1));
            
            positions.push({
              type: 'regular',
              x,
              y,
              radius: lightRadius
            });
          }
        }
      }
      
      return positions;
    }
  } else {
    // Automatic calculation based on room shape and aspect ratio
    if (isSquare) {
      // For square rooms, use the same number of rows and columns
      rows = Math.max(2, Math.min(maxRowsByLength, minRowsByLength));
      cols = rows; // Equal number for symmetry
    } else {
      // For rectangular rooms, calculate based on aspect ratio
      const aspectRatio = length / width;
      
      if (length > width) {
        // Room is longer than wider - more rows than columns
        rows = Math.max(2, minRowsByLength);
        cols = Math.max(1, Math.min(maxColsByWidth, Math.round(rows / aspectRatio)));
        
        // Ensure we have more rows than columns for a longer room
        if (cols > rows) {
          const temp = rows;
          rows = cols;
          cols = temp;
        }
      } else {
        // Room is wider than longer - more columns than rows
        cols = Math.max(2, minColsByWidth);
        rows = Math.max(1, Math.min(maxRowsByLength, Math.round(cols * aspectRatio)));
        
        // Ensure we have more columns than rows for a wider room
        if (rows > cols) {
          const temp = rows;
          rows = cols;
          cols = temp;
        }
      }
    }
  }
  
  // Calculate actual spacing
  // If we only have 1 column or row, we need to center the lights
  let xStart, yStart, xStep, yStep;
  
  if (cols === 1) {
    xStart = leftOffset + (width / 2);
    xStep = 0;
  } else {
    xStep = effectiveWidth / (cols - 1);
    xStart = leftOffset + MIN_WALL_DISTANCE;
  }
  
  if (rows === 1) {
    yStart = topOffset + (length / 2);
    yStep = 0;
  } else {
    yStep = effectiveLength / (rows - 1);
    yStart = topOffset + MIN_WALL_DISTANCE;
  }
  
  // Add lights
  let lightCounter = 0;
  const totalLights = rows * cols;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // If we have a custom count and we've reached it, stop
      if (customLightCount && lightCounter >= customLightCount) {
        break;
      }
      
      // Otherwise if we're using auto calculation, use all positions
      if (!customLightCount || lightCounter < totalLights) {
        positions.push({
          type: 'regular',
          x: xStart + (col * xStep),
          y: yStart + (row * yStep),
          radius: lightRadius
        });
        
        lightCounter++;
      }
    }
    
    // Stop if we've reached the custom light count
    if (customLightCount && lightCounter >= customLightCount) {
      break;
    }
  }
  
  return positions;
};

// Calculate lights for peripheral ceiling with improved symmetry
const calculatePeripheralCeilingLights = (peripheralConfig, roomWidth: number, roomLength: number): LightPosition[] => {
  const { width, sides, lightCount: customLightCount } = peripheralConfig;
  
  const positions: LightPosition[] = [];
  const lightRadius = 0.25; // Light radius in feet
  
  // For monolithic peripheral ceiling, we'll place lights around the edges following the spacing formula
  const MIN_WALL_DISTANCE = 2; // Minimum 2ft from walls
  const MIN_LIGHT_SPACING = 3; // Minimum 3ft between lights
  const MAX_LIGHT_SPACING = 4; // Maximum 4ft between lights
  
  // Calculate the total perimeter length for selected sides only
  let totalPerimeter = 0;
  if (sides.top) totalPerimeter += roomWidth;
  if (sides.right) totalPerimeter += roomLength;
  if (sides.bottom) totalPerimeter += roomWidth;
  if (sides.left) totalPerimeter += roomLength;
  
  // Calculate the inner perimeter length for selected sides
  const innerWidth = roomWidth - 2 * width;
  const innerLength = roomLength - 2 * width;
  let innerPerimeter = 0;
  if (sides.top) innerPerimeter += innerWidth;
  if (sides.right) innerPerimeter += innerLength;
  if (sides.bottom) innerPerimeter += innerWidth;
  if (sides.left) innerPerimeter += innerLength;
  
  // Check if the room is approximately square (within 10% difference)
  const isSquare = Math.abs(roomWidth - roomLength) < Math.min(roomWidth, roomLength) * 0.1;
  
  let lightCount = customLightCount;
  
  if (!lightCount) {
    // Automatic calculation based on spacing requirements
    // Calculate maximum lights that can fit with MIN_LIGHT_SPACING
    const maxLights = Math.floor(totalPerimeter / MIN_LIGHT_SPACING);
    lightCount = Math.min(maxLights, Math.ceil(totalPerimeter / MAX_LIGHT_SPACING));
  }
  
  // For square rooms, ensure perfect symmetry with equal lights on each side
  if (isSquare && !customLightCount) {
    // Ensure the number of lights is divisible by the number of enabled sides
    const enabledSideCount = Object.values(sides).filter(Boolean).length;
    if (enabledSideCount > 0) {
      lightCount = Math.floor(lightCount / enabledSideCount) * enabledSideCount;
    }
  }
  
  // Calculate lights per side based on proportional length
  const topSideLength = sides.top ? roomWidth : 0;
  const bottomSideLength = sides.bottom ? roomWidth : 0;
  const leftSideLength = sides.left ? roomLength : 0;
  const rightSideLength = sides.right ? roomLength : 0;
  
  const totalLength = topSideLength + bottomSideLength + leftSideLength + rightSideLength;
  
  // For square rooms, ensure equal distribution
  let topLightsCount = 0, bottomLightsCount = 0, leftLightsCount = 0, rightLightsCount = 0;
  
  if (isSquare) {
    // For square rooms, distribute lights equally per enabled side
    const lightsPerSide = Math.floor(lightCount / Object.values(sides).filter(Boolean).length);
    
    topLightsCount = sides.top ? lightsPerSide : 0;
    bottomLightsCount = sides.bottom ? lightsPerSide : 0;
    leftLightsCount = sides.left ? lightsPerSide : 0;
    rightLightsCount = sides.right ? lightsPerSide : 0;
    
    // Distribute any remaining lights
    let remaining = lightCount - (topLightsCount + bottomLightsCount + leftLightsCount + rightLightsCount);
    const enabledSides = [];
    
    if (sides.top) enabledSides.push('top');
    if (sides.bottom) enabledSides.push('bottom');
    if (sides.left) enabledSides.push('left');
    if (sides.right) enabledSides.push('right');
    
    let index = 0;
    while (remaining > 0 && enabledSides.length > 0) {
      const side = enabledSides[index % enabledSides.length];
      if (side === 'top') topLightsCount++;
      else if (side === 'bottom') bottomLightsCount++;
      else if (side === 'left') leftLightsCount++;
      else if (side === 'right') rightLightsCount++;
      
      remaining--;
      index++;
    }
  } else {
    // For rectangular rooms, distribute proportionally based on length
    topLightsCount = Math.round(lightCount * topSideLength / totalLength);
    bottomLightsCount = Math.round(lightCount * bottomSideLength / totalLength);
    leftLightsCount = Math.round(lightCount * leftSideLength / totalLength);
    rightLightsCount = Math.round(lightCount * rightSideLength / totalLength);
    
    // Adjust to match the target light count
    const adjustedTotal = topLightsCount + bottomLightsCount + leftLightsCount + rightLightsCount;
    
    // Adjust if needed (add or remove lights to match custom count)
    if (lightCount !== adjustedTotal) {
      const diff = lightCount - adjustedTotal;
      
      if (diff > 0) {
        // Need to add lights - add them proportionally to the sides based on length
        const sidesByLength = [
          { side: 'top', length: topSideLength, enabled: sides.top },
          { side: 'bottom', length: bottomSideLength, enabled: sides.bottom },
          { side: 'left', length: leftSideLength, enabled: sides.left },
          { side: 'right', length: rightSideLength, enabled: sides.right }
        ].filter(s => s.enabled)
         .sort((a, b) => b.length - a.length);  // Sort by length (descending)
         
        let remaining = diff;
        while (remaining > 0 && sidesByLength.length > 0) {
          for (let i = 0; i < sidesByLength.length && remaining > 0; i++) {
            if (sidesByLength[i].side === 'top') topLightsCount++;
            else if (sidesByLength[i].side === 'bottom') bottomLightsCount++;
            else if (sidesByLength[i].side === 'left') leftLightsCount++;
            else if (sidesByLength[i].side === 'right') rightLightsCount++;
            
            remaining--;
          }
        }
      } else {
        // Need to remove lights - remove them proportionally from sides
        const sidesByCount = [
          { side: 'top', count: topLightsCount, enabled: sides.top },
          { side: 'bottom', count: bottomLightsCount, enabled: sides.bottom },
          { side: 'left', count: leftLightsCount, enabled: sides.left },
          { side: 'right', count: rightLightsCount, enabled: sides.right }
        ].filter(s => s.enabled && s.count > 0)
         .sort((a, b) => b.count - a.count);  // Sort by count (descending)
         
        let remaining = Math.abs(diff);
        while (remaining > 0 && sidesByCount.length > 0) {
          for (let i = 0; i < sidesByCount.length && remaining > 0; i++) {
            if (sidesByCount[i].side === 'top' && topLightsCount > 0) {
              topLightsCount--;
              sidesByCount[i].count--;
              remaining--;
            } else if (sidesByCount[i].side === 'bottom' && bottomLightsCount > 0) {
              bottomLightsCount--;
              sidesByCount[i].count--;
              remaining--;
            } else if (sidesByCount[i].side === 'left' && leftLightsCount > 0) {
              leftLightsCount--;
              sidesByCount[i].count--;
              remaining--;
            } else if (sidesByCount[i].side === 'right' && rightLightsCount > 0) {
              rightLightsCount--;
              sidesByCount[i].count--;
              remaining--;
            }
            
            // Re-sort after decrements
            sidesByCount.sort((a, b) => b.count - a.count);
          }
        }
      }
    }
  }
  
  // Place lights along the selected sides
  
  // Top edge
  if (sides.top && topLightsCount > 0) {
    const spacing = roomWidth / (topLightsCount + 1);
    for (let i = 1; i <= topLightsCount; i++) {
      positions.push({
        type: 'regular',
        x: i * spacing,
        y: width / 2,
        radius: lightRadius
      });
    }
  }
  
  // Bottom edge
  if (sides.bottom && bottomLightsCount > 0) {
    const spacing = roomWidth / (bottomLightsCount + 1);
    for (let i = 1; i <= bottomLightsCount; i++) {
      positions.push({
        type: 'regular',
        x: i * spacing,
        y: roomLength - width / 2,
        radius: lightRadius
      });
    }
  }
  
  // Left edge
  if (sides.left && leftLightsCount > 0) {
    const spacing = roomLength / (leftLightsCount + 1);
    for (let i = 1; i <= leftLightsCount; i++) {
      positions.push({
        type: 'regular',
        x: width / 2,
        y: i * spacing,
        radius: lightRadius
      });
    }
  }
  
  // Right edge
  if (sides.right && rightLightsCount > 0) {
    const spacing = roomLength / (rightLightsCount + 1);
    for (let i = 1; i <= rightLightsCount; i++) {
      positions.push({
        type: 'regular',
        x: roomWidth - width / 2,
        y: i * spacing,
        radius: lightRadius
      });
    }
  }
  
  return positions;
};

// Calculate lights for island ceiling with improved symmetry for square shapes
const calculateIslandCeilingLights = (islandConfig): LightPosition[] => {
  const { 
    shape, 
    width, 
    length, 
    radius, 
    radiusX, 
    radiusY, 
    topOffset, 
    leftOffset, 
    cutoutWidth,
    lightCount: customLightCount 
  } = islandConfig;
  
  const positions: LightPosition[] = [];
  const lightRadius = 0.3; // Light radius in feet
  
  // Check if we have a square shape for rectangular layouts
  const isSquare = shape.includes('rectangle') && Math.abs(width - length) < Math.min(width, length) * 0.1;
  
  if (shape === 'rectangle' || shape === 'rectangular-cutout') {
    // Calculate area
    const area = width * length;
    let lightCount = customLightCount;
    
    if (!lightCount) {
      // Automatic calculation: roughly 1 light per 4-5 sq ft
      // For cutout, we'll calculate based on the visible area
      if (shape === 'rectangular-cutout') {
        const cWidth = Math.max(0.1, cutoutWidth || 0.5);
        const cutoutArea = (width - 2 * cWidth) * (length - 2 * cWidth);
        const visibleArea = area - cutoutArea;
        
        // Reduced light count for rectangular cutout to ensure better spacing
        // Use a higher divisor to get fewer lights
        lightCount = Math.max(4, Math.round(visibleArea / 4.5));
      } else {
        lightCount = Math.max(1, Math.round(area / 4.5));
      }
    }
    
    if (shape === 'rectangular-cutout') {
      const cWidth = Math.max(0.1, cutoutWidth || 0.5);
      
      // For cutout, place lights around the perimeter
      const innerWidth = width - 2 * cWidth;
      const innerLength = length - 2 * cWidth;
      
      // Get sides from config
      const sides = islandConfig.sides || { top: true, right: true, bottom: true, left: true };
      
      // Calculate total perimeter to better distribute lights
      const perimeter = 2 * innerWidth + 2 * innerLength;
      
      // Determine how many sides are enabled
      const enabledSidesCount = Object.values(sides).filter(Boolean).length;
      
      // Calculate min and max lights per side to prevent overcrowding
      const MIN_SPACING = 1.0; // Minimum 1ft between lights
      const MAX_LIGHTS_SHORT_SIDE = Math.floor(Math.min(innerWidth, innerLength) / MIN_SPACING);
      const MAX_LIGHTS_LONG_SIDE = Math.floor(Math.max(innerWidth, innerLength) / MIN_SPACING);
      
      // For square cutouts, ensure symmetry
      let topLights, bottomLights, leftLights, rightLights;
      
      if (isSquare) {
        // For square cutouts, distribute lights equally
        const lightsPerSide = Math.floor(lightCount / enabledSidesCount);
        topLights = sides.top ? lightsPerSide : 0;
        bottomLights = sides.bottom ? lightsPerSide : 0;
        leftLights = sides.left ? lightsPerSide : 0;
        rightLights = sides.right ? lightsPerSide : 0;
        
        // Distribute any remaining lights
        let remaining = lightCount - (topLights + bottomLights + leftLights + rightLights);
        const enabledSidesArr = [];
        
        if (sides.top) enabledSidesArr.push('top');
        if (sides.bottom) enabledSidesArr.push('bottom');
        if (sides.left) enabledSidesArr.push('left');
        if (sides.right) enabledSidesArr.push('right');
        
        let index = 0;
        while (remaining > 0 && enabledSidesArr.length > 0) {
          const side = enabledSidesArr[index % enabledSidesArr.length];
          if (side === 'top') topLights++;
          else if (side === 'bottom') bottomLights++;
          else if (side === 'left') leftLights++;
          else if (side === 'right') rightLights++;
          
          remaining--;
          index++;
        }
      } else {
        // For non-square cutouts, distribute based on aspect ratio as before
        const isWider = innerWidth > innerLength;
        
        // Calculate how many lights should go on each side based on proportions
        const longSideRatio = isWider ? innerWidth / perimeter : innerLength / perimeter;
        const shortSideRatio = isWider ? innerLength / perimeter : innerWidth / perimeter;
        
        // Calculate lights per side
        let longSideLights = Math.max(1, Math.min(
          MAX_LIGHTS_LONG_SIDE,
          Math.floor(lightCount * longSideRatio * 1.1) // Slightly favor the long sides
        ));
        
        let shortSideLights = Math.max(1, Math.min(
          MAX_LIGHTS_SHORT_SIDE,
          Math.floor(lightCount * shortSideRatio * 0.9) // Slightly reduce lights on short sides
        ));
        
        // Make sure we don't exceed the total desired light count
        const initialTotal = (longSideLights * 2 + shortSideLights * 2);
        if (initialTotal > lightCount) {
          // Reduce proportionally
          const reductionFactor = lightCount / initialTotal;
          longSideLights = Math.max(1, Math.round(longSideLights * reductionFactor));
          shortSideLights = Math.max(1, Math.round(shortSideLights * reductionFactor));
        }
        
        // Assign to width/length sides
        if (isWider) {
          topLights = longSideLights;
          bottomLights = longSideLights;
          leftLights = shortSideLights;
          rightLights = shortSideLights;
        } else {
          topLights = shortSideLights;
          bottomLights = shortSideLights;
          leftLights = longSideLights;
          rightLights = longSideLights;
        }
      }
      
      // Apply the enabled sides filter
      const adjustedLightCount = { 
        top: sides.top ? topLights : 0, 
        bottom: sides.bottom ? bottomLights : 0, 
        left: sides.left ? leftLights : 0, 
        right: sides.right ? rightLights : 0 
      };
      
      // Place lights with uniform spacing
      
      // Top edge
      if (adjustedLightCount.top > 0) {
        const xStart = leftOffset + cWidth;
        const xEnd = leftOffset + width - cWidth;
        const availableWidth = xEnd - xStart;
        
        // For a single light, center it
        if (adjustedLightCount.top === 1) {
          positions.push({
            type: 'regular',
            x: leftOffset + width / 2,
            y: topOffset + cWidth/2,
            radius: lightRadius
          });
        } else {
          // For multiple lights, space them evenly
          const spacing = availableWidth / (adjustedLightCount.top - 1);
          
          for (let i = 0; i < adjustedLightCount.top; i++) {
            positions.push({
              type: 'regular',
              x: xStart + i * spacing,
              y: topOffset + cWidth/2,
              radius: lightRadius
            });
          }
        }
      }
      
      // Bottom edge
      if (adjustedLightCount.bottom > 0) {
        const xStart = leftOffset + cWidth;
        const xEnd = leftOffset + width - cWidth;
        const availableWidth = xEnd - xStart;
        
        // For a single light, center it
        if (adjustedLightCount.bottom === 1) {
          positions.push({
            type: 'regular',
            x: leftOffset + width / 2,
            y: topOffset + length - cWidth/2,
            radius: lightRadius
          });
        } else {
          // For multiple lights, space them evenly
          const spacing = availableWidth / (adjustedLightCount.bottom - 1);
          
          for (let i = 0; i < adjustedLightCount.bottom; i++) {
            positions.push({
              type: 'regular',
              x: xStart + i * spacing,
              y: topOffset + length - cWidth/2,
              radius: lightRadius
            });
          }
        }
      }
      
      // Left edge
      if (adjustedLightCount.left > 0) {
        const yStart = topOffset + cWidth;
        const yEnd = topOffset + length - cWidth;
        const availableHeight = yEnd - yStart;
        
        // For a single light, center it
        if (adjustedLightCount.left === 1) {
          positions.push({
            type: 'regular',
            x: leftOffset + cWidth/2,
            y: topOffset + length / 2,
            radius: lightRadius
          });
        } else {
          // For multiple lights, space them evenly
          const spacing = availableHeight / (adjustedLightCount.left - 1);
          
          for (let i = 0; i < adjustedLightCount.left; i++) {
            positions.push({
              type: 'regular',
              x: leftOffset + cWidth/2,
              y: yStart + i * spacing,
              radius: lightRadius
            });
          }
        }
      }
      
      // Right edge
      if (adjustedLightCount.right > 0) {
        const yStart = topOffset + cWidth;
        const yEnd = topOffset + length - cWidth;
        const availableHeight = yEnd - yStart;
        
        // For a single light, center it
        if (adjustedLightCount.right === 1) {
          positions.push({
            type: 'regular',
            x: leftOffset + width - cWidth/2,
            y: topOffset + length / 2,
            radius: lightRadius
          });
        } else {
          // For multiple lights, space them evenly
          const spacing = availableHeight / (adjustedLightCount.right - 1);
          
          for (let i = 0; i < adjustedLightCount.right; i++) {
            positions.push({
              type: 'regular',
              x: leftOffset + width - cWidth/2,
              y: yStart + i * spacing,
              radius: lightRadius
            });
          }
        }
      }
    } else {
      // For solid rectangle, place lights in a grid
      let rows, cols;
      
      // For square ceilings, ensure perfect symmetry
      if (isSquare) {
        // For square, make a perfect square grid
        const side = Math.ceil(Math.sqrt(lightCount));
        rows = side;
        cols = side;
        
        // If we're significantly over the requested light count, reduce one dimension
        if (rows * cols > lightCount * 1.5 && rows > 1) {
          rows--;
          cols = rows;
        }
      } else {
        // For rectangle, calculate based on aspect ratio
        rows = Math.round(Math.sqrt(lightCount * length / width));
        cols = Math.ceil(lightCount / rows);
        
        // Ensure we don't exceed the light count
        while (rows * cols > lightCount && rows > 1) {
          rows--;
          cols = Math.ceil(lightCount / rows);
        }
      }
      
      // Calculate spacing
      const xSpacing = width / (cols + 1);
      const ySpacing = length / (rows + 1);
      
      // Add lights
      for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= cols; col++) {
          // Don't place more lights than requested
          if ((row - 1) * cols + col > lightCount) continue;
          
          positions.push({
            type: 'regular',
            x: leftOffset + col * xSpacing,
            y: topOffset + row * ySpacing,
            radius: lightRadius
          });
        }
      }
    }
  } else if (shape === 'circle' || shape === 'circular-cutout') {
    if (radius) {
      // Center of the circle
      const centerX = leftOffset + radius;
      const centerY = topOffset + radius;
      
      let lightCount = customLightCount;
      
      if (!lightCount) {
        // For circular ceiling, calculate based on area
        const area = Math.PI * radius * radius;
        
        // For cutout, we'll calculate based on the visible area
        if (shape === 'circular-cutout') {
          const cWidth = Math.max(0.1, cutoutWidth || 0.5);
          const innerRadius = Math.max(0, radius - cWidth);
          const cutoutArea = Math.PI * innerRadius * innerRadius;
          const visibleArea = area - cutoutArea;
          lightCount = Math.max(5, Math.round(visibleArea / 5));
        } else {
          lightCount = Math.max(1, Math.round(area / 5));
        }
      }
      
      // For circular cutout, we'll place lights in a ring
      if (shape === 'circular-cutout') {
        const cWidth = Math.max(0.1, cutoutWidth || 0.5);
        const middleRadius = radius - (cWidth / 2);
        
        // Place lights only in the ring area, not in the cutout area
        // For symmetry, always use a number divisible by 4 for the ring
        const ringLightCount = customLightCount || 
          Math.min(8, Math.max(4, Math.floor(Math.round(2 * Math.PI * middleRadius) / 2) * 2));
        
        // Place the lights evenly around the ring
        const angleStep = (2 * Math.PI) / ringLightCount;
        for (let i = 0; i < ringLightCount; i++) {
          const angle = i * angleStep;
          positions.push({
            type: 'regular',
            x: centerX + Math.cos(angle) * middleRadius,
            y: centerY + Math.sin(angle) * middleRadius,
            radius: lightRadius
          });
        }
      } else {
        // For solid circle, place lights in concentric rings
        if (lightCount === 1) {
          // Just a center light
          positions.push({
            type: 'regular',
            x: centerX,
            y: centerY,
            radius: lightRadius
          });
        } else {
          // Center light + outer ring
          positions.push({
            type: 'regular',
            x: centerX,
            y: centerY,
            radius: lightRadius
          });
          
          // For symmetry, use a number divisible by 4 for the outer ring
          const ringLightCount = customLightCount ? 
            Math.min(lightCount - 1, 8) : 
            Math.min(8, Math.max(4, Math.floor((lightCount - 1) / 4) * 4));
          
          const ringRadius = radius * 0.6; // 60% of the way to the edge
          
          // Evenly space lights around the ring
          const angleStep = (2 * Math.PI) / ringLightCount;
          for (let i = 0; i < ringLightCount; i++) {
            const angle = i * angleStep;
            positions.push({
              type: 'regular',
              x: centerX + Math.cos(angle) * ringRadius,
              y: centerY + Math.sin(angle) * ringRadius,
              radius: lightRadius
            });
          }
        }
      }
    }
  } else if (shape === 'oval' || shape === 'oval-cutout') {
    // Get radiusX and radiusY
    const rx = radiusX || width / 2;
    const ry = radiusY || (length ? length / 2 : width / 2);
    
    // Center of the oval
    const centerX = leftOffset + rx;
    const centerY = topOffset + ry;
    
    let lightCount = customLightCount;
    
    if (!lightCount) {
      // For oval ceiling, calculate based on area
      const area = Math.PI * rx * ry;
      
      // For cutout, we'll calculate based on the visible area
      if (shape === 'oval-cutout') {
        const cWidth = Math.max(0.1, cutoutWidth || 0.5);
        const innerRx = Math.max(0, rx - cWidth);
        const innerRy = Math.max(0, ry - cWidth);
        const cutoutArea = Math.PI * innerRx * innerRy;
        const visibleArea = area - cutoutArea;
        lightCount = Math.max(4, Math.round(visibleArea / 4.5));
      } else {
        lightCount = Math.max(1, Math.round(area / 4.5));
      }
    }
    
    // Check if the oval is nearly circular (for symmetry considerations)
    const isNearlyCicular = Math.abs(rx - ry) < Math.min(rx, ry) * 0.1;
    
    // For oval cutout, similar to circular cutout but with oval shape
    if (shape === 'oval-cutout') {
      const cWidth = Math.max(0.1, cutoutWidth || 0.5);
      const middleRx = rx - (cWidth / 2);
      const middleRy = ry - (cWidth / 2);
      
      // For symmetry with nearly circular ovals, use divisible by 4
      const ringLightCount = customLightCount || 
        (isNearlyCicular ? 
          Math.min(8, Math.max(4, Math.floor(Math.round(2 * Math.PI * Math.sqrt(middleRx * middleRy)) / 2) * 2)) : 
          Math.min(8, Math.max(4, Math.round(2 * Math.PI * Math.sqrt(middleRx * middleRy) / 2))));
      
      // Place the lights evenly around the ring
      const angleStep = (2 * Math.PI) / ringLightCount;
      for (let i = 0; i < ringLightCount; i++) {
        const angle = i * angleStep;
        positions.push({
          type: 'regular',
          x: centerX + Math.cos(angle) * middleRx,
          y: centerY + Math.sin(angle) * middleRy,
          radius: lightRadius
        });
      }
    } else {
      // For solid oval, similar to solid circle
      if (lightCount === 1) {
        // Just a center light
        positions.push({
          type: 'regular',
          x: centerX,
          y: centerY,
          radius: lightRadius
        });
      } else {
        // Center light + outer ring
        positions.push({
          type: 'regular',
          x: centerX,
          y: centerY,
          radius: lightRadius
        });
        
        // For nearly circular ovals, ensure symmetry
        const ringLightCount = customLightCount ? 
          Math.min(lightCount - 1, 8) : 
          (isNearlyCicular ? 
            Math.min(8, Math.max(4, Math.floor((lightCount - 1) / 4) * 4)) : 
            Math.min(lightCount - 1, 8));
        
        const ringRx = rx * 0.6; // 60% of the way to the edge
        const ringRy = ry * 0.6; // 60% of the way to the edge
        
        // Evenly space lights around the ring
        const angleStep = (2 * Math.PI) / ringLightCount;
        for (let i = 0; i < ringLightCount; i++) {
          const angle = i * angleStep;
          positions.push({
            type: 'regular',
            x: centerX + Math.cos(angle) * ringRx,
            y: centerY + Math.sin(angle) * ringRy,
            radius: lightRadius
          });
        }
      }
    }
  }
  
  return positions;
};
