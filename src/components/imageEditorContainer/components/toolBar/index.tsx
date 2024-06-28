import React, { useRef, useState, useEffect } from 'react';
import { Tabs } from 'antd-mobile';
import { useDispatch, useSelector } from 'react-redux';
import LayoutList from './components/layoutList';
import Custom from './components/custom';
import { changeToolBarKey } from '@/store/system';
import './index.scss';

interface IProps {
  closeFocusElement: any;
}

const ToolBar = ({ closeFocusElement }: IProps) => {
  const { toolBarKey } = useSelector((state: any) => state.system);

  const dispatch = useDispatch();
  return (
    <div className="tool-bar" onClick={closeFocusElement}>
      <Tabs
        onChange={(key) => {
          console.log(key);
          dispatch(changeToolBarKey(key));
        }}
        activeKey={toolBarKey}
      >
        <Tabs.Tab title="模板" key="model">
          <LayoutList closeFocusElement={closeFocusElement} />
        </Tabs.Tab>
        <Tabs.Tab title="自定义" key="custom">
          <Custom />
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};

export default ToolBar;
