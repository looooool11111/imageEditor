import React, { useRef, useState, useEffect } from 'react';
import { useDrag, useDrop, DragPreviewImage } from 'react-dnd';
import './index.scss';

interface IProps {
  id: number;
  src: string;
  elementIndex: number;
  moveElement: (dragIndex: number, hoverIndex: number) => void;
  initialWidth: string;
  initialHeight: string;
  chooseItem: any;
  choosenId: number | null;
  updateHeight: (id: number, newHeight: string) => void;
  setIsResizing: (isResizing: boolean) => void;
  firstElementIndex: boolean;
  lastElementIndex: boolean;
}

const ResizableDraggableElement = ({
  id,
  src,
  elementIndex,
  moveElement,
  initialWidth,
  initialHeight,
  chooseItem,
  choosenId,
  updateHeight,
  setIsResizing,
  firstElementIndex,
  lastElementIndex,
}: IProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [resizeDirection, setResizeDirection] = useState<
    'top' | 'right' | 'bottom' | 'left' | null
  >(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isClick, setIsClick] = useState(true); // 新增的状态标志

  useEffect(() => {
    setDimensions({
      width: initialWidth,
      height: initialHeight,
    });
  }, [initialWidth, initialHeight]);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    direction: 'top' | 'right' | 'bottom' | 'left'
  ) => {
    e.stopPropagation(); // 阻止事件传播，防止触发图片换位置
    e.preventDefault(); // 阻止默认触摸事件
    setResizeDirection(direction);
    setIsResizing(true); // 设置正在调整大小的标志
    setIsClick(true); // 初始化为点击状态
    if (direction) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setStartPos({ x: clientX, y: clientY });
    }
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!startPos || !resizeDirection) return;
    setIsResizing(true);
    e.preventDefault(); // 阻止默认触摸事件

    const clientX =
      'touches' in e
        ? (e as TouchEvent).touches[0].clientX
        : (e as MouseEvent).clientX;
    const clientY =
      'touches' in e
        ? (e as TouchEvent).touches[0].clientY
        : (e as MouseEvent).clientY;

    const dx = clientX - startPos.x;
    const dy = clientY - startPos.y;

    // 如果移动距离小于一定值（如3px），则认为是点击，而不是拖动
    if (Math.abs(dx) < 3 && Math.abs(dy) < 3) {
      return;
    }

    setIsClick(false); // 取消点击状态

    let newDimensions = { ...dimensions };

    const containerElement = containerRef.current?.parentElement;
    const containerHeight = containerElement
      ? containerElement.clientHeight
      : 0;
    const minHeight = containerHeight * 0.1; // 最小高度为 container 高度的 10%

    switch (resizeDirection) {
      case 'top':
        newDimensions.height = `${Math.max(
          parseInt(dimensions.height) - dy,
          minHeight
        )}px`;
        break;
      case 'right':
        newDimensions.width = `${Math.max(
          parseInt(dimensions.width) + dx,
          50
        )}px`;
        break;
      case 'bottom':
        newDimensions.height = `${Math.max(
          parseInt(dimensions.height) + dy,
          minHeight
        )}px`;
        break;
      case 'left':
        newDimensions.width = `${Math.max(
          parseInt(dimensions.width) - dx,
          50
        )}px`;
        break;
      default:
        break;
    }

    if (containerElement) {
      if (parseInt(newDimensions.height) > containerHeight) {
        newDimensions.height = `${containerHeight}px`;
      }
    }

    setDimensions(newDimensions);
    setStartPos({ x: clientX, y: clientY });
  };

  const handleMouseUp = () => {
    setResizeDirection(null);
    setStartPos(null);
    setIsResizing(false); // 取消正在调整大小的标志

    if (isClick) {
      chooseItem(id); // 如果是点击，则选择图片
    } else {
      updateHeight(id, dimensions.height); // 如果是拖动，则更新高度
    }
  };

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'element',
    item: { id, elementIndex, src },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: 'element',
    hover: (draggedItem: { elementIndex: number }) => {
      if (!resizeDirection && draggedItem.elementIndex !== elementIndex) {
        moveElement(draggedItem.elementIndex, elementIndex);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  useEffect(() => {
    const element = containerRef.current;
    if (element) {
      const handleTouchMove = (e: TouchEvent) => handleMouseMove(e);
      const handleTouchEnd = (e: TouchEvent) => handleMouseUp();

      element.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
      element.addEventListener('touchend', handleTouchEnd, { passive: false });
      return () => {
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [handleMouseMove, handleMouseUp]);

  drag(drop(containerRef));

  return (
    <div
      ref={containerRef}
      className={`resizable-container ${
        choosenId === id ? 'resizable-container__focus' : ''
      }`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
      }}
    >
      <DragPreviewImage connect={preview} src={src} />
      <img
        onClick={() => chooseItem(id)}
        src={src}
        alt="Resizable"
        className="resizable-image"
      />
      {choosenId === id && (
        <>
          {!firstElementIndex && (
            <div
              className="resizable-handle top"
              onTouchStart={(e) => handleMouseDown(e, 'top')}
            ></div>
          )}
          {initialWidth !== '100%' && (
            <div
              className="resizable-handle right"
              onTouchStart={(e) => handleMouseDown(e, 'right')}
            ></div>
          )}
          {!lastElementIndex && (
            <div
              className="resizable-handle bottom"
              onTouchStart={(e) => handleMouseDown(e, 'bottom')}
            ></div>
          )}
          {initialWidth !== '100%' && (
            <div
              className="resizable-handle left"
              onTouchStart={(e) => handleMouseDown(e, 'left')}
            ></div>
          )}
        </>
      )}
      {resizeDirection && (
        <div
          className="resizable-overlay"
          onTouchMove={(e) => handleMouseMove(e as unknown as TouchEvent)}
          onTouchEnd={handleMouseUp}
        ></div>
      )}
    </div>
  );
};

export default ResizableDraggableElement;
