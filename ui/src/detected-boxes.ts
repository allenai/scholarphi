export interface DetectedEntity {
  arxivId: string;
  page: number;
  index: number;
  type: string;
  rectangles: Rectangle[];
  iou: number;
}

interface Rectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const detectedEntities: DetectedEntity[] = [
  {
    arxivId: "1911.00213",
    page: 11,
    index: 0,
    iou: 0.609387792425722,
    type: "citation",
    rectangles: [
      {
        left: 133.06169411764705,
        top: 716.9063301662708,
        width: 16.007421848739497,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.01259",
    page: 3,
    index: 0,
    iou: 0.646794460034845,
    type: "citation",
    rectangles: [{ left: 318.0, top: 241.0, width: 14.0, height: 11.0 }]
  },
  {
    arxivId: "1911.01629",
    page: 2,
    index: 0,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 235.0, top: 704.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01629",
    page: 2,
    index: 1,
    iou: 0.313310285220398,
    type: "citation",
    rectangles: [{ left: 156.0, top: 157.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01629",
    page: 2,
    index: 2,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 435.0, top: 555.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01629",
    page: 2,
    index: 3,
    iou: 0.479233226837066,
    type: "citation",
    rectangles: [{ left: 405.0, top: 519.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01629",
    page: 2,
    index: 4,
    iou: 0.608695652173909,
    type: "citation",
    rectangles: [{ left: 354.0, top: 459.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01629",
    page: 2,
    index: 5,
    iou: 0.560784313725493,
    type: "citation",
    rectangles: [{ left: 514.0, top: 447.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01629",
    page: 2,
    index: 6,
    iou: 0.663483701020745,
    type: "citation",
    rectangles: [{ left: 439.0, top: 279.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01629",
    page: 2,
    index: 7,
    iou: 0.398852223816353,
    type: "citation",
    rectangles: [{ left: 478.0, top: 231.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01629",
    page: 2,
    index: 8,
    iou: 0.397082658022691,
    type: "citation",
    rectangles: [{ left: 398.0, top: 208.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01848",
    page: 1,
    index: 0,
    iou: 0.519527030868054,
    type: "citation",
    rectangles: [{ left: 341.0, top: 479.0, width: 25.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01848",
    page: 1,
    index: 1,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 472.0, top: 564.0, width: 17.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01848",
    page: 1,
    index: 2,
    iou: 0.603085553997197,
    type: "citation",
    rectangles: [{ left: 221.0, top: 257.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 0,
    iou: 0.186733250872893,
    type: "symbol",
    rectangles: [
      {
        left: 78.03618151260504,
        top: 702.9081591448931,
        width: 3.0013915966386553,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 1,
    iou: 0.203990661522016,
    type: "symbol",
    rectangles: [
      {
        left: 240.11132773109244,
        top: 704.9078978622327,
        width: 8.003710924369749,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 2,
    iou: 0.191000106442112,
    type: "symbol",
    rectangles: [
      {
        left: 42.019482352941175,
        top: 693.9093349168646,
        width: 8.003710924369749,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 3,
    iou: 0.217361466114851,
    type: "symbol",
    rectangles: [
      {
        left: 92.0426756302521,
        top: 671.9122090261283,
        width: 8.003710924369749,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 4,
    iou: 0.197249224357084,
    type: "symbol",
    rectangles: [
      {
        left: 183.08488739495797,
        top: 660.9136460807601,
        width: 8.003710924369749,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 5,
    iou: 0.197249224357084,
    type: "symbol",
    rectangles: [
      {
        left: 229.10622521008403,
        top: 660.9136460807601,
        width: 8.003710924369749,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 6,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 275.12756302521007,
        top: 658.9139073634204,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 7,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 276.1280268907563,
        top: 353.9537529691211,
        width: 6.002783193277311,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 8,
    iou: 0.262632759598482,
    type: "symbol",
    rectangles: [
      {
        left: 79.03664537815126,
        top: 253.96681710213775,
        width: 8.003710924369749,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 9,
    iou: 0.0282222965381525,
    type: "symbol",
    rectangles: [
      {
        left: 75.03478991596639,
        top: 253.96681710213775,
        width: 4.001855462184874,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 10,
    iou: 0.220127068095043,
    type: "symbol",
    rectangles: [
      {
        left: 63.029223529411766,
        top: 253.96681710213775,
        width: 8.003710924369749,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 11,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 364.16884705882353,
        top: 390.94891923990497,
        width: 5.002319327731092,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 12,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 397.18415462184873,
        top: 390.94891923990497,
        width: 6.002783193277311,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 13,
    iou: 0.245373930052992,
    type: "symbol",
    rectangles: [
      {
        left: 532.2467764705882,
        top: 357.9532304038005,
        width: 8.003710924369749,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 14,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 403.18693781512604,
        top: 344.95492874109266,
        width: 3.0013915966386553,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 15,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 522.2421378151261,
        top: 308.9596318289786,
        width: 5.002319327731092,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 16,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 414.1920403361344,
        top: 264.96538004750596,
        width: 6.002783193277311,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 17,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 355.16467226890757,
        top: 253.96681710213775,
        width: 6.002783193277311,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 18,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 305.1414789915966,
        top: 231.96969121140143,
        width: 5.002319327731092,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 19,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 456.21152268907565,
        top: 231.96969121140143,
        width: 6.002783193277311,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 20,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 354.16420840336133,
        top: 198.97400237529692,
        width: 5.002319327731092,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 21,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 420.1948235294118,
        top: 187.97543942992874,
        width: 5.002319327731092,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 22,
    iou: 0.02010241128095,
    type: "symbol",
    rectangles: [
      {
        left: 394.1827630252101,
        top: 88.9883729216152,
        width: 6.002783193277311,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 23,
    iou: 0.275402573119519,
    type: "symbol",
    rectangles: [
      {
        left: 98.04545882352942,
        top: 726.9050237529691,
        width: 8.003710924369749,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 24,
    iou: 0.324931064863509,
    type: "symbol",
    rectangles: [
      {
        left: 125.05798319327731,
        top: 724.9052850356295,
        width: 3.0013915966386553,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 0,
    iou: 0.683259198966579,
    type: "citation",
    rectangles: [
      {
        left: 43.0199462184874,
        top: 672.9120783847981,
        width: 24.011132773109242,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 1,
    iou: 0.655658742419994,
    type: "citation",
    rectangles: [
      {
        left: 150.06957983193277,
        top: 727.9048931116389,
        width: 74.03432605042016,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 2,
    iou: 0.718749581130934,
    type: "citation",
    rectangles: [
      {
        left: 110.05102521008403,
        top: 705.9077672209027,
        width: 81.0375731092437,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 3,
    iou: 0.683259198966579,
    type: "citation",
    rectangles: [
      {
        left: 43.0199462184874,
        top: 672.9120783847981,
        width: 24.011132773109242,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.02038",
    page: 5,
    index: 0,
    iou: 0.334123222748817,
    type: "symbol",
    rectangles: [{ left: 163.0, top: 449.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.02038",
    page: 5,
    index: 1,
    iou: 0.290376106194688,
    type: "symbol",
    rectangles: [{ left: 181.0, top: 401.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.02038",
    page: 5,
    index: 0,
    iou: 0.628778329514514,
    type: "citation",
    rectangles: [{ left: 431.0, top: 530.0, width: 30.0, height: 9.0 }]
  },
  {
    arxivId: "1911.02038",
    page: 5,
    index: 1,
    iou: 0.914994357706665,
    type: "citation",
    rectangles: [{ left: 479.0, top: 507.0, width: 63.0, height: 9.0 }]
  },
  {
    arxivId: "1911.02038",
    page: 5,
    index: 2,
    iou: 0.852222812690464,
    type: "citation",
    rectangles: [{ left: 454.0, top: 231.0, width: 31.0, height: 9.0 }]
  },
  {
    arxivId: "1911.02316",
    page: 3,
    index: 0,
    iou: 0.882224682164296,
    type: "citation",
    rectangles: [{ left: 89.0, top: 510.0, width: 14.0, height: 11.0 }]
  },
  {
    arxivId: "1911.02316",
    page: 3,
    index: 1,
    iou: 0.60338364407616,
    type: "citation",
    rectangles: [{ left: 255.0, top: 438.0, width: 13.0, height: 11.0 }]
  },
  {
    arxivId: "1911.02316",
    page: 3,
    index: 2,
    iou: 0.91396861103259,
    type: "citation",
    rectangles: [{ left: 90.0, top: 127.0, width: 13.0, height: 11.0 }]
  },
  {
    arxivId: "1911.02316",
    page: 3,
    index: 3,
    iou: 0.502762430939225,
    type: "citation",
    rectangles: [{ left: 397.0, top: 152.0, width: 13.0, height: 11.0 }]
  },
  {
    arxivId: "1911.03521",
    page: 16,
    index: 0,
    iou: 0.515241565706351,
    type: "citation",
    rectangles: [
      {
        left: 134.0621579831933,
        top: 130.98288598574823,
        width: 24.011132773109242,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.03521",
    page: 16,
    index: 1,
    iou: 0.401537148941267,
    type: "citation",
    rectangles: [
      {
        left: 426.1976067226891,
        top: 408.946567695962,
        width: 28.012988235294117,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.03521",
    page: 16,
    index: 2,
    iou: 0.313034328390468,
    type: "citation",
    rectangles: [
      {
        left: 228.10576134453783,
        top: 178.97661520190024,
        width: 15.006957983193278,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.03521",
    page: 16,
    index: 3,
    iou: 0.482819097816378,
    type: "citation",
    rectangles: [
      {
        left: 293.135912605042,
        top: 178.97661520190024,
        width: 15.006957983193278,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.03521",
    page: 16,
    index: 4,
    iou: 0.454447368959616,
    type: "citation",
    rectangles: [
      {
        left: 422.1957512605042,
        top: 166.97818289786224,
        width: 10.004638655462184,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.03521",
    page: 16,
    index: 5,
    iou: 0.515241565706351,
    type: "citation",
    rectangles: [
      {
        left: 134.0621579831933,
        top: 130.98288598574823,
        width: 24.011132773109242,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.03768",
    page: 1,
    index: 0,
    iou: 0.465465825866949,
    type: "citation",
    rectangles: [
      {
        left: 307.1424067226891,
        top: 524.9314133016627,
        width: 139.06447731092436,
        height: 10.998562945368171
      }
    ]
  },
  {
    arxivId: "1911.03768",
    page: 1,
    index: 1,
    iou: 0.442584246846057,
    type: "citation",
    rectangles: [
      {
        left: 378.17534117647057,
        top: 302.9604156769596,
        width: 86.0398924369748,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.04459",
    page: 2,
    index: 0,
    iou: 0.632287109429803,
    type: "citation",
    rectangles: [
      {
        left: 405.18786554621846,
        top: 740.9031947743468,
        width: 31.01437983193277,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04459",
    page: 2,
    index: 1,
    iou: 0.270024648969925,
    type: "citation",
    rectangles: [
      {
        left: 346.1604974789916,
        top: 659.9137767220902,
        width: 15.006957983193278,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04504",
    page: 16,
    index: 0,
    iou: 0.516340489334126,
    type: "citation",
    rectangles: [
      {
        left: 420.1948235294118,
        top: 736.9037173396674,
        width: 14.006494117647058,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04504",
    page: 16,
    index: 1,
    iou: 0.610523977635499,
    type: "citation",
    rectangles: [
      {
        left: 261.12106890756303,
        top: 722.9055463182898,
        width: 15.006957983193278,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04504",
    page: 16,
    index: 2,
    iou: 0.505471502824154,
    type: "citation",
    rectangles: [
      {
        left: 385.1785882352941,
        top: 668.9126009501188,
        width: 15.006957983193278,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04504",
    page: 16,
    index: 3,
    iou: 0.365131586380698,
    type: "citation",
    rectangles: [
      {
        left: 117.05427226890757,
        top: 575.9247505938242,
        width: 50.023193277310924,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04504",
    page: 16,
    index: 4,
    iou: 0.407722450402625,
    type: "citation",
    rectangles: [
      {
        left: 462.21430588235296,
        top: 138.9818408551069,
        width: 12.005566386554621,
        height: 9.998693586698337
      }
    ]
  },
  {
    arxivId: "1911.04504",
    page: 16,
    index: 5,
    iou: 0.506440494088205,
    type: "citation",
    rectangles: [
      {
        left: 504.2337882352941,
        top: 200.97374109263657,
        width: 15.006957983193278,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04814",
    page: 2,
    index: 0,
    iou: 0,
    type: "citation",
    rectangles: [
      {
        left: 155.07189915966387,
        top: 67.9911163895487,
        width: 92.0426756302521,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.04814",
    page: 2,
    index: 0,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 287.1331294117647,
        top: 497.9349406175772,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.04814",
    page: 2,
    index: 1,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 258.1196773109244,
        top: 428.94395486935866,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.04814",
    page: 2,
    index: 2,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 74.03432605042016,
        top: 362.95257719714965,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.04814",
    page: 2,
    index: 3,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 204.09462857142856,
        top: 296.96119952494064,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.04814",
    page: 2,
    index: 4,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 94.04360336134454,
        top: 197.97413301662706,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.04814",
    page: 2,
    index: 5,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 110.05102521008403,
        top: 186.97557007125891,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.04814",
    page: 2,
    index: 6,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 55.02551260504202,
        top: 175.97700712589074,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.04814",
    page: 2,
    index: 7,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 311.1442621848739,
        top: 231.96969121140143,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.04814",
    page: 2,
    index: 8,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 499.231468907563,
        top: 221.97099762470307,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.04814",
    page: 2,
    index: 9,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 362.1679193277311,
        top: 211.97230403800475,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 0,
    iou: 0.0798840730410247,
    type: "symbol",
    rectangles: [
      { left: 219.0, top: 349.0, width: 2.0, height: 1.0 },
      { left: 218.0, top: 347.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 1,
    iou: 0.389496068805245,
    type: "symbol",
    rectangles: [{ left: 211.0, top: 352.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 2,
    iou: 0.14997983976755,
    type: "symbol",
    rectangles: [
      { left: 195.0, top: 349.0, width: 2.0, height: 1.0 },
      { left: 194.0, top: 347.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 3,
    iou: 0.34972433573479,
    type: "symbol",
    rectangles: [{ left: 188.0, top: 352.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 4,
    iou: 0.601564705808028,
    type: "symbol",
    rectangles: [{ left: 173.0, top: 361.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 5,
    iou: 0.191196481054753,
    type: "symbol",
    rectangles: [
      { left: 170.0, top: 339.0, width: 2.0, height: 1.0 },
      { left: 169.0, top: 337.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 6,
    iou: 0.318020919548566,
    type: "symbol",
    rectangles: [{ left: 159.0, top: 343.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 7,
    iou: 0.438577654028668,
    type: "symbol",
    rectangles: [{ left: 138.0, top: 352.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 8,
    iou: 0.6848625,
    type: "symbol",
    rectangles: [{ left: 130.0, top: 352.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 9,
    iou: 0.317073170731705,
    type: "symbol",
    rectangles: [{ left: 121.0, top: 352.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 10,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 79.0, top: 321.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 11,
    iou: 0.00526514599630894,
    type: "symbol",
    rectangles: [
      { left: 242.0, top: 317.0, width: 3.0, height: 3.0 },
      { left: 243.0, top: 319.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 12,
    iou: 0.569971974969787,
    type: "symbol",
    rectangles: [{ left: 236.0, top: 323.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 0,
    iou: 0.286925710763077,
    type: "citation",
    rectangles: [{ left: 387.0, top: 458.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 1,
    iou: 0.577482511937047,
    type: "citation",
    rectangles: [{ left: 511.0, top: 395.0, width: 40.0, height: 9.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 2,
    iou: 0.59827376133027,
    type: "citation",
    rectangles: [{ left: 432.0, top: 287.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 3,
    iou: 0.669065385927178,
    type: "citation",
    rectangles: [{ left: 544.0, top: 263.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.04912",
    page: 2,
    index: 0,
    iou: 0.533473811878513,
    type: "citation",
    rectangles: [
      {
        left: 466.2161613445378,
        top: 712.9068527315915,
        width: 37.01716302521008,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04912",
    page: 2,
    index: 1,
    iou: 0.784834045086477,
    type: "citation",
    rectangles: [
      {
        left: 466.2161613445378,
        top: 695.9090736342042,
        width: 37.01716302521008,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04912",
    page: 2,
    index: 2,
    iou: 0.775161239679777,
    type: "citation",
    rectangles: [
      {
        left: 466.2161613445378,
        top: 678.9112945368171,
        width: 37.01716302521008,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04912",
    page: 2,
    index: 3,
    iou: 0.78340914971343,
    type: "citation",
    rectangles: [
      {
        left: 466.2161613445378,
        top: 643.9158669833729,
        width: 37.01716302521008,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04912",
    page: 2,
    index: 4,
    iou: 0.711512938463569,
    type: "citation",
    rectangles: [
      {
        left: 467.21662521008403,
        top: 575.9247505938242,
        width: 31.01437983193277,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04912",
    page: 2,
    index: 5,
    iou: 0.861939166646629,
    type: "citation",
    rectangles: [
      {
        left: 469.21755294117645,
        top: 540.92932304038,
        width: 31.01437983193277,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04912",
    page: 2,
    index: 6,
    iou: 0.738365862753392,
    type: "citation",
    rectangles: [
      {
        left: 469.21755294117645,
        top: 523.9315439429929,
        width: 31.01437983193277,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04912",
    page: 2,
    index: 7,
    iou: 0.790368111125018,
    type: "citation",
    rectangles: [
      {
        left: 469.21755294117645,
        top: 506.9337648456057,
        width: 31.01437983193277,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04912",
    page: 2,
    index: 8,
    iou: 0.744599756130971,
    type: "citation",
    rectangles: [
      {
        left: 469.21755294117645,
        top: 488.9361163895487,
        width: 31.01437983193277,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04912",
    page: 2,
    index: 9,
    iou: 0.917436995027861,
    type: "citation",
    rectangles: [
      {
        left: 465.2156974789916,
        top: 471.9383372921615,
        width: 39.01809075630252,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04912",
    page: 2,
    index: 10,
    iou: 0.804407492802643,
    type: "citation",
    rectangles: [
      {
        left: 466.2161613445378,
        top: 454.9405581947743,
        width: 37.01716302521008,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.04912",
    page: 2,
    index: 11,
    iou: 0.938968914002155,
    type: "citation",
    rectangles: [
      {
        left: 148.06865210084032,
        top: 123.98380047505938,
        width: 26.01206050420168,
        height: 9.998693586698337
      }
    ]
  },
  {
    arxivId: "1911.04912",
    page: 2,
    index: 12,
    iou: 0.761520700365792,
    type: "citation",
    rectangles: [
      {
        left: 403.18693781512604,
        top: 188.97530878859857,
        width: 35.01623529411765,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 0,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 101.0, top: 461.0, width: 3.0, height: 5.0 },
      { left: 428.0, top: 475.0, width: 5.0, height: 6.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 1,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 94.0, top: 460.0, width: 5.0, height: 5.0 },
      { left: 481.0, top: 445.0, width: 5.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 2,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 472.0, top: 445.0, width: 5.0, height: 3.0 },
      { left: 87.0, top: 461.0, width: 5.0, height: 5.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 3,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 54.0, top: 461.0, width: 6.0, height: 7.0 },
      { left: 446.0, top: 445.0, width: 5.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 4,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 257.0, top: 598.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 5,
    iou: 0.271488442486593,
    type: "symbol",
    rectangles: [{ left: 244.0, top: 602.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 6,
    iou: 0.396425206844151,
    type: "symbol",
    rectangles: [{ left: 226.0, top: 602.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 7,
    iou: 0.455765764822002,
    type: "symbol",
    rectangles: [{ left: 217.0, top: 604.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 8,
    iou: 0.174712901702513,
    type: "symbol",
    rectangles: [{ left: 212.0, top: 598.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 9,
    iou: 0.678284727037547,
    type: "symbol",
    rectangles: [{ left: 206.0, top: 602.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 10,
    iou: 0.422780031101664,
    type: "symbol",
    rectangles: [{ left: 175.0, top: 602.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 11,
    iou: 0.361146977493011,
    type: "symbol",
    rectangles: [{ left: 158.0, top: 602.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 12,
    iou: 0.587145468117206,
    type: "symbol",
    rectangles: [{ left: 147.0, top: 602.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 13,
    iou: 0.476416049457383,
    type: "symbol",
    rectangles: [{ left: 136.0, top: 604.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 14,
    iou: 0.428334806170404,
    type: "symbol",
    rectangles: [{ left: 122.0, top: 597.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 15,
    iou: 0.689418268716413,
    type: "symbol",
    rectangles: [{ left: 115.0, top: 602.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 16,
    iou: 0.56671073199668,
    type: "symbol",
    rectangles: [{ left: 92.0, top: 595.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 17,
    iou: 0.545855883090273,
    type: "symbol",
    rectangles: [{ left: 86.0, top: 597.0, width: 6.0, height: 8.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 18,
    iou: 0.349946368164614,
    type: "symbol",
    rectangles: [{ left: 89.0, top: 610.0, width: 6.0, height: 8.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 19,
    iou: 0.104051047194977,
    type: "symbol",
    rectangles: [
      { left: 216.0, top: 516.0, width: 5.0, height: 5.0 },
      { left: 167.0, top: 550.0, width: 5.0, height: 6.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 20,
    iou: 0.227122870652267,
    type: "symbol",
    rectangles: [{ left: 212.0, top: 519.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 21,
    iou: 0.247377933870167,
    type: "symbol",
    rectangles: [{ left: 203.0, top: 519.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 22,
    iou: 0.404553049283083,
    type: "symbol",
    rectangles: [{ left: 187.0, top: 517.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 23,
    iou: 0.368310245484346,
    type: "symbol",
    rectangles: [{ left: 182.0, top: 519.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 24,
    iou: 0.286880132821363,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 519.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 25,
    iou: 0.204914779630558,
    type: "symbol",
    rectangles: [{ left: 161.0, top: 516.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 26,
    iou: 0.230043999645232,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 518.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 27,
    iou: 0.28752406287217,
    type: "symbol",
    rectangles: [{ left: 143.0, top: 518.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 28,
    iou: 0.210770879819233,
    type: "symbol",
    rectangles: [{ left: 127.0, top: 518.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 29,
    iou: 0.203695649356005,
    type: "symbol",
    rectangles: [{ left: 123.0, top: 519.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 30,
    iou: 0.404208003699869,
    type: "symbol",
    rectangles: [{ left: 110.0, top: 519.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 31,
    iou: 0.241592105406745,
    type: "symbol",
    rectangles: [{ left: 101.0, top: 514.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 32,
    iou: 0.289411441710232,
    type: "symbol",
    rectangles: [{ left: 92.0, top: 516.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 33,
    iou: 0.188570433518809,
    type: "symbol",
    rectangles: [{ left: 87.0, top: 519.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 34,
    iou: 0.109421636845597,
    type: "symbol",
    rectangles: [{ left: 82.0, top: 516.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 35,
    iou: 0.666389489229209,
    type: "symbol",
    rectangles: [{ left: 75.0, top: 521.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 36,
    iou: 0.284182109606627,
    type: "symbol",
    rectangles: [{ left: 299.0, top: 546.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 37,
    iou: 0.584436768016824,
    type: "symbol",
    rectangles: [{ left: 281.0, top: 546.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 38,
    iou: 0.43123004435729,
    type: "symbol",
    rectangles: [{ left: 268.0, top: 548.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 39,
    iou: 0.599104284750357,
    type: "symbol",
    rectangles: [{ left: 250.0, top: 548.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 40,
    iou: 0.48784709569273,
    type: "symbol",
    rectangles: [{ left: 239.0, top: 548.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 41,
    iou: 0.415737768884133,
    type: "symbol",
    rectangles: [{ left: 230.0, top: 544.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 42,
    iou: 0.414867766510634,
    type: "symbol",
    rectangles: [{ left: 219.0, top: 544.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 43,
    iou: 0.326239864431587,
    type: "symbol",
    rectangles: [{ left: 203.0, top: 544.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 44,
    iou: 0.392027652961285,
    type: "symbol",
    rectangles: [{ left: 191.0, top: 544.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 45,
    iou: 0.273421755878933,
    type: "symbol",
    rectangles: [{ left: 186.0, top: 546.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 46,
    iou: 0.166063939138044,
    type: "symbol",
    rectangles: [{ left: 177.0, top: 546.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 47,
    iou: 0.566082379258431,
    type: "symbol",
    rectangles: [{ left: 172.0, top: 548.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 48,
    iou: 0.104051047194977,
    type: "symbol",
    rectangles: [
      { left: 216.0, top: 516.0, width: 5.0, height: 5.0 },
      { left: 167.0, top: 550.0, width: 5.0, height: 6.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 49,
    iou: 0.072074743568659,
    type: "symbol",
    rectangles: [{ left: 108.0, top: 497.0, width: 2.0, height: 2.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 50,
    iou: 0.0896147280765807,
    type: "symbol",
    rectangles: [{ left: 228.0, top: 497.0, width: 2.0, height: 2.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 51,
    iou: 0.353465036445269,
    type: "symbol",
    rectangles: [{ left: 218.0, top: 351.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 52,
    iou: 0.51099601820773,
    type: "symbol",
    rectangles: [{ left: 207.0, top: 352.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 53,
    iou: 0.371520090523176,
    type: "symbol",
    rectangles: [{ left: 198.0, top: 352.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 54,
    iou: 0.255059477159901,
    type: "symbol",
    rectangles: [{ left: 185.0, top: 351.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 55,
    iou: 0.207311670549074,
    type: "symbol",
    rectangles: [{ left: 181.0, top: 352.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 56,
    iou: 0.20569851555342,
    type: "symbol",
    rectangles: [{ left: 176.0, top: 349.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 57,
    iou: 0.161342361399401,
    type: "symbol",
    rectangles: [{ left: 169.0, top: 352.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 58,
    iou: 0.660611388071144,
    type: "symbol",
    rectangles: [{ left: 125.0, top: 352.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 59,
    iou: 0.493351378206731,
    type: "symbol",
    rectangles: [{ left: 114.0, top: 352.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 60,
    iou: 0.267786979770453,
    type: "symbol",
    rectangles: [{ left: 104.0, top: 352.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 61,
    iou: 0.357630489605001,
    type: "symbol",
    rectangles: [{ left: 215.0, top: 306.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 62,
    iou: 0.227730385946619,
    type: "symbol",
    rectangles: [{ left: 211.0, top: 309.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 63,
    iou: 0.339219962417003,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 309.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 64,
    iou: 0.433287000427966,
    type: "symbol",
    rectangles: [{ left: 188.0, top: 306.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 65,
    iou: 0.309036407253665,
    type: "symbol",
    rectangles: [{ left: 178.0, top: 309.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 66,
    iou: 0.190648986336094,
    type: "symbol",
    rectangles: [{ left: 173.0, top: 306.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 67,
    iou: 0.727359986054029,
    type: "symbol",
    rectangles: [{ left: 166.0, top: 311.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 68,
    iou: 0.598996343723476,
    type: "symbol",
    rectangles: [{ left: 122.0, top: 309.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 69,
    iou: 0.553762545456094,
    type: "symbol",
    rectangles: [{ left: 111.0, top: 311.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 70,
    iou: 0.712196992361036,
    type: "symbol",
    rectangles: [{ left: 101.0, top: 311.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 71,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 292.0, top: 288.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 72,
    iou: 0.368092184180383,
    type: "symbol",
    rectangles: [
      { left: 74.0, top: 276.0, width: 5.0, height: 5.0 },
      { left: 76.0, top: 278.0, width: 3.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 73,
    iou: 0.237225277114031,
    type: "symbol",
    rectangles: [{ left: 146.0, top: 276.0, width: 7.0, height: 6.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 74,
    iou: 0.525317771496409,
    type: "symbol",
    rectangles: [
      { left: 514.0, top: 637.0, width: 5.0, height: 5.0 },
      { left: 419.0, top: 672.0, width: 7.0, height: 7.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 75,
    iou: 0.29866621795294,
    type: "symbol",
    rectangles: [{ left: 510.0, top: 640.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 76,
    iou: 0.522938990675193,
    type: "symbol",
    rectangles: [{ left: 500.0, top: 640.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 77,
    iou: 0.298473525470868,
    type: "symbol",
    rectangles: [{ left: 487.0, top: 636.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 78,
    iou: 0.629150733063558,
    type: "symbol",
    rectangles: [{ left: 476.0, top: 638.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 79,
    iou: 0.30471001881522,
    type: "symbol",
    rectangles: [{ left: 472.0, top: 640.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 80,
    iou: 0.418668574532837,
    type: "symbol",
    rectangles: [{ left: 463.0, top: 640.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 81,
    iou: 0.443674632479806,
    type: "symbol",
    rectangles: [{ left: 449.0, top: 635.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 82,
    iou: 0.332025850047247,
    type: "symbol",
    rectangles: [{ left: 434.0, top: 637.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 83,
    iou: 0.452285686857839,
    type: "symbol",
    rectangles: [{ left: 423.0, top: 640.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 84,
    iou: 0.367382211013442,
    type: "symbol",
    rectangles: [{ left: 414.0, top: 640.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 85,
    iou: 0.356455649856161,
    type: "symbol",
    rectangles: [{ left: 396.0, top: 637.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 86,
    iou: 0.226290211943956,
    type: "symbol",
    rectangles: [{ left: 391.0, top: 640.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 87,
    iou: 0.352557779949519,
    type: "symbol",
    rectangles: [{ left: 386.0, top: 636.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 88,
    iou: 0.766492677781247,
    type: "symbol",
    rectangles: [{ left: 379.0, top: 642.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 89,
    iou: 0.758276233219156,
    type: "symbol",
    rectangles: [{ left: 361.0, top: 626.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 90,
    iou: 0.660044224609803,
    type: "symbol",
    rectangles: [{ left: 349.0, top: 628.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 91,
    iou: 0.659799426272954,
    type: "symbol",
    rectangles: [{ left: 338.0, top: 635.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 92,
    iou: 0.600220584796374,
    type: "symbol",
    rectangles: [{ left: 338.0, top: 647.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 93,
    iou: 0.399618800084661,
    type: "symbol",
    rectangles: [{ left: 511.0, top: 667.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 94,
    iou: 0.282680279616342,
    type: "symbol",
    rectangles: [{ left: 507.0, top: 670.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 95,
    iou: 0.515372623667357,
    type: "symbol",
    rectangles: [{ left: 497.0, top: 670.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 96,
    iou: 0.513264081004826,
    type: "symbol",
    rectangles: [{ left: 481.0, top: 667.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 97,
    iou: 0.297642427092617,
    type: "symbol",
    rectangles: [{ left: 471.0, top: 670.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 98,
    iou: 0.537027279847791,
    type: "symbol",
    rectangles: [{ left: 461.0, top: 670.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 99,
    iou: 0.542783363335599,
    type: "symbol",
    rectangles: [{ left: 450.0, top: 668.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 100,
    iou: 0.357807446023006,
    type: "symbol",
    rectangles: [{ left: 439.0, top: 668.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 101,
    iou: 0.328260408347562,
    type: "symbol",
    rectangles: [{ left: 431.0, top: 672.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 102,
    iou: 0.465204570416686,
    type: "symbol",
    rectangles: [{ left: 426.0, top: 667.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 103,
    iou: 0.525317771496409,
    type: "symbol",
    rectangles: [
      { left: 514.0, top: 637.0, width: 5.0, height: 5.0 },
      { left: 419.0, top: 672.0, width: 7.0, height: 7.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 104,
    iou: 0.305923870203337,
    type: "symbol",
    rectangles: [{ left: 450.0, top: 588.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 105,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 512.0, top: 535.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 106,
    iou: 0.0479896917323797,
    type: "symbol",
    rectangles: [{ left: 507.0, top: 538.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 107,
    iou: 0.38492055194175,
    type: "symbol",
    rectangles: [{ left: 493.0, top: 538.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 108,
    iou: 0.0966317843143228,
    type: "symbol",
    rectangles: [{ left: 478.0, top: 535.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 109,
    iou: 0.144003193907528,
    type: "symbol",
    rectangles: [{ left: 467.0, top: 538.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 110,
    iou: 0.238869558733779,
    type: "symbol",
    rectangles: [{ left: 458.0, top: 538.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 111,
    iou: 0.709556977192775,
    type: "symbol",
    rectangles: [{ left: 446.0, top: 536.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 112,
    iou: 0.425808356659351,
    type: "symbol",
    rectangles: [{ left: 435.0, top: 536.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 113,
    iou: 0.0237340435920861,
    type: "symbol",
    rectangles: [{ left: 427.0, top: 540.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 114,
    iou: 0.187531931921351,
    type: "symbol",
    rectangles: [{ left: 422.0, top: 535.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 115,
    iou: 0.486033918720261,
    type: "symbol",
    rectangles: [{ left: 415.0, top: 540.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 116,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 380.0, top: 538.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 117,
    iou: 0.108765234322034,
    type: "symbol",
    rectangles: [{ left: 370.0, top: 538.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 118,
    iou: 0.0629215623897765,
    type: "symbol",
    rectangles: [{ left: 357.0, top: 540.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 119,
    iou: 0.352713834726995,
    type: "symbol",
    rectangles: [{ left: 347.0, top: 540.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 120,
    iou: 0.0360964431575663,
    type: "symbol",
    rectangles: [{ left: 332.0, top: 540.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 121,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 101.0, top: 461.0, width: 3.0, height: 5.0 },
      { left: 428.0, top: 475.0, width: 5.0, height: 6.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 122,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 94.0, top: 460.0, width: 5.0, height: 5.0 },
      { left: 481.0, top: 445.0, width: 5.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 123,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 472.0, top: 445.0, width: 5.0, height: 3.0 },
      { left: 87.0, top: 461.0, width: 5.0, height: 5.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 124,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 54.0, top: 461.0, width: 6.0, height: 7.0 },
      { left: 446.0, top: 445.0, width: 5.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 125,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 433.0, top: 445.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 126,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 417.0, top: 443.0, width: 2.0, height: 1.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 127,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 406.0, top: 443.0, width: 2.0, height: 1.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 128,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 390.0, top: 443.0, width: 2.0, height: 1.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 129,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 386.0, top: 445.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 130,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 373.0, top: 445.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 131,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 350.0, top: 445.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 132,
    iou: 0.121257454297025,
    type: "symbol",
    rectangles: [{ left: 338.0, top: 447.0, width: 7.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 133,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 561.0, top: 471.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 134,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 543.0, top: 471.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 135,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 530.0, top: 473.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 136,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 512.0, top: 473.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 137,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 500.0, top: 473.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 138,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 491.0, top: 470.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 139,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 480.0, top: 470.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 140,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 464.0, top: 470.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 141,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 452.0, top: 470.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 142,
    iou: 0.00118278702306742,
    type: "symbol",
    rectangles: [{ left: 447.0, top: 471.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 143,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 439.0, top: 471.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 144,
    iou: 0.00669428780019551,
    type: "symbol",
    rectangles: [{ left: 434.0, top: 473.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 145,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 101.0, top: 461.0, width: 3.0, height: 5.0 },
      { left: 428.0, top: 475.0, width: 5.0, height: 6.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 146,
    iou: 0.128746952791852,
    type: "symbol",
    rectangles: [
      { left: 515.0, top: 321.0, width: 1.0, height: 1.0 },
      { left: 402.0, top: 345.0, width: 6.0, height: 9.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 147,
    iou: 0.0631973906254908,
    type: "symbol",
    rectangles: [{ left: 508.0, top: 319.0, width: 6.0, height: 2.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 148,
    iou: 0.225700465889822,
    type: "symbol",
    rectangles: [{ left: 503.0, top: 321.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 149,
    iou: 0.330605018730433,
    type: "symbol",
    rectangles: [
      { left: 501.0, top: 323.0, width: 2.0, height: 1.0 },
      { left: 500.0, top: 321.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 150,
    iou: 0.0530902331282299,
    type: "symbol",
    rectangles: [{ left: 496.0, top: 319.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 151,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 486.0, top: 319.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 152,
    iou: 0.0854046749833482,
    type: "symbol",
    rectangles: [{ left: 476.0, top: 321.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 153,
    iou: 0.128424176858609,
    type: "symbol",
    rectangles: [{ left: 465.0, top: 321.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 154,
    iou: 0.164620605348912,
    type: "symbol",
    rectangles: [{ left: 459.0, top: 319.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 155,
    iou: 0.230893265755406,
    type: "symbol",
    rectangles: [{ left: 454.0, top: 321.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 156,
    iou: 0.428171502883336,
    type: "symbol",
    rectangles: [{ left: 448.0, top: 323.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 157,
    iou: 0.10830326051284,
    type: "symbol",
    rectangles: [{ left: 412.0, top: 316.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 158,
    iou: 0.175491136361918,
    type: "symbol",
    rectangles: [{ left: 405.0, top: 319.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 159,
    iou: 0.341802966487631,
    type: "symbol",
    rectangles: [{ left: 402.0, top: 321.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 160,
    iou: 0.0954409163668304,
    type: "symbol",
    rectangles: [{ left: 391.0, top: 321.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 161,
    iou: 0.149533324297964,
    type: "symbol",
    rectangles: [{ left: 381.0, top: 321.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 162,
    iou: 0.0448109266862805,
    type: "symbol",
    rectangles: [{ left: 511.0, top: 347.0, width: 6.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 163,
    iou: 0.195191474437502,
    type: "symbol",
    rectangles: [{ left: 505.0, top: 350.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 164,
    iou: 0.337561573554697,
    type: "symbol",
    rectangles: [{ left: 501.0, top: 352.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 165,
    iou: 0.0901926185168832,
    type: "symbol",
    rectangles: [{ left: 491.0, top: 352.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 166,
    iou: 0.139912025949545,
    type: "symbol",
    rectangles: [{ left: 480.0, top: 352.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 167,
    iou: 0.0476364156071941,
    type: "symbol",
    rectangles: [{ left: 474.0, top: 352.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 168,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 468.0, top: 350.0, width: 6.0, height: 2.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 169,
    iou: 0.228492153447447,
    type: "symbol",
    rectangles: [{ left: 462.0, top: 352.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 170,
    iou: 0.0747893488244598,
    type: "symbol",
    rectangles: [
      { left: 461.0, top: 354.0, width: 2.0, height: 1.0 },
      { left: 460.0, top: 352.0, width: 2.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 171,
    iou: 0.0352594103777614,
    type: "symbol",
    rectangles: [{ left: 449.0, top: 350.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 172,
    iou: 0.243488469973509,
    type: "symbol",
    rectangles: [{ left: 440.0, top: 352.0, width: 8.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 173,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 431.0, top: 337.0, width: 8.0, height: 2.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 174,
    iou: 0.046603185252635,
    type: "symbol",
    rectangles: [{ left: 411.0, top: 337.0, width: 6.0, height: 2.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 175,
    iou: 0.128746952791852,
    type: "symbol",
    rectangles: [
      { left: 515.0, top: 321.0, width: 1.0, height: 1.0 },
      { left: 402.0, top: 345.0, width: 6.0, height: 9.0 }
    ]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 176,
    iou: 0.268648493530358,
    type: "symbol",
    rectangles: [{ left: 396.0, top: 288.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 177,
    iou: 0.528427551721701,
    type: "symbol",
    rectangles: [{ left: 435.0, top: 230.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 178,
    iou: 0.50996912292432,
    type: "symbol",
    rectangles: [{ left: 429.0, top: 234.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 179,
    iou: 0.201510822825542,
    type: "symbol",
    rectangles: [{ left: 425.0, top: 236.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 180,
    iou: 0.594353869266582,
    type: "symbol",
    rectangles: [{ left: 412.0, top: 236.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 181,
    iou: 0.580047850731932,
    type: "symbol",
    rectangles: [{ left: 400.0, top: 236.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 182,
    iou: 0.475200830940743,
    type: "symbol",
    rectangles: [{ left: 386.0, top: 230.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 183,
    iou: 0.273629761627859,
    type: "symbol",
    rectangles: [{ left: 380.0, top: 234.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 184,
    iou: 0.528469851870837,
    type: "symbol",
    rectangles: [{ left: 376.0, top: 236.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 185,
    iou: 0.747070713538877,
    type: "symbol",
    rectangles: [{ left: 356.0, top: 230.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 186,
    iou: 0.721115340138328,
    type: "symbol",
    rectangles: [{ left: 350.0, top: 234.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 187,
    iou: 0.503897099916683,
    type: "symbol",
    rectangles: [{ left: 346.0, top: 236.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 188,
    iou: 0.749584467867206,
    type: "symbol",
    rectangles: [{ left: 333.0, top: 236.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 189,
    iou: 0.702057848710864,
    type: "symbol",
    rectangles: [{ left: 315.0, top: 236.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 190,
    iou: 0.593322837340501,
    type: "symbol",
    rectangles: [{ left: 304.0, top: 236.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 191,
    iou: 0.739411487360901,
    type: "symbol",
    rectangles: [{ left: 297.0, top: 232.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 192,
    iou: 0.653813296919194,
    type: "symbol",
    rectangles: [{ left: 290.0, top: 232.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 193,
    iou: 0.365626254348618,
    type: "symbol",
    rectangles: [{ left: 285.0, top: 234.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 194,
    iou: 0.524196362571106,
    type: "symbol",
    rectangles: [{ left: 277.0, top: 232.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 195,
    iou: 0.576946798495979,
    type: "symbol",
    rectangles: [{ left: 272.0, top: 232.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 196,
    iou: 0.752385970880699,
    type: "symbol",
    rectangles: [{ left: 267.0, top: 234.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 197,
    iou: 0.60340364879403,
    type: "symbol",
    rectangles: [{ left: 255.0, top: 220.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 198,
    iou: 0.646671696652282,
    type: "symbol",
    rectangles: [{ left: 246.0, top: 222.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 199,
    iou: 0.811729576755802,
    type: "symbol",
    rectangles: [{ left: 237.0, top: 229.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 200,
    iou: 0.558591862397852,
    type: "symbol",
    rectangles: [{ left: 229.0, top: 229.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 201,
    iou: 0.255991286522061,
    type: "symbol",
    rectangles: [{ left: 194.0, top: 230.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 202,
    iou: 0.344310740433274,
    type: "symbol",
    rectangles: [{ left: 187.0, top: 234.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 203,
    iou: 0.461952733354607,
    type: "symbol",
    rectangles: [{ left: 184.0, top: 236.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 204,
    iou: 0.582332304335672,
    type: "symbol",
    rectangles: [{ left: 173.0, top: 236.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 205,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 163.0, top: 236.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 206,
    iou: 0.782690710716618,
    type: "symbol",
    rectangles: [{ left: 159.0, top: 194.0, width: 5.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 207,
    iou: 0.139353330735225,
    type: "symbol",
    rectangles: [{ left: 442.0, top: 189.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 208,
    iou: 0.284572019608789,
    type: "symbol",
    rectangles: [{ left: 435.0, top: 192.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 209,
    iou: 0.241839282632488,
    type: "symbol",
    rectangles: [{ left: 432.0, top: 194.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 210,
    iou: 0.411253131525435,
    type: "symbol",
    rectangles: [{ left: 418.0, top: 194.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 211,
    iou: 0.42292883621955,
    type: "symbol",
    rectangles: [{ left: 408.0, top: 194.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 212,
    iou: 0.230131946218395,
    type: "symbol",
    rectangles: [{ left: 393.0, top: 189.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 213,
    iou: 0.348646011558823,
    type: "symbol",
    rectangles: [{ left: 386.0, top: 192.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 214,
    iou: 0.229823460390531,
    type: "symbol",
    rectangles: [{ left: 383.0, top: 194.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 215,
    iou: 0.301231467117577,
    type: "symbol",
    rectangles: [{ left: 363.0, top: 189.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 216,
    iou: 0.342199048266876,
    type: "symbol",
    rectangles: [{ left: 356.0, top: 192.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 217,
    iou: 0.181332718896205,
    type: "symbol",
    rectangles: [{ left: 353.0, top: 194.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 218,
    iou: 0.539884955028401,
    type: "symbol",
    rectangles: [{ left: 340.0, top: 194.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 219,
    iou: 0.610696272223305,
    type: "symbol",
    rectangles: [{ left: 321.0, top: 194.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 220,
    iou: 0.449324847886521,
    type: "symbol",
    rectangles: [{ left: 310.0, top: 194.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 221,
    iou: 0.178325084253707,
    type: "symbol",
    rectangles: [{ left: 304.0, top: 191.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 222,
    iou: 0.565016181795472,
    type: "symbol",
    rectangles: [{ left: 290.0, top: 191.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 223,
    iou: 0.626910586705393,
    type: "symbol",
    rectangles: [{ left: 279.0, top: 192.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 224,
    iou: 0.578132158435178,
    type: "symbol",
    rectangles: [{ left: 273.0, top: 191.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 225,
    iou: 0.330454956685747,
    type: "symbol",
    rectangles: [{ left: 266.0, top: 191.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 226,
    iou: 0.514651850243031,
    type: "symbol",
    rectangles: [{ left: 261.0, top: 192.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 227,
    iou: 0.320882575963188,
    type: "symbol",
    rectangles: [{ left: 249.0, top: 178.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 228,
    iou: 0.761757056603461,
    type: "symbol",
    rectangles: [{ left: 240.0, top: 180.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 229,
    iou: 0.84485685244047,
    type: "symbol",
    rectangles: [{ left: 231.0, top: 188.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 230,
    iou: 0.400015853639436,
    type: "symbol",
    rectangles: [{ left: 223.0, top: 188.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 231,
    iou: 0.598845994557218,
    type: "symbol",
    rectangles: [{ left: 188.0, top: 189.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 232,
    iou: 0.359908861548643,
    type: "symbol",
    rectangles: [{ left: 181.0, top: 192.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 233,
    iou: 0.554339061938804,
    type: "symbol",
    rectangles: [{ left: 178.0, top: 194.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 234,
    iou: 0.539649532317011,
    type: "symbol",
    rectangles: [{ left: 167.0, top: 194.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 235,
    iou: 0.782690710716618,
    type: "symbol",
    rectangles: [{ left: 159.0, top: 194.0, width: 5.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 236,
    iou: 0.640204736556814,
    type: "symbol",
    rectangles: [{ left: 180.0, top: 161.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 237,
    iou: 0.34148973041991,
    type: "symbol",
    rectangles: [{ left: 175.0, top: 161.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 238,
    iou: 0.384578821045536,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 164.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 239,
    iou: 0.507609536132547,
    type: "symbol",
    rectangles: [{ left: 151.0, top: 162.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 240,
    iou: 0.524874772945974,
    type: "symbol",
    rectangles: [{ left: 144.0, top: 162.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 241,
    iou: 0.434595161174743,
    type: "symbol",
    rectangles: [{ left: 139.0, top: 164.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 242,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 78.0, top: 64.0, width: 5.0, height: 4.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 243,
    iou: 0.212839738033484,
    type: "symbol",
    rectangles: [{ left: 149.0, top: 529.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 244,
    iou: 0.232300336726768,
    type: "symbol",
    rectangles: [{ left: 140.0, top: 531.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 245,
    iou: 0.348995042106775,
    type: "symbol",
    rectangles: [{ left: 129.0, top: 538.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 246,
    iou: 0.49098508175945,
    type: "symbol",
    rectangles: [{ left: 104.0, top: 543.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 247,
    iou: 0.279546874711092,
    type: "symbol",
    rectangles: [{ left: 94.0, top: 543.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 248,
    iou: 0.38607204120188,
    type: "symbol",
    rectangles: [{ left: 81.0, top: 545.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 249,
    iou: 0.556907886693394,
    type: "symbol",
    rectangles: [{ left: 70.0, top: 545.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 250,
    iou: 0.361340544185806,
    type: "symbol",
    rectangles: [{ left: 54.0, top: 545.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 251,
    iou: 0.722375298075612,
    type: "symbol",
    rectangles: [{ left: 401.0, top: 668.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 252,
    iou: 0.349750814193096,
    type: "symbol",
    rectangles: [{ left: 385.0, top: 668.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 253,
    iou: 0.51705520486491,
    type: "symbol",
    rectangles: [{ left: 374.0, top: 669.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 254,
    iou: 0.278468437749082,
    type: "symbol",
    rectangles: [{ left: 361.0, top: 657.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 255,
    iou: 0.62765205912576,
    type: "symbol",
    rectangles: [{ left: 347.0, top: 663.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 256,
    iou: 0.406993576686463,
    type: "symbol",
    rectangles: [{ left: 402.0, top: 699.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 257,
    iou: 0.786516853932584,
    type: "symbol",
    rectangles: [{ left: 391.0, top: 701.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 258,
    iou: 0.482727048237739,
    type: "symbol",
    rectangles: [{ left: 381.0, top: 701.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 259,
    iou: 0.508938852538426,
    type: "symbol",
    rectangles: [{ left: 367.0, top: 697.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 260,
    iou: 0.260242918888947,
    type: "symbol",
    rectangles: [{ left: 363.0, top: 699.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 261,
    iou: 0.621323287278513,
    type: "symbol",
    rectangles: [{ left: 344.0, top: 692.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 262,
    iou: 0.377069215665291,
    type: "symbol",
    rectangles: [{ left: 338.0, top: 694.0, width: 6.0, height: 8.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 263,
    iou: 0.565799261886465,
    type: "symbol",
    rectangles: [{ left: 341.0, top: 707.0, width: 6.0, height: 8.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 264,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 412.0, top: 463.0, width: 5.0, height: 2.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 265,
    iou: 0.17285137462268,
    type: "symbol",
    rectangles: [{ left: 403.0, top: 465.0, width: 4.0, height: 4.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 266,
    iou: 0.223026142141783,
    type: "symbol",
    rectangles: [{ left: 392.0, top: 473.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 267,
    iou: 0.167570445117668,
    type: "symbol",
    rectangles: [{ left: 367.0, top: 478.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 268,
    iou: 0.251969361950996,
    type: "symbol",
    rectangles: [{ left: 357.0, top: 478.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 269,
    iou: 0.422017640874552,
    type: "symbol",
    rectangles: [{ left: 344.0, top: 480.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 270,
    iou: 0.427068559381257,
    type: "symbol",
    rectangles: [{ left: 333.0, top: 480.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 271,
    iou: 0.648396215660985,
    type: "symbol",
    rectangles: [{ left: 318.0, top: 480.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 272,
    iou: 0.52738159462198,
    type: "symbol",
    rectangles: [{ left: 383.0, top: 351.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 273,
    iou: 0.670635092230903,
    type: "symbol",
    rectangles: [{ left: 372.0, top: 353.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 274,
    iou: 0.489719837385247,
    type: "symbol",
    rectangles: [{ left: 362.0, top: 353.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 0,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 75.0, top: 421.0, width: 8.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 0,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 380.17626890756304,
        top: 733.9041092636579,
        width: 3.0013915966386553,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 1,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 372.17255798319326,
        top: 733.9041092636579,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 2,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 366.16977478991595,
        top: 733.9041092636579,
        width: 2.000927731092437,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 3,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 459.2129142857143,
        top: 730.9045011876484,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 4,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 455.2110588235294,
        top: 733.9041092636579,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 5,
    iou: 0.201236691669807,
    type: "symbol",
    rectangles: [
      {
        left: 448.20781176470587,
        top: 730.9045011876484,
        width: 3.0013915966386553,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 6,
    iou: 0.204401730559968,
    type: "symbol",
    rectangles: [
      {
        left: 443.2054924369748,
        top: 733.9041092636579,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 7,
    iou: 0.00048413991318128,
    type: "symbol",
    rectangles: [
      {
        left: 436.20224537815125,
        top: 730.9045011876484,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 8,
    iou: 0.463117205377792,
    type: "symbol",
    rectangles: [
      {
        left: 433.2008537815126,
        top: 733.9041092636579,
        width: 3.0013915966386553,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 9,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 344.1595697478992,
        top: 720.9058076009501,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 10,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 342.1586420168067,
        top: 721.90567695962,
        width: 1.0004638655462186,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 11,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 339.15725042016805,
        top: 720.9058076009501,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 12,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 336.1558588235294,
        top: 720.9058076009501,
        width: 3.0013915966386553,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 13,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 333.15446722689074,
        top: 725.9051543942993,
        width: 2.000927731092437,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 14,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 432.2003899159664,
        top: 720.9058076009501,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 15,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 430.19946218487394,
        top: 721.90567695962,
        width: 1.0004638655462186,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 16,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 427.1980705882353,
        top: 720.9058076009501,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 17,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 424.1966789915966,
        top: 720.9058076009501,
        width: 3.0013915966386553,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 18,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 419.19435966386555,
        top: 725.9051543942993,
        width: 5.002319327731092,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 19,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 541.2509512605042,
        top: 720.9058076009501,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 20,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 539.2500235294118,
        top: 721.90567695962,
        width: 1.0004638655462186,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 21,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 536.2486319327732,
        top: 720.9058076009501,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 22,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 533.2472403361345,
        top: 720.9058076009501,
        width: 3.0013915966386553,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 23,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 528.2449210084034,
        top: 724.9052850356295,
        width: 5.002319327731092,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 24,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 529.2453848739495,
        top: 713.9067220902613,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 25,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 517.2398184873949,
        top: 713.9067220902613,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 26,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 500.23193277310924,
        top: 715.906460807601,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 27,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 147.06818823529412,
        top: 354.953622327791,
        width: 5.002319327731092,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 28,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 140.0649411764706,
        top: 354.953622327791,
        width: 3.0013915966386553,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 29,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 76.03525378151261,
        top: 338.95571258907364,
        width: 2.000927731092437,
        height: 0.9998693586698337
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 30,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 267.12385210084034,
        top: 354.953622327791,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 31,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 260.1206050420168,
        top: 351.9540142517815,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 32,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 258.1196773109244,
        top: 350.9541448931116,
        width: 2.000927731092437,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 33,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 255.11828571428572,
        top: 349.9542755344418,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 34,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 249.1155025210084,
        top: 354.953622327791,
        width: 6.002783193277311,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 35,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 149.06911596638656,
        top: 338.95571258907364,
        width: 2.000927731092437,
        height: 0.9998693586698337
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 36,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 275.12756302521007,
        top: 253.96681710213775,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 37,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 125.05798319327731,
        top: 105.98615201900238,
        width: 2.000927731092437,
        height: 0.9998693586698337
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 38,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 78.03618151260504,
        top: 110.98549881235154,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 39,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 71.03293445378151,
        top: 108.98576009501187,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 40,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 69.03200672268908,
        top: 107.98589073634204,
        width: 2.000927731092437,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 41,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 66.03061512605042,
        top: 106.9860213776722,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 42,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 60.02783193277311,
        top: 110.98549881235154,
        width: 6.002783193277311,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 43,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 535.2481680672269,
        top: 483.9367695961995,
        width: 2.000927731092437,
        height: 0.9998693586698337
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 44,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 485.22497478991596,
        top: 488.9361163895487,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 45,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 479.22219159663865,
        top: 482.9369002375297,
        width: 2.000927731092437,
        height: 1.9997387173396675
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 46,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 476.2208,
        top: 483.9367695961995,
        width: 2.000927731092437,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 47,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 472.2189445378151,
        top: 484.93663895486935,
        width: 3.0013915966386553,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 48,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 470.2180168067227,
        top: 485.9365083135392,
        width: 2.000927731092437,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 49,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 467.21662521008403,
        top: 483.9367695961995,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 50,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 463.21476974789914,
        top: 485.9365083135392,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 51,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 458.21245042016807,
        top: 485.9365083135392,
        width: 5.002319327731092,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 52,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 454.2105949579832,
        top: 485.9365083135392,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 53,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 449.2082756302521,
        top: 485.9365083135392,
        width: 5.002319327731092,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 54,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 444.20595630252103,
        top: 488.9361163895487,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 55,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 442.20502857142856,
        top: 477.93755344418054,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 56,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 427.1980705882353,
        top: 695.9090736342042,
        width: 2.000927731092437,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 57,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 424.1966789915966,
        top: 695.9090736342042,
        width: 2.000927731092437,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 58,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 421.195287394958,
        top: 695.9090736342042,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 59,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 420.1948235294118,
        top: 696.9089429928741,
        width: 1.0004638655462186,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 60,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 417.19343193277314,
        top: 695.9090736342042,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 61,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 429.19899831932776,
        top: 690.9097268408551,
        width: 3.0013915966386553,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 62,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 425.19714285714286,
        top: 690.9097268408551,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 63,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 421.195287394958,
        top: 690.9097268408551,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 64,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 417.19343193277314,
        top: 690.9097268408551,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 65,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 413.19157647058825,
        top: 694.9092042755344,
        width: 3.0013915966386553,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 66,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 283.13127394957985,
        top: 681.9109026128266,
        width: 2.000927731092437,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 67,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 279.12941848739496,
        top: 684.9105106888361,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 68,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 110.05102521008403,
        top: 660.9136460807601,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 69,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 143.06633277310925,
        top: 660.9136460807601,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 70,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 175.08117647058825,
        top: 660.9136460807601,
        width: 3.0013915966386553,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 71,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 217.10065882352941,
        top: 658.9139073634204,
        width: 2.000927731092437,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 72,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 213.09880336134455,
        top: 660.9136460807601,
        width: 3.0013915966386553,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 73,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 262.12153277310927,
        top: 658.9139073634204,
        width: 3.0013915966386553,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 74,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 258.1196773109244,
        top: 660.9136460807601,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 75,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 306.14194285714285,
        top: 658.9139073634204,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 76,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 302.14008739495796,
        top: 660.9136460807601,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 77,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 345.16003361344536,
        top: 658.9139073634204,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 78,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 343.15910588235295,
        top: 659.9137767220902,
        width: 1.0004638655462186,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 79,
    iou: 0.0399053204629724,
    type: "symbol",
    rectangles: [
      {
        left: 340.1577142857143,
        top: 658.9139073634204,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 80,
    iou: 0.0178205260486586,
    type: "symbol",
    rectangles: [
      {
        left: 337.15632268907564,
        top: 658.9139073634204,
        width: 3.0013915966386553,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 81,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 334.154931092437,
        top: 662.9133847980997,
        width: 2.000927731092437,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 82,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 375.1739495798319,
        top: 658.9139073634204,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 83,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 373.1730218487395,
        top: 659.9137767220902,
        width: 1.0004638655462186,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 84,
    iou: 0.0464149854576037,
    type: "symbol",
    rectangles: [
      {
        left: 370.17163025210084,
        top: 658.9139073634204,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 85,
    iou: 0.0173195715545786,
    type: "symbol",
    rectangles: [
      {
        left: 367.1702386554622,
        top: 658.9139073634204,
        width: 3.0013915966386553,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 86,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 363.1683831932773,
        top: 662.9133847980997,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 87,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 404.1874016806723,
        top: 658.9139073634204,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 88,
    iou: 0.00654272439884068,
    type: "symbol",
    rectangles: [
      {
        left: 402.1864739495798,
        top: 659.9137767220902,
        width: 1.0004638655462186,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 89,
    iou: 0.124230223503865,
    type: "symbol",
    rectangles: [
      {
        left: 399.18508235294115,
        top: 658.9139073634204,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 90,
    iou: 0.0578190478461709,
    type: "symbol",
    rectangles: [
      {
        left: 396.1836907563025,
        top: 658.9139073634204,
        width: 3.0013915966386553,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 91,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 391.1813714285714,
        top: 661.91351543943,
        width: 5.002319327731092,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 92,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 434.20131764705883,
        top: 662.9133847980997,
        width: 3.0013915966386553,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 93,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 429.19899831932776,
        top: 662.9133847980997,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 94,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 491.22775798319327,
        top: 662.9133847980997,
        width: 2.000927731092437,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 95,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 489.22683025210085,
        top: 662.9133847980997,
        width: 1.0004638655462186,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 96,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 486.2254386554622,
        top: 662.9133847980997,
        width: 2.000927731092437,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 97,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 484.2245109243697,
        top: 663.9132541567695,
        width: 1.0004638655462186,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 98,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 481.22311932773107,
        top: 662.9133847980997,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 99,
    iou: 0.0635587399370117,
    type: "symbol",
    rectangles: [
      {
        left: 494.2291495798319,
        top: 657.9140380047506,
        width: 2.000927731092437,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 100,
    iou: 0.145774116382069,
    type: "symbol",
    rectangles: [
      {
        left: 489.22683025210085,
        top: 657.9140380047506,
        width: 5.002319327731092,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 101,
    iou: 0.0468814091219268,
    type: "symbol",
    rectangles: [
      {
        left: 486.2254386554622,
        top: 657.9140380047506,
        width: 3.0013915966386553,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 102,
    iou: 0.0616351340608718,
    type: "symbol",
    rectangles: [
      {
        left: 481.22311932773107,
        top: 657.9140380047506,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 103,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 477.22126386554623,
        top: 661.91351543943,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 104,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 523.2426016806722,
        top: 659.9137767220902,
        width: 2.000927731092437,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 105,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 519.2407462184874,
        top: 661.91351543943,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 106,
    iou: 0.31215433899071,
    type: "symbol",
    rectangles: [
      {
        left: 217.10065882352941,
        top: 650.9149524940617,
        width: 3.0013915966386553,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 107,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 209.09694789915966,
        top: 650.9149524940617,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 108,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 205.0950924369748,
        top: 652.9146912114014,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 109,
    iou: 0.188447413497978,
    type: "symbol",
    rectangles: [
      {
        left: 262.12153277310927,
        top: 650.9149524940617,
        width: 3.0013915966386553,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 110,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 255.11828571428572,
        top: 650.9149524940617,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 111,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 251.11643025210083,
        top: 652.9146912114014,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 112,
    iou: 0.408989586531679,
    type: "symbol",
    rectangles: [
      {
        left: 306.14194285714285,
        top: 650.9149524940617,
        width: 3.0013915966386553,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 113,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 298.1382319327731,
        top: 650.9149524940617,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 114,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 294.13637647058823,
        top: 652.9146912114014,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 115,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 446.20688403361345,
        top: 650.9149524940617,
        width: 3.0013915966386553,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 116,
    iou: 0.0855514274025467,
    type: "symbol",
    rectangles: [
      {
        left: 438.2031731092437,
        top: 650.9149524940617,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 117,
    iou: 0.288927422122675,
    type: "symbol",
    rectangles: [
      {
        left: 434.20131764705883,
        top: 652.9146912114014,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 118,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 430.19946218487394,
        top: 650.9149524940617,
        width: 3.0013915966386553,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 119,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 426.1976067226891,
        top: 650.9149524940617,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 120,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 422.1957512605042,
        top: 652.9146912114014,
        width: 4.001855462184874,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 121,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 429.19899831932776,
        top: 354.953622327791,
        width: 6.002783193277311,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 122,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 367.1702386554622,
        top: 66.99124703087885,
        width: 5.002319327731092,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 0,
    iou: 0,
    type: "citation",
    rectangles: [
      {
        left: 183.08488739495797,
        top: 78.98967933491686,
        width: 98.04545882352942,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 1,
    iou: 0,
    type: "citation",
    rectangles: [
      {
        left: 102.04731428571428,
        top: 433.9433016627078,
        width: 3.0013915966386553,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 2,
    iou: 0,
    type: "citation",
    rectangles: [
      {
        left: 183.08488739495797,
        top: 78.98967933491686,
        width: 98.04545882352942,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 3,
    iou: 0,
    type: "citation",
    rectangles: [
      {
        left: 502.23286050420165,
        top: 66.99124703087885,
        width: 22.010205042016807,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 4,
    iou: 0,
    type: "citation",
    rectangles: [
      {
        left: 386.17905210084035,
        top: 159.9790973871734,
        width: 65.0301512605042,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.05081",
    page: 5,
    index: 5,
    iou: 0,
    type: "citation",
    rectangles: [
      {
        left: 341.15817815126053,
        top: 148.98053444180522,
        width: 3.0013915966386553,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 0,
    iou: 0.540029325800049,
    type: "citation",
    rectangles: [{ left: 123.0, top: 694.0, width: 9.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 1,
    iou: 0.69403627873777,
    type: "citation",
    rectangles: [{ left: 102.0, top: 569.0, width: 14.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 2,
    iou: 0.667956273158938,
    type: "citation",
    rectangles: [{ left: 201.0, top: 415.0, width: 13.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 3,
    iou: 0.47469212824825,
    type: "citation",
    rectangles: [{ left: 389.0, top: 670.0, width: 22.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 4,
    iou: 0.747367087485088,
    type: "citation",
    rectangles: [{ left: 521.0, top: 514.0, width: 13.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 5,
    iou: 0.798073056018601,
    type: "citation",
    rectangles: [{ left: 328.0, top: 481.0, width: 14.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 6,
    iou: 0.429893408148871,
    type: "citation",
    rectangles: [{ left: 319.0, top: 369.0, width: 14.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 0,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 347.0, top: 141.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 1,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 345.0, top: 140.0, width: 2.0, height: 2.0 },
      { left: 345.0, top: 142.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 2,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 339.0, top: 141.0, width: 6.0, height: 3.0 }]
  },
  {
    arxivId: "1911.06031",
    page: 2,
    index: 0,
    iou: 0.430872730982778,
    type: "citation",
    rectangles: [
      {
        left: 169.07839327731094,
        top: 152.94238413098236,
        width: 15.006957983193278,
        height: 8.996610831234257
      }
    ]
  },
  {
    arxivId: "1911.06031",
    page: 2,
    index: 1,
    iou: 0.472895520810436,
    type: "citation",
    rectangles: [
      {
        left: 440.20410084033614,
        top: 389.8531360201511,
        width: 16.007421848739497,
        height: 8.996610831234257
      }
    ]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 0,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 515.0, width: 4.0, height: 4.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 1,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 198.0, top: 515.0, width: 4.0, height: 4.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 2,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 196.0, top: 516.0, width: 2.0, height: 5.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 3,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 515.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 4,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 185.0, top: 519.0, width: 7.0, height: 6.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 5,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 177.0, top: 519.0, width: 7.0, height: 6.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 6,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 171.0, top: 519.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 7,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 528.0, width: 4.0, height: 4.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 8,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 198.0, top: 528.0, width: 4.0, height: 4.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 9,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 196.0, top: 529.0, width: 2.0, height: 5.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 10,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 528.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 11,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 189.0, top: 530.0, width: 2.0, height: 5.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 12,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 184.0, top: 529.0, width: 4.0, height: 4.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 13,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 179.0, top: 530.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 14,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 176.0, top: 529.0, width: 4.0, height: 4.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 15,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 172.0, top: 531.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 16,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 155.0, top: 523.0, width: 5.0, height: 4.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 17,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 155.0, top: 525.0, width: 1.0, height: 1.0 },
      { left: 154.0, top: 523.0, width: 2.0, height: 4.0 }
    ]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 18,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 151.0, top: 524.0, width: 2.0, height: 5.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 19,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 145.0, top: 523.0, width: 5.0, height: 4.0 }]
  },
  {
    arxivId: "1911.06073",
    page: 2,
    index: 20,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 140.0, top: 525.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.06554",
    page: 1,
    index: 0,
    iou: 0.666982956058023,
    type: "citation",
    rectangles: [
      {
        left: 281.1303462184874,
        top: 540.92932304038,
        width: 11.005102521008403,
        height: 9.998693586698337
      }
    ]
  },
  {
    arxivId: "1911.06554",
    page: 1,
    index: 1,
    iou: 0.911692065082092,
    type: "citation",
    rectangles: [
      {
        left: 376.17441344537815,
        top: 525.9312826603325,
        width: 22.010205042016807,
        height: 9.998693586698337
      }
    ]
  },
  {
    arxivId: "1911.06554",
    page: 1,
    index: 2,
    iou: 0.789812288241201,
    type: "citation",
    rectangles: [
      {
        left: 135.0626218487395,
        top: 380.95022565320664,
        width: 11.005102521008403,
        height: 9.998693586698337
      }
    ]
  },
  {
    arxivId: "1911.06554",
    page: 1,
    index: 3,
    iou: 0.764000513417178,
    type: "citation",
    rectangles: [
      {
        left: 442.20502857142856,
        top: 231.96969121140143,
        width: 12.005566386554621,
        height: 9.998693586698337
      }
    ]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 0,
    iou: 0.515463917525773,
    type: "citation",
    rectangles: [{ left: 168.0, top: 447.0, width: 10.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 1,
    iou: 0.763881681370005,
    type: "citation",
    rectangles: [{ left: 98.0, top: 705.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 2,
    iou: 0.437606837606837,
    type: "citation",
    rectangles: [{ left: 112.0, top: 578.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 3,
    iou: 0.339780053090633,
    type: "citation",
    rectangles: [{ left: 112.0, top: 567.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 4,
    iou: 0.746081504702194,
    type: "citation",
    rectangles: [{ left: 99.0, top: 556.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 5,
    iou: 0.801649106733852,
    type: "citation",
    rectangles: [{ left: 99.0, top: 545.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 6,
    iou: 0.601388122091647,
    type: "citation",
    rectangles: [{ left: 104.0, top: 533.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 7,
    iou: 0.544812601846822,
    type: "citation",
    rectangles: [{ left: 107.0, top: 136.0, width: 17.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 8,
    iou: 0.616532007458048,
    type: "citation",
    rectangles: [{ left: 177.0, top: 136.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 9,
    iou: 0.456431535269709,
    type: "citation",
    rectangles: [{ left: 310.0, top: 578.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 10,
    iou: 0.551724137931034,
    type: "citation",
    rectangles: [{ left: 529.0, top: 530.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 11,
    iou: 0.585812356979405,
    type: "citation",
    rectangles: [{ left: 370.0, top: 518.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 12,
    iou: 0.585812356979405,
    type: "citation",
    rectangles: [{ left: 388.0, top: 506.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 13,
    iou: 0.64609450337512,
    type: "citation",
    rectangles: [{ left: 529.0, top: 482.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 14,
    iou: 0.551724137931034,
    type: "citation",
    rectangles: [{ left: 366.0, top: 691.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 15,
    iou: 0.3196405648267,
    type: "citation",
    rectangles: [{ left: 346.0, top: 678.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 16,
    iou: 0.420826110347301,
    type: "citation",
    rectangles: [{ left: 351.0, top: 665.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 17,
    iou: 0.61310259579728,
    type: "citation",
    rectangles: [{ left: 360.0, top: 652.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 0,
    iou: 0.446719404374127,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 611.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 1,
    iou: 0.678571428571428,
    type: "symbol",
    rectangles: [{ left: 236.0, top: 223.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07222",
    page: 6,
    index: 0,
    iou: 0.406189397992495,
    type: "symbol",
    rectangles: [{ left: 336.0, top: 216.0, width: 7.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07222",
    page: 6,
    index: 1,
    iou: 0.55205263480769,
    type: "symbol",
    rectangles: [{ left: 317.0, top: 212.0, width: 4.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07222",
    page: 6,
    index: 2,
    iou: 0.748665822221729,
    type: "symbol",
    rectangles: [{ left: 310.0, top: 219.0, width: 6.0, height: 10.0 }]
  },
  {
    arxivId: "1911.07222",
    page: 6,
    index: 3,
    iou: 0.86307954524377,
    type: "symbol",
    rectangles: [{ left: 267.0, top: 219.0, width: 6.0, height: 10.0 }]
  },
  {
    arxivId: "1911.07222",
    page: 6,
    index: 4,
    iou: 0.0767114306194459,
    type: "symbol",
    rectangles: [{ left: 301.0, top: 175.0, width: 6.0, height: 10.0 }]
  },
  {
    arxivId: "1911.07222",
    page: 6,
    index: 5,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 489.0, top: 574.0, width: 7.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07222",
    page: 6,
    index: 0,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 90.0, top: 431.0, width: 19.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07222",
    page: 6,
    index: 1,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 149.0, top: 431.0, width: 9.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07222",
    page: 6,
    index: 2,
    iou: 0.327201963906473,
    type: "citation",
    rectangles: [{ left: 220.0, top: 431.0, width: 8.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07222",
    page: 6,
    index: 3,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 288.0, top: 105.0, width: 8.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 0,
    iou: 0.124999999999999,
    type: "citation",
    rectangles: [{ left: 484.0, top: 231.0, width: 26.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 1,
    iou: 0.424363454817773,
    type: "citation",
    rectangles: [{ left: 322.0, top: 119.0, width: 25.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 2,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 322.0, top: 94.0, width: 25.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 0,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 293.0, top: 668.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 1,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 124.0, top: 503.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 2,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 487.0, top: 491.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 3,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 501.0, top: 454.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 4,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 487.0, top: 404.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 5,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 203.0, top: 391.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 6,
    iou: 0.249343832020998,
    type: "symbol",
    rectangles: [{ left: 126.0, top: 213.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 7,
    iou: 0.26796973518285,
    type: "symbol",
    rectangles: [{ left: 178.0, top: 188.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 8,
    iou: 0.29976762199845,
    type: "symbol",
    rectangles: [{ left: 89.0, top: 163.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 9,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 482.0, top: 291.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 10,
    iou: 0.302140007254257,
    type: "symbol",
    rectangles: [{ left: 353.0, top: 266.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 11,
    iou: 0.334224598930481,
    type: "symbol",
    rectangles: [{ left: 437.0, top: 268.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 12,
    iou: 0.29192756811643,
    type: "symbol",
    rectangles: [{ left: 491.0, top: 268.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 13,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 441.0, top: 117.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 14,
    iou: 0.430379746835442,
    type: "symbol",
    rectangles: [{ left: 559.0, top: 94.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 0,
    iou: 0.783475783475781,
    type: "citation",
    rectangles: [{ left: 272.0, top: 632.0, width: 14.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 1,
    iou: 0.467422096317277,
    type: "citation",
    rectangles: [{ left: 178.0, top: 390.0, width: 14.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 2,
    iou: 0.587842351369407,
    type: "citation",
    rectangles: [{ left: 413.0, top: 327.0, width: 12.0, height: 10.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 3,
    iou: 0.396825396825396,
    type: "citation",
    rectangles: [{ left: 244.0, top: 297.0, width: 30.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 4,
    iou: 0.543432997418172,
    type: "citation",
    rectangles: [{ left: 349.0, top: 124.0, width: 58.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 5,
    iou: 0.755287009063442,
    type: "citation",
    rectangles: [{ left: 545.0, top: 101.0, width: 13.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 6,
    iou: 0.128685072531586,
    type: "citation",
    rectangles: [{ left: 518.0, top: 90.0, width: 9.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 7,
    iou: 0.321708569883752,
    type: "citation",
    rectangles: [{ left: 516.0, top: 78.0, width: 42.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 0,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 244.0, top: 144.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 1,
    iou: 0.230722109695332,
    type: "symbol",
    rectangles: [{ left: 137.0, top: 110.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 2,
    iou: 0.318168727985814,
    type: "symbol",
    rectangles: [{ left: 172.0, top: 77.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 3,
    iou: 0.183649034638405,
    type: "symbol",
    rectangles: [{ left: 530.0, top: 268.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 4,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 211.0, top: 709.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 5,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 180.0, top: 711.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 6,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 222.0, top: 571.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 7,
    iou: 0.228857890148216,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 536.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 8,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 142.0, top: 533.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 9,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 137.0, top: 533.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 10,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 130.0, top: 533.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 11,
    iou: 0.117903930131003,
    type: "symbol",
    rectangles: [{ left: 123.0, top: 538.0, width: 6.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 12,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 201.0, top: 444.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 13,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 222.0, top: 433.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 14,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 221.0, top: 421.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 15,
    iou: 0.373075404658505,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 398.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 16,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 193.0, top: 395.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 17,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 189.0, top: 395.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 18,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 182.0, top: 395.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 19,
    iou: 0.119287318027087,
    type: "symbol",
    rectangles: [{ left: 174.0, top: 400.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 20,
    iou: 0.449522084050121,
    type: "symbol",
    rectangles: [{ left: 516.0, top: 348.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 21,
    iou: 0.34513533624733,
    type: "symbol",
    rectangles: [{ left: 492.0, top: 348.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 22,
    iou: 0.30135989504882,
    type: "symbol",
    rectangles: [{ left: 467.0, top: 317.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 23,
    iou: 0.166685125787408,
    type: "symbol",
    rectangles: [{ left: 463.0, top: 317.0, width: 4.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 24,
    iou: 0.221397109498517,
    type: "symbol",
    rectangles: [{ left: 458.0, top: 314.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 25,
    iou: 0.375838926174498,
    type: "symbol",
    rectangles: [{ left: 174.0, top: 319.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 26,
    iou: 0.168439716312057,
    type: "symbol",
    rectangles: [{ left: 148.0, top: 319.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 27,
    iou: 0.423031002553219,
    type: "symbol",
    rectangles: [{ left: 267.0, top: 250.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 28,
    iou: 0.0980185444976611,
    type: "symbol",
    rectangles: [{ left: 262.0, top: 251.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 29,
    iou: 0.45409689143245,
    type: "symbol",
    rectangles: [{ left: 257.0, top: 248.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 30,
    iou: 0.566532614848586,
    type: "symbol",
    rectangles: [{ left: 217.0, top: 250.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 31,
    iou: 0.0592599893142279,
    type: "symbol",
    rectangles: [{ left: 212.0, top: 251.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 32,
    iou: 0.271932614929909,
    type: "symbol",
    rectangles: [{ left: 207.0, top: 248.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 33,
    iou: 0.391566309204642,
    type: "symbol",
    rectangles: [{ left: 165.0, top: 252.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 34,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 252.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 35,
    iou: 0.328491084217719,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 250.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 36,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 139.0, top: 248.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 37,
    iou: 0.0456850403624275,
    type: "symbol",
    rectangles: [{ left: 106.0, top: 248.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 38,
    iou: 0.0337234903954472,
    type: "symbol",
    rectangles: [{ left: 101.0, top: 248.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 39,
    iou: 0.390237315919891,
    type: "symbol",
    rectangles: [{ left: 96.0, top: 251.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 40,
    iou: 0.380457929337062,
    type: "symbol",
    rectangles: [{ left: 87.0, top: 248.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 41,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 78.0, top: 244.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 42,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 74.0, top: 244.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 43,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 67.0, top: 244.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 44,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 65.0, top: 250.0, width: 1.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 45,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 82.0, top: 227.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 46,
    iou: 0.198780521563893,
    type: "symbol",
    rectangles: [{ left: 80.0, top: 214.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 47,
    iou: 0.4975256971637,
    type: "symbol",
    rectangles: [{ left: 75.0, top: 214.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 48,
    iou: 0.0823297083527874,
    type: "symbol",
    rectangles: [{ left: 70.0, top: 217.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 49,
    iou: 0.380396288879248,
    type: "symbol",
    rectangles: [{ left: 64.0, top: 214.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07822",
    page: 0,
    index: 0,
    iou: 0.773339276068535,
    type: "citation",
    rectangles: [
      {
        left: 262.121168356998,
        top: 119.02669,
        width: 115.0531845841785,
        height: 9.002018571428572
      }
    ]
  },
  {
    arxivId: "1911.07822",
    page: 0,
    index: 1,
    iou: 0.781120007018676,
    type: "citation",
    rectangles: [
      {
        left: 123.05688438133875,
        top: 83.01861571428572,
        width: 189.08740770791076,
        height: 9.002018571428572
      }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 0,
    iou: 0.159717552118356,
    type: "symbol",
    rectangles: [{ left: 437.0, top: 652.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 1,
    iou: 0.195298372513561,
    type: "symbol",
    rectangles: [{ left: 351.0, top: 641.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 2,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 492.0, top: 723.0, width: 4.0, height: 5.0 },
      { left: 294.0, top: 310.0, width: 3.0, height: 5.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 3,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 489.0, top: 723.0, width: 3.0, height: 5.0 },
      { left: 289.0, top: 306.0, width: 5.0, height: 5.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 4,
    iou: 0.0887980280147123,
    type: "symbol",
    rectangles: [{ left: 69.0, top: 722.0, width: 235.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 5,
    iou: 0.14172335600907,
    type: "symbol",
    rectangles: [{ left: 283.0, top: 726.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 6,
    iou: 0.0568659127625206,
    type: "symbol",
    rectangles: [{ left: 279.0, top: 722.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 7,
    iou: 0.0688976377952773,
    type: "symbol",
    rectangles: [{ left: 271.0, top: 726.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 8,
    iou: 0.0440140845070422,
    type: "symbol",
    rectangles: [{ left: 266.0, top: 722.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 9,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 254.0, top: 724.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 10,
    iou: 0.144675925925925,
    type: "symbol",
    rectangles: [{ left: 246.0, top: 726.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 11,
    iou: 0.0934738273283499,
    type: "symbol",
    rectangles: [{ left: 241.0, top: 722.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 12,
    iou: 0.484375000000004,
    type: "symbol",
    rectangles: [{ left: 230.0, top: 724.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 13,
    iou: 0.0189274447949533,
    type: "symbol",
    rectangles: [{ left: 207.0, top: 722.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 14,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 722.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 15,
    iou: 0.0320641282565134,
    type: "symbol",
    rectangles: [{ left: 199.0, top: 724.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 16,
    iou: 0.264150943396226,
    type: "symbol",
    rectangles: [{ left: 189.0, top: 724.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 17,
    iou: 0.121681415929202,
    type: "symbol",
    rectangles: [{ left: 167.0, top: 726.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 18,
    iou: 0.174081237911026,
    type: "symbol",
    rectangles: [{ left: 162.0, top: 722.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 19,
    iou: 0.173611111111111,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 726.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 20,
    iou: 0.0773694390715679,
    type: "symbol",
    rectangles: [{ left: 149.0, top: 722.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 21,
    iou: 0.37069726390115,
    type: "symbol",
    rectangles: [{ left: 138.0, top: 724.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 22,
    iou: 0.0212305877727548,
    type: "symbol",
    rectangles: [{ left: 132.0, top: 722.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 23,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 127.0, top: 722.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 24,
    iou: 0.052117263843649,
    type: "symbol",
    rectangles: [{ left: 124.0, top: 724.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 25,
    iou: 0.0724999999999999,
    type: "symbol",
    rectangles: [{ left: 113.0, top: 724.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 26,
    iou: 0.398724082934607,
    type: "symbol",
    rectangles: [{ left: 97.0, top: 716.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 27,
    iou: 0.0325443786982254,
    type: "symbol",
    rectangles: [{ left: 103.0, top: 722.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 28,
    iou: 0.0371471025260035,
    type: "symbol",
    rectangles: [{ left: 98.0, top: 722.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 29,
    iou: 0.0493044550096856,
    type: "symbol",
    rectangles: [{ left: 89.0, top: 722.0, width: 8.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 30,
    iou: 0.542168674698796,
    type: "symbol",
    rectangles: [{ left: 75.0, top: 716.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 31,
    iou: 0.124555160142347,
    type: "symbol",
    rectangles: [{ left: 81.0, top: 722.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 32,
    iou: 0.166830225711481,
    type: "symbol",
    rectangles: [{ left: 78.0, top: 724.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 33,
    iou: 0.0887980280147123,
    type: "symbol",
    rectangles: [{ left: 69.0, top: 722.0, width: 235.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 34,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 118.0, top: 651.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 35,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 168.0, top: 639.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 36,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 189.0, top: 628.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 37,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 246.0, top: 603.0, width: 1.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 38,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 243.0, top: 603.0, width: 1.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 39,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 237.0, top: 600.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 40,
    iou: 0.0246507806080535,
    type: "symbol",
    rectangles: [{ left: 233.0, top: 604.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 41,
    iou: 0.00378698224852156,
    type: "symbol",
    rectangles: [{ left: 228.0, top: 601.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 42,
    iou: 0.0203097232800191,
    type: "symbol",
    rectangles: [{ left: 211.0, top: 600.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 43,
    iou: 0.106564364876385,
    type: "symbol",
    rectangles: [{ left: 208.0, top: 605.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 44,
    iou: 0.0131427253862114,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 601.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 45,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 200.0, top: 603.0, width: 1.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 46,
    iou: 0.0237388724035606,
    type: "symbol",
    rectangles: [{ left: 198.0, top: 603.0, width: 1.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 47,
    iou: 0.192901234567902,
    type: "symbol",
    rectangles: [{ left: 162.0, top: 605.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 48,
    iou: 0.0142065634323059,
    type: "symbol",
    rectangles: [{ left: 156.0, top: 601.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 49,
    iou: 0.0667351129363456,
    type: "symbol",
    rectangles: [{ left: 148.0, top: 601.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 50,
    iou: 0.0122824974411468,
    type: "symbol",
    rectangles: [{ left: 143.0, top: 601.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 51,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 140.0, top: 603.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 52,
    iou: 0.214567635450305,
    type: "symbol",
    rectangles: [{ left: 120.0, top: 603.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 53,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 98.0, top: 603.0, width: 3.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 54,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 492.0, top: 723.0, width: 4.0, height: 5.0 },
      { left: 294.0, top: 310.0, width: 3.0, height: 5.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 55,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 489.0, top: 723.0, width: 3.0, height: 5.0 },
      { left: 289.0, top: 306.0, width: 5.0, height: 5.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 56,
    iou: 0.14175326405542,
    type: "symbol",
    rectangles: [{ left: 49.0, top: 724.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 0,
    iou: 0.119492158327109,
    type: "citation",
    rectangles: [{ left: 404.0, top: 139.0, width: 11.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 1,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 406.0, top: 143.0, width: 6.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 2,
    iou: 0.0500910746812386,
    type: "citation",
    rectangles: [{ left: 399.0, top: 117.0, width: 11.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 3,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 407.0, top: 114.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 4,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 408.0, top: 113.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 5,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 395.0, top: 104.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 6,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 400.0, top: 98.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 7,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 407.0, top: 90.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 8,
    iou: 0.255095473074448,
    type: "citation",
    rectangles: [{ left: 338.0, top: 55.0, width: 10.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 9,
    iou: 0.666174298375189,
    type: "citation",
    rectangles: [{ left: 48.0, top: 652.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 10,
    iou: 0.140870987528114,
    type: "citation",
    rectangles: [{ left: 164.0, top: 445.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 11,
    iou: 0.146023468057367,
    type: "citation",
    rectangles: [{ left: 53.0, top: 399.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 12,
    iou: 0.108238387379491,
    type: "citation",
    rectangles: [{ left: 108.0, top: 319.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 13,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 264.0, top: 308.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 14,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 103.0, top: 296.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 15,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 172.0, top: 296.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 16,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 243.0, top: 227.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 17,
    iou: 0.578579743888243,
    type: "citation",
    rectangles: [{ left: 128.0, top: 159.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 18,
    iou: 0.343423799582462,
    type: "citation",
    rectangles: [{ left: 257.0, top: 55.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 19,
    iou: 0.419872681981733,
    type: "citation",
    rectangles: [{ left: 364.0, top: 733.0, width: 10.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 20,
    iou: 0.436018957345966,
    type: "citation",
    rectangles: [{ left: 312.0, top: 721.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 21,
    iou: 0.657894736842103,
    type: "citation",
    rectangles: [{ left: 312.0, top: 560.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 22,
    iou: 0.922260546564071,
    type: "citation",
    rectangles: [{ left: 508.0, top: 560.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 23,
    iou: 0.725190839694658,
    type: "citation",
    rectangles: [{ left: 424.0, top: 549.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 24,
    iou: 0.722408026755846,
    type: "citation",
    rectangles: [{ left: 550.0, top: 409.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 25,
    iou: 0.456611570247935,
    type: "citation",
    rectangles: [{ left: 397.0, top: 374.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 26,
    iou: 0.41425389755011,
    type: "citation",
    rectangles: [{ left: 462.0, top: 374.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 27,
    iou: 0.530120481927709,
    type: "citation",
    rectangles: [{ left: 553.0, top: 300.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 28,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 415.0, top: 203.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 29,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 426.0, top: 196.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 30,
    iou: 0.158553546592489,
    type: "citation",
    rectangles: [{ left: 392.0, top: 192.0, width: 36.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 31,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 400.0, top: 180.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 0,
    iou: 0.703324808184143,
    type: "citation",
    rectangles: [{ left: 264.0, top: 413.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 1,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 286.0, top: 389.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 2,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 48.0, top: 343.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 3,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 186.0, top: 332.0, width: 28.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 4,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 220.0, top: 320.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 5,
    iou: 0.677966101694918,
    type: "citation",
    rectangles: [{ left: 196.0, top: 308.0, width: 64.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 6,
    iou: 0.516891268229646,
    type: "citation",
    rectangles: [{ left: 205.0, top: 262.0, width: 32.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 7,
    iou: 0.823529411764707,
    type: "citation",
    rectangles: [{ left: 119.0, top: 228.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 8,
    iou: 0.837053571428571,
    type: "citation",
    rectangles: [{ left: 239.0, top: 112.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 9,
    iou: 0.559197324414717,
    type: "citation",
    rectangles: [{ left: 357.0, top: 436.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 10,
    iou: 0.495665813588708,
    type: "citation",
    rectangles: [{ left: 395.0, top: 424.0, width: 37.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 11,
    iou: 0.143011917659805,
    type: "citation",
    rectangles: [{ left: 384.0, top: 378.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 12,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 462.0, top: 355.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 13,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 472.0, top: 136.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 14,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 402.0, top: 124.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 15,
    iou: 0.143011917659805,
    type: "citation",
    rectangles: [{ left: 384.0, top: 378.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 1,
    index: 0,
    iou: 0.475506205094706,
    type: "citation",
    rectangles: [{ left: 53.0, top: 393.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 1,
    index: 1,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 284.0, top: 381.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 1,
    index: 2,
    iou: 0.334231805929918,
    type: "citation",
    rectangles: [{ left: 88.0, top: 170.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 1,
    index: 3,
    iou: 0.258780036968576,
    type: "citation",
    rectangles: [{ left: 259.0, top: 170.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 1,
    index: 4,
    iou: 0.349372384937238,
    type: "citation",
    rectangles: [{ left: 452.0, top: 228.0, width: 38.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 1,
    index: 5,
    iou: 0.452616690240452,
    type: "citation",
    rectangles: [{ left: 548.0, top: 216.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 1,
    index: 6,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 317.0, top: 136.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 1,
    index: 7,
    iou: 0.476082004555808,
    type: "citation",
    rectangles: [{ left: 446.0, top: 136.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 1,
    index: 8,
    iou: 0.565839126117179,
    type: "citation",
    rectangles: [{ left: 506.0, top: 89.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 0,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 227.0, top: 678.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 1,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 54.0, top: 666.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 2,
    iou: 0.47005444646098,
    type: "citation",
    rectangles: [{ left: 284.0, top: 541.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 3,
    iou: 0.55405405405406,
    type: "citation",
    rectangles: [{ left: 267.0, top: 529.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 4,
    iou: 0.29987760097919,
    type: "citation",
    rectangles: [{ left: 190.0, top: 506.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 5,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 219.0, top: 460.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 6,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 286.0, top: 425.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 7,
    iou: 0.658476658476661,
    type: "citation",
    rectangles: [{ left: 130.0, top: 298.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 8,
    iou: 0.485568760611205,
    type: "citation",
    rectangles: [{ left: 177.0, top: 252.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 9,
    iou: 0.472440944881888,
    type: "citation",
    rectangles: [{ left: 247.0, top: 228.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 10,
    iou: 0.563380281690141,
    type: "citation",
    rectangles: [{ left: 197.0, top: 194.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 11,
    iou: 0.414460285132382,
    type: "citation",
    rectangles: [{ left: 51.0, top: 170.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 12,
    iou: 0.41816009557945,
    type: "citation",
    rectangles: [{ left: 229.0, top: 136.0, width: 36.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 13,
    iou: 0.596774193548388,
    type: "citation",
    rectangles: [{ left: 219.0, top: 101.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 14,
    iou: 0.342081717864598,
    type: "citation",
    rectangles: [{ left: 101.0, top: 89.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 15,
    iou: 0.369215034518028,
    type: "citation",
    rectangles: [{ left: 329.0, top: 724.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 0,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 332.0, top: 222.0, width: 9.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 1,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 334.0, top: 220.0, width: 6.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 2,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 335.0, top: 218.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 3,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 484.0, top: 226.0, width: 10.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 4,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 472.0, top: 214.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 5,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 344.0, top: 224.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 6,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 341.0, top: 218.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 7,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 344.0, top: 223.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 8,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 343.0, top: 219.0, width: 1.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 9,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 320.0, top: 220.0, width: 30.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 10,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 345.0, top: 218.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 11,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 325.0, top: 224.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 12,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 460.0, top: 225.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 13,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 471.0, top: 249.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 14,
    iou: 0.0018145997511405,
    type: "citation",
    rectangles: [{ left: 169.0, top: 250.0, width: 38.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 15,
    iou: 0.0791705937794534,
    type: "citation",
    rectangles: [{ left: 53.0, top: 239.0, width: 466.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 16,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 227.0, top: 239.0, width: 38.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 17,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 123.0, top: 227.0, width: 384.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 18,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 48.0, top: 135.0, width: 102.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 19,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 186.0, top: 78.0, width: 37.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 20,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 115.0, top: 66.0, width: 37.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 21,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 421.0, top: 713.0, width: 37.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 22,
    iou: 0.0929359982682746,
    type: "citation",
    rectangles: [{ left: 312.0, top: 460.0, width: 97.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 23,
    iou: 0.0520385166973975,
    type: "citation",
    rectangles: [{ left: 312.0, top: 426.0, width: 103.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 24,
    iou: 0.338672768878718,
    type: "citation",
    rectangles: [{ left: 548.0, top: 182.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 25,
    iou: 0.617886178861786,
    type: "citation",
    rectangles: [{ left: 454.0, top: 170.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 0,
    iou: 0.35,
    type: "symbol",
    rectangles: [{ left: 121.0, top: 400.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 1,
    iou: 0.596026490066217,
    type: "symbol",
    rectangles: [{ left: 279.0, top: 386.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 2,
    iou: 0.0468123049487293,
    type: "symbol",
    rectangles: [{ left: 275.0, top: 367.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 3,
    iou: 0.129469790382244,
    type: "symbol",
    rectangles: [{ left: 266.0, top: 365.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 4,
    iou: 0.130861504907307,
    type: "symbol",
    rectangles: [{ left: 189.0, top: 355.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 5,
    iou: 0.0717474489795924,
    type: "symbol",
    rectangles: [{ left: 184.0, top: 352.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 6,
    iou: 0.119760479041918,
    type: "symbol",
    rectangles: [{ left: 276.0, top: 344.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 7,
    iou: 0.139925373134328,
    type: "symbol",
    rectangles: [{ left: 271.0, top: 340.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 8,
    iou: 0.103900255754474,
    type: "symbol",
    rectangles: [{ left: 277.0, top: 309.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 9,
    iou: 0.43859649122807,
    type: "symbol",
    rectangles: [{ left: 271.0, top: 308.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 10,
    iou: 0.0954545454545451,
    type: "symbol",
    rectangles: [{ left: 141.0, top: 298.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 11,
    iou: 0.00651041666666629,
    type: "symbol",
    rectangles: [{ left: 136.0, top: 294.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 12,
    iou: 0.100160256410256,
    type: "symbol",
    rectangles: [{ left: 59.0, top: 286.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 13,
    iou: 0.296052631578945,
    type: "symbol",
    rectangles: [{ left: 49.0, top: 284.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 14,
    iou: 0.420820189274451,
    type: "symbol",
    rectangles: [{ left: 410.0, top: 78.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 0,
    iou: 0.386435331230283,
    type: "citation",
    rectangles: [{ left: 99.0, top: 382.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 1,
    iou: 0.573065902578796,
    type: "citation",
    rectangles: [{ left: 282.0, top: 701.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 2,
    iou: 0.587212671431334,
    type: "citation",
    rectangles: [{ left: 284.0, top: 469.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 3,
    iou: 0.386435331230283,
    type: "citation",
    rectangles: [{ left: 99.0, top: 382.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 4,
    iou: 0.280361757105943,
    type: "citation",
    rectangles: [{ left: 129.0, top: 89.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 5,
    iou: 0.41512195121951,
    type: "citation",
    rectangles: [{ left: 375.0, top: 530.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 6,
    iou: 0.280361757105943,
    type: "citation",
    rectangles: [{ left: 129.0, top: 89.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 0,
    iou: 0.106496272630457,
    type: "symbol",
    rectangles: [
      { left: 250.0, top: 321.0, width: 3.0, height: 5.0 },
      { left: 215.0, top: 204.0, width: 4.0, height: 5.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 1,
    iou: 0.0721847930702598,
    type: "symbol",
    rectangles: [
      { left: 212.0, top: 204.0, width: 3.0, height: 5.0 },
      { left: 244.0, top: 318.0, width: 5.0, height: 7.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 2,
    iou: 0.168728908886389,
    type: "symbol",
    rectangles: [{ left: 206.0, top: 203.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 3,
    iou: 0.320512820512819,
    type: "symbol",
    rectangles: [{ left: 288.0, top: 203.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 4,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 188.0, top: 130.0, width: 3.0, height: 3.0 },
      { left: 233.0, top: 101.0, width: 1.0, height: 1.0 },
      { left: 189.0, top: 132.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 5,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 224.0, top: 104.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 6,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 220.0, top: 104.0, width: 2.0, height: 1.0 },
      { left: 219.0, top: 102.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 7,
    iou: 0.0427382053654023,
    type: "symbol",
    rectangles: [{ left: 214.0, top: 105.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 8,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 205.0, top: 104.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 9,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 200.0, top: 104.0, width: 2.0, height: 1.0 },
      { left: 199.0, top: 102.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 10,
    iou: 0.0658761528326744,
    type: "symbol",
    rectangles: [{ left: 194.0, top: 105.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 11,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 174.0, top: 104.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 12,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 168.0, top: 102.0, width: 3.0, height: 3.0 },
      { left: 169.0, top: 104.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 13,
    iou: 0.0196482955103644,
    type: "symbol",
    rectangles: [{ left: 163.0, top: 105.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 14,
    iou: 0.026898863543455,
    type: "symbol",
    rectangles: [{ left: 213.0, top: 118.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 15,
    iou: 0.00300120048019233,
    type: "symbol",
    rectangles: [
      { left: 209.0, top: 118.0, width: 2.0, height: 1.0 },
      { left: 208.0, top: 116.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 16,
    iou: 0.0563851298802302,
    type: "symbol",
    rectangles: [{ left: 203.0, top: 120.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 17,
    iou: 0.0559683011391779,
    type: "symbol",
    rectangles: [{ left: 193.0, top: 118.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 18,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 189.0, top: 118.0, width: 2.0, height: 1.0 },
      { left: 188.0, top: 116.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 19,
    iou: 0.264190821256038,
    type: "symbol",
    rectangles: [{ left: 183.0, top: 120.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 20,
    iou: 0.0526094276094276,
    type: "symbol",
    rectangles: [{ left: 175.0, top: 118.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 21,
    iou: 0.0473484848484848,
    type: "symbol",
    rectangles: [{ left: 169.0, top: 116.0, width: 6.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 22,
    iou: 0.0526094276094276,
    type: "symbol",
    rectangles: [{ left: 165.0, top: 118.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 23,
    iou: 0.0478564307078763,
    type: "symbol",
    rectangles: [{ left: 157.0, top: 122.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 24,
    iou: 0.0565336779195606,
    type: "symbol",
    rectangles: [{ left: 151.0, top: 122.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 25,
    iou: 0.0522896529868483,
    type: "symbol",
    rectangles: [{ left: 142.0, top: 122.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 26,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 124.0, top: 118.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 27,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 119.0, top: 116.0, width: 3.0, height: 3.0 },
      { left: 120.0, top: 118.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 28,
    iou: 0.0686868686868688,
    type: "symbol",
    rectangles: [{ left: 115.0, top: 120.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 29,
    iou: 0.0218446601941748,
    type: "symbol",
    rectangles: [{ left: 213.0, top: 132.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 30,
    iou: 0.0284090909090908,
    type: "symbol",
    rectangles: [
      { left: 209.0, top: 132.0, width: 2.0, height: 1.0 },
      { left: 208.0, top: 130.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 31,
    iou: 0.014068712406973,
    type: "symbol",
    rectangles: [{ left: 203.0, top: 134.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 32,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 193.0, top: 132.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 33,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 188.0, top: 130.0, width: 3.0, height: 3.0 },
      { left: 233.0, top: 101.0, width: 1.0, height: 1.0 },
      { left: 189.0, top: 132.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 34,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 97.0, top: 74.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 35,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 93.0, top: 74.0, width: 2.0, height: 1.0 },
      { left: 92.0, top: 72.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 36,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 87.0, top: 76.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 37,
    iou: 0.0062189054726369,
    type: "symbol",
    rectangles: [{ left: 80.0, top: 63.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 38,
    iou: 0.303951367781155,
    type: "symbol",
    rectangles: [{ left: 75.0, top: 66.0, width: 5.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 39,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 143.0, top: 49.0, width: 3.0, height: 3.0 },
      { left: 144.0, top: 51.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 40,
    iou: 0.234404536862003,
    type: "symbol",
    rectangles: [{ left: 139.0, top: 55.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 41,
    iou: 0.146198830409356,
    type: "symbol",
    rectangles: [{ left: 276.0, top: 56.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 42,
    iou: 0.458100558659217,
    type: "symbol",
    rectangles: [{ left: 270.0, top: 55.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 43,
    iou: 0.179250407387288,
    type: "symbol",
    rectangles: [{ left: 383.0, top: 749.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 44,
    iou: 0.196220930232558,
    type: "symbol",
    rectangles: [{ left: 366.0, top: 749.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 45,
    iou: 0.0965539661898568,
    type: "symbol",
    rectangles: [{ left: 399.0, top: 738.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 46,
    iou: 0.675154320987654,
    type: "symbol",
    rectangles: [{ left: 380.0, top: 738.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 47,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 463.0, top: 723.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 48,
    iou: 0.12317666126418,
    type: "symbol",
    rectangles: [{ left: 457.0, top: 726.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 49,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 440.0, top: 723.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 50,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 436.0, top: 723.0, width: 2.0, height: 1.0 },
      { left: 435.0, top: 721.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 51,
    iou: 0.0433050407067381,
    type: "symbol",
    rectangles: [{ left: 430.0, top: 724.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 52,
    iou: 0.0287191269385409,
    type: "symbol",
    rectangles: [{ left: 428.0, top: 726.0, width: 1.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 53,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 419.0, top: 728.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 54,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 414.0, top: 723.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 55,
    iou: 0.218446601941745,
    type: "symbol",
    rectangles: [{ left: 408.0, top: 726.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 56,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 399.0, top: 723.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 57,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 394.0, top: 723.0, width: 2.0, height: 1.0 },
      { left: 393.0, top: 721.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 58,
    iou: 0.0390846834808757,
    type: "symbol",
    rectangles: [{ left: 388.0, top: 724.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 59,
    iou: 0.0205846739318452,
    type: "symbol",
    rectangles: [{ left: 368.0, top: 723.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 60,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 363.0, top: 723.0, width: 2.0, height: 1.0 },
      { left: 362.0, top: 721.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 61,
    iou: 0.0524017467248903,
    type: "symbol",
    rectangles: [{ left: 357.0, top: 724.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 62,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 388.0, top: 586.0, width: 3.0, height: 3.0 },
      { left: 487.0, top: 566.0, width: 4.0, height: 5.0 },
      { left: 389.0, top: 588.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 63,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 483.0, top: 566.0, width: 2.0, height: 1.0 },
      { left: 482.0, top: 564.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 64,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 476.0, top: 567.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 65,
    iou: 0.05359317904994,
    type: "symbol",
    rectangles: [{ left: 471.0, top: 566.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 66,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 467.0, top: 566.0, width: 2.0, height: 1.0 },
      { left: 466.0, top: 564.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 67,
    iou: 0.112867915349065,
    type: "symbol",
    rectangles: [{ left: 460.0, top: 567.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 68,
    iou: 0.330861909175172,
    type: "symbol",
    rectangles: [{ left: 449.0, top: 556.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 69,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 429.0, top: 566.0, width: 2.0, height: 1.0 },
      { left: 428.0, top: 564.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 70,
    iou: 0.716829919857537,
    type: "symbol",
    rectangles: [{ left: 422.0, top: 567.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 71,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 482.0, top: 580.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 72,
    iou: 0.189174986862849,
    type: "symbol",
    rectangles: [{ left: 476.0, top: 583.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 73,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 469.0, top: 586.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 74,
    iou: 0.0490196078431372,
    type: "symbol",
    rectangles: [{ left: 462.0, top: 582.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 75,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 457.0, top: 582.0, width: 2.0, height: 1.0 },
      { left: 456.0, top: 580.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 76,
    iou: 0.0744215134459039,
    type: "symbol",
    rectangles: [{ left: 451.0, top: 583.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 77,
    iou: 0.0581902822228676,
    type: "symbol",
    rectangles: [{ left: 439.0, top: 583.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 78,
    iou: 0.0917618270799317,
    type: "symbol",
    rectangles: [{ left: 433.0, top: 583.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 79,
    iou: 0.0403587443946173,
    type: "symbol",
    rectangles: [{ left: 429.0, top: 583.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 80,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 422.0, top: 580.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 81,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 473.0, top: 593.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 82,
    iou: 0.0962000962000978,
    type: "symbol",
    rectangles: [{ left: 468.0, top: 597.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 83,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 461.0, top: 600.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 84,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 453.0, top: 595.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 85,
    iou: 0.00628140703517587,
    type: "symbol",
    rectangles: [
      { left: 449.0, top: 595.0, width: 2.0, height: 1.0 },
      { left: 448.0, top: 593.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 86,
    iou: 0.0513824321017858,
    type: "symbol",
    rectangles: [{ left: 442.0, top: 597.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 87,
    iou: 0.167540792540792,
    type: "symbol",
    rectangles: [{ left: 430.0, top: 597.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 88,
    iou: 0.0946969696969701,
    type: "symbol",
    rectangles: [{ left: 425.0, top: 597.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 89,
    iou: 0.0643445892049986,
    type: "symbol",
    rectangles: [{ left: 421.0, top: 597.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 90,
    iou: 0.0125786163522004,
    type: "symbol",
    rectangles: [{ left: 393.0, top: 588.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 91,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 388.0, top: 586.0, width: 3.0, height: 3.0 },
      { left: 487.0, top: 566.0, width: 4.0, height: 5.0 },
      { left: 389.0, top: 588.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 92,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 351.0, top: 536.0, width: 3.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 93,
    iou: 0.255474452554746,
    type: "symbol",
    rectangles: [{ left: 342.0, top: 541.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 94,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 382.0, top: 536.0, width: 3.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 95,
    iou: 0.229132569558101,
    type: "symbol",
    rectangles: [{ left: 377.0, top: 541.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 96,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 400.0, top: 524.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 97,
    iou: 0.136849607982896,
    type: "symbol",
    rectangles: [{ left: 394.0, top: 528.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 98,
    iou: 0.0800915331807782,
    type: "symbol",
    rectangles: [{ left: 344.0, top: 503.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 99,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 339.0, top: 501.0, width: 3.0, height: 3.0 },
      { left: 340.0, top: 503.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 100,
    iou: 0.217785843920145,
    type: "symbol",
    rectangles: [{ left: 332.0, top: 505.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 101,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 431.0, top: 492.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 102,
    iou: 0.128843338213762,
    type: "symbol",
    rectangles: [{ left: 427.0, top: 495.0, width: 4.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 103,
    iou: 0.0464700625558539,
    type: "symbol",
    rectangles: [{ left: 372.0, top: 480.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 104,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 368.0, top: 480.0, width: 2.0, height: 1.0 },
      { left: 367.0, top: 478.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 105,
    iou: 0.126582278481013,
    type: "symbol",
    rectangles: [{ left: 362.0, top: 481.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 106,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 452.0, top: 480.0, width: 2.0, height: 1.0 },
      { left: 451.0, top: 478.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 107,
    iou: 0.232974910394265,
    type: "symbol",
    rectangles: [{ left: 446.0, top: 483.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 108,
    iou: 0.0663521085225598,
    type: "symbol",
    rectangles: [
      { left: 393.0, top: 374.0, width: 2.0, height: 1.0 },
      { left: 392.0, top: 372.0, width: 3.0, height: 3.0 },
      { left: 488.0, top: 342.0, width: 1.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 109,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 481.0, top: 345.0, width: 2.0, height: 1.0 },
      { left: 480.0, top: 343.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 110,
    iou: 0.181090354555852,
    type: "symbol",
    rectangles: [{ left: 475.0, top: 346.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 111,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 467.0, top: 345.0, width: 2.0, height: 1.0 },
      { left: 466.0, top: 343.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 112,
    iou: 0.174050632911391,
    type: "symbol",
    rectangles: [{ left: 461.0, top: 346.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 113,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 440.0, top: 345.0, width: 2.0, height: 1.0 },
      { left: 439.0, top: 343.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 114,
    iou: 0.0152183838076398,
    type: "symbol",
    rectangles: [{ left: 434.0, top: 346.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 115,
    iou: 0.0251256281407039,
    type: "symbol",
    rectangles: [
      { left: 471.0, top: 359.0, width: 2.0, height: 1.0 },
      { left: 470.0, top: 357.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 116,
    iou: 0.0216440506896939,
    type: "symbol",
    rectangles: [{ left: 465.0, top: 361.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 117,
    iou: 0.00990099009900931,
    type: "symbol",
    rectangles: [
      { left: 457.0, top: 357.0, width: 3.0, height: 3.0 },
      { left: 458.0, top: 359.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 118,
    iou: 0.206699346405228,
    type: "symbol",
    rectangles: [{ left: 452.0, top: 361.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 119,
    iou: 0.020256036298817,
    type: "symbol",
    rectangles: [{ left: 443.0, top: 359.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 120,
    iou: 0.0646997929606624,
    type: "symbol",
    rectangles: [{ left: 438.0, top: 357.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 121,
    iou: 0.0862663906142166,
    type: "symbol",
    rectangles: [{ left: 434.0, top: 359.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 122,
    iou: 0.0782299741602067,
    type: "symbol",
    rectangles: [{ left: 426.0, top: 363.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 123,
    iou: 0.0963673505639932,
    type: "symbol",
    rectangles: [{ left: 419.0, top: 363.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 124,
    iou: 0.10969568294409,
    type: "symbol",
    rectangles: [{ left: 411.0, top: 363.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 125,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 393.0, top: 357.0, width: 3.0, height: 3.0 },
      { left: 394.0, top: 359.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 126,
    iou: 0.0420388859695224,
    type: "symbol",
    rectangles: [{ left: 389.0, top: 361.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 127,
    iou: 0.0416666666666666,
    type: "symbol",
    rectangles: [
      { left: 470.0, top: 372.0, width: 3.0, height: 3.0 },
      { left: 471.0, top: 374.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 128,
    iou: 0.0422904508162057,
    type: "symbol",
    rectangles: [{ left: 465.0, top: 375.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 129,
    iou: 0.0696378830083563,
    type: "symbol",
    rectangles: [
      { left: 458.0, top: 374.0, width: 2.0, height: 1.0 },
      { left: 457.0, top: 372.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 130,
    iou: 0.162008634401274,
    type: "symbol",
    rectangles: [{ left: 452.0, top: 375.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 131,
    iou: 0.0126336248785226,
    type: "symbol",
    rectangles: [{ left: 443.0, top: 374.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 132,
    iou: 0.0411184210526316,
    type: "symbol",
    rectangles: [{ left: 437.0, top: 372.0, width: 6.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 133,
    iou: 0.0223517978620017,
    type: "symbol",
    rectangles: [{ left: 433.0, top: 374.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 134,
    iou: 0.115750310045472,
    type: "symbol",
    rectangles: [{ left: 425.0, top: 377.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 135,
    iou: 0.115750310045472,
    type: "symbol",
    rectangles: [{ left: 418.0, top: 377.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 136,
    iou: 0.075087993742667,
    type: "symbol",
    rectangles: [{ left: 409.0, top: 377.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 137,
    iou: 0.0663521085225598,
    type: "symbol",
    rectangles: [
      { left: 393.0, top: 374.0, width: 2.0, height: 1.0 },
      { left: 392.0, top: 372.0, width: 3.0, height: 3.0 },
      { left: 488.0, top: 342.0, width: 1.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 138,
    iou: 0.153186274509803,
    type: "symbol",
    rectangles: [{ left: 375.0, top: 307.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 139,
    iou: 0.198341146772447,
    type: "symbol",
    rectangles: [{ left: 370.0, top: 304.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 140,
    iou: 0.17759121730707,
    type: "symbol",
    rectangles: [{ left: 514.0, top: 286.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 141,
    iou: 0.131078224101478,
    type: "symbol",
    rectangles: [{ left: 498.0, top: 286.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 142,
    iou: 0.127758420441346,
    type: "symbol",
    rectangles: [{ left: 492.0, top: 286.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 143,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 483.0, top: 286.0, width: 1.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 144,
    iou: 0.0654138915318741,
    type: "symbol",
    rectangles: [{ left: 479.0, top: 288.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 145,
    iou: 0.11787157611136,
    type: "symbol",
    rectangles: [{ left: 474.0, top: 284.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 146,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 457.0, top: 282.0, width: 2.0, height: 1.0 },
      { left: 456.0, top: 280.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 147,
    iou: 0.0597490539733114,
    type: "symbol",
    rectangles: [{ left: 451.0, top: 284.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 148,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 448.0, top: 286.0, width: 1.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 149,
    iou: 0.0907770515613654,
    type: "symbol",
    rectangles: [{ left: 428.0, top: 288.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 150,
    iou: 0.043898156277437,
    type: "symbol",
    rectangles: [{ left: 424.0, top: 284.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 151,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 415.0, top: 282.0, width: 2.0, height: 1.0 },
      { left: 414.0, top: 280.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 152,
    iou: 0.045601945683016,
    type: "symbol",
    rectangles: [{ left: 409.0, top: 284.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 153,
    iou: 0.0691562932226827,
    type: "symbol",
    rectangles: [{ left: 399.0, top: 288.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 154,
    iou: 0.154854567800082,
    type: "symbol",
    rectangles: [{ left: 394.0, top: 284.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 155,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 385.0, top: 280.0, width: 3.0, height: 3.0 },
      { left: 386.0, top: 282.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 156,
    iou: 0.0391100295498003,
    type: "symbol",
    rectangles: [{ left: 380.0, top: 284.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 157,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 359.0, top: 282.0, width: 2.0, height: 1.0 },
      { left: 358.0, top: 280.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 158,
    iou: 0.0748863332441832,
    type: "symbol",
    rectangles: [{ left: 354.0, top: 284.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 159,
    iou: 0.0680827886710239,
    type: "symbol",
    rectangles: [{ left: 346.0, top: 267.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 160,
    iou: 0.0208055925432756,
    type: "symbol",
    rectangles: [{ left: 342.0, top: 263.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 161,
    iou: 0.0375939849624059,
    type: "symbol",
    rectangles: [{ left: 516.0, top: 264.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 162,
    iou: 0.148266423357662,
    type: "symbol",
    rectangles: [{ left: 499.0, top: 255.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 163,
    iou: 0.0993245927691697,
    type: "symbol",
    rectangles: [{ left: 494.0, top: 252.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 164,
    iou: 0.0852618757612674,
    type: "symbol",
    rectangles: [{ left: 560.0, top: 253.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 165,
    iou: 0.08414464534075,
    type: "symbol",
    rectangles: [
      { left: 450.0, top: 221.0, width: 5.0, height: 5.0 },
      { left: 481.0, top: 175.0, width: 2.0, height: 1.0 },
      { left: 480.0, top: 173.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 166,
    iou: 0.0645050609023838,
    type: "symbol",
    rectangles: [{ left: 475.0, top: 177.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 167,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 473.0, top: 175.0, width: 2.0, height: 1.0 },
      { left: 472.0, top: 173.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 168,
    iou: 0.188462700090607,
    type: "symbol",
    rectangles: [{ left: 466.0, top: 177.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 169,
    iou: 0.561167227833892,
    type: "symbol",
    rectangles: [{ left: 456.0, top: 165.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 170,
    iou: 0.165343915343915,
    type: "symbol",
    rectangles: [{ left: 434.0, top: 181.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 171,
    iou: 0.103668261562998,
    type: "symbol",
    rectangles: [{ left: 430.0, top: 177.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 172,
    iou: 0.0120292887029286,
    type: "symbol",
    rectangles: [{ left: 475.0, top: 189.0, width: 3.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 173,
    iou: 0.174071618037134,
    type: "symbol",
    rectangles: [{ left: 469.0, top: 193.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 174,
    iou: 0.00883652430044186,
    type: "symbol",
    rectangles: [{ left: 462.0, top: 195.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 175,
    iou: 0.0494071146245059,
    type: "symbol",
    rectangles: [
      { left: 457.0, top: 191.0, width: 2.0, height: 1.0 },
      { left: 456.0, top: 189.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 176,
    iou: 0.0906585436611546,
    type: "symbol",
    rectangles: [{ left: 452.0, top: 193.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 177,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 439.0, top: 193.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 178,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 434.0, top: 193.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 179,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 430.0, top: 193.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 180,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 423.0, top: 190.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 181,
    iou: 0.0261352499183276,
    type: "symbol",
    rectangles: [{ left: 467.0, top: 203.0, width: 3.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 182,
    iou: 0.114487926727726,
    type: "symbol",
    rectangles: [{ left: 461.0, top: 206.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 183,
    iou: 0.0181686046511617,
    type: "symbol",
    rectangles: [{ left: 454.0, top: 210.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 184,
    iou: 0.0118343195266265,
    type: "symbol",
    rectangles: [
      { left: 448.0, top: 203.0, width: 3.0, height: 3.0 },
      { left: 449.0, top: 205.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 185,
    iou: 0.128986866791743,
    type: "symbol",
    rectangles: [{ left: 443.0, top: 206.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 186,
    iou: 0.234946049425688,
    type: "symbol",
    rectangles: [{ left: 431.0, top: 206.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 187,
    iou: 0.14792899408284,
    type: "symbol",
    rectangles: [{ left: 426.0, top: 206.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 188,
    iou: 0.0790263948158685,
    type: "symbol",
    rectangles: [{ left: 421.0, top: 206.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 189,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 396.0, top: 198.0, width: 2.0, height: 1.0 },
      { left: 395.0, top: 196.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 190,
    iou: 0.231653076352853,
    type: "symbol",
    rectangles: [{ left: 390.0, top: 199.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 191,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 476.0, top: 217.0, width: 3.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 192,
    iou: 0.206942590120159,
    type: "symbol",
    rectangles: [{ left: 471.0, top: 223.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 193,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 455.0, top: 217.0, width: 3.0, height: 3.0 },
      { left: 456.0, top: 219.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 194,
    iou: 0.08414464534075,
    type: "symbol",
    rectangles: [
      { left: 450.0, top: 221.0, width: 5.0, height: 5.0 },
      { left: 481.0, top: 175.0, width: 2.0, height: 1.0 },
      { left: 480.0, top: 173.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 195,
    iou: 0.0853548966756514,
    type: "symbol",
    rectangles: [{ left: 337.0, top: 120.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 196,
    iou: 0.272903404373098,
    type: "symbol",
    rectangles: [{ left: 331.0, top: 119.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 197,
    iou: 0.0444983818770227,
    type: "symbol",
    rectangles: [{ left: 484.0, top: 120.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 198,
    iou: 0.157159487776484,
    type: "symbol",
    rectangles: [{ left: 475.0, top: 119.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 199,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 473.0, top: 81.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 200,
    iou: 0.0115172759138707,
    type: "symbol",
    rectangles: [{ left: 466.0, top: 89.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 201,
    iou: 0.0326894502228825,
    type: "symbol",
    rectangles: [{ left: 460.0, top: 87.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 202,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 449.0, top: 82.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 203,
    iou: 0.0115172759138707,
    type: "symbol",
    rectangles: [{ left: 442.0, top: 89.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 204,
    iou: 0.0339734121122599,
    type: "symbol",
    rectangles: [{ left: 432.0, top: 87.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 205,
    iou: 0.0115172759138707,
    type: "symbol",
    rectangles: [{ left: 412.0, top: 89.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 206,
    iou: 0.0269953051643191,
    type: "symbol",
    rectangles: [{ left: 402.0, top: 87.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 207,
    iou: 0.106496272630457,
    type: "symbol",
    rectangles: [
      { left: 250.0, top: 321.0, width: 3.0, height: 5.0 },
      { left: 215.0, top: 204.0, width: 4.0, height: 5.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 208,
    iou: 0.0721847930702598,
    type: "symbol",
    rectangles: [
      { left: 212.0, top: 204.0, width: 3.0, height: 5.0 },
      { left: 244.0, top: 318.0, width: 5.0, height: 7.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 209,
    iou: 0.111788617886178,
    type: "symbol",
    rectangles: [{ left: 228.0, top: 726.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 210,
    iou: 0.291173794358507,
    type: "symbol",
    rectangles: [{ left: 222.0, top: 724.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 211,
    iou: 0.158730158730156,
    type: "symbol",
    rectangles: [{ left: 296.0, top: 723.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 212,
    iou: 0.0951683748169847,
    type: "symbol",
    rectangles: [{ left: 115.0, top: 712.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 213,
    iou: 0.288108957569405,
    type: "symbol",
    rectangles: [{ left: 82.0, top: 712.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 214,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 141.0, top: 688.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 215,
    iou: 0.08,
    type: "symbol",
    rectangles: [{ left: 135.0, top: 687.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 216,
    iou: 0.130010834236185,
    type: "symbol",
    rectangles: [{ left: 239.0, top: 688.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 217,
    iou: 0.311601150527324,
    type: "symbol",
    rectangles: [{ left: 233.0, top: 687.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 218,
    iou: 0.539191213180224,
    type: "symbol",
    rectangles: [{ left: 68.0, top: 672.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 219,
    iou: 0.00450247636199883,
    type: "symbol",
    rectangles: [{ left: 206.0, top: 674.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 220,
    iou: 0.0492610837438417,
    type: "symbol",
    rectangles: [{ left: 200.0, top: 672.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 221,
    iou: 0.154519368723096,
    type: "symbol",
    rectangles: [
      { left: 273.0, top: 672.0, width: 8.0, height: 7.0 },
      { left: 174.0, top: 199.0, width: 4.0, height: 5.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 222,
    iou: 0.0113847444424473,
    type: "symbol",
    rectangles: [
      { left: 121.0, top: 639.0, width: 1.0, height: 1.0 },
      { left: 211.0, top: 623.0, width: 3.0, height: 5.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 223,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 211.0, top: 616.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 224,
    iou: 0.0566343042071204,
    type: "symbol",
    rectangles: [{ left: 205.0, top: 621.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 225,
    iou: 0.00719491683797439,
    type: "symbol",
    rectangles: [{ left: 197.0, top: 623.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 226,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 617.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 227,
    iou: 0.211640211640211,
    type: "symbol",
    rectangles: [{ left: 186.0, top: 621.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 228,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 177.0, top: 617.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 229,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 172.0, top: 615.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 230,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 168.0, top: 617.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 231,
    iou: 0.0755834204110071,
    type: "symbol",
    rectangles: [{ left: 160.0, top: 621.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 232,
    iou: 0.0755834204110071,
    type: "symbol",
    rectangles: [{ left: 153.0, top: 621.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 233,
    iou: 0.0632222977566285,
    type: "symbol",
    rectangles: [{ left: 145.0, top: 621.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 234,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 126.0, top: 617.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 235,
    iou: 0.0336538461538455,
    type: "symbol",
    rectangles: [{ left: 123.0, top: 623.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 236,
    iou: 0.0193348801237432,
    type: "symbol",
    rectangles: [{ left: 211.0, top: 641.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 237,
    iou: 0.0480584390618993,
    type: "symbol",
    rectangles: [{ left: 211.0, top: 635.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 238,
    iou: 0.0696055684454755,
    type: "symbol",
    rectangles: [{ left: 205.0, top: 639.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 239,
    iou: 0.00893084970655782,
    type: "symbol",
    rectangles: [{ left: 197.0, top: 641.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 240,
    iou: 0.0205721632915475,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 636.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 241,
    iou: 0.322580645161294,
    type: "symbol",
    rectangles: [{ left: 186.0, top: 639.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 242,
    iou: 0.0167832167832165,
    type: "symbol",
    rectangles: [{ left: 177.0, top: 636.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 243,
    iou: 0.032051282051282,
    type: "symbol",
    rectangles: [{ left: 171.0, top: 634.0, width: 6.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 244,
    iou: 0.0165517241379308,
    type: "symbol",
    rectangles: [{ left: 167.0, top: 636.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 245,
    iou: 0.0356506238859186,
    type: "symbol",
    rectangles: [{ left: 159.0, top: 639.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 246,
    iou: 0.0356506238859186,
    type: "symbol",
    rectangles: [{ left: 152.0, top: 639.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 247,
    iou: 0.0259157737353604,
    type: "symbol",
    rectangles: [{ left: 143.0, top: 639.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 248,
    iou: 0.0823045267489709,
    type: "symbol",
    rectangles: [{ left: 125.0, top: 636.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 249,
    iou: 0.00516795865633118,
    type: "symbol",
    rectangles: [{ left: 122.0, top: 641.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 250,
    iou: 0.0113847444424473,
    type: "symbol",
    rectangles: [
      { left: 121.0, top: 639.0, width: 1.0, height: 1.0 },
      { left: 211.0, top: 623.0, width: 3.0, height: 5.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 251,
    iou: 0.267015706806286,
    type: "symbol",
    rectangles: [{ left: 190.0, top: 592.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 252,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 198.0, top: 566.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 253,
    iou: 0.00178253119429577,
    type: "symbol",
    rectangles: [{ left: 195.0, top: 572.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 254,
    iou: 0.0709534368070946,
    type: "symbol",
    rectangles: [{ left: 189.0, top: 570.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 255,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 179.0, top: 566.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 256,
    iou: 0.0126198889449773,
    type: "symbol",
    rectangles: [{ left: 176.0, top: 572.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 257,
    iou: 0.0566636446056211,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 570.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 258,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 149.0, top: 566.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 259,
    iou: 0.0030926240915415,
    type: "symbol",
    rectangles: [{ left: 146.0, top: 572.0, width: 2.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 260,
    iou: 0.059859154929577,
    type: "symbol",
    rectangles: [{ left: 148.0, top: 482.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 261,
    iou: 0.0361570247933878,
    type: "symbol",
    rectangles: [{ left: 144.0, top: 478.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 262,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 174.0, top: 454.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 263,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 169.0, top: 455.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 264,
    iou: 0.0611620795107036,
    type: "symbol",
    rectangles: [{ left: 217.0, top: 432.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 265,
    iou: 0.135577372604021,
    type: "symbol",
    rectangles: [{ left: 213.0, top: 435.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 266,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 195.0, top: 432.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 267,
    iou: 0.00221336874723316,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 438.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 268,
    iou: 0.0237247924080661,
    type: "symbol",
    rectangles: [{ left: 186.0, top: 435.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 269,
    iou: 0.0161943319838057,
    type: "symbol",
    rectangles: [{ left: 181.0, top: 432.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 270,
    iou: 0.18018018018018,
    type: "symbol",
    rectangles: [{ left: 171.0, top: 435.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 271,
    iou: 0.07850525985241,
    type: "symbol",
    rectangles: [{ left: 161.0, top: 435.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 272,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 155.0, top: 433.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 273,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 433.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 274,
    iou: 0.0312793243665936,
    type: "symbol",
    rectangles: [{ left: 146.0, top: 434.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 275,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 128.0, top: 432.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 276,
    iou: 0.0925925925925925,
    type: "symbol",
    rectangles: [{ left: 125.0, top: 438.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 277,
    iou: 0.00799232736572891,
    type: "symbol",
    rectangles: [
      { left: 122.0, top: 429.0, width: 1.0, height: 1.0 },
      { left: 123.0, top: 432.0, width: 1.0, height: 2.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 278,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 88.0, top: 408.0, width: 2.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 279,
    iou: 0.27659574468085,
    type: "symbol",
    rectangles: [{ left: 78.0, top: 417.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 280,
    iou: 0.0256191289496155,
    type: "symbol",
    rectangles: [{ left: 118.0, top: 413.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 281,
    iou: 0.159607120933087,
    type: "symbol",
    rectangles: [{ left: 114.0, top: 417.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 282,
    iou: 0.066454013822435,
    type: "symbol",
    rectangles: [{ left: 270.0, top: 407.0, width: 2.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 283,
    iou: 0.0339640950994657,
    type: "symbol",
    rectangles: [{ left: 265.0, top: 402.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 284,
    iou: 0.00523971705527872,
    type: "symbol",
    rectangles: [
      { left: 263.0, top: 405.0, width: 2.0, height: 1.0 },
      { left: 263.0, top: 403.0, width: 1.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 285,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 130.0, top: 386.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 286,
    iou: 0.116713352007469,
    type: "symbol",
    rectangles: [{ left: 126.0, top: 395.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 287,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 123.0, top: 391.0, width: 3.0, height: 2.0 },
      { left: 123.0, top: 388.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 288,
    iou: 0.0899470899470893,
    type: "symbol",
    rectangles: [{ left: 292.0, top: 390.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 289,
    iou: 0.0949720670391055,
    type: "symbol",
    rectangles: [{ left: 288.0, top: 392.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 290,
    iou: 0.0301960784313721,
    type: "symbol",
    rectangles: [{ left: 215.0, top: 324.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 291,
    iou: 0.0298270033803934,
    type: "symbol",
    rectangles: [{ left: 210.0, top: 325.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 292,
    iou: 0.0954151177199502,
    type: "symbol",
    rectangles: [{ left: 203.0, top: 328.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 293,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 197.0, top: 328.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 294,
    iou: 0.0241109101868598,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 324.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 295,
    iou: 0.0481999404939008,
    type: "symbol",
    rectangles: [{ left: 187.0, top: 325.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 296,
    iou: 0.0736105999263892,
    type: "symbol",
    rectangles: [{ left: 175.0, top: 325.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 297,
    iou: 0.0276039749723958,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 325.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 298,
    iou: 0.0224761191234311,
    type: "symbol",
    rectangles: [{ left: 165.0, top: 325.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 299,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 159.0, top: 322.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 300,
    iou: 0.0724509183027234,
    type: "symbol",
    rectangles: [{ left: 207.0, top: 337.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 301,
    iou: 0.0391282813273901,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 339.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 302,
    iou: 0.0524620340543028,
    type: "symbol",
    rectangles: [{ left: 195.0, top: 342.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 303,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 189.0, top: 342.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 304,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 184.0, top: 337.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 305,
    iou: 0.0238770685579197,
    type: "symbol",
    rectangles: [{ left: 179.0, top: 339.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 306,
    iou: 0.0640836044562752,
    type: "symbol",
    rectangles: [{ left: 167.0, top: 339.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 307,
    iou: 0.0295643861805271,
    type: "symbol",
    rectangles: [{ left: 161.0, top: 339.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 308,
    iou: 0.0395215808632346,
    type: "symbol",
    rectangles: [{ left: 157.0, top: 339.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 309,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 129.0, top: 330.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 310,
    iou: 0.0874769797421735,
    type: "symbol",
    rectangles: [{ left: 126.0, top: 336.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 311,
    iou: 0.0836267605633806,
    type: "symbol",
    rectangles: [{ left: 123.0, top: 334.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 312,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 201.0, top: 285.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 313,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 197.0, top: 290.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 314,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 191.0, top: 288.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 315,
    iou: 0.0170394036208735,
    type: "symbol",
    rectangles: [{ left: 186.0, top: 285.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 316,
    iou: 0.087719298245614,
    type: "symbol",
    rectangles: [{ left: 183.0, top: 290.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 317,
    iou: 0.0709736123748862,
    type: "symbol",
    rectangles: [{ left: 177.0, top: 288.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 318,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 169.0, top: 271.0, width: 1.0, height: 1.0 },
      { left: 169.0, top: 273.0, width: 1.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 319,
    iou: 0.100644122383252,
    type: "symbol",
    rectangles: [{ left: 144.0, top: 290.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 320,
    iou: 0.0307219662058368,
    type: "symbol",
    rectangles: [{ left: 143.0, top: 285.0, width: 2.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 321,
    iou: 0.0472411186696901,
    type: "symbol",
    rectangles: [{ left: 201.0, top: 228.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 322,
    iou: 0.15267175572519,
    type: "symbol",
    rectangles: [{ left: 191.0, top: 226.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 323,
    iou: 0.0260416666666666,
    type: "symbol",
    rectangles: [{ left: 255.0, top: 225.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 324,
    iou: 0.48076923076923,
    type: "symbol",
    rectangles: [{ left: 49.0, top: 214.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 325,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 144.0, top: 209.0, width: 2.0, height: 3.0 },
      { left: 145.0, top: 211.0, width: 1.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 326,
    iou: 0.278330019880715,
    type: "symbol",
    rectangles: [{ left: 139.0, top: 214.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 327,
    iou: 0.123421092679957,
    type: "symbol",
    rectangles: [{ left: 218.0, top: 214.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 328,
    iou: 0.25,
    type: "symbol",
    rectangles: [{ left: 184.0, top: 214.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 329,
    iou: 0.375579598145286,
    type: "symbol",
    rectangles: [{ left: 87.0, top: 203.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 330,
    iou: 0.154519368723096,
    type: "symbol",
    rectangles: [
      { left: 273.0, top: 672.0, width: 8.0, height: 7.0 },
      { left: 174.0, top: 199.0, width: 4.0, height: 5.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 331,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 169.0, top: 199.0, width: 2.0, height: 1.0 },
      { left: 168.0, top: 197.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 332,
    iou: 0.103129131776112,
    type: "symbol",
    rectangles: [{ left: 163.0, top: 201.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 333,
    iou: 0.0804469273743019,
    type: "symbol",
    rectangles: [{ left: 184.0, top: 134.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 334,
    iou: 0.0405740155462545,
    type: "symbol",
    rectangles: [{ left: 175.0, top: 132.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 335,
    iou: 0.0385208012326656,
    type: "symbol",
    rectangles: [{ left: 169.0, top: 130.0, width: 6.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 336,
    iou: 0.0599212463619243,
    type: "symbol",
    rectangles: [{ left: 165.0, top: 132.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 337,
    iou: 0.0508860858972845,
    type: "symbol",
    rectangles: [{ left: 157.0, top: 136.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 338,
    iou: 0.0508860858972846,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 136.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 339,
    iou: 0.0476301566934949,
    type: "symbol",
    rectangles: [{ left: 141.0, top: 136.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 340,
    iou: 0.036659877800407,
    type: "symbol",
    rectangles: [{ left: 123.0, top: 132.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 341,
    iou: 0.0490196078431373,
    type: "symbol",
    rectangles: [
      { left: 119.0, top: 132.0, width: 2.0, height: 1.0 },
      { left: 118.0, top: 130.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 342,
    iou: 0.0405076964623279,
    type: "symbol",
    rectangles: [{ left: 113.0, top: 134.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 343,
    iou: 0.0669856459330129,
    type: "symbol",
    rectangles: [{ left: 381.0, top: 590.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 344,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 483.0, top: 608.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 345,
    iou: 0.0218480915049478,
    type: "symbol",
    rectangles: [{ left: 479.0, top: 613.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 346,
    iou: 0.00572810590631352,
    type: "symbol",
    rectangles: [{ left: 462.0, top: 610.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 347,
    iou: 0.0172278778386845,
    type: "symbol",
    rectangles: [
      { left: 457.0, top: 610.0, width: 2.0, height: 1.0 },
      { left: 456.0, top: 608.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 348,
    iou: 0.0111539564677011,
    type: "symbol",
    rectangles: [{ left: 451.0, top: 611.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 349,
    iou: 0.058635394456291,
    type: "symbol",
    rectangles: [{ left: 446.0, top: 608.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 350,
    iou: 0.0491187518058363,
    type: "symbol",
    rectangles: [{ left: 436.0, top: 613.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 351,
    iou: 0.0273057277779561,
    type: "symbol",
    rectangles: [{ left: 426.0, top: 613.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 352,
    iou: 0.0111539564677011,
    type: "symbol",
    rectangles: [{ left: 420.0, top: 611.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 353,
    iou: 0.0111539564677011,
    type: "symbol",
    rectangles: [{ left: 415.0, top: 611.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 354,
    iou: 0.0153727901614142,
    type: "symbol",
    rectangles: [{ left: 411.0, top: 612.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 355,
    iou: 0.00572810590631352,
    type: "symbol",
    rectangles: [{ left: 393.0, top: 610.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 356,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 389.0, top: 610.0, width: 2.0, height: 1.0 },
      { left: 388.0, top: 608.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 357,
    iou: 0.00893883284382571,
    type: "symbol",
    rectangles: [{ left: 383.0, top: 611.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 358,
    iou: 0.0365205843293491,
    type: "symbol",
    rectangles: [{ left: 387.0, top: 375.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 359,
    iou: 0.0842787682333893,
    type: "symbol",
    rectangles: [{ left: 447.0, top: 217.0, width: 3.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 360,
    iou: 0.296096904441453,
    type: "symbol",
    rectangles: [{ left: 436.0, top: 223.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 361,
    iou: 0.116880948405409,
    type: "symbol",
    rectangles: [{ left: 426.0, top: 223.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 362,
    iou: 0.0320564192979643,
    type: "symbol",
    rectangles: [{ left: 420.0, top: 221.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 363,
    iou: 0.0320564192979643,
    type: "symbol",
    rectangles: [{ left: 415.0, top: 221.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 364,
    iou: 0.0594648166501486,
    type: "symbol",
    rectangles: [{ left: 411.0, top: 222.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 365,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 396.0, top: 219.0, width: 2.0, height: 1.0 },
      { left: 395.0, top: 217.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 366,
    iou: 0.167992926613617,
    type: "symbol",
    rectangles: [{ left: 391.0, top: 221.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 0,
    iou: 0.0416171224732454,
    type: "symbol",
    rectangles: [{ left: 287.0, top: 446.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 1,
    iou: 0.138312586445366,
    type: "symbol",
    rectangles: [{ left: 341.0, top: 447.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 2,
    iou: 0.333333333333334,
    type: "symbol",
    rectangles: [{ left: 145.0, top: 435.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 3,
    iou: 0.257142857142859,
    type: "symbol",
    rectangles: [{ left: 515.0, top: 433.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 4,
    iou: 0.213675213675213,
    type: "symbol",
    rectangles: [{ left: 399.0, top: 402.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 5,
    iou: 0.2020202020202,
    type: "symbol",
    rectangles: [{ left: 394.0, top: 399.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 6,
    iou: 0.115577889447236,
    type: "symbol",
    rectangles: [{ left: 470.0, top: 400.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 7,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 154.0, top: 384.0, width: 3.0, height: 3.0 },
      { left: 155.0, top: 386.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 8,
    iou: 0.128402670775552,
    type: "symbol",
    rectangles: [{ left: 149.0, top: 387.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 9,
    iou: 0.459016393442622,
    type: "symbol",
    rectangles: [{ left: 227.0, top: 389.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 10,
    iou: 0.255972696245734,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 389.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 11,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 217.0, top: 274.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 12,
    iou: 0.319361277445108,
    type: "symbol",
    rectangles: [{ left: 213.0, top: 279.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 13,
    iou: 0.0994530084535055,
    type: "symbol",
    rectangles: [{ left: 197.0, top: 281.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 14,
    iou: 0.100626118067979,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 277.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 15,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 188.0, top: 274.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 16,
    iou: 0.172711571675301,
    type: "symbol",
    rectangles: [{ left: 178.0, top: 279.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 17,
    iou: 0.0301718117055451,
    type: "symbol",
    rectangles: [{ left: 168.0, top: 277.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 18,
    iou: 0.0424028268551232,
    type: "symbol",
    rectangles: [{ left: 163.0, top: 277.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 19,
    iou: 0.0660247592847311,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 277.0, width: 8.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 20,
    iou: 0.0636758321273513,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 278.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 21,
    iou: 0.0424028268551232,
    type: "symbol",
    rectangles: [{ left: 145.0, top: 277.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 22,
    iou: 0.0259179265658744,
    type: "symbol",
    rectangles: [{ left: 142.0, top: 277.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 23,
    iou: 0.113224637681159,
    type: "symbol",
    rectangles: [{ left: 125.0, top: 281.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 24,
    iou: 0.127963362068965,
    type: "symbol",
    rectangles: [{ left: 120.0, top: 277.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 25,
    iou: 0.676229508196722,
    type: "symbol",
    rectangles: [{ left: 161.0, top: 251.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 26,
    iou: 0.198412698412698,
    type: "symbol",
    rectangles: [{ left: 229.0, top: 241.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 27,
    iou: 0.148401826484017,
    type: "symbol",
    rectangles: [{ left: 224.0, top: 237.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 28,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 223.0, top: 155.0, width: 4.0, height: 5.0 },
      { left: 169.0, top: 190.0, width: 6.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 29,
    iou: 0.253726609578179,
    type: "symbol",
    rectangles: [{ left: 217.0, top: 159.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 30,
    iou: 0.00224089635854348,
    type: "symbol",
    rectangles: [{ left: 208.0, top: 155.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 31,
    iou: 0.192458521870287,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 159.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 32,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 182.0, top: 161.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 33,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 177.0, top: 155.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 34,
    iou: 0.17361111111111,
    type: "symbol",
    rectangles: [{ left: 172.0, top: 159.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 35,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 223.0, top: 179.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 36,
    iou: 0.0131362889983581,
    type: "symbol",
    rectangles: [{ left: 208.0, top: 174.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 37,
    iou: 0.124570446735395,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 177.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 38,
    iou: 0.0505458956732712,
    type: "symbol",
    rectangles: [{ left: 194.0, top: 179.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 39,
    iou: 0.0542005420054202,
    type: "symbol",
    rectangles: [{ left: 189.0, top: 174.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 40,
    iou: 0.102491103202847,
    type: "symbol",
    rectangles: [{ left: 184.0, top: 177.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 41,
    iou: 0.00181653042688454,
    type: "symbol",
    rectangles: [{ left: 175.0, top: 174.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 42,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 172.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 43,
    iou: 0.00181653042688454,
    type: "symbol",
    rectangles: [{ left: 166.0, top: 174.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 44,
    iou: 0.100046104195481,
    type: "symbol",
    rectangles: [{ left: 158.0, top: 177.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 45,
    iou: 0.100046104195481,
    type: "symbol",
    rectangles: [{ left: 151.0, top: 177.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 46,
    iou: 0.110704147971797,
    type: "symbol",
    rectangles: [{ left: 142.0, top: 177.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 47,
    iou: 0.0377358490566039,
    type: "symbol",
    rectangles: [{ left: 126.0, top: 179.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 48,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 121.0, top: 174.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 49,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 223.0, top: 198.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 50,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 208.0, top: 192.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 51,
    iou: 0.0976944118796405,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 195.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 52,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 194.0, top: 198.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 53,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 189.0, top: 192.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 54,
    iou: 0.0798371947401379,
    type: "symbol",
    rectangles: [{ left: 184.0, top: 195.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 55,
    iou: 0.00193012931866423,
    type: "symbol",
    rectangles: [{ left: 175.0, top: 192.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 56,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 223.0, top: 155.0, width: 4.0, height: 5.0 },
      { left: 169.0, top: 190.0, width: 6.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 57,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 111.0, top: 139.0, width: 1.0, height: 1.0 },
      { left: 111.0, top: 141.0, width: 1.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 58,
    iou: 0.0579878225572627,
    type: "symbol",
    rectangles: [{ left: 106.0, top: 140.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 59,
    iou: 0.0316957210776544,
    type: "symbol",
    rectangles: [{ left: 88.0, top: 143.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 60,
    iou: 0.209459459459459,
    type: "symbol",
    rectangles: [{ left: 78.0, top: 142.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 61,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 217.0, top: 101.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 62,
    iou: 0.128376571275742,
    type: "symbol",
    rectangles: [{ left: 213.0, top: 107.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 63,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 197.0, top: 109.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 64,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 103.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 65,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 186.0, top: 107.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 66,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 181.0, top: 101.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 67,
    iou: 0.164835164835164,
    type: "symbol",
    rectangles: [{ left: 172.0, top: 107.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 68,
    iou: 0.0506230529595014,
    type: "symbol",
    rectangles: [{ left: 161.0, top: 105.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 69,
    iou: 0.0537459283387621,
    type: "symbol",
    rectangles: [{ left: 158.0, top: 107.0, width: 2.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 70,
    iou: 0.0408805031446539,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 105.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 71,
    iou: 0.192893401015228,
    type: "symbol",
    rectangles: [{ left: 147.0, top: 107.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 72,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 128.0, top: 103.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 73,
    iou: 0.0625434329395412,
    type: "symbol",
    rectangles: [{ left: 125.0, top: 109.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 74,
    iou: 0.0178491744756804,
    type: "symbol",
    rectangles: [{ left: 123.0, top: 105.0, width: 2.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 75,
    iou: 0.473491773308955,
    type: "symbol",
    rectangles: [{ left: 312.0, top: 296.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 76,
    iou: 0.479233226837061,
    type: "symbol",
    rectangles: [{ left: 422.0, top: 296.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 77,
    iou: 0.184501845018446,
    type: "symbol",
    rectangles: [{ left: 515.0, top: 286.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 78,
    iou: 0.0552626440148398,
    type: "symbol",
    rectangles: [{ left: 510.0, top: 282.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 79,
    iou: 0.487804878048776,
    type: "symbol",
    rectangles: [{ left: 524.0, top: 284.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 80,
    iou: 0.123203285420945,
    type: "symbol",
    rectangles: [{ left: 507.0, top: 274.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 81,
    iou: 0.143634714242516,
    type: "symbol",
    rectangles: [{ left: 502.0, top: 271.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 82,
    iou: 0.454138702460851,
    type: "symbol",
    rectangles: [{ left: 333.0, top: 261.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 83,
    iou: 0.165343915343915,
    type: "symbol",
    rectangles: [{ left: 452.0, top: 251.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 84,
    iou: 0.200534759358288,
    type: "symbol",
    rectangles: [{ left: 447.0, top: 248.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 85,
    iou: 0.126262626262626,
    type: "symbol",
    rectangles: [{ left: 558.0, top: 251.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 86,
    iou: 0.150853038012569,
    type: "symbol",
    rectangles: [{ left: 553.0, top: 248.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 87,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 541.0, top: 165.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 88,
    iou: 0.156641604010025,
    type: "symbol",
    rectangles: [{ left: 521.0, top: 173.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 89,
    iou: 0.110334681868334,
    type: "symbol",
    rectangles: [{ left: 516.0, top: 169.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 90,
    iou: 0.115597212208603,
    type: "symbol",
    rectangles: [{ left: 505.0, top: 171.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 91,
    iou: 0.269295021717338,
    type: "symbol",
    rectangles: [{ left: 493.0, top: 171.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 92,
    iou: 0.128654970760232,
    type: "symbol",
    rectangles: [{ left: 467.0, top: 169.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 93,
    iou: 0.0771406531241965,
    type: "symbol",
    rectangles: [{ left: 462.0, top: 169.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 94,
    iou: 0.133000831255195,
    type: "symbol",
    rectangles: [{ left: 459.0, top: 171.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 95,
    iou: 0.196581196581196,
    type: "symbol",
    rectangles: [{ left: 449.0, top: 171.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 96,
    iou: 0.0974025974025981,
    type: "symbol",
    rectangles: [{ left: 423.0, top: 173.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 97,
    iou: 0.221327967806841,
    type: "symbol",
    rectangles: [{ left: 418.0, top: 169.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 98,
    iou: 0.357779300891024,
    type: "symbol",
    rectangles: [{ left: 407.0, top: 171.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 99,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 401.0, top: 169.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 100,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 396.0, top: 169.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 101,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 393.0, top: 171.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 102,
    iou: 0.30554283096656,
    type: "symbol",
    rectangles: [{ left: 382.0, top: 171.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 103,
    iou: 0.41570438799076,
    type: "symbol",
    rectangles: [{ left: 366.0, top: 163.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 104,
    iou: 0.0663288807001386,
    type: "symbol",
    rectangles: [{ left: 372.0, top: 169.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 105,
    iou: 0.134803921568627,
    type: "symbol",
    rectangles: [{ left: 367.0, top: 169.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 106,
    iou: 0.0761126639432382,
    type: "symbol",
    rectangles: [{ left: 358.0, top: 169.0, width: 8.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 107,
    iou: 0.634632819582958,
    type: "symbol",
    rectangles: [{ left: 344.0, top: 163.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 108,
    iou: 0.13310185185185,
    type: "symbol",
    rectangles: [{ left: 350.0, top: 169.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 109,
    iou: 0.17555266579974,
    type: "symbol",
    rectangles: [{ left: 347.0, top: 171.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 110,
    iou: 0.217806648834544,
    type: "symbol",
    rectangles: [{ left: 338.0, top: 169.0, width: 8.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 111,
    iou: 0.0669099756690994,
    type: "symbol",
    rectangles: [{ left: 318.0, top: 171.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 112,
    iou: 0.34875272463066,
    type: "symbol",
    rectangles: [{ left: 457.0, top: 136.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 113,
    iou: 0.486842105263157,
    type: "symbol",
    rectangles: [{ left: 441.0, top: 89.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 114,
    iou: 0.10115606936416,
    type: "symbol",
    rectangles: [{ left: 466.0, top: 80.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 115,
    iou: 0.19060773480663,
    type: "symbol",
    rectangles: [{ left: 461.0, top: 76.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 116,
    iou: 0.130208333333333,
    type: "symbol",
    rectangles: [{ left: 350.0, top: 68.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 117,
    iou: 0.0685975609756096,
    type: "symbol",
    rectangles: [{ left: 345.0, top: 64.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 118,
    iou: 0.0789711191335727,
    type: "symbol",
    rectangles: [{ left: 421.0, top: 68.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 119,
    iou: 0.234942332336609,
    type: "symbol",
    rectangles: [{ left: 416.0, top: 64.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 120,
    iou: 0.106564364876385,
    type: "symbol",
    rectangles: [{ left: 487.0, top: 68.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 121,
    iou: 0.121204388874712,
    type: "symbol",
    rectangles: [{ left: 482.0, top: 64.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 122,
    iou: 0.186011904761904,
    type: "symbol",
    rectangles: [{ left: 459.0, top: 68.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 123,
    iou: 0.157825515124945,
    type: "symbol",
    rectangles: [{ left: 454.0, top: 64.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 124,
    iou: 0.0869221651521133,
    type: "symbol",
    rectangles: [{ left: 446.0, top: 68.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 125,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 441.0, top: 64.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 126,
    iou: 0.381341504937009,
    type: "symbol",
    rectangles: [{ left: 430.0, top: 66.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 127,
    iou: 0.549456832475705,
    type: "symbol",
    rectangles: [{ left: 355.0, top: 55.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 128,
    iou: 0.0212314225053077,
    type: "symbol",
    rectangles: [{ left: 169.0, top: 192.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 129,
    iou: 0.106403844267921,
    type: "symbol",
    rectangles: [{ left: 161.0, top: 195.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 130,
    iou: 0.106403844267921,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 195.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 131,
    iou: 0.12107010349541,
    type: "symbol",
    rectangles: [{ left: 145.0, top: 195.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 132,
    iou: 0.0394570707070706,
    type: "symbol",
    rectangles: [{ left: 128.0, top: 198.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 133,
    iou: 0.0925925925925925,
    type: "symbol",
    rectangles: [{ left: 123.0, top: 192.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 134,
    iou: 0.048291000313578,
    type: "symbol",
    rectangles: [{ left: 120.0, top: 195.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 0,
    iou: 0.317440401505647,
    type: "citation",
    rectangles: [{ left: 375.0, top: 333.0, width: 126.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 1,
    iou: 0.238866396761132,
    type: "citation",
    rectangles: [{ left: 392.0, top: 89.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 0,
    iou: 0.615514333895448,
    type: "citation",
    rectangles: [{ left: 379.0, top: 66.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 1,
    iou: 0.426229508196721,
    type: "citation",
    rectangles: [{ left: 548.0, top: 55.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 2,
    iou: 0.717299578059072,
    type: "citation",
    rectangles: [{ left: 412.0, top: 453.0, width: 13.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 3,
    iou: 0.716236722306526,
    type: "citation",
    rectangles: [{ left: 111.0, top: 713.0, width: 39.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 4,
    iou: 0.529813111836251,
    type: "citation",
    rectangles: [{ left: 59.0, top: 655.0, width: 10.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 5,
    iou: 0.376890652120012,
    type: "citation",
    rectangles: [{ left: 154.0, top: 655.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 6,
    iou: 0.447487644151568,
    type: "citation",
    rectangles: [{ left: 230.0, top: 655.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 7,
    iou: 0.537102473498237,
    type: "citation",
    rectangles: [{ left: 75.0, top: 643.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 8,
    iou: 0.378142530646166,
    type: "citation",
    rectangles: [{ left: 289.0, top: 643.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 9,
    iou: 0.45060658578856,
    type: "citation",
    rectangles: [{ left: 284.0, top: 207.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 10,
    iou: 0.00551146384479717,
    type: "citation",
    rectangles: [{ left: 123.0, top: 118.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 11,
    iou: 0.152788388082505,
    type: "citation",
    rectangles: [{ left: 115.0, top: 107.0, width: 10.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 12,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 123.0, top: 101.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 13,
    iou: 0.0196599362380445,
    type: "citation",
    rectangles: [{ left: 107.0, top: 89.0, width: 1.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 14,
    iou: 0.446204620462046,
    type: "citation",
    rectangles: [{ left: 97.0, top: 81.0, width: 11.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 15,
    iou: 0.0995024875621893,
    type: "citation",
    rectangles: [{ left: 115.0, top: 72.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 16,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 312.0, top: 620.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 17,
    iou: 0.451256897608826,
    type: "citation",
    rectangles: [{ left: 522.0, top: 568.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 18,
    iou: 0.241652397260273,
    type: "citation",
    rectangles: [{ left: 402.0, top: 472.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 19,
    iou: 0.633466135458169,
    type: "citation",
    rectangles: [{ left: 401.0, top: 463.0, width: 12.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 20,
    iou: 0.717299578059072,
    type: "citation",
    rectangles: [{ left: 412.0, top: 453.0, width: 13.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 21,
    iou: 0.850599781897492,
    type: "citation",
    rectangles: [{ left: 409.0, top: 444.0, width: 12.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 22,
    iou: 0.473684210526315,
    type: "citation",
    rectangles: [{ left: 399.0, top: 435.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 23,
    iou: 0.390699695784441,
    type: "citation",
    rectangles: [{ left: 400.0, top: 425.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 24,
    iou: 0.31637168141593,
    type: "citation",
    rectangles: [{ left: 401.0, top: 416.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 25,
    iou: 0.613839285714287,
    type: "citation",
    rectangles: [{ left: 374.0, top: 361.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 26,
    iou: 0.509188361408881,
    type: "citation",
    rectangles: [{ left: 472.0, top: 193.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 27,
    iou: 0.463949843260191,
    type: "citation",
    rectangles: [{ left: 553.0, top: 170.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 28,
    iou: 0.408376963350784,
    type: "citation",
    rectangles: [{ left: 315.0, top: 147.0, width: 10.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 29,
    iou: 0.484504132231406,
    type: "citation",
    rectangles: [{ left: 370.0, top: 78.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 30,
    iou: 0.850599781897492,
    type: "citation",
    rectangles: [{ left: 409.0, top: 444.0, width: 12.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 0,
    iou: 0.37738246505718,
    type: "citation",
    rectangles: [{ left: 123.0, top: 355.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 1,
    iou: 0.572668112798267,
    type: "citation",
    rectangles: [{ left: 140.0, top: 346.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 2,
    iou: 0.021021021021021,
    type: "citation",
    rectangles: [{ left: 129.0, top: 337.0, width: 1.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 3,
    iou: 0.162359697206995,
    type: "citation",
    rectangles: [{ left: 123.0, top: 328.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 4,
    iou: 0.205333333333333,
    type: "citation",
    rectangles: [{ left: 118.0, top: 327.0, width: 11.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 5,
    iou: 0.506533914125697,
    type: "citation",
    rectangles: [{ left: 102.0, top: 257.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 6,
    iou: 0.0123660346248968,
    type: "citation",
    rectangles: [{ left: 116.0, top: 166.0, width: 7.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 7,
    iou: 0.0972222222222222,
    type: "citation",
    rectangles: [{ left: 125.0, top: 157.0, width: 7.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 8,
    iou: 0.0411301859799713,
    type: "citation",
    rectangles: [{ left: 123.0, top: 148.0, width: 7.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 9,
    iou: 0.00901875901875901,
    type: "citation",
    rectangles: [{ left: 131.0, top: 139.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 10,
    iou: 0.0335683115139308,
    type: "citation",
    rectangles: [{ left: 126.0, top: 130.0, width: 8.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 11,
    iou: 0.112047997405545,
    type: "citation",
    rectangles: [{ left: 131.0, top: 125.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 12,
    iou: 0.245983935742971,
    type: "citation",
    rectangles: [{ left: 124.0, top: 117.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 13,
    iou: 0.395080023710728,
    type: "citation",
    rectangles: [{ left: 139.0, top: 108.0, width: 9.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 14,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 122.0, top: 85.0, width: 8.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 15,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 142.0, top: 74.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 16,
    iou: 0.163098878695209,
    type: "citation",
    rectangles: [{ left: 138.0, top: 81.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 17,
    iou: 0.314007617435463,
    type: "citation",
    rectangles: [{ left: 317.0, top: 736.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 18,
    iou: 0.379310344827582,
    type: "citation",
    rectangles: [{ left: 381.0, top: 736.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 19,
    iou: 0.602026049204049,
    type: "citation",
    rectangles: [{ left: 454.0, top: 736.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 20,
    iou: 0.545567265964039,
    type: "citation",
    rectangles: [{ left: 525.0, top: 736.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 21,
    iou: 0.426829268292682,
    type: "citation",
    rectangles: [{ left: 433.0, top: 724.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 22,
    iou: 0.286362109506217,
    type: "citation",
    rectangles: [{ left: 415.0, top: 713.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 23,
    iou: 0.639344262295074,
    type: "citation",
    rectangles: [{ left: 534.0, top: 643.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 24,
    iou: 0.371411363180081,
    type: "citation",
    rectangles: [{ left: 389.0, top: 632.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 25,
    iou: 0.596774193548384,
    type: "citation",
    rectangles: [{ left: 312.0, top: 620.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 26,
    iou: 0.37738246505718,
    type: "citation",
    rectangles: [{ left: 123.0, top: 355.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 27,
    iou: 0.420468557336622,
    type: "citation",
    rectangles: [{ left: 83.0, top: 732.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 28,
    iou: 0.00401445202729831,
    type: "citation",
    rectangles: [{ left: 119.0, top: 641.0, width: 5.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 29,
    iou: 0.247747747747746,
    type: "citation",
    rectangles: [{ left: 127.0, top: 636.0, width: 10.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 30,
    iou: 0.826271186440671,
    type: "citation",
    rectangles: [{ left: 123.0, top: 628.0, width: 12.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 31,
    iou: 0.647101980924435,
    type: "citation",
    rectangles: [{ left: 126.0, top: 619.0, width: 13.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 32,
    iou: 0.379921627169244,
    type: "citation",
    rectangles: [{ left: 125.0, top: 610.0, width: 12.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 33,
    iou: 0.366540563261876,
    type: "citation",
    rectangles: [{ left: 127.0, top: 601.0, width: 11.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 34,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 132.0, top: 592.0, width: 1.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 35,
    iou: 0.458963282937361,
    type: "citation",
    rectangles: [{ left: 119.0, top: 574.0, width: 10.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 36,
    iou: 0.152682255845939,
    type: "citation",
    rectangles: [{ left: 119.0, top: 564.0, width: 11.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 37,
    iou: 0.252032520325204,
    type: "citation",
    rectangles: [{ left: 133.0, top: 556.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 38,
    iou: 0.112,
    type: "citation",
    rectangles: [{ left: 139.0, top: 555.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 39,
    iou: 0.138248847926266,
    type: "citation",
    rectangles: [{ left: 99.0, top: 495.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 40,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 289.0, top: 495.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 41,
    iou: 0.594821553533942,
    type: "citation",
    rectangles: [{ left: 125.0, top: 400.0, width: 10.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 42,
    iou: 0.469924812030075,
    type: "citation",
    rectangles: [{ left: 123.0, top: 391.0, width: 10.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 43,
    iou: 0.216379799508228,
    type: "citation",
    rectangles: [{ left: 129.0, top: 382.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 44,
    iou: 0.172955974842767,
    type: "citation",
    rectangles: [{ left: 125.0, top: 373.0, width: 11.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 0,
    iou: 0.574916759156493,
    type: "citation",
    rectangles: [{ left: 284.0, top: 159.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 1,
    iou: 0.565217391304347,
    type: "citation",
    rectangles: [{ left: 203.0, top: 66.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 2,
    iou: 0.366115251772405,
    type: "citation",
    rectangles: [{ left: 254.0, top: 55.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 3,
    iou: 0.633783783783781,
    type: "citation",
    rectangles: [{ left: 328.0, top: 736.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 4,
    iou: 0.462406015037599,
    type: "citation",
    rectangles: [{ left: 393.0, top: 655.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 5,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 465.0, top: 450.0, width: 8.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 6,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 442.0, top: 441.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 7,
    iou: 0.0427480916030536,
    type: "citation",
    rectangles: [{ left: 431.0, top: 436.0, width: 1.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 8,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 447.0, top: 251.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 9,
    iou: 0.085653104925053,
    type: "citation",
    rectangles: [{ left: 417.0, top: 245.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 10,
    iou: 0.585274662064999,
    type: "citation",
    rectangles: [{ left: 396.0, top: 237.0, width: 11.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 0,
    iou: 0.62240663900415,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 699.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 1,
    iou: 0.0763025942882047,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 687.0, width: 5.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 2,
    iou: 0.286298568507163,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 678.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 3,
    iou: 0.120248538011699,
    type: "symbol",
    rectangles: [{ left: 178.0, top: 669.0, width: 5.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 4,
    iou: 0.565602836879442,
    type: "symbol",
    rectangles: [{ left: 162.0, top: 671.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 5,
    iou: 0.205164992826396,
    type: "symbol",
    rectangles: [{ left: 178.0, top: 659.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 6,
    iou: 0.522231204527072,
    type: "symbol",
    rectangles: [{ left: 163.0, top: 661.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 7,
    iou: 0.454545454545451,
    type: "symbol",
    rectangles: [{ left: 178.0, top: 650.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 8,
    iou: 0.505050505050503,
    type: "symbol",
    rectangles: [{ left: 162.0, top: 650.0, width: 5.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 9,
    iou: 0.493562231759658,
    type: "symbol",
    rectangles: [{ left: 186.0, top: 640.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 10,
    iou: 0.429894996911669,
    type: "symbol",
    rectangles: [{ left: 171.0, top: 642.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 11,
    iou: 0.295746785361031,
    type: "symbol",
    rectangles: [{ left: 155.0, top: 640.0, width: 5.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 12,
    iou: 0.333179510844489,
    type: "symbol",
    rectangles: [{ left: 263.0, top: 601.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 13,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 231.0, top: 517.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 14,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 224.0, top: 517.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 15,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 216.0, top: 517.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 16,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 211.0, top: 518.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 17,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 203.0, top: 517.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 18,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 195.0, top: 517.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 19,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 187.0, top: 517.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 20,
    iou: 0.252729478366357,
    type: "symbol",
    rectangles: [{ left: 116.0, top: 457.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 21,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 96.0, top: 459.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 22,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 89.0, top: 459.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 23,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 81.0, top: 459.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 24,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 72.0, top: 460.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 25,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 65.0, top: 459.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 26,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 56.0, top: 459.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 27,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 48.0, top: 459.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 28,
    iou: 0.452513966480442,
    type: "symbol",
    rectangles: [{ left: 183.0, top: 327.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 29,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 166.0, top: 329.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 30,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 160.0, top: 329.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 31,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 153.0, top: 329.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 32,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 145.0, top: 329.0, width: 4.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 33,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 139.0, top: 329.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 34,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 132.0, top: 329.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 35,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 125.0, top: 329.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 36,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 173.0, top: 319.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 37,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 167.0, top: 319.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 38,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 160.0, top: 319.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 39,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 156.0, top: 319.0, width: 4.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 40,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 319.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 41,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 143.0, top: 319.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 42,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 136.0, top: 319.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 43,
    iou: 0.261633428300096,
    type: "symbol",
    rectangles: [{ left: 210.0, top: 252.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 44,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 191.0, top: 254.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 45,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 183.0, top: 254.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 46,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 175.0, top: 254.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 47,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 166.0, top: 255.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 48,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 159.0, top: 254.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 49,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 151.0, top: 254.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 50,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 142.0, top: 254.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 51,
    iou: 0.227755845733372,
    type: "symbol",
    rectangles: [{ left: 418.0, top: 584.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 52,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 398.0, top: 586.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 53,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 390.0, top: 586.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 54,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 383.0, top: 586.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 55,
    iou: 0.405092592592591,
    type: "symbol",
    rectangles: [{ left: 519.0, top: 584.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 56,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 499.0, top: 586.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 57,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 492.0, top: 586.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 58,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 484.0, top: 586.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 59,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 460.0, top: 586.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 60,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 451.0, top: 586.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 61,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 444.0, top: 586.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 62,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 415.0, top: 422.0, width: 1.0, height: 1.0 },
      { left: 411.0, top: 425.0, width: 1.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 63,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 405.0, top: 425.0, width: 2.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 64,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 399.0, top: 425.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 65,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 428.0, top: 414.0, width: 2.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 66,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 421.0, top: 416.0, width: 2.0, height: 1.0 },
      { left: 420.0, top: 414.0, width: 5.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 67,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 417.0, top: 416.0, width: 1.0, height: 1.0 },
      { left: 412.0, top: 414.0, width: 6.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 68,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 392.0, top: 414.0, width: 6.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 69,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 381.0, top: 414.0, width: 2.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 70,
    iou: 0.298293515358364,
    type: "symbol",
    rectangles: [{ left: 439.0, top: 406.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 71,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 422.0, top: 408.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 72,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 416.0, top: 408.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 73,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 409.0, top: 408.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 74,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 402.0, top: 408.0, width: 4.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 75,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 396.0, top: 408.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 76,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 389.0, top: 408.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 77,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 381.0, top: 408.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 78,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 430.0, top: 399.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 79,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 423.0, top: 399.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 80,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 417.0, top: 399.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 81,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 412.0, top: 399.0, width: 4.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 82,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 406.0, top: 399.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 83,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 399.0, top: 399.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 84,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 392.0, top: 399.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 85,
    iou: 0.338983050847458,
    type: "symbol",
    rectangles: [{ left: 440.0, top: 387.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 86,
    iou: 0.504895960832313,
    type: "symbol",
    rectangles: [{ left: 424.0, top: 389.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 87,
    iou: 0.155202821869487,
    type: "symbol",
    rectangles: [{ left: 408.0, top: 387.0, width: 5.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 88,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 401.0, top: 389.0, width: 4.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 89,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 395.0, top: 389.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 90,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 388.0, top: 389.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 91,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 380.0, top: 389.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 92,
    iou: 0.762711864406776,
    type: "symbol",
    rectangles: [{ left: 424.0, top: 378.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 93,
    iou: 0.0294117647058808,
    type: "symbol",
    rectangles: [{ left: 420.0, top: 380.0, width: 4.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 94,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 414.0, top: 380.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 95,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 407.0, top: 380.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 96,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 399.0, top: 380.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 97,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 374.0, top: 234.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 98,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 381.0, top: 225.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 99,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 375.0, top: 225.0, width: 3.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 100,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 403.0, top: 215.0, width: 2.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 101,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 395.0, top: 218.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 102,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 387.0, top: 218.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 103,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 367.0, top: 218.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 104,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 354.0, top: 218.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 105,
    iou: 0.430851063829791,
    type: "symbol",
    rectangles: [{ left: 414.0, top: 207.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 106,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 397.0, top: 209.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 107,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 391.0, top: 209.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 108,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 384.0, top: 209.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 109,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 377.0, top: 209.0, width: 4.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 110,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 371.0, top: 209.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 111,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 364.0, top: 209.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 112,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 356.0, top: 209.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 113,
    iou: 0.0317145688800791,
    type: "symbol",
    rectangles: [{ left: 405.0, top: 199.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 114,
    iou: 0.16747663551402,
    type: "symbol",
    rectangles: [{ left: 398.0, top: 199.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 115,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 392.0, top: 199.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 116,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 388.0, top: 199.0, width: 4.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 117,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 381.0, top: 199.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 118,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 374.0, top: 199.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 119,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 367.0, top: 199.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 120,
    iou: 0.624999999999994,
    type: "symbol",
    rectangles: [{ left: 415.0, top: 188.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 121,
    iou: 0.333620318553593,
    type: "symbol",
    rectangles: [{ left: 399.0, top: 190.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 122,
    iou: 0.165584415584414,
    type: "symbol",
    rectangles: [{ left: 383.0, top: 188.0, width: 5.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 123,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 376.0, top: 190.0, width: 4.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 124,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 370.0, top: 190.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 125,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 363.0, top: 190.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 126,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 355.0, top: 190.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 127,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 399.0, top: 179.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 128,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 395.0, top: 181.0, width: 4.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 129,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 389.0, top: 181.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 130,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 382.0, top: 181.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 131,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 374.0, top: 181.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 0,
    iou: 0.378787878787876,
    type: "symbol",
    rectangles: [{ left: 417.0, top: 582.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 1,
    iou: 0.53911205073995,
    type: "symbol",
    rectangles: [{ left: 417.0, top: 571.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 2,
    iou: 0.453547915142655,
    type: "symbol",
    rectangles: [{ left: 313.0, top: 559.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 3,
    iou: 0.380441264162189,
    type: "symbol",
    rectangles: [{ left: 534.0, top: 546.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 4,
    iou: 0.262793914246191,
    type: "symbol",
    rectangles: [{ left: 519.0, top: 546.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 5,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 510.0, top: 549.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 6,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 502.0, top: 548.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 7,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 491.0, top: 548.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 8,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 483.0, top: 548.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 9,
    iou: 0.170219064535227,
    type: "symbol",
    rectangles: [{ left: 423.0, top: 66.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 10,
    iou: 0.183935503135265,
    type: "symbol",
    rectangles: [{ left: 313.0, top: 55.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 11,
    iou: 0.388595564941918,
    type: "symbol",
    rectangles: [{ left: 227.0, top: 501.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 12,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 222.0, top: 504.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 13,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 214.0, top: 503.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 14,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 206.0, top: 503.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 15,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 198.0, top: 503.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 16,
    iou: 0.130208333333333,
    type: "symbol",
    rectangles: [{ left: 89.0, top: 470.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 17,
    iou: 0.119808306709264,
    type: "symbol",
    rectangles: [{ left: 84.0, top: 466.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 18,
    iou: 0.316317626527045,
    type: "symbol",
    rectangles: [{ left: 183.0, top: 606.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 19,
    iou: 0.0371571807726333,
    type: "symbol",
    rectangles: [{ left: 178.0, top: 609.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 20,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 171.0, top: 608.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 21,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 163.0, top: 608.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 22,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 608.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 23,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 92.0, top: 287.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 24,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 85.0, top: 287.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 25,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 77.0, top: 287.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 26,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 72.0, top: 288.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 27,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 65.0, top: 287.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 28,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 56.0, top: 287.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 29,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 48.0, top: 287.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 30,
    iou: 0.294533459000941,
    type: "symbol",
    rectangles: [{ left: 112.0, top: 274.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 31,
    iou: 0.118498105408198,
    type: "symbol",
    rectangles: [{ left: 107.0, top: 277.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 32,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 99.0, top: 276.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 33,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 91.0, top: 276.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 34,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 83.0, top: 276.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 35,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 173.0, top: 178.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 36,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 167.0, top: 178.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 37,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 160.0, top: 178.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 38,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 156.0, top: 178.0, width: 4.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 39,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 178.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 40,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 143.0, top: 178.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 41,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 136.0, top: 178.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 42,
    iou: 0.0561403508771938,
    type: "symbol",
    rectangles: [
      { left: 168.0, top: 161.0, width: 1.0, height: 1.0 },
      { left: 168.0, top: 166.0, width: 4.0, height: 4.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 43,
    iou: 0.121718377088304,
    type: "symbol",
    rectangles: [{ left: 164.0, top: 168.0, width: 4.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 44,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 157.0, top: 168.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 45,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 168.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 46,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 143.0, top: 168.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 47,
    iou: 0.124269005847953,
    type: "symbol",
    rectangles: [{ left: 295.0, top: 87.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 48,
    iou: 0.105879358615425,
    type: "symbol",
    rectangles: [{ left: 290.0, top: 90.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 49,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 282.0, top: 89.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 50,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 274.0, top: 89.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 51,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 266.0, top: 89.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 52,
    iou: 0.429240374609782,
    type: "symbol",
    rectangles: [{ left: 433.0, top: 698.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 53,
    iou: 0.383583267561171,
    type: "symbol",
    rectangles: [{ left: 553.0, top: 698.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 54,
    iou: 0.390016233766236,
    type: "symbol",
    rectangles: [{ left: 397.0, top: 652.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 0,
    iou: 0.490066225165563,
    type: "citation",
    rectangles: [{ left: 48.0, top: 457.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 1,
    iou: 0.24817518248175,
    type: "citation",
    rectangles: [{ left: 281.0, top: 585.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 2,
    iou: 0.377893950709488,
    type: "citation",
    rectangles: [{ left: 514.0, top: 663.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 3,
    iou: 0.638297872340428,
    type: "citation",
    rectangles: [{ left: 438.0, top: 444.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 4,
    iou: 0.556549520766772,
    type: "citation",
    rectangles: [{ left: 458.0, top: 240.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 5,
    iou: 0.486301369863014,
    type: "citation",
    rectangles: [{ left: 548.0, top: 240.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 6,
    iou: 0.463740905890632,
    type: "citation",
    rectangles: [{ left: 531.0, top: 193.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 0,
    iou: 0.244821092278723,
    type: "symbol",
    rectangles: [{ left: 233.0, top: 522.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 1,
    iou: 0.677966101694916,
    type: "symbol",
    rectangles: [{ left: 153.0, top: 500.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 2,
    iou: 0.176470588235295,
    type: "symbol",
    rectangles: [
      { left: 180.0, top: 283.0, width: 6.0, height: 5.0 },
      { left: 124.0, top: 448.0, width: 4.0, height: 6.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 3,
    iou: 0.294612794612794,
    type: "symbol",
    rectangles: [{ left: 237.0, top: 158.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 4,
    iou: 0.132908027644869,
    type: "symbol",
    rectangles: [{ left: 136.0, top: 148.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 5,
    iou: 0.0996810207336523,
    type: "symbol",
    rectangles: [{ left: 133.0, top: 148.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 6,
    iou: 0.104327666151468,
    type: "symbol",
    rectangles: [{ left: 130.0, top: 146.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 7,
    iou: 0.394021739130435,
    type: "symbol",
    rectangles: [{ left: 268.0, top: 145.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 8,
    iou: 0.0609161793372319,
    type: "symbol",
    rectangles: [{ left: 114.0, top: 136.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 9,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 110.0, top: 129.0, width: 3.0, height: 3.0 },
      { left: 111.0, top: 131.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 10,
    iou: 0.176712328767123,
    type: "symbol",
    rectangles: [{ left: 101.0, top: 134.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 11,
    iou: 0.00653594771241792,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 132.0, width: 3.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 12,
    iou: 0.0526094276094276,
    type: "symbol",
    rectangles: [{ left: 196.0, top: 99.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 13,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 192.0, top: 91.0, width: 3.0, height: 3.0 },
      { left: 193.0, top: 93.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 14,
    iou: 0.149366085578447,
    type: "symbol",
    rectangles: [{ left: 183.0, top: 96.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 15,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 179.0, top: 93.0, width: 2.0, height: 1.0 },
      { left: 178.0, top: 91.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 16,
    iou: 0.114318376679051,
    type: "symbol",
    rectangles: [{ left: 173.0, top: 94.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 17,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 165.0, top: 79.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 18,
    iou: 0.0925925925925925,
    type: "symbol",
    rectangles: [{ left: 141.0, top: 99.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 19,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 138.0, top: 94.0, width: 3.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 20,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 526.0, top: 424.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 21,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 510.0, top: 428.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 22,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 507.0, top: 421.0, width: 3.0, height: 3.0 },
      { left: 508.0, top: 423.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 23,
    iou: 0.185393258426968,
    type: "symbol",
    rectangles: [{ left: 501.0, top: 426.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 24,
    iou: 0.0374404356705242,
    type: "symbol",
    rectangles: [{ left: 499.0, top: 426.0, width: 1.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 25,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 492.0, top: 426.0, width: 1.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 26,
    iou: 0.0357142857142854,
    type: "symbol",
    rectangles: [{ left: 477.0, top: 428.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 27,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 474.0, top: 421.0, width: 3.0, height: 3.0 },
      { left: 475.0, top: 423.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 28,
    iou: 0.0977011494252866,
    type: "symbol",
    rectangles: [{ left: 464.0, top: 426.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 29,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 448.0, top: 428.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 30,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 445.0, top: 423.0, width: 2.0, height: 1.0 },
      { left: 444.0, top: 421.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 31,
    iou: 0.277078085642318,
    type: "symbol",
    rectangles: [{ left: 438.0, top: 426.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 32,
    iou: 0.0504124656278644,
    type: "symbol",
    rectangles: [{ left: 437.0, top: 426.0, width: 1.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 33,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 428.0, top: 428.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 34,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 425.0, top: 423.0, width: 2.0, height: 1.0 },
      { left: 424.0, top: 421.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 35,
    iou: 0.221366698748797,
    type: "symbol",
    rectangles: [{ left: 418.0, top: 426.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 36,
    iou: 0.0456711675933283,
    type: "symbol",
    rectangles: [{ left: 395.0, top: 428.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 37,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 393.0, top: 423.0, width: 2.0, height: 1.0 },
      { left: 392.0, top: 421.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 38,
    iou: 0.0449012402388607,
    type: "symbol",
    rectangles: [{ left: 382.0, top: 426.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 39,
    iou: 0.103231597845601,
    type: "symbol",
    rectangles: [{ left: 373.0, top: 428.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 40,
    iou: 0.042060726729717,
    type: "symbol",
    rectangles: [{ left: 369.0, top: 424.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 41,
    iou: 0.0849617672047579,
    type: "symbol",
    rectangles: [{ left: 356.0, top: 428.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 42,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 353.0, top: 423.0, width: 2.0, height: 1.0 },
      { left: 352.0, top: 421.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 43,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 346.0, top: 426.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 44,
    iou: 0.0209672910260002,
    type: "symbol",
    rectangles: [{ left: 328.0, top: 428.0, width: 2.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 45,
    iou: 0.0328227571115975,
    type: "symbol",
    rectangles: [{ left: 523.0, top: 370.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 46,
    iou: 0.225067908420644,
    type: "symbol",
    rectangles: [{ left: 519.0, top: 372.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 47,
    iou: 0.0630063006300628,
    type: "symbol",
    rectangles: [{ left: 514.0, top: 364.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 48,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 511.0, top: 356.0, width: 3.0, height: 3.0 },
      { left: 512.0, top: 358.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 49,
    iou: 0.0710479573712253,
    type: "symbol",
    rectangles: [{ left: 508.0, top: 362.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 50,
    iou: 0.0591133004926109,
    type: "symbol",
    rectangles: [{ left: 427.0, top: 352.0, width: 2.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 51,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 425.0, top: 347.0, width: 2.0, height: 1.0 },
      { left: 424.0, top: 345.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 52,
    iou: 0.159250585480093,
    type: "symbol",
    rectangles: [{ left: 420.0, top: 350.0, width: 4.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 53,
    iou: 0.0636267232237542,
    type: "symbol",
    rectangles: [{ left: 491.0, top: 352.0, width: 2.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 54,
    iou: 0.0524842547235833,
    type: "symbol",
    rectangles: [{ left: 487.0, top: 348.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 55,
    iou: 0.0942684766214177,
    type: "symbol",
    rectangles: [{ left: 460.0, top: 329.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 56,
    iou: 0.00561419267909241,
    type: "symbol",
    rectangles: [{ left: 456.0, top: 325.0, width: 5.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 57,
    iou: 0.0463821892393328,
    type: "symbol",
    rectangles: [{ left: 463.0, top: 306.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 58,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 459.0, top: 299.0, width: 3.0, height: 3.0 },
      { left: 460.0, top: 301.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 59,
    iou: 0.0745121230041383,
    type: "symbol",
    rectangles: [{ left: 453.0, top: 302.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 60,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 451.0, top: 301.0, width: 2.0, height: 1.0 },
      { left: 450.0, top: 299.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 61,
    iou: 0.115308804204994,
    type: "symbol",
    rectangles: [{ left: 444.0, top: 302.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 62,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 436.0, top: 287.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 63,
    iou: 0.137061403508771,
    type: "symbol",
    rectangles: [{ left: 412.0, top: 306.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 64,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 409.0, top: 302.0, width: 3.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 65,
    iou: 0.15432098765432,
    type: "symbol",
    rectangles: [{ left: 558.0, top: 211.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 66,
    iou: 0.0475509474436892,
    type: "symbol",
    rectangles: [{ left: 553.0, top: 207.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 67,
    iou: 0.145719489981785,
    type: "symbol",
    rectangles: [{ left: 358.0, top: 199.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 68,
    iou: 0.117677824267783,
    type: "symbol",
    rectangles: [{ left: 353.0, top: 196.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 69,
    iou: 0.367717287488058,
    type: "symbol",
    rectangles: [{ left: 345.0, top: 152.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 70,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 481.0, top: 123.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 71,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 477.0, top: 119.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 72,
    iou: 0.0630494089117921,
    type: "symbol",
    rectangles: [{ left: 473.0, top: 123.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 73,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 470.0, top: 116.0, width: 3.0, height: 3.0 },
      { left: 471.0, top: 118.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 74,
    iou: 0.294222539229671,
    type: "symbol",
    rectangles: [{ left: 464.0, top: 119.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 75,
    iou: 0.192406362237044,
    type: "symbol",
    rectangles: [{ left: 447.0, top: 121.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 76,
    iou: 0.00453514739229023,
    type: "symbol",
    rectangles: [{ left: 430.0, top: 123.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 77,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 428.0, top: 118.0, width: 2.0, height: 1.0 },
      { left: 427.0, top: 116.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 78,
    iou: 0.00919348098620978,
    type: "symbol",
    rectangles: [{ left: 417.0, top: 121.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 79,
    iou: 0.0323027226580525,
    type: "symbol",
    rectangles: [{ left: 400.0, top: 122.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 80,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 397.0, top: 118.0, width: 2.0, height: 1.0 },
      { left: 396.0, top: 116.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 81,
    iou: 0.0705166270783847,
    type: "symbol",
    rectangles: [{ left: 391.0, top: 121.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 82,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 474.0, top: 90.0, width: 1.0, height: 1.0 },
      { left: 474.0, top: 92.0, width: 1.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 83,
    iou: 0.057237204182719,
    type: "symbol",
    rectangles: [{ left: 469.0, top: 89.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 84,
    iou: 0.0263504611330695,
    type: "symbol",
    rectangles: [{ left: 465.0, top: 93.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 85,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 463.0, top: 88.0, width: 2.0, height: 1.0 },
      { left: 462.0, top: 86.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 86,
    iou: 0.205918242830994,
    type: "symbol",
    rectangles: [{ left: 456.0, top: 89.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 87,
    iou: 0.00676895306859209,
    type: "symbol",
    rectangles: [{ left: 441.0, top: 92.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 88,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 437.0, top: 86.0, width: 3.0, height: 3.0 },
      { left: 438.0, top: 88.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 89,
    iou: 0.060459492140266,
    type: "symbol",
    rectangles: [{ left: 428.0, top: 91.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 90,
    iou: 0.0461454940282303,
    type: "symbol",
    rectangles: [{ left: 410.0, top: 93.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 91,
    iou: 0,
    type: "symbol",
    rectangles: [
      { left: 407.0, top: 88.0, width: 2.0, height: 1.0 },
      { left: 406.0, top: 86.0, width: 3.0, height: 3.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 92,
    iou: 0.0766417000522558,
    type: "symbol",
    rectangles: [{ left: 402.0, top: 91.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 93,
    iou: 0.0369685767097966,
    type: "symbol",
    rectangles: [{ left: 487.0, top: 57.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 94,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 482.0, top: 53.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 95,
    iou: 0.0321130378933847,
    type: "symbol",
    rectangles: [{ left: 475.0, top: 57.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 96,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 470.0, top: 53.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 97,
    iou: 0.068082788671024,
    type: "symbol",
    rectangles: [{ left: 452.0, top: 57.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 98,
    iou: 0.169197755034664,
    type: "symbol",
    rectangles: [{ left: 442.0, top: 55.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 99,
    iou: 0.145816072908037,
    type: "symbol",
    rectangles: [{ left: 428.0, top: 55.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 100,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 418.0, top: 53.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 101,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 415.0, top: 55.0, width: 2.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 102,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 411.0, top: 53.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 103,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 403.0, top: 55.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 104,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 387.0, top: 57.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 105,
    iou: 0.332778702163061,
    type: "symbol",
    rectangles: [{ left: 377.0, top: 55.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 106,
    iou: 0.176470588235295,
    type: "symbol",
    rectangles: [
      { left: 180.0, top: 283.0, width: 6.0, height: 5.0 },
      { left: 124.0, top: 448.0, width: 4.0, height: 6.0 }
    ]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 0,
    iou: 0.187101910828025,
    type: "citation",
    rectangles: [{ left: 113.0, top: 204.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 1,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 48.0, top: 193.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 2,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 219.0, top: 193.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 3,
    iou: 0.594745667970934,
    type: "citation",
    rectangles: [{ left: 220.0, top: 66.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 4,
    iou: 0.207972270363953,
    type: "citation",
    rectangles: [{ left: 369.0, top: 385.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 5,
    iou: 0.220614828209764,
    type: "citation",
    rectangles: [{ left: 415.0, top: 73.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 0,
    iou: 0.0563380281690149,
    type: "symbol",
    rectangles: [{ left: 49.0, top: 735.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 1,
    iou: 0.156641604010025,
    type: "symbol",
    rectangles: [{ left: 92.0, top: 518.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 2,
    iou: 0.13538924407672,
    type: "symbol",
    rectangles: [{ left: 88.0, top: 514.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 3,
    iou: 0.253549695740366,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 515.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 4,
    iou: 0.0119331742243438,
    type: "symbol",
    rectangles: [{ left: 187.0, top: 494.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 5,
    iou: 0.0237580993520522,
    type: "symbol",
    rectangles: [{ left: 177.0, top: 492.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 6,
    iou: 0.0647039792947267,
    type: "symbol",
    rectangles: [{ left: 172.0, top: 494.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 7,
    iou: 0.0706015249929399,
    type: "symbol",
    rectangles: [{ left: 167.0, top: 490.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 8,
    iou: 0.145985401459853,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 494.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 9,
    iou: 0.208816705336427,
    type: "symbol",
    rectangles: [{ left: 145.0, top: 490.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 10,
    iou: 0.00211237853823423,
    type: "symbol",
    rectangles: [{ left: 160.0, top: 475.0, width: 2.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 11,
    iou: 0.0359864521591869,
    type: "symbol",
    rectangles: [{ left: 145.0, top: 473.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 12,
    iou: 0.0599919338576322,
    type: "symbol",
    rectangles: [{ left: 139.0, top: 471.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 13,
    iou: 0.0449218750000002,
    type: "symbol",
    rectangles: [{ left: 104.0, top: 473.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 14,
    iou: 0.126373626373627,
    type: "symbol",
    rectangles: [{ left: 95.0, top: 471.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 15,
    iou: 0.5090909090909,
    type: "symbol",
    rectangles: [{ left: 285.0, top: 460.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 0,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 201.0, top: 414.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 1,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 262.0, top: 551.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 2,
    iou: 0.0817307692307687,
    type: "citation",
    rectangles: [{ left: 122.0, top: 414.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 3,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 201.0, top: 414.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 0,
    iou: 0.417582417582419,
    type: "symbol",
    rectangles: [{ left: 362.0, top: 235.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 1,
    iou: 0.23943661971831,
    type: "symbol",
    rectangles: [{ left: 476.0, top: 233.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 2,
    iou: 0.182926829268292,
    type: "symbol",
    rectangles: [{ left: 407.0, top: 221.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 3,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 538.0, top: 94.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 4,
    iou: 0.180657830142367,
    type: "symbol",
    rectangles: [{ left: 350.0, top: 82.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.08624",
    page: 10,
    index: 0,
    iou: 0.829672509886746,
    type: "citation",
    rectangles: [{ left: 514.0, top: 406.0, width: 25.0, height: 11.0 }]
  },
  {
    arxivId: "1911.08624",
    page: 10,
    index: 1,
    iou: 0.629895216412779,
    type: "citation",
    rectangles: [{ left: 515.0, top: 306.0, width: 14.0, height: 11.0 }]
  },
  {
    arxivId: "1911.08624",
    page: 10,
    index: 2,
    iou: 0.619172980608706,
    type: "citation",
    rectangles: [{ left: 227.0, top: 181.0, width: 13.0, height: 11.0 }]
  },
  {
    arxivId: "1911.08836",
    page: 3,
    index: 0,
    iou: 0.291060291060291,
    type: "citation",
    rectangles: [{ left: 102.0, top: 635.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.08836",
    page: 3,
    index: 1,
    iou: 0.631067961165048,
    type: "citation",
    rectangles: [{ left: 454.0, top: 462.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.08836",
    page: 3,
    index: 2,
    iou: 0.499999999999998,
    type: "citation",
    rectangles: [{ left: 389.0, top: 438.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.08836",
    page: 3,
    index: 3,
    iou: 0.659420289855064,
    type: "citation",
    rectangles: [{ left: 542.0, top: 414.0, width: 10.0, height: 9.0 }]
  },
  {
    arxivId: "1911.08836",
    page: 3,
    index: 4,
    iou: 0.797580645161293,
    type: "citation",
    rectangles: [{ left: 437.0, top: 344.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.08836",
    page: 3,
    index: 5,
    iou: 0.733281493001556,
    type: "citation",
    rectangles: [{ left: 313.0, top: 115.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.08836",
    page: 3,
    index: 6,
    iou: 0.798021434460015,
    type: "citation",
    rectangles: [{ left: 439.0, top: 115.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.08885",
    page: 0,
    index: 0,
    iou: 0.633706115153018,
    type: "citation",
    rectangles: [
      {
        left: 85.03942857142857,
        top: 415.94565320665083,
        width: 9.004174789915966,
        height: 10.998562945368171
      }
    ]
  },
  {
    arxivId: "1911.08885",
    page: 0,
    index: 1,
    iou: 0.523737158013238,
    type: "citation",
    rectangles: [
      {
        left: 62.02875966386554,
        top: 343.9550593824228,
        width: 9.004174789915966,
        height: 10.998562945368171
      }
    ]
  },
  {
    arxivId: "1911.08885",
    page: 0,
    index: 2,
    iou: 0.578259176479327,
    type: "citation",
    rectangles: [
      {
        left: 165.07653781512604,
        top: 188.97530878859857,
        width: 9.004174789915966,
        height: 10.998562945368171
      }
    ]
  },
  {
    arxivId: "1911.08885",
    page: 0,
    index: 3,
    iou: 0.48966350998025,
    type: "citation",
    rectangles: [
      {
        left: 75.03478991596639,
        top: 164.97844418052256,
        width: 9.004174789915966,
        height: 10.998562945368171
      }
    ]
  },
  {
    arxivId: "1911.08885",
    page: 0,
    index: 4,
    iou: 0.587986939400314,
    type: "citation",
    rectangles: [
      {
        left: 208.09648403361345,
        top: 140.98157957244655,
        width: 9.004174789915966,
        height: 10.998562945368171
      }
    ]
  },
  {
    arxivId: "1911.08885",
    page: 0,
    index: 5,
    iou: 0.512640836284886,
    type: "citation",
    rectangles: [
      {
        left: 464.2152336134454,
        top: 448.94134204275537,
        width: 8.003710924369749,
        height: 10.998562945368171
      }
    ]
  },
  {
    arxivId: "1911.08885",
    page: 0,
    index: 6,
    iou: 0.504206714396004,
    type: "citation",
    rectangles: [
      {
        left: 418.1938957983193,
        top: 436.94290973871733,
        width: 9.004174789915966,
        height: 10.998562945368171
      }
    ]
  },
  {
    arxivId: "1911.08885",
    page: 0,
    index: 7,
    iou: 0.845279108651093,
    type: "citation",
    rectangles: [
      {
        left: 535.2481680672269,
        top: 352.9538836104513,
        width: 19.008813445378152,
        height: 10.998562945368171
      }
    ]
  },
  {
    arxivId: "1911.08885",
    page: 0,
    index: 8,
    iou: 0.66753040356138,
    type: "citation",
    rectangles: [
      {
        left: 390.1809075630252,
        top: 244.96799287410926,
        width: 9.004174789915966,
        height: 10.998562945368171
      }
    ]
  },
  {
    arxivId: "1911.08885",
    page: 0,
    index: 9,
    iou: 0.485030750629703,
    type: "citation",
    rectangles: [
      {
        left: 345.16003361344536,
        top: 173.97726840855105,
        width: 9.004174789915966,
        height: 10.998562945368171
      }
    ]
  },
  {
    arxivId: "1911.08885",
    page: 0,
    index: 10,
    iou: 0.592267190007315,
    type: "citation",
    rectangles: [
      {
        left: 480.2226554621849,
        top: 149.98040380047505,
        width: 9.004174789915966,
        height: 10.998562945368171
      }
    ]
  },
  {
    arxivId: "1911.08885",
    page: 0,
    index: 11,
    iou: 0.56142418928087,
    type: "citation",
    rectangles: [
      {
        left: 375.1739495798319,
        top: 137.98197149643704,
        width: 9.004174789915966,
        height: 10.998562945368171
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 0,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 504.2337882352941,
        top: 541.9291923990498,
        width: 1.0004638655462186,
        height: 0.9998693586698337
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 1,
    iou: 0.325594004716443,
    type: "symbol",
    rectangles: [
      {
        left: 483.22404705882354,
        top: 545.9286698337293,
        width: 6.002783193277311,
        height: 6.999085510688836
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 2,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 234.10854453781513,
        top: 480.93716152019005,
        width: 1.0004638655462186,
        height: 0.9998693586698337
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 3,
    iou: 0.381526197293651,
    type: "symbol",
    rectangles: [
      {
        left: 213.09880336134455,
        top: 484.93663895486935,
        width: 6.002783193277311,
        height: 6.999085510688836
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 4,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 175.08117647058825,
        top: 173.97726840855105,
        width: 1.0004638655462186,
        height: 0.9998693586698337
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 5,
    iou: 0.317940886576774,
    type: "symbol",
    rectangles: [
      {
        left: 154.07143529411763,
        top: 177.9767458432304,
        width: 6.002783193277311,
        height: 6.999085510688836
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 6,
    iou: 0.380215538601381,
    type: "symbol",
    rectangles: [
      {
        left: 72.03339831932773,
        top: 180.9763539192399,
        width: 7.003247058823529,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 7,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 426.1976067226891,
        top: 173.97726840855105,
        width: 1.0004638655462186,
        height: 0.9998693586698337
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 8,
    iou: 0.27044563041889,
    type: "symbol",
    rectangles: [
      {
        left: 404.1874016806723,
        top: 177.9767458432304,
        width: 6.002783193277311,
        height: 6.999085510688836
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 9,
    iou: 0.376101814910717,
    type: "symbol",
    rectangles: [
      {
        left: 328.1521478991597,
        top: 180.9763539192399,
        width: 7.003247058823529,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 10,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 188.08720672268907,
        top: 159.9790973871734,
        width: 1.0004638655462186,
        height: 0.9998693586698337
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 11,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 167.0774655462185,
        top: 163.97857482185273,
        width: 6.002783193277311,
        height: 6.999085510688836
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 12,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 424.1966789915966,
        top: 125.98353919239905,
        width: 1.0004638655462186,
        height: 0.9998693586698337
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 13,
    iou: 0.299617419703477,
    type: "symbol",
    rectangles: [
      {
        left: 395.1832268907563,
        top: 129.98301662707837,
        width: 6.002783193277311,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 14,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 371.1720941176471,
        top: 125.98353919239905,
        width: 1.0004638655462186,
        height: 0.9998693586698337
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 15,
    iou: 0.265240043976995,
    type: "symbol",
    rectangles: [
      {
        left: 347.16096134453784,
        top: 129.98301662707837,
        width: 6.002783193277311,
        height: 6.999085510688836
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 16,
    iou: 0.230839809817607,
    type: "symbol",
    rectangles: [
      {
        left: 281.1303462184874,
        top: 131.98275534441805,
        width: 4.001855462184874,
        height: 6.999085510688836
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 17,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 159.07375462184874,
        top: 98.98706650831353,
        width: 1.0004638655462186,
        height: 0.9998693586698337
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 18,
    iou: 0.28547566788809,
    type: "symbol",
    rectangles: [
      {
        left: 131.06076638655463,
        top: 102.98654394299287,
        width: 6.002783193277311,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 19,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 113.05241680672269,
        top: 98.98706650831353,
        width: 1.0004638655462186,
        height: 0.9998693586698337
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 20,
    iou: 0.409173064259775,
    type: "symbol",
    rectangles: [
      {
        left: 90.04174789915966,
        top: 102.98654394299287,
        width: 6.002783193277311,
        height: 6.999085510688836
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 21,
    iou: 0.320692594115621,
    type: "symbol",
    rectangles: [
      {
        left: 488.2263663865546,
        top: 118.9844536817102,
        width: 4.001855462184874,
        height: 6.999085510688836
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 22,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 428.1985344537815,
        top: 98.98706650831353,
        width: 1.0004638655462186,
        height: 0.9998693586698337
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 23,
    iou: 0.256948611407992,
    type: "symbol",
    rectangles: [
      {
        left: 400.1855462184874,
        top: 102.98654394299287,
        width: 6.002783193277311,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 24,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 376.17441344537815,
        top: 98.98706650831353,
        width: 1.0004638655462186,
        height: 0.9998693586698337
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 25,
    iou: 0.386744581474081,
    type: "symbol",
    rectangles: [
      {
        left: 353.16374453781515,
        top: 102.98654394299287,
        width: 6.002783193277311,
        height: 6.999085510688836
      }
    ]
  },
  {
    arxivId: "1911.09018",
    page: 16,
    index: 26,
    iou: 0.32222764214407,
    type: "symbol",
    rectangles: [
      {
        left: 295.13684033613447,
        top: 104.98628266033253,
        width: 4.001855462184874,
        height: 6.999085510688836
      }
    ]
  },
  {
    arxivId: "1911.09322",
    page: 4,
    index: 0,
    iou: 0.553154710458083,
    type: "citation",
    rectangles: [{ left: 248.0, top: 266.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.09322",
    page: 4,
    index: 1,
    iou: 0.311444652908068,
    type: "citation",
    rectangles: [{ left: 387.0, top: 173.0, width: 10.0, height: 9.0 }]
  },
  {
    arxivId: "1911.09322",
    page: 4,
    index: 2,
    iou: 0.240802675585285,
    type: "citation",
    rectangles: [{ left: 387.0, top: 162.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 0,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 162.0, top: 678.0, width: 1.0, height: 12.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 1,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 158.0, top: 666.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 2,
    iou: 0.559376544873819,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 668.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 3,
    iou: 0.371220040126401,
    type: "symbol",
    rectangles: [{ left: 139.0, top: 678.0, width: 8.0, height: 9.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 4,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 135.0, top: 678.0, width: 1.0, height: 12.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 5,
    iou: 0.110491246139038,
    type: "symbol",
    rectangles: [{ left: 323.0, top: 535.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 6,
    iou: 0.120503555047805,
    type: "symbol",
    rectangles: [{ left: 319.0, top: 537.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 7,
    iou: 0.620307790308116,
    type: "symbol",
    rectangles: [{ left: 313.0, top: 540.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 8,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 312.0, top: 540.0, width: 1.0, height: 8.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 9,
    iou: 0.2928937021687,
    type: "symbol",
    rectangles: [{ left: 306.0, top: 542.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 10,
    iou: 0.3181051811017,
    type: "symbol",
    rectangles: [{ left: 245.0, top: 542.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 11,
    iou: 0.344948648858672,
    type: "symbol",
    rectangles: [{ left: 216.0, top: 542.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 12,
    iou: 0.571427336767819,
    type: "symbol",
    rectangles: [{ left: 244.0, top: 528.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 13,
    iou: 0.803026119421944,
    type: "symbol",
    rectangles: [{ left: 229.0, top: 528.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 14,
    iou: 0.579691412876645,
    type: "symbol",
    rectangles: [{ left: 288.0, top: 528.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 15,
    iou: 0.325236747557817,
    type: "symbol",
    rectangles: [{ left: 273.0, top: 528.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 16,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 401.0, top: 526.0, width: 1.0, height: 8.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 17,
    iou: 0.267358110054739,
    type: "symbol",
    rectangles: [{ left: 397.0, top: 521.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 18,
    iou: 0.131225281430252,
    type: "symbol",
    rectangles: [{ left: 393.0, top: 523.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 19,
    iou: 0.481527561645371,
    type: "symbol",
    rectangles: [{ left: 388.0, top: 526.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 20,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 386.0, top: 526.0, width: 1.0, height: 8.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 21,
    iou: 0.603526035260352,
    type: "symbol",
    rectangles: [{ left: 380.0, top: 528.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 22,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 362.0, top: 526.0, width: 1.0, height: 8.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 23,
    iou: 0.204472843450479,
    type: "symbol",
    rectangles: [{ left: 358.0, top: 521.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 24,
    iou: 0.108422149386299,
    type: "symbol",
    rectangles: [{ left: 354.0, top: 523.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 25,
    iou: 0.509892417140114,
    type: "symbol",
    rectangles: [{ left: 349.0, top: 526.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 26,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 348.0, top: 526.0, width: 1.0, height: 8.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 27,
    iou: 0.507358943857437,
    type: "symbol",
    rectangles: [{ left: 341.0, top: 528.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 28,
    iou: 0.199170124481327,
    type: "symbol",
    rectangles: [{ left: 240.0, top: 506.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 29,
    iou: 0.235036774276268,
    type: "symbol",
    rectangles: [{ left: 236.0, top: 508.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 30,
    iou: 0.429949288202685,
    type: "symbol",
    rectangles: [{ left: 231.0, top: 511.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 31,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 229.0, top: 511.0, width: 1.0, height: 8.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 32,
    iou: 0.761116856256463,
    type: "symbol",
    rectangles: [{ left: 223.0, top: 513.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 33,
    iou: 0.395233590478428,
    type: "symbol",
    rectangles: [{ left: 195.0, top: 513.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 34,
    iou: 0.341751418270162,
    type: "symbol",
    rectangles: [{ left: 185.0, top: 513.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 35,
    iou: 0.153323899459625,
    type: "symbol",
    rectangles: [{ left: 441.0, top: 511.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 36,
    iou: 0.51170046801872,
    type: "symbol",
    rectangles: [{ left: 435.0, top: 513.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 37,
    iou: 0.326463719424756,
    type: "symbol",
    rectangles: [{ left: 426.0, top: 510.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 38,
    iou: 0.297371237409135,
    type: "symbol",
    rectangles: [{ left: 420.0, top: 513.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 39,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 490.0, top: 516.0, width: 1.0, height: 12.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 40,
    iou: 0.775825720309205,
    type: "symbol",
    rectangles: [{ left: 482.0, top: 516.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 41,
    iou: 0.37174721189591,
    type: "symbol",
    rectangles: [
      { left: 461.0, top: 513.0, width: 5.0, height: 9.0 },
      { left: 464.0, top: 515.0, width: 2.0, height: 1.0 }
    ]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 42,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 459.0, top: 516.0, width: 1.0, height: 12.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 43,
    iou: 0.137795275590551,
    type: "symbol",
    rectangles: [{ left: 455.0, top: 494.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 44,
    iou: 0.354639175257732,
    type: "symbol",
    rectangles: [{ left: 451.0, top: 496.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 45,
    iou: 0.28496878633582,
    type: "symbol",
    rectangles: [{ left: 445.0, top: 502.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 46,
    iou: 0.0432957369246099,
    type: "symbol",
    rectangles: [{ left: 106.0, top: 410.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 47,
    iou: 0.158488245026964,
    type: "symbol",
    rectangles: [{ left: 102.0, top: 413.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 48,
    iou: 0.138499587798845,
    type: "symbol",
    rectangles: [{ left: 159.0, top: 410.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 49,
    iou: 0.4509482355795,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 413.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 50,
    iou: 0.0388742660457582,
    type: "symbol",
    rectangles: [{ left: 335.0, top: 396.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 51,
    iou: 0.12730157000224,
    type: "symbol",
    rectangles: [{ left: 331.0, top: 398.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 52,
    iou: 0.0355881544933684,
    type: "symbol",
    rectangles: [{ left: 206.0, top: 381.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 53,
    iou: 0.141416920758532,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 384.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 54,
    iou: 0.117410515022337,
    type: "symbol",
    rectangles: [{ left: 257.0, top: 381.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 55,
    iou: 0.335261112986252,
    type: "symbol",
    rectangles: [{ left: 253.0, top: 384.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 56,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 402.0, top: 234.0, width: 1.0, height: 12.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 57,
    iou: 0.0262201838037449,
    type: "symbol",
    rectangles: [{ left: 389.0, top: 222.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 58,
    iou: 0.118917577362543,
    type: "symbol",
    rectangles: [{ left: 385.0, top: 224.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 59,
    iou: 0.38409724692258,
    type: "symbol",
    rectangles: [{ left: 370.0, top: 234.0, width: 8.0, height: 9.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 60,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 366.0, top: 234.0, width: 1.0, height: 12.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 61,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 310.0, top: 234.0, width: 1.0, height: 12.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 62,
    iou: 0.0615988006397108,
    type: "symbol",
    rectangles: [{ left: 306.0, top: 226.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 63,
    iou: 0.268292325675579,
    type: "symbol",
    rectangles: [{ left: 302.0, top: 228.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 64,
    iou: 0.546926862532843,
    type: "symbol",
    rectangles: [{ left: 294.0, top: 234.0, width: 8.0, height: 10.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 65,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 292.0, top: 234.0, width: 1.0, height: 12.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 0,
    iou: 0.728746210897793,
    type: "citation",
    rectangles: [{ left: 120.0, top: 661.0, width: 88.0, height: 12.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 1,
    iou: 0.547486645236474,
    type: "citation",
    rectangles: [{ left: 455.0, top: 603.0, width: 10.0, height: 12.0 }]
  },
  {
    arxivId: "1911.09986",
    page: 6,
    index: 0,
    iou: 0.647123743354335,
    type: "citation",
    rectangles: [
      {
        left: 297.1377680672269,
        top: 565.9260570071259,
        width: 14.006494117647058,
        height: 10.998562945368171
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 0,
    iou: 0.363177172711519,
    type: "symbol",
    rectangles: [
      {
        left: 368.1707025210084,
        top: 498.93480997624704,
        width: 5.002319327731092,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 1,
    iou: 0.681322968800836,
    type: "symbol",
    rectangles: [
      {
        left: 328.1521478991597,
        top: 253.96681710213775,
        width: 6.002783193277311,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 2,
    iou: 0.767878884800338,
    type: "symbol",
    rectangles: [
      {
        left: 343.15910588235295,
        top: 242.9682541567696,
        width: 6.002783193277311,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 3,
    iou: 0.39800589719371,
    type: "symbol",
    rectangles: [
      {
        left: 67.03107899159664,
        top: 412.9460451306413,
        width: 7.003247058823529,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 4,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 196.09091764705883,
        top: 274.9640736342043,
        width: 5.002319327731092,
        height: 1.9997387173396675
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 5,
    iou: 0.149656559301225,
    type: "symbol",
    rectangles: [
      {
        left: 229.10622521008403,
        top: 285.96263657957246,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 6,
    iou: 0.369524387319334,
    type: "symbol",
    rectangles: [
      {
        left: 224.10390588235293,
        top: 286.96250593824226,
        width: 5.002319327731092,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 7,
    iou: 0.313852433131289,
    type: "symbol",
    rectangles: [
      {
        left: 208.09648403361345,
        top: 286.96250593824226,
        width: 5.002319327731092,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 8,
    iou: 0.552240898319366,
    type: "symbol",
    rectangles: [
      {
        left: 181.08395966386556,
        top: 285.96263657957246,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 9,
    iou: 0.237534763724444,
    type: "symbol",
    rectangles: [
      {
        left: 176.08164033613446,
        top: 286.96250593824226,
        width: 5.002319327731092,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 10,
    iou: 0.231386061469205,
    type: "symbol",
    rectangles: [
      {
        left: 159.07375462184874,
        top: 286.96250593824226,
        width: 5.002319327731092,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 11,
    iou: 0.303236020337502,
    type: "symbol",
    rectangles: [
      {
        left: 109.05056134453781,
        top: 280.9632897862233,
        width: 5.002319327731092,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 12,
    iou: 0.0705292937560075,
    type: "symbol",
    rectangles: [
      {
        left: 100.04638655462185,
        top: 280.9632897862233,
        width: 5.002319327731092,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 13,
    iou: 0.294456475652104,
    type: "symbol",
    rectangles: [
      {
        left: 91.04221176470588,
        top: 279.96342042755344,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 14,
    iou: 0.361970262730881,
    type: "symbol",
    rectangles: [
      {
        left: 85.03942857142857,
        top: 283.96289786223275,
        width: 6.002783193277311,
        height: 6.999085510688836
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 15,
    iou: 0.0557063092732915,
    type: "symbol",
    rectangles: [
      {
        left: 77.03571764705882,
        top: 256.9664251781473,
        width: 1.0004638655462186,
        height: 1.9997387173396675
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 16,
    iou: 0.404520309654796,
    type: "symbol",
    rectangles: [
      {
        left: 69.03200672268908,
        top: 260.9659026128266,
        width: 6.002783193277311,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 17,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 124.05751932773109,
        top: 256.9664251781473,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 18,
    iou: 0.118747036048357,
    type: "symbol",
    rectangles: [
      {
        left: 118.05473613445378,
        top: 257.9662945368171,
        width: 5.002319327731092,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 19,
    iou: 0.0282854921733484,
    type: "symbol",
    rectangles: [
      {
        left: 110.05102521008403,
        top: 256.9664251781473,
        width: 3.0013915966386553,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 20,
    iou: 0.115846584104266,
    type: "symbol",
    rectangles: [
      {
        left: 104.04824201680673,
        top: 257.9662945368171,
        width: 5.002319327731092,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 21,
    iou: 0.385779444255257,
    type: "symbol",
    rectangles: [
      {
        left: 98.04545882352942,
        top: 249.96733966745842,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 22,
    iou: 0,
    type: "symbol",
    rectangles: [
      {
        left: 211.0978756302521,
        top: 246.96773159144894,
        width: 5.002319327731092,
        height: 1.9997387173396675
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 23,
    iou: 0.276316295474482,
    type: "symbol",
    rectangles: [
      {
        left: 212.0983394957983,
        top: 172.97739904988123,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 24,
    iou: 0.177757990247742,
    type: "symbol",
    rectangles: [
      {
        left: 206.095556302521,
        top: 172.97739904988123,
        width: 4.001855462184874,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 25,
    iou: 0.496818487868201,
    type: "symbol",
    rectangles: [
      {
        left: 198.09184537815125,
        top: 172.97739904988123,
        width: 3.0013915966386553,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 26,
    iou: 0.226664995854891,
    type: "symbol",
    rectangles: [
      {
        left: 193.08952605042018,
        top: 173.97726840855105,
        width: 5.002319327731092,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 27,
    iou: 0.162961302500669,
    type: "symbol",
    rectangles: [
      {
        left: 188.08720672268907,
        top: 170.97766033254157,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 28,
    iou: 0.113172696084632,
    type: "symbol",
    rectangles: [
      {
        left: 183.08488739495797,
        top: 168.9779216152019,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 29,
    iou: 0.392082207917105,
    type: "symbol",
    rectangles: [
      {
        left: 166.07700168067228,
        top: 168.9779216152019,
        width: 4.001855462184874,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 30,
    iou: 0.504573951746654,
    type: "symbol",
    rectangles: [
      {
        left: 195.0904537815126,
        top: 185.97570071258906,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 31,
    iou: 0.10166145081998,
    type: "symbol",
    rectangles: [
      {
        left: 189.08767058823528,
        top: 185.97570071258906,
        width: 4.001855462184874,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 32,
    iou: 0.334071612906041,
    type: "symbol",
    rectangles: [
      {
        left: 182.08442352941177,
        top: 185.97570071258906,
        width: 3.0013915966386553,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 33,
    iou: 0.331559363488029,
    type: "symbol",
    rectangles: [
      {
        left: 176.08164033613446,
        top: 186.97557007125891,
        width: 5.002319327731092,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 34,
    iou: 0.106069576017583,
    type: "symbol",
    rectangles: [
      {
        left: 171.07932100840335,
        top: 182.97609263657958,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 35,
    iou: 0.465364479268526,
    type: "symbol",
    rectangles: [
      {
        left: 132.06123025210084,
        top: 177.9767458432304,
        width: 5.002319327731092,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 36,
    iou: 0.158921448781915,
    type: "symbol",
    rectangles: [
      {
        left: 123.05705546218488,
        top: 177.9767458432304,
        width: 5.002319327731092,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 37,
    iou: 0.23789431234239,
    type: "symbol",
    rectangles: [
      {
        left: 115.05334453781512,
        top: 175.97700712589074,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 38,
    iou: 0.604853291011037,
    type: "symbol",
    rectangles: [
      {
        left: 110.05102521008403,
        top: 180.9763539192399,
        width: 5.002319327731092,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 39,
    iou: 0.710077017527693,
    type: "symbol",
    rectangles: [
      {
        left: 123.05705546218488,
        top: 151.98014251781473,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 40,
    iou: 0.651052150250953,
    type: "symbol",
    rectangles: [
      {
        left: 98.04545882352942,
        top: 151.98014251781473,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 41,
    iou: 0.751404161831064,
    type: "symbol",
    rectangles: [
      {
        left: 65.0301512605042,
        top: 151.98014251781473,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 42,
    iou: 0.663956762423846,
    type: "symbol",
    rectangles: [
      {
        left: 159.07375462184874,
        top: 121.98406175771972,
        width: 6.002783193277311,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 43,
    iou: 0.795678254454249,
    type: "symbol",
    rectangles: [
      {
        left: 240.11132773109244,
        top: 110.98549881235154,
        width: 6.002783193277311,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 44,
    iou: 0.324811924174614,
    type: "symbol",
    rectangles: [
      {
        left: 364.16884705882353,
        top: 767.8996674584323,
        width: 5.002319327731092,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 45,
    iou: 0.355386189686791,
    type: "symbol",
    rectangles: [
      {
        left: 354.16420840336133,
        top: 767.8996674584323,
        width: 5.002319327731092,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 46,
    iou: 0.522371865082273,
    type: "symbol",
    rectangles: [
      {
        left: 346.1604974789916,
        top: 766.8997980997625,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 47,
    iou: 0.481687192730109,
    type: "symbol",
    rectangles: [
      {
        left: 339.15725042016805,
        top: 770.8992755344418,
        width: 7.003247058823529,
        height: 6.999085510688836
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 48,
    iou: 0.428042258256539,
    type: "symbol",
    rectangles: [
      {
        left: 479.22219159663865,
        top: 744.9026722090262,
        width: 6.002783193277311,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 49,
    iou: 0.432327679978941,
    type: "symbol",
    rectangles: [
      {
        left: 458.21245042016807,
        top: 736.9037173396674,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 50,
    iou: 0.176455193303378,
    type: "symbol",
    rectangles: [
      {
        left: 452.20966722689076,
        top: 736.9037173396674,
        width: 4.001855462184874,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 51,
    iou: 0.485694681428737,
    type: "symbol",
    rectangles: [
      {
        left: 444.20595630252103,
        top: 736.9037173396674,
        width: 3.0013915966386553,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 52,
    iou: 0.363679823536289,
    type: "symbol",
    rectangles: [
      {
        left: 439.2036369747899,
        top: 737.9035866983373,
        width: 5.002319327731092,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 53,
    iou: 0.228743074999546,
    type: "symbol",
    rectangles: [
      {
        left: 433.2008537815126,
        top: 737.9035866983373,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 54,
    iou: 0.307353197528008,
    type: "symbol",
    rectangles: [
      {
        left: 429.19899831932776,
        top: 735.9038479809976,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 55,
    iou: 0.102889883827991,
    type: "symbol",
    rectangles: [
      {
        left: 425.19714285714286,
        top: 733.9041092636579,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 56,
    iou: 0.331822764365027,
    type: "symbol",
    rectangles: [
      {
        left: 407.18879327731094,
        top: 733.9041092636579,
        width: 4.001855462184874,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 57,
    iou: 0.624479232527165,
    type: "symbol",
    rectangles: [
      {
        left: 441.2045647058824,
        top: 749.9020190023753,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 58,
    iou: 0.344586016114573,
    type: "symbol",
    rectangles: [
      {
        left: 435.20178151260507,
        top: 749.9020190023753,
        width: 4.001855462184874,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 59,
    iou: 0.36896985445848,
    type: "symbol",
    rectangles: [
      {
        left: 428.1985344537815,
        top: 749.9020190023753,
        width: 3.0013915966386553,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 60,
    iou: 0.455268379202712,
    type: "symbol",
    rectangles: [
      {
        left: 422.1957512605042,
        top: 750.9018883610452,
        width: 5.002319327731092,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 61,
    iou: 0.615512627192891,
    type: "symbol",
    rectangles: [
      {
        left: 417.19343193277314,
        top: 750.9018883610452,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 62,
    iou: 0.247720232802004,
    type: "symbol",
    rectangles: [
      {
        left: 413.19157647058825,
        top: 747.9022802850357,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 63,
    iou: 0.626171441460164,
    type: "symbol",
    rectangles: [
      {
        left: 374.17348571428573,
        top: 741.9030641330166,
        width: 5.002319327731092,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 64,
    iou: 0.553192424235547,
    type: "symbol",
    rectangles: [
      {
        left: 365.16931092436977,
        top: 741.9030641330166,
        width: 5.002319327731092,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 65,
    iou: 0.626216686969699,
    type: "symbol",
    rectangles: [
      {
        left: 357.1656,
        top: 740.9031947743468,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 66,
    iou: 0.661960572179993,
    type: "symbol",
    rectangles: [
      {
        left: 352.1632806722689,
        top: 744.9026722090262,
        width: 4.001855462184874,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 67,
    iou: 0.10754334152623,
    type: "symbol",
    rectangles: [
      {
        left: 450.20873949579834,
        top: 703.908028503563,
        width: 4.001855462184874,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 68,
    iou: 0.438138687875462,
    type: "symbol",
    rectangles: [
      {
        left: 441.2045647058824,
        top: 707.9075059382423,
        width: 8.003710924369749,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 69,
    iou: 0.213073526450864,
    type: "symbol",
    rectangles: [
      {
        left: 426.1976067226891,
        top: 704.9078978622327,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 70,
    iou: 0.524097374718113,
    type: "symbol",
    rectangles: [
      {
        left: 420.1948235294118,
        top: 707.9075059382423,
        width: 6.002783193277311,
        height: 6.999085510688836
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 71,
    iou: 0.611648949545765,
    type: "symbol",
    rectangles: [
      {
        left: 389.180443697479,
        top: 704.9078978622327,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 72,
    iou: 0.684205211007512,
    type: "symbol",
    rectangles: [
      {
        left: 384.1781243697479,
        top: 705.9077672209027,
        width: 5.002319327731092,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 73,
    iou: 0.573771295784295,
    type: "symbol",
    rectangles: [
      {
        left: 372.17255798319326,
        top: 703.908028503563,
        width: 4.001855462184874,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 74,
    iou: 0.408450813073837,
    type: "symbol",
    rectangles: [
      {
        left: 363.1683831932773,
        top: 707.9075059382423,
        width: 8.003710924369749,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 75,
    iou: 0.165912716823381,
    type: "symbol",
    rectangles: [
      {
        left: 348.161425210084,
        top: 704.9078978622327,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 76,
    iou: 0.457335985235201,
    type: "symbol",
    rectangles: [
      {
        left: 341.15817815126053,
        top: 707.9075059382423,
        width: 6.002783193277311,
        height: 6.999085510688836
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 77,
    iou: 0.623750862656422,
    type: "symbol",
    rectangles: [
      {
        left: 310.14379831932774,
        top: 704.9078978622327,
        width: 4.001855462184874,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 78,
    iou: 0.61611108335429,
    type: "symbol",
    rectangles: [
      {
        left: 305.1414789915966,
        top: 705.9077672209027,
        width: 5.002319327731092,
        height: 3.999477434679335
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 79,
    iou: 0.631629121267835,
    type: "symbol",
    rectangles: [
      {
        left: 498.2310050420168,
        top: 703.908028503563,
        width: 4.001855462184874,
        height: 2.999608076009501
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 80,
    iou: 0.711994487970461,
    type: "symbol",
    rectangles: [
      {
        left: 491.22775798319327,
        top: 707.9075059382423,
        width: 6.002783193277311,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 81,
    iou: 0.27392230998612,
    type: "symbol",
    rectangles: [
      {
        left: 532.2467764705882,
        top: 703.908028503563,
        width: 3.0013915966386553,
        height: 4.999346793349169
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 82,
    iou: 0.513200023962826,
    type: "symbol",
    rectangles: [
      {
        left: 524.2430655462185,
        top: 707.9075059382423,
        width: 7.003247058823529,
        height: 5.999216152019002
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 83,
    iou: 0.723279177898827,
    type: "symbol",
    rectangles: [
      {
        left: 372.17255798319326,
        top: 685.9103800475059,
        width: 6.002783193277311,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 0,
    iou: 0.877226847280355,
    type: "citation",
    rectangles: [
      {
        left: 502.23286050420165,
        top: 603.9210926365796,
        width: 15.006957983193278,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 1,
    iou: 0.629385467545111,
    type: "citation",
    rectangles: [
      {
        left: 451.2092033613445,
        top: 400.94761282660335,
        width: 15.006957983193278,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 2,
    iou: 0.630868189025395,
    type: "citation",
    rectangles: [
      {
        left: 522.2421378151261,
        top: 296.96119952494064,
        width: 15.006957983193278,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 3,
    iou: 0.696983315275256,
    type: "citation",
    rectangles: [
      {
        left: 305.1414789915966,
        top: 274.9640736342043,
        width: 28.012988235294117,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 4,
    iou: 0.636321214781488,
    type: "citation",
    rectangles: [
      {
        left: 387.17951596638653,
        top: 192.9747862232779,
        width: 14.006494117647058,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 5,
    iou: 0.763597516965049,
    type: "citation",
    rectangles: [
      {
        left: 392.18183529411766,
        top: 170.97766033254157,
        width: 15.006957983193278,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 6,
    iou: 0.810249500923531,
    type: "citation",
    rectangles: [
      {
        left: 443.2054924369748,
        top: 170.97766033254157,
        width: 10.004638655462184,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 7,
    iou: 0.759791649287449,
    type: "citation",
    rectangles: [
      {
        left: 364.16884705882353,
        top: 137.98197149643704,
        width: 15.006957983193278,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 8,
    iou: 0.126479877385255,
    type: "citation",
    rectangles: [
      {
        left: 272.1261714285714,
        top: 353.9537529691211,
        width: 15.006957983193278,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 9,
    iou: 0.246256535019632,
    type: "citation",
    rectangles: [
      {
        left: 97.04499495798319,
        top: 342.95519002375295,
        width: 15.006957983193278,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 10,
    iou: 0.737922175245126,
    type: "citation",
    rectangles: [
      {
        left: 472.2189445378151,
        top: 662.9133847980997,
        width: 15.006957983193278,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10346",
    page: 3,
    index: 11,
    iou: 0.663314542097865,
    type: "citation",
    rectangles: [
      {
        left: 519.2407462184874,
        top: 662.9133847980997,
        width: 15.006957983193278,
        height: 7.99895486935867
      }
    ]
  },
  {
    arxivId: "1911.10353",
    page: 3,
    index: 0,
    iou: 0.542073170731703,
    type: "citation",
    rectangles: [{ left: 179.0, top: 426.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.10353",
    page: 3,
    index: 1,
    iou: 0.460616874840684,
    type: "citation",
    rectangles: [{ left: 149.0, top: 390.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.10353",
    page: 3,
    index: 2,
    iou: 0.530899449316744,
    type: "citation",
    rectangles: [{ left: 481.0, top: 733.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.10353",
    page: 3,
    index: 3,
    iou: 0.133899412148922,
    type: "citation",
    rectangles: [{ left: 393.0, top: 709.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.10353",
    page: 3,
    index: 4,
    iou: 0.436065573770491,
    type: "citation",
    rectangles: [{ left: 386.0, top: 489.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.11124",
    page: 2,
    index: 0,
    iou: 0.551756466937364,
    type: "citation",
    rectangles: [
      {
        left: 411.19064873949577,
        top: 607.9205700712589,
        width: 10.004638655462184,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.11124",
    page: 2,
    index: 1,
    iou: 0.756966733464398,
    type: "citation",
    rectangles: [
      {
        left: 464.2152336134454,
        top: 574.9248812351544,
        width: 10.004638655462184,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.11124",
    page: 2,
    index: 2,
    iou: 0.901240469644363,
    type: "citation",
    rectangles: [
      {
        left: 107.04963361344538,
        top: 540.92932304038,
        width: 39.01809075630252,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.11124",
    page: 2,
    index: 3,
    iou: 0.854170928455899,
    type: "citation",
    rectangles: [
      {
        left: 146.0677243697479,
        top: 425.94434679334915,
        width: 15.006957983193278,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.11124",
    page: 2,
    index: 4,
    iou: 0.863359517864079,
    type: "citation",
    rectangles: [
      {
        left: 199.09230924369749,
        top: 343.9550593824228,
        width: 32.014843697478994,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.11124",
    page: 2,
    index: 5,
    iou: 0.790034817169552,
    type: "citation",
    rectangles: [
      {
        left: 349.16188907563026,
        top: 244.96799287410926,
        width: 15.006957983193278,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.11124",
    page: 2,
    index: 6,
    iou: 0.835116456778151,
    type: "citation",
    rectangles: [
      {
        left: 147.06818823529412,
        top: 178.97661520190024,
        width: 51.02365714285714,
        height: 11.998432304038005
      }
    ]
  },
  {
    arxivId: "1911.11657",
    page: 5,
    index: 0,
    iou: 0.148491837865865,
    type: "citation",
    rectangles: [{ left: 216.0, top: 633.0, width: 100.0, height: 11.0 }]
  },
  {
    arxivId: "1911.11862",
    page: 0,
    index: 0,
    iou: 0.439780109945027,
    type: "citation",
    rectangles: [{ left: 164.0, top: 510.0, width: 8.0, height: 10.0 }]
  },
  {
    arxivId: "1911.11862",
    page: 0,
    index: 1,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 189.0, top: 245.0, width: 19.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 0,
    iou: 0.581395348837208,
    type: "citation",
    rectangles: [{ left: 148.0, top: 389.0, width: 8.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 1,
    iou: 0.683962264150942,
    type: "citation",
    rectangles: [{ left: 165.0, top: 377.0, width: 9.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 2,
    iou: 0.800319772606149,
    type: "citation",
    rectangles: [{ left: 155.0, top: 281.0, width: 9.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 3,
    iou: 0.840317100792756,
    type: "citation",
    rectangles: [{ left: 130.0, top: 257.0, width: 28.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 4,
    iou: 0.804603330068559,
    type: "citation",
    rectangles: [{ left: 181.0, top: 233.0, width: 31.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 5,
    iou: 0.716332378223495,
    type: "citation",
    rectangles: [{ left: 78.0, top: 197.0, width: 14.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 6,
    iou: 0.745841995841995,
    type: "citation",
    rectangles: [{ left: 55.0, top: 149.0, width: 29.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 7,
    iou: 0.765096065873741,
    type: "citation",
    rectangles: [{ left: 95.0, top: 101.0, width: 67.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 8,
    iou: 0.824480369515021,
    type: "citation",
    rectangles: [{ left: 515.0, top: 535.0, width: 28.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 9,
    iou: 0.951784222460916,
    type: "citation",
    rectangles: [{ left: 447.0, top: 524.0, width: 29.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 10,
    iou: 0.749464668094219,
    type: "citation",
    rectangles: [{ left: 480.0, top: 428.0, width: 14.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 11,
    iou: 0.89531811299469,
    type: "citation",
    rectangles: [{ left: 457.0, top: 332.0, width: 57.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 12,
    iou: 0.694356773134704,
    type: "citation",
    rectangles: [{ left: 236.0, top: 461.0, width: 22.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12923",
    page: 9,
    index: 0,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 484.0, top: 558.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.12923",
    page: 9,
    index: 1,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 146.0, top: 544.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.12923",
    page: 9,
    index: 2,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 484.0, top: 544.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.12923",
    page: 9,
    index: 3,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 146.0, top: 529.0, width: 5.0, height: 8.0 }]
  },
  {
    arxivId: "1911.13142",
    page: 6,
    index: 0,
    iou: 0.777514898486275,
    type: "citation",
    rectangles: [
      {
        left: 57.026440336134456,
        top: 511.93311163895487,
        width: 412.191112605042,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.13142",
    page: 6,
    index: 1,
    iou: 0.724554847396791,
    type: "citation",
    rectangles: [
      {
        left: 391.1813714285714,
        top: 346.9546674584323,
        width: 79.03664537815126,
        height: 8.998824228028504
      }
    ]
  },
  {
    arxivId: "1911.13254",
    page: 4,
    index: 0,
    iou: 0.611498836822864,
    type: "citation",
    rectangles: [{ left: 324.0, top: 441.0, width: 92.0, height: 9.0 }]
  },
  {
    arxivId: "1911.13254",
    page: 4,
    index: 1,
    iou: 0.778644356211003,
    type: "citation",
    rectangles: [{ left: 167.0, top: 441.0, width: 109.0, height: 9.0 }]
  },
  {
    arxivId: "1911.13254",
    page: 4,
    index: 2,
    iou: 0.611498836822864,
    type: "citation",
    rectangles: [{ left: 324.0, top: 441.0, width: 92.0, height: 9.0 }]
  },
  {
    arxivId: "1911.13254",
    page: 4,
    index: 3,
    iou: 0.863455809334657,
    type: "citation",
    rectangles: [{ left: 357.0, top: 339.0, width: 90.0, height: 10.0 }]
  },
  {
    arxivId: "1911.13254",
    page: 4,
    index: 4,
    iou: 0.632768361581921,
    type: "citation",
    rectangles: [{ left: 309.0, top: 135.0, width: 85.0, height: 9.0 }]
  },
  {
    arxivId: "1911.13254",
    page: 4,
    index: 5,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 108.0, top: 113.0, width: 109.0, height: 9.0 }]
  }
];
