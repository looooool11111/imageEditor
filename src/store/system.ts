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
interface SystemState {
  layout: string;
  elements: ImageItem[];
  containerInfo: ContainerInfoProp;
}

const initialState: SystemState = {
  layout: 'vertical',
  elements: [],
  containerInfo: {
    width: '',
    height: '',
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
  },
});

export const {
  changeLayoutReducer,
  changeElementsReducer,
  changeContainerInfoReducer,
} = systemSlice.actions;
export default systemSlice.reducer;
