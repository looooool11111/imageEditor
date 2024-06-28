import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';

import { useSelector, useDispatch } from 'react-redux';
import { Dialog, Toast } from 'antd-mobile';

import ResizableDraggableElement from './components/resizableDraggableElement';
import ElementsEditor from '@/components/elementsEditor';

import ToolBar from './components/toolBar';
import back from '@/assets/back.png';
import './index.scss';
import {
  changeContainerInfoReducer,
  changeElementsReducer,
  changeToolEditorElements,
  changeToolEditorfocusedElementId,
  changeToolBarKey,
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
  resetBack: any;
}
function ImageEditorContainer({
  containerImageBoxRef,
  initElementsArr,
  resetBack,
}: IProps) {
  const dispatch = useDispatch();
  const { layout, elements, containerInfo } = useSelector(
    (state: any) => state.system
  );
  const { toolBarKey } = useSelector((state: any) => state.system);

  const [choosenId, setChoosenId] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false); // 新增的状态标志
  useEffect(() => {
    const containerElement = containerImageBoxRef.current;
    const containerLayoutInfo =
      getElementDimensionsWithoutPadding(containerElement);
    dispatch(changeContainerInfoReducer(containerLayoutInfo));
  }, []);
  useEffect(() => {
    if (initElementsArr.length > 0) {
      handleImageChange();
    }
  }, [containerInfo]);
  useEffect(() => {
    console.log('🚀 ~ useEffect ~ isResizing:', isResizing);
  }, [isResizing]);
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
    if (toolBarKey === 'model') {
      const result = await Dialog.confirm({
        content: '选项卡置于自定义时才会展示自定义内容哦',
      });
      if (result) {
        dispatch(changeToolBarKey('custom'));

        Toast.show({ content: '点击了确认', position: 'bottom' });
      } else {
        Toast.show({ content: '点击了取消', position: 'bottom' });
      }
    } else {
      const containerImageBox = containerImageBoxRef.current;
      if (containerImageBox) {
        dispatch(changeToolEditorfocusedElementId(null));
        domtoimage
          .toPng(containerImageBox, {
            width: containerInfo.width,
            height: containerInfo.height,
          })
          .then((dataUrl: string) => {
            const link = document.createElement('a');
            link.href = dataUrl;
            console.log(dataUrl);
            link.download = 'screenshot.png';
            link.click();
          })
          .catch((error: any) => {
            console.error('oops, something went wrong!', error);
          });
      }
    }
  };
  const resetElement = () => {
    dispatch(changeElementsReducer([]));
    resetBack([]);
    dispatch(changeToolEditorElements([]));
  };
  const handleImageChange = () => {
    const newElements = [...initElementsArr];
    let height = '',
      width = '';
    if (layout === 'vertical') {
      height = `${containerInfo.height}`;
      width = `${containerInfo.width / newElements.length}`;
    } else {
      height = `${containerInfo.width / newElements.length}`;
      width = `${containerInfo.width}`;
    }
    const updatedElements: ImageItem[] = newElements.map((element) => ({
      ...element,
      height,
      width,
    }));
    dispatch(changeElementsReducer(updatedElements));
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
    dispatch(changeElementsReducer(newItems));
  };

  const handleChooseItem = (id: any) => {
    setChoosenId(id);
  };

  const updateElementDimensions = (id: number, newDimensions: any) => {
    const prevElements = [...elements];
    const elementIndex = prevElements.findIndex((el: any) => el.id === id);
    const otherElements = prevElements.filter(
      (el: any, idx: any) => idx !== elementIndex
    );
    let remainItemWidth = 0,
      remainItemHeight = 0,
      updateElementWidth = 0,
      updateElementHeight = 0;
    // 容器宽高
    const containerWidth = containerInfo.width;
    const containerHeight = containerInfo.height;

    if (layout === 'vertical') {
      //单个元素调整高度最多80%
      if (newDimensions.width >= containerWidth * 0.8) {
        updateElementWidth = containerWidth * 0.8;
        updateElementHeight = containerHeight;
        remainItemWidth = (containerWidth * 0.2) / otherElements.length;
        remainItemHeight = containerHeight;
      } else {
        updateElementWidth = newDimensions.width;
        updateElementHeight = containerHeight;
        remainItemWidth =
          (containerWidth - parseFloat(newDimensions.width)) /
          otherElements.length;
        remainItemHeight = containerHeight;
      }
    } else {
      //单个元素调整宽度最多80%
      if (newDimensions.height >= containerHeight * 0.8) {
        updateElementHeight = containerHeight * 0.8;
        updateElementWidth = containerWidth;
        remainItemHeight = (containerHeight * 0.2) / otherElements.length;
        remainItemWidth = containerWidth;
      } else {
        updateElementHeight = newDimensions.height;
        updateElementWidth = containerWidth;
        remainItemHeight =
          (containerHeight - parseFloat(newDimensions.height)) /
          otherElements.length;
        remainItemWidth = containerWidth;
      }
    }
    // 剩下的元素平分
    const updatedElements = otherElements.map((element: any) => ({
      ...element,
      height: remainItemHeight,
      width: remainItemWidth,
    }));

    const updatedElement = {
      ...prevElements[elementIndex],
      width: updateElementWidth,
      height: updateElementHeight,
    };
    updatedElements.splice(elementIndex, 0, updatedElement);
    dispatch(changeElementsReducer(updatedElements));
  };
  const closeFocusElement = () => {
    setChoosenId(null);
    dispatch(changeToolEditorfocusedElementId(null));
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
            <div className="container-body">
              <div
                ref={containerImageBoxRef}
                className={`container-imagebox ${
                  layout === 'horizational'
                    ? 'horizational_layout'
                    : 'vertical_layout'
                }`}
              >
                <ElementsEditor />

                {elements.map((element: any, index: number) => {
                  const firstElementIndex = index === 0;
                  const lastElementIndex = index === elements.length - 1;
                  return (
                    <Draggable
                      key={element.id.toString()}
                      draggableId={element.id.toString()}
                      index={index}
                      isDragDisabled={toolBarKey == 'custom' || isResizing}
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
            </div>

            <ToolBar closeFocusElement={closeFocusElement} />
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default ImageEditorContainer;
