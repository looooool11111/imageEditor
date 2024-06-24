import React, { useState, useRef, useCallback } from 'react';
interface ImageItem {
  src: any;
  id: number;
  height: string;
  width: string;
}
let idCounter = 0; // 全局计数器

function useImage() {
  const containerImageBoxRef = useRef<HTMLDivElement>(null);
  const [imageArr, setImageArr] = useState<ImageItem[]>([]);

  return {
    containerImageBoxRef,
    idCounter,
    imageArr,
    setImageArr,
  };
}

export default useImage;
