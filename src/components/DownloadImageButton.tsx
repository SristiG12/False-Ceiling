
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DownloadImageButtonProps {
  targetElementId: string;
  filename?: string;
}

const DownloadImageButton: React.FC<DownloadImageButtonProps> = ({ 
  targetElementId, 
  filename = "ceiling-layout.png" 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [elementExists, setElementExists] = useState(false);

  // Check if the element exists when the component mounts or targetElementId changes
  useEffect(() => {
    const checkElement = () => {
      const element = document.getElementById(targetElementId);
      setElementExists(!!element);
      
      if (!element) {
        console.log(`Element with ID '${targetElementId}' not found during check. Available IDs:`, 
          [...document.querySelectorAll('[id]')].map(el => el.id));
      } else {
        console.log(`Element with ID '${targetElementId}' found during check:`, element.tagName);
      }
    };
    
    // Check immediately
    checkElement();
    
    // Also check after a short delay to ensure the DOM is fully loaded
    const timeoutId = setTimeout(checkElement, 500);
    
    return () => clearTimeout(timeoutId);
  }, [targetElementId]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      console.log("Attempting to download element with ID:", targetElementId);
      
      // Find all canvas elements for debugging
      const allCanvases = document.querySelectorAll('canvas');
      console.log(`Found ${allCanvases.length} canvas elements:`, 
        [...allCanvases].map(canvas => ({ id: canvas.id, className: canvas.className })));
      
      // Find the canvas element
      const element = document.getElementById(targetElementId);
      if (!element) {
        console.error("Element not found:", targetElementId);
        toast({
          title: "Error",
          description: `Could not find the element with ID: ${targetElementId}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log("Element found:", element.tagName);

      // If it's a canvas, we can directly get the data URL
      if (element instanceof HTMLCanvasElement) {
        console.log("Element is a canvas, getting dataURL");
        const dataUrl = element.toDataURL('image/png');
        downloadFromDataURL(dataUrl, filename);
      } 
      // If it's not a canvas (e.g., a div), we need to use html2canvas
      else {
        console.log("Element is not a canvas, using html2canvas");
        try {
          // Import html2canvas dynamically
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(element);
          const dataUrl = canvas.toDataURL('image/png');
          downloadFromDataURL(dataUrl, filename);
        } catch (error) {
          console.error("html2canvas error:", error);
          toast({
            title: "Error",
            description: "Failed to convert element to image",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Failed to download the image",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  const downloadFromDataURL = (dataUrl: string, filename: string) => {
    console.log("Creating download link for data URL");
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    console.log("Triggering download click");
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      toast({
        title: "Success",
        description: "Image downloaded successfully"
      });
    }, 100);
  };

  return (
    <Button 
      onClick={handleDownload} 
      variant="outline" 
      size="sm" 
      disabled={isDownloading || !elementExists}
      className="flex items-center gap-2"
      title={!elementExists ? `Element '${targetElementId}' not found` : "Download ceiling layout"}
    >
      <Download className="h-4 w-4" />
      {isDownloading ? "Downloading..." : "Download Layout"}
    </Button>
  );
};

export default DownloadImageButton;
