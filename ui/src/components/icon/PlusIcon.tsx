import React from "react";

interface Props {
  width: string;
  height: string;
}

export const PlusIcon = ({ width, height }: Props) => (
  <div
    style={{
      height: height,
      width: width,
      content: "url(/images/toolbarButton-zoomIn.png",
    }}
  ></div>
);
