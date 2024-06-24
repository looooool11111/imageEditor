import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { useSelector } from 'react-redux';

import './index.scss';

interface IProps {
  id: number;
  src: string;
  elementIndex: number;
  initialWidth: string;
  initialHeight: string;
  chooseItem: any;
  choosenId: number | null;
  updateDimensions: (id: number, dimensions: any) => void;
  setIsResizing: (isResizing: boolean) => void;
  firstElementIndex: boolean;
  lastElementIndex: boolean;
  isResizing: boolean;
}

const ResizableDraggableElement = ({
  id,
  src,
  initialWidth,
  initialHeight,
  chooseItem,
  choosenId,
  updateDimensions,
  setIsResizing,
  firstElementIndex,
  lastElementIndex,
  isResizing,
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
  const { layout, containerInfo } = useSelector((state: any) => state.system);

  useEffect(() => {
    setDimensions({
      width: initialWidth,
      height: initialHeight,
    });
  }, [initialWidth, initialHeight]);

  const handleTouchStart = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
      direction: 'top' | 'right' | 'bottom' | 'left'
    ) => {
      e.stopPropagation();
      e.preventDefault();
      setResizeDirection(direction);
      setIsResizing(true);
      setIsClick(true);

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setStartPos({ x: clientX, y: clientY });
    },
    [setIsResizing]
  );

  const handleTouchMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!startPos || !resizeDirection || !containerRef.current) return;

      setIsResizing(true);
      e.preventDefault();

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

      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) {
        return;
      }

      setIsClick(false);

      const containerElement = containerRef.current.parentElement;
      if (!containerElement) return;

      const minHeight = containerInfo.height * 0.1;
      const minWidth = containerInfo.width * 0.1;

      let newWidth = parseInt(dimensions.width);
      let newHeight = parseInt(dimensions.height);
      switch (resizeDirection) {
        case 'top':
          newHeight = Math.max(newHeight - dy, minHeight);
          break;
        case 'right':
          newWidth = Math.min(
            Math.max(newWidth + dx, minWidth),
            containerInfo.width
          );
          break;
        case 'bottom':
          newHeight = Math.min(
            Math.max(newHeight + dy, minHeight),
            containerInfo.height
          );
          break;
        case 'left':
          newWidth = Math.max(newWidth - dx, minWidth);
          break;
      }

      setDimensions({
        width: `${newWidth}px`,
        height: `${newHeight}px`,
      });
      setStartPos({ x: clientX, y: clientY });
    },
    [startPos, resizeDirection, dimensions, setIsResizing]
  );

  const handleTouchEnd = useCallback(() => {
    setResizeDirection(null);
    setStartPos(null);
    setIsResizing(false);

    if (isClick) {
      chooseItem(id);
    } else {
      updateDimensions(id, dimensions);
    }
  }, [isClick, chooseItem, id, updateDimensions, dimensions, setIsResizing]);
  useEffect(() => {
    if (resizeDirection) {
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [resizeDirection, handleTouchMove, handleTouchEnd]);
  return (
    <Droppable droppableId="droppable-1" type="PERSON">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          style={{
            backgroundColor: snapshot.isDraggingOver ? 'blue' : '',
            height: '100%',
          }}
          {...provided.droppableProps}
        >
          <div
            ref={containerRef}
            className={`resizable-container ${
              choosenId === id ? 'resizable-container__focus' : ''
            }`}
            style={{
              width: dimensions.width,
              height: dimensions.height,
              touchAction: 'none',
            }}
          >
            <img
              onClick={() => chooseItem(id)}
              src={src}
              alt="Resizable"
              className="resizable-image"
            />
            {choosenId === id && (
              <>
                {!firstElementIndex && layout == 'horizational' && (
                  <div
                    className="resizable-handle top"
                    onTouchStart={(e) => handleTouchStart(e, 'top')}
                  ></div>
                )}
                {!lastElementIndex && layout == 'horizational' && (
                  <div
                    className="resizable-handle bottom"
                    onTouchStart={(e) => handleTouchStart(e, 'bottom')}
                  ></div>
                )}

                {!firstElementIndex && layout == 'vertical' && (
                  <div
                    className="resizable-handle left"
                    onTouchStart={(e) => handleTouchStart(e, 'left')}
                  ></div>
                )}
                {!lastElementIndex && layout == 'vertical' && (
                  <div
                    className="resizable-handle right"
                    onTouchStart={(e) => handleTouchStart(e, 'right')}
                  ></div>
                )}
              </>
            )}
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default ResizableDraggableElement;
