import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import html2canvas from 'html2canvas';
import { useSelector, useDispatch } from 'react-redux';

import ResizableDraggableElement from './components/resizableDraggableElement';
import ToolBar from './components/toolBar';
import back from '@/assets/back.png';
import './index.scss';
import {
  changeContainerInfoReducer,
  changeElementsReducer,
} from '@/store/system';
interface ImageItem {
  src: any;
  id: number;
  height: string;
  width: string;
}

interface IProps {
  containerImageBoxRef: any;
  initElementsArr: ImageItem[];
}
function ImageEditorContainer({
  containerImageBoxRef,
  initElementsArr,
}: IProps) {
  const dispathch = useDispatch();
  const { layout, elements, containerInfo } = useSelector(
    (state: any) => state.system
  );
  const [choosenId, setChoosenId] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false); // 新增的状态标志
  useEffect(() => {
    const containerElement = containerImageBoxRef.current;
    const containerLayoutInfo =
      getElementDimensionsWithoutPadding(containerElement);
    dispathch(changeContainerInfoReducer(containerLayoutInfo));
  }, []);
  useEffect(() => {
    if (initElementsArr.length > 0) {
      handleImageChange();
    }
  }, [containerInfo]);
  function getElementDimensionsWithoutPadding(element: any) {
    const computedStyle = getComputedStyle(element);

    const clientWidth = element.clientWidth;
    const clientHeight = element.clientHeight;

    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const paddingRight = parseFloat(computedStyle.paddingRight);
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingBottom = parseFloat(computedStyle.paddingBottom);

    const widthWithoutPadding = clientWidth - paddingLeft - paddingRight;
    const heightWithoutPadding = clientHeight - paddingTop - paddingBottom;

    return {
      width: widthWithoutPadding,
      height: heightWithoutPadding,
    };
  }
  const takeScreenshot = async () => {
    if (containerImageBoxRef.current) {
      const canvas = await html2canvas(containerImageBoxRef.current);
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'screenshot.png';
      link.click();
    }
  };
  const resetElement = () => {
    dispathch(changeElementsReducer([]));
  };
  const handleImageChange = () => {
    const newElements = [...initElementsArr];
    let height = '',
      width = '';
    if (layout === 'vertical') {
      height = `${containerInfo.height}px`;
      width = `${containerInfo.width / newElements.length}px`;
    } else {
      height = `${containerInfo.width / newElements.length}px`;
      width = `${containerInfo.width}px`;
    }
    const updatedElements: ImageItem[] = newElements.map((element) => ({
      ...element,
      height,
      width,
    }));
    dispathch(changeElementsReducer(updatedElements));
  };

  const handleResizing = (flag: boolean) => {
    setIsResizing(flag);
  };

  const onDragStart = (result: any) => {
    if (isResizing) return;
  };

  const onDragEnd = (result: any) => {
    if (isResizing) return;
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (destination.index === source.index) {
      return;
    }

    const newItems: ImageItem[] = Array.from(elements);
    const movedItem = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, movedItem[0]); // 在目标位置插入项目
    dispathch(changeElementsReducer(newItems));
  };

  const handleChooseItem = (id: any) => {
    setChoosenId(id);
  };

  const updateElementDimensions = (id: number, dimensions: any) => {
    const prevElements = [...elements];
    const elementIndex = prevElements.findIndex((el: any) => el.id === id);
    const otherElements = prevElements.filter(
      (el: any, idx: any) => idx !== elementIndex
    );
    const remainingHeight =
      containerInfo.height - parseFloat(dimensions.height);
    const remainingWidth = containerInfo.width - parseFloat(dimensions.width);

    let width = '',
      height = '';
    if (layout === 'vertical') {
      width = `${remainingWidth / otherElements.length}px`;
      height = `${containerInfo.height}px`;
    } else {
      width = `${containerInfo.width}px`;
      height = `${remainingHeight / otherElements.length}px`;
    }
    const updatedElements = otherElements.map((element: any) => ({
      ...element,
      height,
      width,
    }));
    const updatedElement = {
      ...prevElements[elementIndex],
      width:
        layout === 'vertical' ? dimensions.width : `${containerInfo.width}px`,
      height:
        layout === 'vertical' ? dimensions.height : `${containerInfo.height}px`,
    };
    updatedElements.splice(elementIndex, 0, updatedElement);
    dispathch(changeElementsReducer(updatedElements));
  };
  const closeFocusElement = () => {
    setChoosenId(null);
  };
  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div
            className="container"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            <div className="container-header">
              <img
                className="back"
                src={back}
                alt="icon"
                onClick={resetElement}
              />
              <div className="screenshot" onClick={takeScreenshot}>
                保存
              </div>
            </div>

            <div
              ref={containerImageBoxRef}
              className={`container-imagebox ${
                layout === 'horizational'
                  ? 'horizational_layout'
                  : 'vertical_layout'
              }`}
            >
              {elements.map((element: any, index: number) => {
                const firstElementIndex = index === 0;
                const lastElementIndex = index === elements.length - 1;
                return (
                  <Draggable
                    key={element.id.toString()}
                    draggableId={element.id.toString()}
                    index={index}
                    isDragDisabled={isResizing}
                  >
                    {(provided) => (
                      <div
                        className="image-item"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ResizableDraggableElement
                          choosenId={choosenId}
                          chooseItem={handleChooseItem}
                          key={element.id}
                          id={element.id}
                          src={element.src}
                          elementIndex={index}
                          firstElementIndex={firstElementIndex}
                          lastElementIndex={lastElementIndex}
                          initialWidth={element.width}
                          initialHeight={element.height}
                          updateDimensions={updateElementDimensions}
                          setIsResizing={handleResizing} // 传递setIsResizing函数
                          isResizing={isResizing}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
            <ToolBar closeFocusElement={closeFocusElement} />
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default ImageEditorContainer;
