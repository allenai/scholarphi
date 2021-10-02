import React from "react";

interface Props {
  width: string;
  height: string;
}

export const MinusIcon = ({ width, height }: Props) => (
  <div
    style={{
      height: height,
      width: width,
      content: "url(/images/toolbarButton-zoomOut.png",
    }}
  ></div>
);
