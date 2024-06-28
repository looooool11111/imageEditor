import React, { useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  changeToolEditorDraggedElement,
  changeToolEditorElements,
  changeToolEditorisInputing,
  changeToolEditorisResizing,
  changeToolEditorfocusedElementId,
} from '@/store/system';
let idCounter = 0; // 全局计数器

function useToolEditor() {
  const { elements, draggedElement, isResizing, isInputing, focusedElementId } =
    useSelector((state) => state.system.toolEditor);
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const handleDragStart = (e, type) => {
    // e.preventDefault();
    dispatch(changeToolEditorDraggedElement(type));
  };

  const handleDragOver = (e) => {
    // e.preventDefault();
  };

  const handleDrop = (e) => {
    // e.preventDefault();
    if (!draggedElement) return;

    const touch = e.changedTouches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const newElement = {
      id: Date.now(),
      type: draggedElement,
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      content:
        draggedElement === 'text'
          ? 'Edit me'
          : 'https://inews.gtimg.com/om_bt/OHyQqgC_5oi4Vm0tlH49XvJzqNBHo2Zryxx5F_be5N2cIAA/1000',
      width: 150,
      height: draggedElement === 'text' ? 40 : 150,
    };
    dispatch(changeToolEditorElements([...elements, newElement]));
    dispatch(changeToolEditorDraggedElement(null));
  };

  const handleElementTouch = (id) => {
    dispatch(changeToolEditorfocusedElementId(id));
    dispatch(changeToolEditorisInputing(false));

    const element = elements.find((el) => el.id === id);
    if (element.type === 'text') {
      dispatch(changeToolEditorisInputing(true));

      const updatedElements = elements.map((el) =>
        el.id === id ? { ...el, content: '' } : el
      );
      dispatch(changeToolEditorElements(updatedElements));
    }
  };

  const handleResize = (id, newWidth, newHeight) => {
    const updatedElements = elements.map((el) =>
      el.id === id ? { ...el, width: newWidth, height: newHeight } : el
    );
    dispatch(changeToolEditorElements(updatedElements));
  };

  const handleResizeStart = (e, id) => {
    e.stopPropagation();
    dispatch(changeToolEditorisResizing(true));

    const element = elements.find((el) => el.id === id);
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const startWidth = element.width;
    const startHeight = element.height;

    const handleTouchMove = (moveEvent) => {
      const moveTouch = moveEvent.touches[0];
      const newWidth = startWidth + (moveTouch.clientX - startX);
      const newHeight = startHeight + (moveTouch.clientY - startY);
      handleResize(id, newWidth, newHeight);
    };

    const handleTouchEnd = () => {
      dispatch(changeToolEditorisResizing(false));
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleDelete = (id) => {
    const data = elements.filter((el) => el.id !== id);
    dispatch(changeToolEditorElements(data));

    dispatch(changeToolEditorfocusedElementId(null));
  };
  const handleCanvasTouch = (e) => {
    if (e.target === canvasRef.current) {
      dispatch(changeToolEditorfocusedElementId(null));
    }
  };
  return {
    canvasRef,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleElementTouch,
    handleResize,
    handleResizeStart,
    handleDelete,
    handleCanvasTouch,
  };
}

export default useToolEditor;
