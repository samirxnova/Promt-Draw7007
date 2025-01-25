import React, { useRef, useEffect, useState } from 'react';
import { 
  Eraser, 
  Download, 
  Circle, 
  Square, 
  Minus, 
  Palette,
  Undo,
  Redo,
  Type
} from 'lucide-react';

interface DrawingHistory {
  type: 'path' | 'shape' | 'text';
  data: any;
}

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [tempCtx, setTempCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [color, setColor] = useState('#FFFFFF');
  const [lineWidth, setLineWidth] = useState(2);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'circle' | 'square' | 'line' | 'text'>('brush');
  const [history, setHistory] = useState<DrawingHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lastDrawnShape, setLastDrawnShape] = useState<ImageData | null>(null);

  const colors = [
    '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'
  ];

  const lineWidths = [2, 4, 6, 8, 10];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create and set up main canvas
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    context.fillStyle = '#1a1a1a';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    setCtx(context);

    // Create and set up temporary canvas for shape preview
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempContext = tempCanvas.getContext('2d');
    if (tempContext) {
      tempContext.strokeStyle = color;
      tempContext.lineWidth = lineWidth;
      tempContext.lineCap = 'round';
      setTempCtx(tempContext);
      tempCanvasRef.current = tempCanvas;
    }
  }, []);

  useEffect(() => {
    if (!ctx) return;
    ctx.strokeStyle = tool === 'eraser' ? '#1a1a1a' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 2 : lineWidth;
    
    if (tempCtx) {
      tempCtx.strokeStyle = tool === 'eraser' ? '#1a1a1a' : color;
      tempCtx.lineWidth = tool === 'eraser' ? lineWidth * 2 : lineWidth;
    }
  }, [color, lineWidth, tool, ctx, tempCtx]);

  const getMousePos = (e: React.MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (!ctx || !canvasRef.current) return;
    
    const pos = getMousePos(e, canvasRef.current);

    if (tool === 'text') {
      setShowTextInput(true);
      setTextInputPos(pos);
      return;
    }

    setIsDrawing(true);
    setStartPos(pos);

    if (tool === 'brush' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !ctx || !canvasRef.current || !startPos || !tempCtx || !tempCanvasRef.current) return;

    const pos = getMousePos(e, canvasRef.current);

    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      // Clear the temporary canvas
      tempCtx.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height);
      
      // Copy the main canvas state to temp canvas
      tempCtx.drawImage(canvasRef.current, 0, 0);
      
      // Draw the shape preview
      tempCtx.beginPath();
      
      if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
        );
        tempCtx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
      } else if (tool === 'square') {
        const width = pos.x - startPos.x;
        const height = pos.y - startPos.y;
        tempCtx.rect(startPos.x, startPos.y, width, height);
      } else if (tool === 'line') {
        tempCtx.moveTo(startPos.x, startPos.y);
        tempCtx.lineTo(pos.x, pos.y);
      }
      
      tempCtx.stroke();
      
      // Draw the temporary canvas on the main canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      if (lastDrawnShape) {
        ctx.putImageData(lastDrawnShape, 0, 0);
      }
      ctx.drawImage(tempCanvasRef.current, 0, 0);
    }
  };

  const stopDrawing = (e: React.MouseEvent) => {
    if (!isDrawing || !ctx || !canvasRef.current || !startPos) return;

    const pos = getMousePos(e, canvasRef.current);

    if (tool !== 'brush' && tool !== 'eraser') {
      ctx.beginPath();
      
      if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
        );
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
      } else if (tool === 'square') {
        const width = pos.x - startPos.x;
        const height = pos.y - startPos.y;
        ctx.rect(startPos.x, startPos.y, width, height);
      } else if (tool === 'line') {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
      }
      
      ctx.stroke();
    }

    setIsDrawing(false);
    ctx.closePath();
    
    // Save the current state to history
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    setLastDrawnShape(imageData);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ type: 'path', data: imageData });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setLastDrawnShape(null);
    
    // Save to history
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const newHistory = [...history, { type: 'path', data: imageData }];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0 && ctx && canvasRef.current) {
      const newIndex = historyIndex - 1;
      ctx.putImageData(history[newIndex].data, 0, 0);
      setLastDrawnShape(history[newIndex].data);
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && ctx && canvasRef.current) {
      const newIndex = historyIndex + 1;
      ctx.putImageData(history[newIndex].data, 0, 0);
      setLastDrawnShape(history[newIndex].data);
      setHistoryIndex(newIndex);
    }
  };

  const handleTextInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && ctx && canvasRef.current) {
      const text = (e.target as HTMLInputElement).value;
      ctx.font = `${lineWidth * 8}px Arial`;
      ctx.fillStyle = color;
      ctx.fillText(text, textInputPos.x, textInputPos.y);
      setShowTextInput(false);
      
      // Save to history
      const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      setLastDrawnShape(imageData);
      const newHistory = [...history, { type: 'text', data: imageData }];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const getCanvasImage = (): string => {
    if (!canvasRef.current) return '';
    return canvasRef.current.toDataURL('image/png');
  };

  return {
    canvasElement: (
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[500px] rounded-lg cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        
        {/* Drawing Tools */}
        <div className="absolute top-4 left-4 flex flex-col space-y-4">
          {/* Color Palette */}
          <div className="bg-white/10 p-2 rounded-lg">
            <div className="grid grid-cols-5 gap-1">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full ${
                    color === c ? 'ring-2 ring-white' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Line Width */}
          <div className="bg-white/10 p-2 rounded-lg">
            <div className="space-y-1">
              {lineWidths.map((w) => (
                <button
                  key={w}
                  onClick={() => setLineWidth(w)}
                  className={`w-full h-6 flex items-center justify-center ${
                    lineWidth === w ? 'bg-white/20' : ''
                  } rounded hover:bg-white/10`}
                >
                  <div
                    className="bg-white rounded-full"
                    style={{ width: w, height: w }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={() => setTool('brush')}
            className={`p-2 rounded-lg ${
              tool === 'brush' ? 'bg-white/20' : 'bg-white/10'
            } hover:bg-white/20 transition`}
            title="Brush"
          >
            <Palette className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg ${
              tool === 'eraser' ? 'bg-white/20' : 'bg-white/10'
            } hover:bg-white/20 transition`}
            title="Eraser"
          >
            <Eraser className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded-lg ${
              tool === 'circle' ? 'bg-white/20' : 'bg-white/10'
            } hover:bg-white/20 transition`}
            title="Circle"
          >
            <Circle className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setTool('square')}
            className={`p-2 rounded-lg ${
              tool === 'square' ? 'bg-white/20' : 'bg-white/10'
            } hover:bg-white/20 transition`}
            title="Square"
          >
            <Square className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setTool('line')}
            className={`p-2 rounded-lg ${
              tool === 'line' ? 'bg-white/20' : 'bg-white/10'
            } hover:bg-white/20 transition`}
            title="Line"
          >
            <Minus className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setTool('text')}
            className={`p-2 rounded-lg ${
              tool === 'text' ? 'bg-white/20' : 'bg-white/10'
            } hover:bg-white/20 transition`}
            title="Text"
          >
            <Type className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-50"
            title="Undo"
          >
            <Undo className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-50"
            title="Redo"
          >
            <Redo className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            title="Clear canvas"
          >
            <Eraser className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Text Input */}
        {showTextInput && (
          <input
            type="text"
            autoFocus
            className="absolute bg-white/10 text-white border border-white/20 rounded px-2 py-1"
            style={{
              left: textInputPos.x + 'px',
              top: textInputPos.y + 'px',
              fontSize: lineWidth * 8 + 'px'
            }}
            onKeyDown={handleTextInput}
            onBlur={() => setShowTextInput(false)}
          />
        )}
      </div>
    ),
    getCanvasImage
  };
};

export default Canvas;