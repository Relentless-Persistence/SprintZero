import { atom, selector } from "recoil";

export const productsState = atom({
  key: "productsState",
  default: null,
});

export const activeProductState = atom({
  key: "activeProductState",
  default: null,
});