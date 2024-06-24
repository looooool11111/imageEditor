import React, { useRef, useState, useEffect } from 'react';
import { Tabs } from 'antd-mobile';
import { useSelector, useDispatch } from 'react-redux';
import { changeLayoutReducer, changeElementsReducer } from '@/store/system';
import VerticalIcon from '@/assets/v_layout.png';
import HorizationalIcon from '@/assets/h_layout.png';
import VerticalIconActive from '@/assets/v_layout_active.png';
import HorizationalIconActive from '@/assets/h_layout_active.png';

import './index.scss';

interface IProps {
  closeFocusElement: any;
}

const LayoutList = ({ closeFocusElement }: IProps) => {
  const dispathch = useDispatch();
  const { layout, elements, containerInfo } = useSelector(
    (state: any) => state.system
  );
  const modelList = [
    {
      id: 'vertical',
      src: VerticalIcon,
      activeSrc: VerticalIconActive,
    },
    {
      id: 'horizational',
      src: HorizationalIcon,
      activeSrc: HorizationalIconActive,
    },
  ];
  const handleLayout = (item: any) => {
    let newElements;
    if (item.id === 'vertical') {
      newElements = elements.map((item: any) => {
        return {
          ...item,
          width: `${containerInfo.width / elements.length}px`,
          height: `${containerInfo.height}px`,
        };
      });
    } else {
      newElements = elements.map((item: any) => {
        return {
          ...item,
          height: `${containerInfo.height / elements.length}px`,
          width: `${containerInfo.width}px`,
        };
      });
    }
    console.log(item.id, newElements, 'newELements');
    dispathch(changeElementsReducer(newElements));
    dispathch(changeLayoutReducer(item.id));
  };
  return (
    <div className="layout-list" onClick={closeFocusElement}>
      {modelList.map((item: any, index: number) => {
        const isLastIndex = (index + 1) % 5 === 0; // 使用 (index + 1) % 5 === 0 判断是否是 5 的倍数

        return (
          <div
            key={index}
            className={`layout-list-item ${isLastIndex ? 'isLast' : ''}`}
            onClick={() => {
              handleLayout(item);
            }}
          >
            <img
              className="layout-list-item-icon"
              src={layout === item.id ? item.activeSrc : item.src}
              alt="icon"
            />
          </div>
        );
      })}
    </div>
  );
};

export default LayoutList;
