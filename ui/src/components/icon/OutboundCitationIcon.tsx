import React from "react";

interface Props {
    width: string;
    height: string;
}

export const OutboundCitationIcon = ({ width, height }: Props) => (
  <svg viewBox="0 0 24 24" width={width} height={height}>
    <path d="M24,21.43A2.57,2.57,0,0,1,21.43,24H2.57A2.57,2.57,0,0,1,0,21.43V2.57A2.57,2.57,0,0,1,2.57,0H21.43A2.57,2.57,0,0,1,24,2.57Zm-10.71-18a1.28,1.28,0,0,0-.9,2.19L14.1,7.34,3.62,17.82a.65.65,0,0,0,0,.91l1.66,1.66a.65.65,0,0,0,.91,0L16.67,9.91l1.72,1.71a1.28,1.28,0,0,0,2.19-.91v-6a1.29,1.29,0,0,0-1.29-1.28Z" />
  </svg>
);
