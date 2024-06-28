import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface ImageItem {
  src: any;
  id: number;
  height: string;
  width: string;
}
interface ContainerInfoProp {
  width: string;
  height: string;
}
interface ToolEditor {
  elements: any[];
  draggedElement: any;
  isResizing: boolean;
  isInputing: boolean;
  focusedElementId: any;
}
interface SystemState {
  layout: string;
  elements: ImageItem[];
  containerInfo: ContainerInfoProp;
  toolEditor: ToolEditor;
  toolBarKey: string;
}

const initialState: SystemState = {
  layout: 'vertical',
  elements: [],
  containerInfo: {
    width: '',
    height: '',
  },
  toolBarKey: 'custom',
  toolEditor: {
    elements: [],
    draggedElement: null,
    isResizing: false,
    isInputing: false,
    focusedElementId: null,
  },
};

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    changeLayoutReducer(state, action) {
      state.layout = action.payload;
    },
    changeElementsReducer(state, action) {
      state.elements = action.payload;
    },
    changeContainerInfoReducer(state, action) {
      state.containerInfo = action.payload;
    },
    changeToolBarKey(state, action) {
      state.toolBarKey = action.payload;
    },
    changeToolEditorElements(state, action) {
      state.toolEditor.elements = action.payload;
    },
    changeToolEditorDraggedElement(state, action) {
      state.toolEditor.draggedElement = action.payload;
    },
    changeToolEditorisResizing(state, action) {
      state.toolEditor.isResizing = action.payload;
    },

    changeToolEditorisInputing(state, action) {
      state.toolEditor.isInputing = action.payload;
    },
    changeToolEditorfocusedElementId(state, action) {
      state.toolEditor.focusedElementId = action.payload;
    },
  },
});

export const {
  changeLayoutReducer,
  changeElementsReducer,
  changeContainerInfoReducer,
  changeToolBarKey,
  changeToolEditorElements,
  changeToolEditorDraggedElement,
  changeToolEditorisInputing,
  changeToolEditorisResizing,
  changeToolEditorfocusedElementId,
} = systemSlice.actions;
export default systemSlice.reducer;
