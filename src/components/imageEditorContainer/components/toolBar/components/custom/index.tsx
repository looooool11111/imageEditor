import React, { useRef, useState, useEffect } from 'react';
import { Tabs } from 'antd-mobile';
import useToolEditor from '@/hooks/useToolEditor';
import { useDispatch, useSelector } from 'react-redux';
import './index.scss';
import { changeToolEditorfocusedElementId } from '@/store/system';

interface IProps {}

const Custom = ({}: IProps) => {
  const dispatch = useDispatch();
  const { handleDragStart } = useToolEditor();
  return (
    <div className="custom">
      <footer
        className="editor__footer"
        onClick={() => {
          // setFocusedElementId(null);
          dispatch(changeToolEditorfocusedElementId(null));
        }}
      >
        <div
          className="editor__tool"
          onTouchStart={(e) => handleDragStart(e, 'image')}
        >
          Add Image
        </div>
        <div
          className="editor__tool"
          onTouchStart={(e) => handleDragStart(e, 'text')}
        >
          Add Text
        </div>
      </footer>
    </div>
  );
};

export default Custom;
