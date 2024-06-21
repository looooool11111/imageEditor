import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import ResizableDraggableElement from './components/resizableDraggableElement/index';
import { TouchBackend } from 'react-dnd-touch-backend';
import './index.scss';

interface ImageItem {
  src: any;
  id: number;
  height: string;
}

let idCounter = 0; // 全局计数器

const ResizableDraggableContainer = () => {
  const [elements, setElements] = useState<ImageItem[]>([]);
  const [choosenId, setChoosenId] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false); // 新增的状态标志
  const containerImageBoxRef = useRef<HTMLDivElement>(null);
  const swapElementsArr = (
    arr: Array<any>,
    fromIndex: number,
    toIndex: number
  ) => {
    const item = arr.splice(fromIndex, 1)[0];
    arr.splice(toIndex, 0, item);
    return arr;
  };
  const handleResizing = (flag: boolean) => {
    setIsResizing(flag);
  };
  const moveElement = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      if (!isResizing) {
        // 如果正在调整大小，阻止移动元素
        setElements((prevElements) => {
          const updatedElements = swapElementsArr(
            [...prevElements],
            dragIndex,
            hoverIndex
          );
          return updatedElements;
        });
      }
    },
    [isResizing]
  ); // 添加isResizing为依赖项

  const handleImageChange = (e: any) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file: any) => ({
      id: idCounter++,
      src: URL.createObjectURL(file),
      height: `${100 / (elements.length + 1)}%`,
    }));
    setElements((state) => {
      const newElements = [...state, ...imageUrls];
      const updatedElements = newElements.map((element) => ({
        ...element,
        height: `${100 / newElements.length}%`,
      }));
      return updatedElements;
    });
  };

  const handleChooseItem = (id: any) => {
    setChoosenId(id);
  };

  const updateElementHeight = (id: number, newHeight: string) => {
    setElements((prevElements) => {
      const totalHeight = containerImageBoxRef.current?.offsetHeight as number;
      const elementIndex = prevElements.findIndex((el) => el.id === id);
      const otherElements = prevElements.filter(
        (el, idx) => idx !== elementIndex
      );
      const remainingHeight = totalHeight - parseFloat(newHeight);
      const updatedElements = otherElements.map((element) => ({
        ...element,
        height: `${remainingHeight / otherElements.length}px`,
      }));
      const updatedElement = {
        ...prevElements[elementIndex],
        height: newHeight,
      };
      updatedElements.splice(elementIndex, 0, updatedElement);
      return updatedElements;
    });
  };

  return (
    <div className="container">
      <DndProvider backend={TouchBackend as any}>
        <div ref={containerImageBoxRef} className="container-imagebox">
          {elements.length > 0 &&
            elements.map((element, index) => {
              const firstElementIndex = index === 0;
              const lastElementIndex = index === elements.length - 1;
              return (
                <ResizableDraggableElement
                  choosenId={choosenId}
                  chooseItem={handleChooseItem}
                  key={element.id}
                  id={element.id}
                  src={element.src}
                  elementIndex={index}
                  firstElementIndex={firstElementIndex}
                  lastElementIndex={lastElementIndex}
                  moveElement={moveElement}
                  initialWidth="100%"
                  initialHeight={element.height}
                  updateHeight={updateElementHeight}
                  setIsResizing={handleResizing} // 传递setIsResizing函数
                />
              );
            })}
        </div>
      </DndProvider>
      <div className="tool-bar">
        <div className="tool-bar-upload">
          <input
            type="file"
            className="tool-bar-upload-btn"
            multiple
            onChange={handleImageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ResizableDraggableContainer;
