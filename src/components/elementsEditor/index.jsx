import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import './index.scss';
import { useDispatch, useSelector } from 'react-redux';
import useToolEditor from '@/hooks/useToolEditor';
import {
  changeToolEditorDraggedElement,
  changeToolEditorElements,
  changeToolEditorisInputing,
  changeToolEditorisResizing,
  changeToolEditorfocusedElementId,
} from '@/store/system';
const ImageTextEditor = () => {
  const { elements, draggedElement, isResizing, isInputing, focusedElementId } =
    useSelector((state) => state.system.toolEditor);
  const { toolBarKey } = useSelector((state) => state.system);
  console.log('🚀 ~ ImageTextEditor ~ toolBarKey:', toolBarKey);
  const dispatch = useDispatch();
  const {
    canvasRef,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleElementTouch,
    handleResize,
    handleResizeStart,
    handleDelete,
    handleCanvasTouch,
  } = useToolEditor();
  const testPng = '@/assets/v_layout.png';
  return (
    <div
      className="editor"
      style={{
        zIndex: `${toolBarKey != 'model' ? 10 : 0}`,
        // display: `${toolBarKey == 'model' ? 'none' : 'block'}`,
        opacity: `${toolBarKey == 'model' ? 0 : 1}`,
      }}
    >
      <main
        className="editor__main"
        onTouchMove={handleDragOver}
        onTouchEnd={handleDrop}
        onTouchStart={handleCanvasTouch}
        ref={canvasRef}
      >
        <div className="editor__canvas">
          {elements.map((element, index) => (
            <Draggable
              key={index}
              disabled={toolBarKey == 'model' || isInputing}
              onStop={() => {
                dispatch(changeToolEditorisInputing(false));
              }}
            >
              <div
                key={element.id}
                className={`editor__element editor__element--${element.type}`}
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                }}
                onTouchStart={() =>
                  !isResizing && handleElementTouch(element.id)
                }
              >
                {element.type === 'text' ? (
                  <input
                    className="editor__text"
                    onBlur={() => {
                      dispatch(changeToolEditorisInputing(false));
                    }}
                    type="text"
                  />
                ) : (
                  <img
                    src={element.content}
                    alt="Draggable"
                    className="editor__image"
                  />
                )}
                {focusedElementId === element.id && (
                  <>
                    <button
                      className="editor__delete-btn"
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        handleDelete(element.id);
                      }}
                    >
                      X
                    </button>
                    <div
                      className="editor__resize-handle"
                      onTouchStart={(e) => handleResizeStart(e, element.id)}
                    />
                  </>
                )}
              </div>
            </Draggable>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ImageTextEditor;
