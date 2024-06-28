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
  const [isClick, setIsClick] = useState(true);
  const { layout, containerInfo } = useSelector((state: any) => state.system);

  useEffect(() => {
    setDimensions({
      width: initialWidth,
      height: initialHeight,
    });
    console.log(initialWidth, initialHeight);
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

      const minHeight = containerInfo.height * 0.2;
      const minWidth = containerInfo.width * 0.2;
      const maxHeight = containerInfo.height * 0.8;
      const maxWidth = containerInfo.width * 0.8;
      let newWidth = parseInt(dimensions.width);
      let newHeight = parseInt(dimensions.height);

      switch (resizeDirection) {
        case 'top':
          if (dy < 0) {
            // 向上拖动，只放大
            newHeight = Math.min(newHeight - dy, maxHeight);
          } else {
            // 向下拖动，只缩小
            newHeight = Math.max(newHeight - dy, minHeight);
          }
          break;
        case 'right':
          if (dx > 0) {
            // 向右拖动，只放大
            newWidth = Math.min(newWidth + dx, maxWidth);
          } else {
            // 向左拖动，只缩小
            newWidth = Math.max(newWidth + dx, minWidth);
          }
          break;
        case 'bottom':
          if (dy > 0) {
            // 向下拖动，只放大
            newHeight = Math.min(newHeight + dy, maxHeight);
          } else {
            // 向上拖动，只缩小
            newHeight = Math.max(newHeight + dy, minHeight);
          }
          break;
        case 'left':
          if (dx < 0) {
            // 向左拖动，只放大
            newWidth = Math.min(newWidth - dx, maxWidth);
          } else {
            // 向右拖动，只缩小
            newWidth = Math.max(newWidth - dx, minWidth);
          }
          break;
      }

      setDimensions({
        width: `${newWidth}`,
        height: `${newHeight}`,
      });
      setStartPos({ x: clientX, y: clientY });
    },
    [startPos, resizeDirection, dimensions, setIsResizing, containerInfo]
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
    <Droppable
      droppableId="droppable-1"
      type="PERSON"
      isDropDisabled={isResizing}
    >
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
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
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
