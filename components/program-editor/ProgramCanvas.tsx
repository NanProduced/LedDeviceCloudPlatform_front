'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';

interface ProgramCanvasProps {
  width?: number;
  height?: number;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  onSelectionChange?: (selectedObjects: fabric.Object[]) => void;
}

/**
 * 节目编辑画布组件
 * 基于Fabric.js实现可视化编辑功能
 */
export const ProgramCanvas: React.FC<ProgramCanvasProps> = ({
  width = 1920,
  height = 1080,
  onCanvasReady,
  onSelectionChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // 初始化Fabric.js画布
  const initCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    // 创建Fabric.js画布实例
    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#000000',
      selection: true,
      preserveObjectStacking: true,
      imageSmoothingEnabled: false,
    });

    // 设置画布配置
    canvas.setDimensions({
      width: '100%',
      height: '100%',
    }, {
      cssOnly: true,
    });

    // 事件监听
    canvas.on('selection:created', (e) => {
      const selectedObjects = canvas.getActiveObjects();
      onSelectionChange?.(selectedObjects);
    });

    canvas.on('selection:updated', (e) => {
      const selectedObjects = canvas.getActiveObjects();
      onSelectionChange?.(selectedObjects);
    });

    canvas.on('selection:cleared', () => {
      onSelectionChange?.([]);
    });

    // 对象修改事件
    canvas.on('object:modified', (e) => {
      console.log('Object modified:', e.target);
      // TODO: 触发状态更新
    });

    // 保存引用
    fabricCanvasRef.current = canvas;

    // 通知父组件画布已准备就绪
    onCanvasReady?.(canvas);

    return canvas;
  }, [width, height, onCanvasReady, onSelectionChange]);

  // 组件挂载时初始化画布
  useEffect(() => {
    const canvas = initCanvas();

    // 清理函数
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [initCanvas]);

  // 添加测试元素的方法
  const addTestImage = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    // 添加一个测试矩形
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: 'rgba(255, 0, 0, 0.8)',
      stroke: '#fff',
      strokeWidth: 2,
      rx: 10,
      ry: 10,
    });

    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  }, []);

  // 添加测试文本
  const addTestText = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const text = new fabric.Text('测试文本', {
      left: 300,
      top: 200,
      fontSize: 48,
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeWidth: 1,
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  }, []);

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {/* 画布容器 */}
      <div className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="border border-gray-600"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* 临时测试按钮 - 后续会移除 */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <button
          onClick={addTestImage}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          添加矩形
        </button>
        <button
          onClick={addTestText}
          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        >
          添加文本
        </button>
      </div>

      {/* 画布信息显示 */}
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
        {width} × {height}
      </div>
    </div>
  );
};

export default ProgramCanvas;