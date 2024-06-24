import React, { useRef, useState, useEffect } from 'react';
import { Tabs } from 'antd-mobile';
import LayoutList from './components/layoutList';
import Custom from './components/custom';

import './index.scss';

interface IProps {
  closeFocusElement: any;
}

const ToolBar = ({ closeFocusElement }: IProps) => {
  return (
    <div className="tool-bar" onClick={closeFocusElement}>
      <Tabs>
        <Tabs.Tab title="模板" key="fruits">
          <LayoutList closeFocusElement={closeFocusElement} />
        </Tabs.Tab>
        <Tabs.Tab title="自定义" key="vegetables">
          <Custom />
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};

export default ToolBar;
