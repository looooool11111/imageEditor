import React, { useState, useRef, useCallback } from 'react';
import ImageEditorContainer from '@/components/imageEditorContainer';
import useImage from '@/hooks/useImage';
import './index.scss';

let idCounter = 0; // 全局计数器

function UploadImage() {
  const { containerImageBoxRef, imageArr, setImageArr } = useImage();
  const handleImageChange = (e: any) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file: any) => ({
      id: idCounter++,
      src: URL.createObjectURL(file),
    }));
    setImageArr((state: any) => {
      const newElements = [...state, ...imageUrls];
      const updatedElements = newElements.map((element) => ({
        ...element,
      }));
      return updatedElements;
    });
  };
  const render = () => {
    if (imageArr.length > 0) {
      return (
        <ImageEditorContainer
          initElementsArr={imageArr}
          containerImageBoxRef={containerImageBoxRef}
        />
      );
    } else {
      return (
        <div className="upload-image">
          <input
            type="file"
            className="upload-image-btn"
            multiple
            onChange={handleImageChange}
          />
        </div>
      );
    }
  };
  return <div className="content">{render()}</div>;
}

export default UploadImage;
