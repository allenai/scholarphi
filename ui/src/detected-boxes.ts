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
    iou: 0.748262300975072,
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
    iou: 0.721063662546887,
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
    iou: 0.587774294670846,
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
    iou: 0.680580762250455,
    type: "citation",
    rectangles: [{ left: 405.0, top: 519.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01629",
    page: 2,
    index: 4,
    iou: 0.68181818181818,
    type: "citation",
    rectangles: [{ left: 354.0, top: 459.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01629",
    page: 2,
    index: 5,
    iou: 0.70815450643777,
    type: "citation",
    rectangles: [{ left: 514.0, top: 447.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01629",
    page: 2,
    index: 6,
    iou: 0.852585258525852,
    type: "citation",
    rectangles: [{ left: 439.0, top: 279.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01629",
    page: 2,
    index: 7,
    iou: 0.553784860557767,
    type: "citation",
    rectangles: [{ left: 478.0, top: 231.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01629",
    page: 2,
    index: 8,
    iou: 0.575868372943328,
    type: "citation",
    rectangles: [{ left: 398.0, top: 208.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.01848",
    page: 1,
    index: 0,
    iou: 0.711815561959653,
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
    iou: 0.649350649350649,
    type: "citation",
    rectangles: [{ left: 221.0, top: 257.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.02023",
    page: 13,
    index: 0,
    iou: 0.337494319708521,
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
    iou: 0.338737155933475,
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
    iou: 0.336812513002036,
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
    iou: 0.404175015602442,
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
    iou: 0.348700013460929,
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
    iou: 0.348700013460929,
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
    iou: 0.390912979757383,
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
    iou: 0.0348476264186987,
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
    iou: 0.34582854910239,
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
    iou: 0.374834721395856,
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
    iou: 0,
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
    iou: 0.378914077127287,
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
    iou: 0.473642596409117,
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
    iou: 0.823221538782684,
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
    iou: 0.838484627731368,
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
    iou: 0.816668118534219,
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
    iou: 0.823221538782684,
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
    iou: 0.575376005596365,
    type: "symbol",
    rectangles: [{ left: 163.0, top: 449.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.02038",
    page: 5,
    index: 1,
    iou: 0.600137174211247,
    type: "symbol",
    rectangles: [{ left: 181.0, top: 401.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.02038",
    page: 5,
    index: 0,
    iou: 0.808046758501899,
    type: "citation",
    rectangles: [{ left: 431.0, top: 530.0, width: 30.0, height: 9.0 }]
  },
  {
    arxivId: "1911.02038",
    page: 5,
    index: 1,
    iou: 0.897631139846986,
    type: "citation",
    rectangles: [{ left: 479.0, top: 507.0, width: 63.0, height: 9.0 }]
  },
  {
    arxivId: "1911.02038",
    page: 5,
    index: 2,
    iou: 0.886305193991152,
    type: "citation",
    rectangles: [{ left: 454.0, top: 231.0, width: 31.0, height: 9.0 }]
  },
  {
    arxivId: "1911.02316",
    page: 3,
    index: 0,
    iou: 0.917603636239362,
    type: "citation",
    rectangles: [{ left: 89.0, top: 510.0, width: 14.0, height: 11.0 }]
  },
  {
    arxivId: "1911.02316",
    page: 3,
    index: 1,
    iou: 0.785412204097326,
    type: "citation",
    rectangles: [{ left: 255.0, top: 438.0, width: 13.0, height: 11.0 }]
  },
  {
    arxivId: "1911.02316",
    page: 3,
    index: 2,
    iou: 0.920549010325514,
    type: "citation",
    rectangles: [{ left: 90.0, top: 127.0, width: 13.0, height: 11.0 }]
  },
  {
    arxivId: "1911.02316",
    page: 3,
    index: 3,
    iou: 0.679012345679011,
    type: "citation",
    rectangles: [{ left: 397.0, top: 152.0, width: 13.0, height: 11.0 }]
  },
  {
    arxivId: "1911.03521",
    page: 16,
    index: 0,
    iou: 0.565585947000617,
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
    iou: 0.496977282394364,
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
    iou: 0.533155705250659,
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
    iou: 0.627442607729002,
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
    iou: 0.527824148198153,
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
    iou: 0.565585947000617,
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
    iou: 0.427816631663947,
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
    iou: 0.764900588259707,
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
    iou: 0.682086490043635,
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
    iou: 0.559813490513191,
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
    iou: 0.666888775744027,
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
    iou: 0.749874935244414,
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
    iou: 0.672266911032287,
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
    iou: 0.638782352245238,
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
    iou: 0.658981003699629,
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
    iou: 0.666888775744024,
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
    iou: 0.235166632980435,
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
    iou: 0.519944185020136,
    type: "symbol",
    rectangles: [{ left: 211.0, top: 352.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 2,
    iou: 0.108963991338152,
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
    iou: 0.502629847580631,
    type: "symbol",
    rectangles: [{ left: 188.0, top: 352.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 4,
    iou: 0.632281441584393,
    type: "symbol",
    rectangles: [{ left: 173.0, top: 361.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 5,
    iou: 0.376854555422721,
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
    iou: 0.501100803499767,
    type: "symbol",
    rectangles: [{ left: 159.0, top: 343.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 7,
    iou: 0.590191203480759,
    type: "symbol",
    rectangles: [{ left: 138.0, top: 352.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 8,
    iou: 0.650647054282082,
    type: "symbol",
    rectangles: [{ left: 130.0, top: 352.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 9,
    iou: 0.620736698499319,
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
    iou: 0.0614735716581814,
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
    iou: 0.657066456405398,
    type: "symbol",
    rectangles: [{ left: 236.0, top: 323.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 0,
    iou: 0.313530114758953,
    type: "citation",
    rectangles: [{ left: 387.0, top: 458.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 1,
    iou: 0.791941078156051,
    type: "citation",
    rectangles: [{ left: 511.0, top: 395.0, width: 40.0, height: 9.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 2,
    iou: 0.650864680576927,
    type: "citation",
    rectangles: [{ left: 432.0, top: 287.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.04866",
    page: 6,
    index: 3,
    iou: 0.808871547678639,
    type: "citation",
    rectangles: [{ left: 544.0, top: 263.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.04912",
    page: 2,
    index: 0,
    iou: 0.767125681873916,
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
    iou: 0.785040899757579,
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
    iou: 0.896133468595945,
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
    iou: 0.783611521961723,
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
    iou: 0.851072145159551,
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
    iou: 0.78331485980562,
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
    iou: 0.845794566577783,
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
    iou: 0.855514163595398,
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
    iou: 0.807624095579202,
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
    iou: 0.92505813475745,
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
    iou: 0.876861574361374,
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
    iou: 0.941025271164175,
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
    iou: 0.850790444670339,
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
    iou: 0.0838163387137149,
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
    iou: 0.315500327315856,
    type: "symbol",
    rectangles: [{ left: 244.0, top: 602.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 6,
    iou: 0.580645252861597,
    type: "symbol",
    rectangles: [{ left: 226.0, top: 602.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 7,
    iou: 0.604316765384768,
    type: "symbol",
    rectangles: [{ left: 217.0, top: 604.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 8,
    iou: 0.20245462451922,
    type: "symbol",
    rectangles: [{ left: 212.0, top: 598.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 9,
    iou: 0.705271879166852,
    type: "symbol",
    rectangles: [{ left: 206.0, top: 602.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 10,
    iou: 0.436954568447958,
    type: "symbol",
    rectangles: [{ left: 175.0, top: 602.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 11,
    iou: 0.460894955904148,
    type: "symbol",
    rectangles: [{ left: 158.0, top: 602.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 12,
    iou: 0.654685768946822,
    type: "symbol",
    rectangles: [{ left: 147.0, top: 602.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 13,
    iou: 0.579145337330821,
    type: "symbol",
    rectangles: [{ left: 136.0, top: 604.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 14,
    iou: 0.446033340671564,
    type: "symbol",
    rectangles: [{ left: 122.0, top: 597.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 15,
    iou: 0.717037653158168,
    type: "symbol",
    rectangles: [{ left: 115.0, top: 602.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 16,
    iou: 0.558760435589543,
    type: "symbol",
    rectangles: [{ left: 92.0, top: 595.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 17,
    iou: 0.611771792587112,
    type: "symbol",
    rectangles: [{ left: 86.0, top: 597.0, width: 6.0, height: 8.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 18,
    iou: 0.578450573826046,
    type: "symbol",
    rectangles: [{ left: 89.0, top: 610.0, width: 6.0, height: 8.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 19,
    iou: 0.105031811513618,
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
    iou: 0.320114132872107,
    type: "symbol",
    rectangles: [{ left: 212.0, top: 519.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 21,
    iou: 0.210973351141049,
    type: "symbol",
    rectangles: [{ left: 203.0, top: 519.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 22,
    iou: 0.401710172767688,
    type: "symbol",
    rectangles: [{ left: 187.0, top: 517.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 23,
    iou: 0.267244002848534,
    type: "symbol",
    rectangles: [{ left: 182.0, top: 519.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 24,
    iou: 0.251714535353976,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 519.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 25,
    iou: 0.112751252146591,
    type: "symbol",
    rectangles: [{ left: 161.0, top: 516.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 26,
    iou: 0.297807540064735,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 518.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 27,
    iou: 0.182632717064476,
    type: "symbol",
    rectangles: [{ left: 143.0, top: 518.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 28,
    iou: 0.270305379961226,
    type: "symbol",
    rectangles: [{ left: 127.0, top: 518.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 29,
    iou: 0.177595262106544,
    type: "symbol",
    rectangles: [{ left: 123.0, top: 519.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 30,
    iou: 0.290759730473286,
    type: "symbol",
    rectangles: [{ left: 110.0, top: 519.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 31,
    iou: 0.177213770960407,
    type: "symbol",
    rectangles: [{ left: 101.0, top: 514.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 32,
    iou: 0.241861379265996,
    type: "symbol",
    rectangles: [{ left: 92.0, top: 516.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 33,
    iou: 0.221022936260911,
    type: "symbol",
    rectangles: [{ left: 87.0, top: 519.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 34,
    iou: 0.0809846907215486,
    type: "symbol",
    rectangles: [{ left: 82.0, top: 516.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 35,
    iou: 0.440640761507449,
    type: "symbol",
    rectangles: [{ left: 75.0, top: 521.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 36,
    iou: 0.252386933635188,
    type: "symbol",
    rectangles: [{ left: 299.0, top: 546.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 37,
    iou: 0.334887851174392,
    type: "symbol",
    rectangles: [{ left: 281.0, top: 546.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 38,
    iou: 0.328087506047533,
    type: "symbol",
    rectangles: [{ left: 268.0, top: 548.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 39,
    iou: 0.412640107357728,
    type: "symbol",
    rectangles: [{ left: 250.0, top: 548.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 40,
    iou: 0.362243976613356,
    type: "symbol",
    rectangles: [{ left: 239.0, top: 548.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 41,
    iou: 0.32063249339477,
    type: "symbol",
    rectangles: [{ left: 230.0, top: 544.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 42,
    iou: 0.26432796657666,
    type: "symbol",
    rectangles: [{ left: 219.0, top: 544.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 43,
    iou: 0.292661899159023,
    type: "symbol",
    rectangles: [{ left: 203.0, top: 544.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 44,
    iou: 0.27429669200326,
    type: "symbol",
    rectangles: [{ left: 191.0, top: 544.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 45,
    iou: 0.267496664115642,
    type: "symbol",
    rectangles: [{ left: 186.0, top: 546.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 46,
    iou: 0.148944385068467,
    type: "symbol",
    rectangles: [{ left: 177.0, top: 546.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 47,
    iou: 0.367566798734903,
    type: "symbol",
    rectangles: [{ left: 172.0, top: 548.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 48,
    iou: 0.105031811513618,
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
    iou: 0.121183769876229,
    type: "symbol",
    rectangles: [{ left: 108.0, top: 497.0, width: 2.0, height: 2.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 50,
    iou: 0.111253021151055,
    type: "symbol",
    rectangles: [{ left: 228.0, top: 497.0, width: 2.0, height: 2.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 51,
    iou: 0.220303534280675,
    type: "symbol",
    rectangles: [{ left: 218.0, top: 351.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 52,
    iou: 0.405383220004031,
    type: "symbol",
    rectangles: [{ left: 207.0, top: 352.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 53,
    iou: 0.316310947619697,
    type: "symbol",
    rectangles: [{ left: 198.0, top: 352.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 54,
    iou: 0.217897201196423,
    type: "symbol",
    rectangles: [{ left: 185.0, top: 351.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 55,
    iou: 0.184400155878789,
    type: "symbol",
    rectangles: [{ left: 181.0, top: 352.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 56,
    iou: 0.123073425992833,
    type: "symbol",
    rectangles: [{ left: 176.0, top: 349.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 57,
    iou: 0.234013650016205,
    type: "symbol",
    rectangles: [{ left: 169.0, top: 352.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 58,
    iou: 0.478894163415728,
    type: "symbol",
    rectangles: [{ left: 125.0, top: 352.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 59,
    iou: 0.609940970362283,
    type: "symbol",
    rectangles: [{ left: 114.0, top: 352.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 60,
    iou: 0.35729450910367,
    type: "symbol",
    rectangles: [{ left: 104.0, top: 352.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 61,
    iou: 0.215512943664743,
    type: "symbol",
    rectangles: [{ left: 215.0, top: 306.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 62,
    iou: 0.208090132947882,
    type: "symbol",
    rectangles: [{ left: 211.0, top: 309.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 63,
    iou: 0.274318539401108,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 309.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 64,
    iou: 0.285565598247319,
    type: "symbol",
    rectangles: [{ left: 188.0, top: 306.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 65,
    iou: 0.337043810017773,
    type: "symbol",
    rectangles: [{ left: 178.0, top: 309.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 66,
    iou: 0.11426991261467,
    type: "symbol",
    rectangles: [{ left: 173.0, top: 306.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 67,
    iou: 0.493213858060761,
    type: "symbol",
    rectangles: [{ left: 166.0, top: 311.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 68,
    iou: 0.453273700731239,
    type: "symbol",
    rectangles: [{ left: 122.0, top: 309.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 69,
    iou: 0.486723089651407,
    type: "symbol",
    rectangles: [{ left: 111.0, top: 311.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 70,
    iou: 0.583831536056697,
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
    iou: 0.456542708645691,
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
    iou: 0.428219708216681,
    type: "symbol",
    rectangles: [{ left: 146.0, top: 276.0, width: 7.0, height: 6.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 74,
    iou: 0.445469085406318,
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
    iou: 0.23555423232434,
    type: "symbol",
    rectangles: [{ left: 510.0, top: 640.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 76,
    iou: 0.393917688740712,
    type: "symbol",
    rectangles: [{ left: 500.0, top: 640.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 77,
    iou: 0.393023067528448,
    type: "symbol",
    rectangles: [{ left: 487.0, top: 636.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 78,
    iou: 0.518100120476408,
    type: "symbol",
    rectangles: [{ left: 476.0, top: 638.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 79,
    iou: 0.236760949327283,
    type: "symbol",
    rectangles: [{ left: 472.0, top: 640.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 80,
    iou: 0.405137970972271,
    type: "symbol",
    rectangles: [{ left: 463.0, top: 640.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 81,
    iou: 0.392959254898758,
    type: "symbol",
    rectangles: [{ left: 449.0, top: 635.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 82,
    iou: 0.308404903039632,
    type: "symbol",
    rectangles: [{ left: 434.0, top: 637.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 83,
    iou: 0.274672438198856,
    type: "symbol",
    rectangles: [{ left: 423.0, top: 640.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 84,
    iou: 0.30122073450968,
    type: "symbol",
    rectangles: [{ left: 414.0, top: 640.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 85,
    iou: 0.333060831520326,
    type: "symbol",
    rectangles: [{ left: 396.0, top: 637.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 86,
    iou: 0.229758206397649,
    type: "symbol",
    rectangles: [{ left: 391.0, top: 640.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 87,
    iou: 0.185773640289971,
    type: "symbol",
    rectangles: [{ left: 386.0, top: 636.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 88,
    iou: 0.47026845943698,
    type: "symbol",
    rectangles: [{ left: 379.0, top: 642.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 89,
    iou: 0.607200667428854,
    type: "symbol",
    rectangles: [{ left: 361.0, top: 626.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 90,
    iou: 0.535392693766292,
    type: "symbol",
    rectangles: [{ left: 349.0, top: 628.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 91,
    iou: 0.61297292734256,
    type: "symbol",
    rectangles: [{ left: 338.0, top: 635.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 92,
    iou: 0.754507758645688,
    type: "symbol",
    rectangles: [{ left: 338.0, top: 647.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 93,
    iou: 0.204271004726715,
    type: "symbol",
    rectangles: [{ left: 511.0, top: 667.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 94,
    iou: 0.259871659971956,
    type: "symbol",
    rectangles: [{ left: 507.0, top: 670.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 95,
    iou: 0.468744461375509,
    type: "symbol",
    rectangles: [{ left: 497.0, top: 670.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 96,
    iou: 0.456057578795262,
    type: "symbol",
    rectangles: [{ left: 481.0, top: 667.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 97,
    iou: 0.318757806889096,
    type: "symbol",
    rectangles: [{ left: 471.0, top: 670.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 98,
    iou: 0.469567946754201,
    type: "symbol",
    rectangles: [{ left: 461.0, top: 670.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 99,
    iou: 0.515216248585776,
    type: "symbol",
    rectangles: [{ left: 450.0, top: 668.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 100,
    iou: 0.354125124026107,
    type: "symbol",
    rectangles: [{ left: 439.0, top: 668.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 101,
    iou: 0.403223308753381,
    type: "symbol",
    rectangles: [{ left: 431.0, top: 672.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 102,
    iou: 0.120552676713192,
    type: "symbol",
    rectangles: [{ left: 426.0, top: 667.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 103,
    iou: 0.445469085406318,
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
    iou: 0.403100812691548,
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
    iou: 0.0085252955061143,
    type: "symbol",
    rectangles: [{ left: 507.0, top: 538.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 107,
    iou: 0.234988125126416,
    type: "symbol",
    rectangles: [{ left: 493.0, top: 538.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 108,
    iou: 0.0906398707698059,
    type: "symbol",
    rectangles: [{ left: 478.0, top: 535.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 109,
    iou: 0.0273807768633071,
    type: "symbol",
    rectangles: [{ left: 467.0, top: 538.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 110,
    iou: 0.316607521452624,
    type: "symbol",
    rectangles: [{ left: 458.0, top: 538.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 111,
    iou: 0.62954417024634,
    type: "symbol",
    rectangles: [{ left: 446.0, top: 536.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 112,
    iou: 0.314609529154024,
    type: "symbol",
    rectangles: [{ left: 435.0, top: 536.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 113,
    iou: 0.0316732664057043,
    type: "symbol",
    rectangles: [{ left: 427.0, top: 540.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 114,
    iou: 0.0950299210771547,
    type: "symbol",
    rectangles: [{ left: 422.0, top: 535.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 115,
    iou: 0.40000557267391,
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
    iou: 0.18454746977641,
    type: "symbol",
    rectangles: [{ left: 370.0, top: 538.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 118,
    iou: 0.0920195763061898,
    type: "symbol",
    rectangles: [{ left: 357.0, top: 540.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 119,
    iou: 0.310403557909869,
    type: "symbol",
    rectangles: [{ left: 347.0, top: 540.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 120,
    iou: 0.0263266878031572,
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
    iou: 0.0838163387137149,
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
    iou: 0.0577617525331122,
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
    iou: 0.149065721418868,
    type: "symbol",
    rectangles: [{ left: 350.0, top: 445.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 132,
    iou: 0.125431198443112,
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
    iou: 0.0595806127564641,
    type: "symbol",
    rectangles: [{ left: 530.0, top: 473.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 136,
    iou: 0.0317355538507532,
    type: "symbol",
    rectangles: [{ left: 512.0, top: 473.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 137,
    iou: 0.0233812809348566,
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
    iou: 0.0247130737545171,
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
    iou: 0.0458442873983292,
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
    iou: 0.154784735002963,
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
    iou: 0.246715993522939,
    type: "symbol",
    rectangles: [{ left: 508.0, top: 319.0, width: 6.0, height: 2.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 148,
    iou: 0.172473739224246,
    type: "symbol",
    rectangles: [{ left: 503.0, top: 321.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 149,
    iou: 0.373205503537156,
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
    iou: 0.163145881181087,
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
    iou: 0.0925695265118311,
    type: "symbol",
    rectangles: [{ left: 476.0, top: 321.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 153,
    iou: 0.122676229214826,
    type: "symbol",
    rectangles: [{ left: 465.0, top: 321.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 154,
    iou: 0.257350923144746,
    type: "symbol",
    rectangles: [{ left: 459.0, top: 319.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 155,
    iou: 0.221936131256867,
    type: "symbol",
    rectangles: [{ left: 454.0, top: 321.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 156,
    iou: 0.368127690712783,
    type: "symbol",
    rectangles: [{ left: 448.0, top: 323.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 157,
    iou: 0.0871874868813435,
    type: "symbol",
    rectangles: [{ left: 412.0, top: 316.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 158,
    iou: 0.222733097156485,
    type: "symbol",
    rectangles: [{ left: 405.0, top: 319.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 159,
    iou: 0.305763414752063,
    type: "symbol",
    rectangles: [{ left: 402.0, top: 321.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 160,
    iou: 0.0874640239562953,
    type: "symbol",
    rectangles: [{ left: 391.0, top: 321.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 161,
    iou: 0.144973168932162,
    type: "symbol",
    rectangles: [{ left: 381.0, top: 321.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 162,
    iou: 0.100092557292218,
    type: "symbol",
    rectangles: [{ left: 511.0, top: 347.0, width: 6.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 163,
    iou: 0.292250113872708,
    type: "symbol",
    rectangles: [{ left: 505.0, top: 350.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 164,
    iou: 0.395707040216093,
    type: "symbol",
    rectangles: [{ left: 501.0, top: 352.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 165,
    iou: 0.12488022842958,
    type: "symbol",
    rectangles: [{ left: 491.0, top: 352.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 166,
    iou: 0.177032507746512,
    type: "symbol",
    rectangles: [{ left: 480.0, top: 352.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 167,
    iou: 0.120389725539836,
    type: "symbol",
    rectangles: [{ left: 474.0, top: 352.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 168,
    iou: 0.00198129878505694,
    type: "symbol",
    rectangles: [{ left: 468.0, top: 350.0, width: 6.0, height: 2.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 169,
    iou: 0.276631700798475,
    type: "symbol",
    rectangles: [{ left: 462.0, top: 352.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 170,
    iou: 0.237352162352286,
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
    iou: 0.0608771247034112,
    type: "symbol",
    rectangles: [{ left: 449.0, top: 350.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 172,
    iou: 0.264541549432606,
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
    iou: 0.0397500900974841,
    type: "symbol",
    rectangles: [{ left: 411.0, top: 337.0, width: 6.0, height: 2.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 175,
    iou: 0.154784735002963,
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
    iou: 0.350804213470004,
    type: "symbol",
    rectangles: [{ left: 396.0, top: 288.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 177,
    iou: 0.410553164506309,
    type: "symbol",
    rectangles: [{ left: 435.0, top: 230.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 178,
    iou: 0.274060003671049,
    type: "symbol",
    rectangles: [{ left: 429.0, top: 234.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 179,
    iou: 0.168619651474924,
    type: "symbol",
    rectangles: [{ left: 425.0, top: 236.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 180,
    iou: 0.453933482104227,
    type: "symbol",
    rectangles: [{ left: 412.0, top: 236.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 181,
    iou: 0.616840411303115,
    type: "symbol",
    rectangles: [{ left: 400.0, top: 236.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 182,
    iou: 0.461297507893971,
    type: "symbol",
    rectangles: [{ left: 386.0, top: 230.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 183,
    iou: 0.257776666661557,
    type: "symbol",
    rectangles: [{ left: 380.0, top: 234.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 184,
    iou: 0.429303967920451,
    type: "symbol",
    rectangles: [{ left: 376.0, top: 236.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 185,
    iou: 0.615890038707256,
    type: "symbol",
    rectangles: [{ left: 356.0, top: 230.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 186,
    iou: 0.297659182359792,
    type: "symbol",
    rectangles: [{ left: 350.0, top: 234.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 187,
    iou: 0.426133599915529,
    type: "symbol",
    rectangles: [{ left: 346.0, top: 236.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 188,
    iou: 0.648937304791445,
    type: "symbol",
    rectangles: [{ left: 333.0, top: 236.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 189,
    iou: 0.542194629332574,
    type: "symbol",
    rectangles: [{ left: 315.0, top: 236.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 190,
    iou: 0.464983370931181,
    type: "symbol",
    rectangles: [{ left: 304.0, top: 236.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 191,
    iou: 0.640663100677545,
    type: "symbol",
    rectangles: [{ left: 297.0, top: 232.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 192,
    iou: 0.537039624017742,
    type: "symbol",
    rectangles: [{ left: 290.0, top: 232.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 193,
    iou: 0.336248527659108,
    type: "symbol",
    rectangles: [{ left: 285.0, top: 234.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 194,
    iou: 0.514984231577977,
    type: "symbol",
    rectangles: [{ left: 277.0, top: 232.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 195,
    iou: 0.506209953441221,
    type: "symbol",
    rectangles: [{ left: 272.0, top: 232.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 196,
    iou: 0.554256115356317,
    type: "symbol",
    rectangles: [{ left: 267.0, top: 234.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 197,
    iou: 0.426644045728292,
    type: "symbol",
    rectangles: [{ left: 255.0, top: 220.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 198,
    iou: 0.510326421833359,
    type: "symbol",
    rectangles: [{ left: 246.0, top: 222.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 199,
    iou: 0.72655002440627,
    type: "symbol",
    rectangles: [{ left: 237.0, top: 229.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 200,
    iou: 0.555736505213211,
    type: "symbol",
    rectangles: [{ left: 229.0, top: 229.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 201,
    iou: 0.291454894691368,
    type: "symbol",
    rectangles: [{ left: 194.0, top: 230.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 202,
    iou: 0.29395391289057,
    type: "symbol",
    rectangles: [{ left: 187.0, top: 234.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 203,
    iou: 0.377635961563757,
    type: "symbol",
    rectangles: [{ left: 184.0, top: 236.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 204,
    iou: 0.469951686575623,
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
    iou: 0.79737934514893,
    type: "symbol",
    rectangles: [{ left: 159.0, top: 194.0, width: 5.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 207,
    iou: 0.339519870486987,
    type: "symbol",
    rectangles: [{ left: 442.0, top: 189.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 208,
    iou: 0.364167645716789,
    type: "symbol",
    rectangles: [{ left: 435.0, top: 192.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 209,
    iou: 0.259205563234971,
    type: "symbol",
    rectangles: [{ left: 432.0, top: 194.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 210,
    iou: 0.505337267447876,
    type: "symbol",
    rectangles: [{ left: 418.0, top: 194.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 211,
    iou: 0.483467548888222,
    type: "symbol",
    rectangles: [{ left: 408.0, top: 194.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 212,
    iou: 0.388332271973704,
    type: "symbol",
    rectangles: [{ left: 393.0, top: 189.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 213,
    iou: 0.406494637501569,
    type: "symbol",
    rectangles: [{ left: 386.0, top: 192.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 214,
    iou: 0.245407075578234,
    type: "symbol",
    rectangles: [{ left: 383.0, top: 194.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 215,
    iou: 0.496594578525343,
    type: "symbol",
    rectangles: [{ left: 363.0, top: 189.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 216,
    iou: 0.396730502845557,
    type: "symbol",
    rectangles: [{ left: 356.0, top: 192.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 217,
    iou: 0.231870467456012,
    type: "symbol",
    rectangles: [{ left: 353.0, top: 194.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 218,
    iou: 0.535970705354222,
    type: "symbol",
    rectangles: [{ left: 340.0, top: 194.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 219,
    iou: 0.746580380948866,
    type: "symbol",
    rectangles: [{ left: 321.0, top: 194.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 220,
    iou: 0.617254467972644,
    type: "symbol",
    rectangles: [{ left: 310.0, top: 194.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 221,
    iou: 0.211403312412105,
    type: "symbol",
    rectangles: [{ left: 304.0, top: 191.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 222,
    iou: 0.583596017854643,
    type: "symbol",
    rectangles: [{ left: 290.0, top: 191.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 223,
    iou: 0.682250009159043,
    type: "symbol",
    rectangles: [{ left: 279.0, top: 192.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 224,
    iou: 0.680598917061406,
    type: "symbol",
    rectangles: [{ left: 273.0, top: 191.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 225,
    iou: 0.474246407862862,
    type: "symbol",
    rectangles: [{ left: 266.0, top: 191.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 226,
    iou: 0.665396529819098,
    type: "symbol",
    rectangles: [{ left: 261.0, top: 192.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 227,
    iou: 0.591851655214673,
    type: "symbol",
    rectangles: [{ left: 249.0, top: 178.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 228,
    iou: 0.777959371810851,
    type: "symbol",
    rectangles: [{ left: 240.0, top: 180.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 229,
    iou: 0.832455229016472,
    type: "symbol",
    rectangles: [{ left: 231.0, top: 188.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 230,
    iou: 0.384528298920192,
    type: "symbol",
    rectangles: [{ left: 223.0, top: 188.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 231,
    iou: 0.67391035607815,
    type: "symbol",
    rectangles: [{ left: 188.0, top: 189.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 232,
    iou: 0.44809229466647,
    type: "symbol",
    rectangles: [{ left: 181.0, top: 192.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 233,
    iou: 0.589275392531249,
    type: "symbol",
    rectangles: [{ left: 178.0, top: 194.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 234,
    iou: 0.624225292068454,
    type: "symbol",
    rectangles: [{ left: 167.0, top: 194.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 235,
    iou: 0.79737934514893,
    type: "symbol",
    rectangles: [{ left: 159.0, top: 194.0, width: 5.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 236,
    iou: 0.585630552352408,
    type: "symbol",
    rectangles: [{ left: 180.0, top: 161.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 237,
    iou: 0.403773025461017,
    type: "symbol",
    rectangles: [{ left: 175.0, top: 161.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 238,
    iou: 0.410995179947748,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 164.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 239,
    iou: 0.770285894108322,
    type: "symbol",
    rectangles: [{ left: 151.0, top: 162.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 240,
    iou: 0.575773584559759,
    type: "symbol",
    rectangles: [{ left: 144.0, top: 162.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 241,
    iou: 0.465321881731284,
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
    iou: 0.553863850178532,
    type: "symbol",
    rectangles: [{ left: 149.0, top: 529.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 244,
    iou: 0.438709999750194,
    type: "symbol",
    rectangles: [{ left: 140.0, top: 531.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 245,
    iou: 0.523086920953488,
    type: "symbol",
    rectangles: [{ left: 129.0, top: 538.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 246,
    iou: 0.57240378250279,
    type: "symbol",
    rectangles: [{ left: 104.0, top: 543.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 247,
    iou: 0.528573052589754,
    type: "symbol",
    rectangles: [{ left: 94.0, top: 543.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 248,
    iou: 0.613009736663923,
    type: "symbol",
    rectangles: [{ left: 81.0, top: 545.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 249,
    iou: 0.760814111970087,
    type: "symbol",
    rectangles: [{ left: 70.0, top: 545.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 250,
    iou: 0.641801648550267,
    type: "symbol",
    rectangles: [{ left: 54.0, top: 545.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 251,
    iou: 0.762843504580064,
    type: "symbol",
    rectangles: [{ left: 401.0, top: 668.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 252,
    iou: 0.40917687622196,
    type: "symbol",
    rectangles: [{ left: 385.0, top: 668.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 253,
    iou: 0.639760756453439,
    type: "symbol",
    rectangles: [{ left: 374.0, top: 669.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 254,
    iou: 0.422006537675047,
    type: "symbol",
    rectangles: [{ left: 361.0, top: 657.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 255,
    iou: 0.748873574417451,
    type: "symbol",
    rectangles: [{ left: 347.0, top: 663.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 256,
    iou: 0.541962845626527,
    type: "symbol",
    rectangles: [{ left: 402.0, top: 699.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 257,
    iou: 0.756129887342611,
    type: "symbol",
    rectangles: [{ left: 391.0, top: 701.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 258,
    iou: 0.531494183376241,
    type: "symbol",
    rectangles: [{ left: 381.0, top: 701.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 259,
    iou: 0.662745342345323,
    type: "symbol",
    rectangles: [{ left: 367.0, top: 697.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 260,
    iou: 0.280627439589558,
    type: "symbol",
    rectangles: [{ left: 363.0, top: 699.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 261,
    iou: 0.583541856301224,
    type: "symbol",
    rectangles: [{ left: 344.0, top: 692.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 262,
    iou: 0.445941777395957,
    type: "symbol",
    rectangles: [{ left: 338.0, top: 694.0, width: 6.0, height: 8.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 263,
    iou: 0.600439088957304,
    type: "symbol",
    rectangles: [{ left: 341.0, top: 707.0, width: 6.0, height: 8.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 264,
    iou: 0.185490758511814,
    type: "symbol",
    rectangles: [{ left: 412.0, top: 463.0, width: 5.0, height: 2.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 265,
    iou: 0.214018620603175,
    type: "symbol",
    rectangles: [{ left: 403.0, top: 465.0, width: 4.0, height: 4.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 266,
    iou: 0.235938549884557,
    type: "symbol",
    rectangles: [{ left: 392.0, top: 473.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 267,
    iou: 0.226559278841024,
    type: "symbol",
    rectangles: [{ left: 367.0, top: 478.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 268,
    iou: 0.308422347059496,
    type: "symbol",
    rectangles: [{ left: 357.0, top: 478.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 269,
    iou: 0.418909603495501,
    type: "symbol",
    rectangles: [{ left: 344.0, top: 480.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 270,
    iou: 0.492768937654063,
    type: "symbol",
    rectangles: [{ left: 333.0, top: 480.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 271,
    iou: 0.692246953141666,
    type: "symbol",
    rectangles: [{ left: 318.0, top: 480.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 272,
    iou: 0.605640304700964,
    type: "symbol",
    rectangles: [{ left: 383.0, top: 351.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 273,
    iou: 0.769430101941699,
    type: "symbol",
    rectangles: [{ left: 372.0, top: 353.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.05065",
    page: 14,
    index: 274,
    iou: 0.54045935029488,
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
    iou: 0.236919799407202,
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
    iou: 0.190522611903261,
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
    iou: 0.0902868560223482,
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
    iou: 0.460730701351082,
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
    iou: 0,
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
    iou: 0,
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
    iou: 0,
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
    iou: 0,
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
    iou: 0,
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
    iou: 0,
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
    iou: 0,
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
    iou: 0.0298719041026067,
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
    iou: 0.0658156866501603,
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
    iou: 0.00940131046432586,
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
    iou: 0,
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
    iou: 0.422497286278133,
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
    iou: 0.311905464337631,
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
    iou: 0.502678847872847,
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
    iou: 0.246201463576637,
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
    iou: 0.316412763072332,
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
    iou: 0.670693306660948,
    type: "citation",
    rectangles: [{ left: 123.0, top: 694.0, width: 9.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 1,
    iou: 0.716805192493583,
    type: "citation",
    rectangles: [{ left: 102.0, top: 569.0, width: 14.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 2,
    iou: 0.647324073084734,
    type: "citation",
    rectangles: [{ left: 201.0, top: 415.0, width: 13.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 3,
    iou: 0.706081717190736,
    type: "citation",
    rectangles: [{ left: 389.0, top: 670.0, width: 22.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 4,
    iou: 0.76291993463368,
    type: "citation",
    rectangles: [{ left: 521.0, top: 514.0, width: 13.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 5,
    iou: 0.842332303816698,
    type: "citation",
    rectangles: [{ left: 328.0, top: 481.0, width: 14.0, height: 9.0 }]
  },
  {
    arxivId: "1911.05488",
    page: 6,
    index: 6,
    iou: 0.59375035342283,
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
    iou: 0.598185422498044,
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
    iou: 0.594310988102571,
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
    iou: 0.743851197872522,
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
    iou: 0.922043304824567,
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
    iou: 0.767442698442965,
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
    iou: 0.857884665194981,
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
    iou: 0.689655172413793,
    type: "citation",
    rectangles: [{ left: 168.0, top: 447.0, width: 10.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 1,
    iou: 0.824476650563607,
    type: "citation",
    rectangles: [{ left: 98.0, top: 705.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 2,
    iou: 0.910222222222222,
    type: "citation",
    rectangles: [{ left: 112.0, top: 578.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 3,
    iou: 0.784674329501915,
    type: "citation",
    rectangles: [{ left: 112.0, top: 567.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 4,
    iou: 0.826229508196721,
    type: "citation",
    rectangles: [{ left: 99.0, top: 556.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 5,
    iou: 0.843881856540084,
    type: "citation",
    rectangles: [{ left: 99.0, top: 545.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 6,
    iou: 0.796178343949044,
    type: "citation",
    rectangles: [{ left: 104.0, top: 533.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 7,
    iou: 0.755555555555555,
    type: "citation",
    rectangles: [{ left: 107.0, top: 136.0, width: 17.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 8,
    iou: 0.795031055900621,
    type: "citation",
    rectangles: [{ left: 177.0, top: 136.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 9,
    iou: 0.695652173913043,
    type: "citation",
    rectangles: [{ left: 310.0, top: 578.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 10,
    iou: 0.666666666666666,
    type: "citation",
    rectangles: [{ left: 529.0, top: 530.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 11,
    iou: 0.711111111111111,
    type: "citation",
    rectangles: [{ left: 370.0, top: 518.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 12,
    iou: 0.711111111111111,
    type: "citation",
    rectangles: [{ left: 388.0, top: 506.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 13,
    iou: 0.729483282674772,
    type: "citation",
    rectangles: [{ left: 529.0, top: 482.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 14,
    iou: 0.703296703296703,
    type: "citation",
    rectangles: [{ left: 366.0, top: 691.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 15,
    iou: 0.679045092838196,
    type: "citation",
    rectangles: [{ left: 346.0, top: 678.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 16,
    iou: 0.633271490414347,
    type: "citation",
    rectangles: [{ left: 351.0, top: 665.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 17,
    iou: 0.770691994572591,
    type: "citation",
    rectangles: [{ left: 360.0, top: 652.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 0,
    iou: 0.563097033685269,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 611.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07072",
    page: 7,
    index: 1,
    iou: 0.638854296388543,
    type: "symbol",
    rectangles: [{ left: 236.0, top: 223.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07222",
    page: 6,
    index: 0,
    iou: 0.530526092410065,
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
    iou: 0.672868711879474,
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
    iou: 0.334190194982265,
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
    iou: 0.364626072569296,
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
    iou: 0.178571428571428,
    type: "citation",
    rectangles: [{ left: 484.0, top: 231.0, width: 26.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 1,
    iou: 0.651041666666666,
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
    iou: 0.356125356125355,
    type: "symbol",
    rectangles: [{ left: 126.0, top: 213.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 7,
    iou: 0.45093795093795,
    type: "symbol",
    rectangles: [{ left: 178.0, top: 188.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 8,
    iou: 0.471284524331434,
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
    iou: 0.517970401691327,
    type: "symbol",
    rectangles: [{ left: 353.0, top: 266.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 11,
    iou: 0.540123456790123,
    type: "symbol",
    rectangles: [{ left: 437.0, top: 268.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07766",
    page: 0,
    index: 12,
    iou: 0.462732324200034,
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
    iou: 0.448717948717948,
    type: "symbol",
    rectangles: [{ left: 559.0, top: 94.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 0,
    iou: 0.758426966292126,
    type: "citation",
    rectangles: [{ left: 272.0, top: 632.0, width: 14.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 1,
    iou: 0.68181818181818,
    type: "citation",
    rectangles: [{ left: 178.0, top: 390.0, width: 14.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 2,
    iou: 0.6093432633717,
    type: "citation",
    rectangles: [{ left: 413.0, top: 327.0, width: 12.0, height: 10.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 3,
    iou: 0.64102564102564,
    type: "citation",
    rectangles: [{ left: 244.0, top: 297.0, width: 30.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 4,
    iou: 0.755422942123709,
    type: "citation",
    rectangles: [{ left: 349.0, top: 124.0, width: 58.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 5,
    iou: 0.655270655270654,
    type: "citation",
    rectangles: [{ left: 545.0, top: 101.0, width: 13.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 6,
    iou: 0.118483412322274,
    type: "citation",
    rectangles: [{ left: 518.0, top: 90.0, width: 9.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 7,
    iou: 0.649460188933873,
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
    iou: 0.535424836601307,
    type: "symbol",
    rectangles: [{ left: 137.0, top: 110.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 2,
    iou: 0.450813398549387,
    type: "symbol",
    rectangles: [{ left: 172.0, top: 77.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 3,
    iou: 0.399220272904483,
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
    iou: 0.450102880658438,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 536.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 8,
    iou: 0.0261066969353009,
    type: "symbol",
    rectangles: [{ left: 142.0, top: 533.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 9,
    iou: 0.0462962962962962,
    type: "symbol",
    rectangles: [{ left: 137.0, top: 533.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 10,
    iou: 0.0810185185185185,
    type: "symbol",
    rectangles: [{ left: 130.0, top: 533.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 11,
    iou: 0.185185185185185,
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
    iou: 0.392313851080861,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 398.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 16,
    iou: 0.0474158368895211,
    type: "symbol",
    rectangles: [{ left: 193.0, top: 395.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 17,
    iou: 0.0474158368895211,
    type: "symbol",
    rectangles: [{ left: 189.0, top: 395.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 18,
    iou: 0.0829777145566621,
    type: "symbol",
    rectangles: [{ left: 182.0, top: 395.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 19,
    iou: 0.187490394959274,
    type: "symbol",
    rectangles: [{ left: 174.0, top: 400.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 20,
    iou: 0.56163575677294,
    type: "symbol",
    rectangles: [{ left: 516.0, top: 348.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 21,
    iou: 0.566950186032715,
    type: "symbol",
    rectangles: [{ left: 492.0, top: 348.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 22,
    iou: 0.361349879892045,
    type: "symbol",
    rectangles: [{ left: 467.0, top: 317.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 23,
    iou: 0.182312476201486,
    type: "symbol",
    rectangles: [{ left: 463.0, top: 317.0, width: 4.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 24,
    iou: 0.414099058067639,
    type: "symbol",
    rectangles: [{ left: 458.0, top: 314.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 25,
    iou: 0.518518518518518,
    type: "symbol",
    rectangles: [{ left: 174.0, top: 319.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 26,
    iou: 0.361570247933884,
    type: "symbol",
    rectangles: [{ left: 148.0, top: 319.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 27,
    iou: 0.5395075076878,
    type: "symbol",
    rectangles: [{ left: 267.0, top: 250.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 28,
    iou: 0.0973072377866737,
    type: "symbol",
    rectangles: [{ left: 262.0, top: 251.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 29,
    iou: 0.602874994722248,
    type: "symbol",
    rectangles: [{ left: 257.0, top: 248.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 30,
    iou: 0.653388518917238,
    type: "symbol",
    rectangles: [{ left: 217.0, top: 250.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 31,
    iou: 0.0621091222773341,
    type: "symbol",
    rectangles: [{ left: 212.0, top: 251.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 32,
    iou: 0.514382750990581,
    type: "symbol",
    rectangles: [{ left: 207.0, top: 248.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 33,
    iou: 0.460220053764317,
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
    iou: 0.436146783987275,
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
    iou: 0.279501317741655,
    type: "symbol",
    rectangles: [{ left: 106.0, top: 248.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 38,
    iou: 0.103452050343216,
    type: "symbol",
    rectangles: [{ left: 101.0, top: 248.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 39,
    iou: 0.393865855129923,
    type: "symbol",
    rectangles: [{ left: 96.0, top: 251.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 40,
    iou: 0.450249109875489,
    type: "symbol",
    rectangles: [{ left: 87.0, top: 248.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 41,
    iou: 0.0311652445373266,
    type: "symbol",
    rectangles: [{ left: 78.0, top: 244.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 42,
    iou: 0.0365500858788067,
    type: "symbol",
    rectangles: [{ left: 74.0, top: 244.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 43,
    iou: 0.0639626502879117,
    type: "symbol",
    rectangles: [{ left: 67.0, top: 244.0, width: 7.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 44,
    iou: 0.00609168097980112,
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
    iou: 0.366061545815329,
    type: "symbol",
    rectangles: [{ left: 80.0, top: 214.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 47,
    iou: 0.718500087496213,
    type: "symbol",
    rectangles: [{ left: 75.0, top: 214.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 48,
    iou: 0.100749029320358,
    type: "symbol",
    rectangles: [{ left: 70.0, top: 217.0, width: 5.0, height: 11.0 }]
  },
  {
    arxivId: "1911.07815",
    page: 3,
    index: 49,
    iou: 0.530962962962963,
    type: "symbol",
    rectangles: [{ left: 64.0, top: 214.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07822",
    page: 0,
    index: 0,
    iou: 0.794951228558604,
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
    iou: 0.875760459323937,
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
    iou: 0.339937839937838,
    type: "symbol",
    rectangles: [{ left: 437.0, top: 652.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 1,
    iou: 0.312810327706059,
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
    iou: 0.315184908479641,
    type: "symbol",
    rectangles: [{ left: 69.0, top: 722.0, width: 235.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 5,
    iou: 0.122630992196208,
    type: "symbol",
    rectangles: [{ left: 283.0, top: 726.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 6,
    iou: 0.202131569276,
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
    iou: 0.267094017094016,
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
    iou: 0.106263982102906,
    type: "symbol",
    rectangles: [{ left: 246.0, top: 726.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 11,
    iou: 0.241126543209875,
    type: "symbol",
    rectangles: [{ left: 241.0, top: 722.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 12,
    iou: 0.583333333333332,
    type: "symbol",
    rectangles: [{ left: 230.0, top: 724.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 13,
    iou: 0.121527777777777,
    type: "symbol",
    rectangles: [{ left: 207.0, top: 722.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 14,
    iou: 0.0868055555555553,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 722.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 15,
    iou: 0.0729166666666664,
    type: "symbol",
    rectangles: [{ left: 199.0, top: 724.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 16,
    iou: 0.353535353535352,
    type: "symbol",
    rectangles: [{ left: 189.0, top: 724.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 17,
    iou: 0.105538595726121,
    type: "symbol",
    rectangles: [{ left: 167.0, top: 726.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 18,
    iou: 0.405092592592592,
    type: "symbol",
    rectangles: [{ left: 162.0, top: 722.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 19,
    iou: 0.149659863945577,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 726.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 20,
    iou: 0.289351851851851,
    type: "symbol",
    rectangles: [{ left: 149.0, top: 722.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 21,
    iou: 0.510700389105059,
    type: "symbol",
    rectangles: [{ left: 138.0, top: 724.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 22,
    iou: 0.120336424412336,
    type: "symbol",
    rectangles: [{ left: 132.0, top: 722.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 23,
    iou: 0.144675925925925,
    type: "symbol",
    rectangles: [{ left: 127.0, top: 722.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 24,
    iou: 0.121527777777777,
    type: "symbol",
    rectangles: [{ left: 124.0, top: 724.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 25,
    iou: 0.309923664122137,
    type: "symbol",
    rectangles: [{ left: 113.0, top: 724.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 26,
    iou: 0.115420129270545,
    type: "symbol",
    rectangles: [{ left: 97.0, top: 716.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 27,
    iou: 0.109257052046086,
    type: "symbol",
    rectangles: [{ left: 103.0, top: 722.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 28,
    iou: 0.126033474490825,
    type: "symbol",
    rectangles: [{ left: 98.0, top: 722.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 29,
    iou: 0.172108575924469,
    type: "symbol",
    rectangles: [{ left: 89.0, top: 722.0, width: 8.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 30,
    iou: 0.419068736141914,
    type: "symbol",
    rectangles: [{ left: 75.0, top: 716.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 31,
    iou: 0.246548323471401,
    type: "symbol",
    rectangles: [{ left: 81.0, top: 722.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 32,
    iou: 0.172583826429981,
    type: "symbol",
    rectangles: [{ left: 78.0, top: 724.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 33,
    iou: 0.315184908479641,
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
    iou: 0.111408199643493,
    type: "symbol",
    rectangles: [{ left: 233.0, top: 604.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 41,
    iou: 0.152132572670469,
    type: "symbol",
    rectangles: [{ left: 228.0, top: 601.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 42,
    iou: 0.14208581983518,
    type: "symbol",
    rectangles: [{ left: 211.0, top: 600.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 43,
    iou: 0.0880134115674783,
    type: "symbol",
    rectangles: [{ left: 208.0, top: 605.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 44,
    iou: 0.02448123105619,
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
    iou: 0.0454545454545454,
    type: "symbol",
    rectangles: [{ left: 198.0, top: 603.0, width: 1.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 47,
    iou: 0.107449856733524,
    type: "symbol",
    rectangles: [{ left: 162.0, top: 605.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 48,
    iou: 0.020002857551079,
    type: "symbol",
    rectangles: [{ left: 156.0, top: 601.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 49,
    iou: 0.202546296296296,
    type: "symbol",
    rectangles: [{ left: 148.0, top: 601.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 50,
    iou: 0.112485939257592,
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
    iou: 0.367676767676766,
    type: "symbol",
    rectangles: [{ left: 120.0, top: 603.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 53,
    iou: 0.104166666666666,
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
    iou: 0.296520423600604,
    type: "symbol",
    rectangles: [{ left: 49.0, top: 724.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 0,
    iou: 0.0385154061624654,
    type: "citation",
    rectangles: [{ left: 404.0, top: 139.0, width: 11.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 1,
    iou: 0.111482720178372,
    type: "citation",
    rectangles: [{ left: 406.0, top: 143.0, width: 6.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 2,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 399.0, top: 117.0, width: 11.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 3,
    iou: 0.0118708452041785,
    type: "citation",
    rectangles: [{ left: 407.0, top: 114.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 4,
    iou: 0.0118708452041785,
    type: "citation",
    rectangles: [{ left: 408.0, top: 113.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 5,
    iou: 0.00694444444444444,
    type: "citation",
    rectangles: [{ left: 395.0, top: 104.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 6,
    iou: 0.0173611111111111,
    type: "citation",
    rectangles: [{ left: 400.0, top: 98.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 7,
    iou: 0.00771604938271605,
    type: "citation",
    rectangles: [{ left: 407.0, top: 90.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 8,
    iou: 0.287128712871287,
    type: "citation",
    rectangles: [{ left: 338.0, top: 55.0, width: 10.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 9,
    iou: 0.751552795031064,
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
    iou: 0.0680437424058327,
    type: "citation",
    rectangles: [{ left: 53.0, top: 399.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 12,
    iou: 0.0541892455189661,
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
    iou: 0.646630236794171,
    type: "citation",
    rectangles: [{ left: 128.0, top: 159.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 18,
    iou: 0.489583333333332,
    type: "citation",
    rectangles: [{ left: 257.0, top: 55.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 19,
    iou: 0.464877213021133,
    type: "citation",
    rectangles: [{ left: 364.0, top: 733.0, width: 10.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 20,
    iou: 0.563870967741933,
    type: "citation",
    rectangles: [{ left: 312.0, top: 721.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 21,
    iou: 0.743944636678201,
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
    iou: 0.645631067961163,
    type: "citation",
    rectangles: [{ left: 424.0, top: 549.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 24,
    iou: 0.68852459016393,
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
    iou: 0.607594936708861,
    type: "citation",
    rectangles: [{ left: 462.0, top: 374.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 27,
    iou: 0.763888888888888,
    type: "citation",
    rectangles: [{ left: 553.0, top: 300.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 28,
    iou: 0.0116713352007469,
    type: "citation",
    rectangles: [{ left: 415.0, top: 203.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 29,
    iou: 0.0164365548980933,
    type: "citation",
    rectangles: [{ left: 426.0, top: 196.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 30,
    iou: 0.153049482163405,
    type: "citation",
    rectangles: [{ left: 392.0, top: 192.0, width: 36.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 6,
    index: 31,
    iou: 0.0105218855218855,
    type: "citation",
    rectangles: [{ left: 400.0, top: 180.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 0,
    iou: 0.67711247901511,
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
    iou: 0.422654268808115,
    type: "citation",
    rectangles: [{ left: 196.0, top: 308.0, width: 64.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 6,
    iou: 0.749414519906323,
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
    iou: 0.771162123385938,
    type: "citation",
    rectangles: [{ left: 239.0, top: 112.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 9,
    iou: 0.432698217578367,
    type: "citation",
    rectangles: [{ left: 357.0, top: 436.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 10,
    iou: 0.622660098522168,
    type: "citation",
    rectangles: [{ left: 395.0, top: 424.0, width: 37.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 0,
    index: 11,
    iou: 0.205714285714285,
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
    iou: 0.205714285714285,
    type: "citation",
    rectangles: [{ left: 384.0, top: 378.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 1,
    index: 0,
    iou: 0.531525423728812,
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
    iou: 0.378830083565458,
    type: "citation",
    rectangles: [{ left: 88.0, top: 170.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 1,
    index: 3,
    iou: 0.461373390557939,
    type: "citation",
    rectangles: [{ left: 259.0, top: 170.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 1,
    index: 4,
    iou: 0.634980988593155,
    type: "citation",
    rectangles: [{ left: 452.0, top: 228.0, width: 38.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 1,
    index: 5,
    iou: 0.637958532695375,
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
    iou: 0.49222797927461,
    type: "citation",
    rectangles: [{ left: 446.0, top: 136.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 1,
    index: 8,
    iou: 0.724032363874918,
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
    iou: 0.69811320754717,
    type: "citation",
    rectangles: [{ left: 284.0, top: 541.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 3,
    iou: 0.642857142857144,
    type: "citation",
    rectangles: [{ left: 267.0, top: 529.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 4,
    iou: 0.350500715307581,
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
    iou: 0.683673469387756,
    type: "citation",
    rectangles: [{ left: 130.0, top: 298.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 8,
    iou: 0.605504587155962,
    type: "citation",
    rectangles: [{ left: 177.0, top: 252.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 9,
    iou: 0.669642857142856,
    type: "citation",
    rectangles: [{ left: 247.0, top: 228.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 10,
    iou: 0.681818181818182,
    type: "citation",
    rectangles: [{ left: 197.0, top: 194.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 11,
    iou: 0.553691275167784,
    type: "citation",
    rectangles: [{ left: 51.0, top: 170.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 12,
    iou: 0.610583446404341,
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
    iou: 0.587301587301587,
    type: "citation",
    rectangles: [{ left: 101.0, top: 89.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 2,
    index: 15,
    iou: 0.410323939952598,
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
    iou: 0.00233426704014926,
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
    iou: 0.0536446828652579,
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
    iou: 0.132401315789476,
    type: "citation",
    rectangles: [{ left: 312.0, top: 460.0, width: 97.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 23,
    iou: 0.209373528026377,
    type: "citation",
    rectangles: [{ left: 312.0, top: 426.0, width: 103.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 24,
    iou: 0.444444444444444,
    type: "citation",
    rectangles: [{ left: 548.0, top: 182.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 25,
    iou: 0.490016638935106,
    type: "citation",
    rectangles: [{ left: 454.0, top: 170.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 0,
    iou: 0.5,
    type: "symbol",
    rectangles: [{ left: 121.0, top: 400.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 1,
    iou: 0.733812949640279,
    type: "symbol",
    rectangles: [{ left: 279.0, top: 386.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 2,
    iou: 0.0562303193882142,
    type: "symbol",
    rectangles: [{ left: 275.0, top: 367.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 3,
    iou: 0.236167341430499,
    type: "symbol",
    rectangles: [{ left: 266.0, top: 365.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 4,
    iou: 0.137061403508772,
    type: "symbol",
    rectangles: [{ left: 189.0, top: 355.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 5,
    iou: 0.22843567251462,
    type: "symbol",
    rectangles: [{ left: 184.0, top: 352.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 6,
    iou: 0.0685714285714295,
    type: "symbol",
    rectangles: [{ left: 276.0, top: 344.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 7,
    iou: 0.257201646090534,
    type: "symbol",
    rectangles: [{ left: 271.0, top: 340.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 8,
    iou: 0.0770430442919517,
    type: "symbol",
    rectangles: [{ left: 277.0, top: 309.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 9,
    iou: 0.424710424710425,
    type: "symbol",
    rectangles: [{ left: 271.0, top: 308.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 10,
    iou: 0.11574074074074,
    type: "symbol",
    rectangles: [{ left: 141.0, top: 298.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 11,
    iou: 0.192901234567901,
    type: "symbol",
    rectangles: [{ left: 136.0, top: 294.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 12,
    iou: 0.0914149443561211,
    type: "symbol",
    rectangles: [{ left: 59.0, top: 286.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 13,
    iou: 0.420673076923075,
    type: "symbol",
    rectangles: [{ left: 49.0, top: 284.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 3,
    index: 14,
    iou: 0.556323427781622,
    type: "symbol",
    rectangles: [{ left: 410.0, top: 78.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 0,
    iou: 0.539404553415061,
    type: "citation",
    rectangles: [{ left: 99.0, top: 382.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 1,
    iou: 0.694444444444444,
    type: "citation",
    rectangles: [{ left: 282.0, top: 701.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 2,
    iou: 0.779727095516571,
    type: "citation",
    rectangles: [{ left: 284.0, top: 469.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 3,
    iou: 0.539404553415061,
    type: "citation",
    rectangles: [{ left: 99.0, top: 382.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 4,
    iou: 0.465976331360946,
    type: "citation",
    rectangles: [{ left: 129.0, top: 89.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 5,
    iou: 0.554662379421222,
    type: "citation",
    rectangles: [{ left: 375.0, top: 530.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 6,
    iou: 0.465976331360946,
    type: "citation",
    rectangles: [{ left: 129.0, top: 89.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 0,
    iou: 0.0720876585928489,
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
    iou: 0.202546296296296,
    type: "symbol",
    rectangles: [{ left: 206.0, top: 203.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 3,
    iou: 0.273851590106005,
    type: "symbol",
    rectangles: [{ left: 288.0, top: 203.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 4,
    iou: 0.06900878293601,
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
    iou: 0.10501995379122,
    type: "symbol",
    rectangles: [{ left: 224.0, top: 104.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 6,
    iou: 0.0577609745851711,
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
    iou: 0.149969394001223,
    type: "symbol",
    rectangles: [{ left: 214.0, top: 105.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 8,
    iou: 0.0818330605564652,
    type: "symbol",
    rectangles: [{ left: 205.0, top: 104.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 9,
    iou: 0.0574352548036758,
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
    iou: 0.182748538011695,
    type: "symbol",
    rectangles: [{ left: 194.0, top: 105.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 11,
    iou: 0.0526094276094276,
    type: "symbol",
    rectangles: [{ left: 174.0, top: 104.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 12,
    iou: 0.0289351851851851,
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
    iou: 0.0920664983164982,
    type: "symbol",
    rectangles: [{ left: 163.0, top: 105.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 14,
    iou: 0.0631313131313131,
    type: "symbol",
    rectangles: [{ left: 213.0, top: 118.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 15,
    iou: 0.0347222222222222,
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
    iou: 0.110479797979797,
    type: "symbol",
    rectangles: [{ left: 203.0, top: 120.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 17,
    iou: 0.117233294255569,
    type: "symbol",
    rectangles: [{ left: 193.0, top: 118.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 18,
    iou: 0.0830314009661836,
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
    iou: 0.0405740155462545,
    type: "symbol",
    rectangles: [{ left: 175.0, top: 118.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 21,
    iou: 0.0385208012326656,
    type: "symbol",
    rectangles: [{ left: 169.0, top: 116.0, width: 6.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 22,
    iou: 0.0428008902585173,
    type: "symbol",
    rectangles: [{ left: 165.0, top: 118.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 23,
    iou: 0.119842492723848,
    type: "symbol",
    rectangles: [{ left: 157.0, top: 122.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 24,
    iou: 0.119842492723848,
    type: "symbol",
    rectangles: [{ left: 151.0, top: 122.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 25,
    iou: 0.110349439892994,
    type: "symbol",
    rectangles: [{ left: 142.0, top: 122.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 26,
    iou: 0.0993520518358533,
    type: "symbol",
    rectangles: [{ left: 124.0, top: 118.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 27,
    iou: 0.0530303030303031,
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
    iou: 0.142548596112311,
    type: "symbol",
    rectangles: [{ left: 115.0, top: 120.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 29,
    iou: 0.0551146384479717,
    type: "symbol",
    rectangles: [{ left: 213.0, top: 132.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 30,
    iou: 0.0303130511463844,
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
    iou: 0.0880551301684531,
    type: "symbol",
    rectangles: [{ left: 203.0, top: 134.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 32,
    iou: 0.126262626262626,
    type: "symbol",
    rectangles: [{ left: 193.0, top: 132.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 33,
    iou: 0.06900878293601,
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
    iou: 0.182748538011696,
    type: "symbol",
    rectangles: [{ left: 80.0, top: 63.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 38,
    iou: 0.411184210526316,
    type: "symbol",
    rectangles: [{ left: 75.0, top: 66.0, width: 5.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 39,
    iou: 0.0819047619047619,
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
    iou: 0.272904483430799,
    type: "symbol",
    rectangles: [{ left: 139.0, top: 55.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 41,
    iou: 0.13953488372093,
    type: "symbol",
    rectangles: [{ left: 276.0, top: 56.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 42,
    iou: 0.526315789473684,
    type: "symbol",
    rectangles: [{ left: 270.0, top: 55.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 43,
    iou: 0.215565509518475,
    type: "symbol",
    rectangles: [{ left: 383.0, top: 749.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 44,
    iou: 0.270061728395063,
    type: "symbol",
    rectangles: [{ left: 366.0, top: 749.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 45,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 399.0, top: 738.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 46,
    iou: 0.58351568198395,
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
    iou: 0.258855585831063,
    type: "symbol",
    rectangles: [{ left: 457.0, top: 726.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 49,
    iou: 0.0226326271953647,
    type: "symbol",
    rectangles: [{ left: 440.0, top: 723.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 50,
    iou: 0.0534188034188032,
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
    iou: 0.169968919968919,
    type: "symbol",
    rectangles: [{ left: 430.0, top: 724.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 52,
    iou: 0.0437062937062935,
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
    iou: 0.157828282828282,
    type: "symbol",
    rectangles: [{ left: 414.0, top: 723.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 55,
    iou: 0.367847411444137,
    type: "symbol",
    rectangles: [{ left: 408.0, top: 726.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 56,
    iou: 0.0935278713056488,
    type: "symbol",
    rectangles: [{ left: 399.0, top: 723.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 57,
    iou: 0.0514403292181068,
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
    iou: 0.112681094616348,
    type: "symbol",
    rectangles: [{ left: 388.0, top: 724.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 59,
    iou: 0.0776255707762551,
    type: "symbol",
    rectangles: [{ left: 368.0, top: 723.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 60,
    iou: 0.0509259259259259,
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
    iou: 0.11574074074074,
    type: "symbol",
    rectangles: [{ left: 357.0, top: 724.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 62,
    iou: 0.0427018633540371,
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
    iou: 0.130718954248365,
    type: "symbol",
    rectangles: [{ left: 471.0, top: 566.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 66,
    iou: 0.0718954248366009,
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
    iou: 0.188311688311687,
    type: "symbol",
    rectangles: [{ left: 460.0, top: 567.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 68,
    iou: 0.42037586547973,
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
    iou: 0.121527777777778,
    type: "symbol",
    rectangles: [{ left: 482.0, top: 580.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 72,
    iou: 0.283607487237663,
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
    iou: 0.132275132275132,
    type: "symbol",
    rectangles: [{ left: 462.0, top: 582.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 75,
    iou: 0.0727513227513227,
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
    iou: 0.165343915343915,
    type: "symbol",
    rectangles: [{ left: 451.0, top: 583.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 77,
    iou: 0.122746451860374,
    type: "symbol",
    rectangles: [{ left: 439.0, top: 583.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 78,
    iou: 0.229673863114376,
    type: "symbol",
    rectangles: [{ left: 433.0, top: 583.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 79,
    iou: 0.0943396226415084,
    type: "symbol",
    rectangles: [{ left: 429.0, top: 583.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 80,
    iou: 0.0746905676483145,
    type: "symbol",
    rectangles: [{ left: 422.0, top: 580.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 81,
    iou: 0.0762776506483601,
    type: "symbol",
    rectangles: [{ left: 473.0, top: 593.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 82,
    iou: 0.158911772184083,
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
    iou: 0.136165577342047,
    type: "symbol",
    rectangles: [{ left: 453.0, top: 595.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 85,
    iou: 0.074891067538126,
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
    iou: 0.13918345705196,
    type: "symbol",
    rectangles: [{ left: 442.0, top: 597.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 87,
    iou: 0.176108012914589,
    type: "symbol",
    rectangles: [{ left: 430.0, top: 597.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 88,
    iou: 0.190053848590436,
    type: "symbol",
    rectangles: [{ left: 425.0, top: 597.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 89,
    iou: 0.143576826196475,
    type: "symbol",
    rectangles: [{ left: 421.0, top: 597.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 90,
    iou: 0.0841750841750838,
    type: "symbol",
    rectangles: [{ left: 393.0, top: 588.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 91,
    iou: 0.0427018633540371,
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
    iou: 0.0487329434697856,
    type: "symbol",
    rectangles: [{ left: 351.0, top: 536.0, width: 3.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 93,
    iou: 0.341130604288499,
    type: "symbol",
    rectangles: [{ left: 342.0, top: 541.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 94,
    iou: 0.0835475578406175,
    type: "symbol",
    rectangles: [{ left: 382.0, top: 536.0, width: 3.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 95,
    iou: 0.303819444444443,
    type: "symbol",
    rectangles: [{ left: 377.0, top: 541.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 96,
    iou: 0.116959064327485,
    type: "symbol",
    rectangles: [{ left: 400.0, top: 524.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 97,
    iou: 0.231660231660232,
    type: "symbol",
    rectangles: [{ left: 394.0, top: 528.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 98,
    iou: 0.152625152625152,
    type: "symbol",
    rectangles: [{ left: 344.0, top: 503.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 99,
    iou: 0.0839438339438337,
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
    iou: 0.228937728937728,
    type: "symbol",
    rectangles: [{ left: 332.0, top: 505.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 101,
    iou: 0.13419216317767,
    type: "symbol",
    rectangles: [{ left: 431.0, top: 492.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 102,
    iou: 0.184331797235021,
    type: "symbol",
    rectangles: [{ left: 427.0, top: 495.0, width: 4.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 103,
    iou: 0.0933706816059758,
    type: "symbol",
    rectangles: [{ left: 372.0, top: 480.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 104,
    iou: 0.0513538748832867,
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
    iou: 0.163398692810457,
    type: "symbol",
    rectangles: [{ left: 362.0, top: 481.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 106,
    iou: 0.107212475633528,
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
    iou: 0.341130604288499,
    type: "symbol",
    rectangles: [{ left: 446.0, top: 483.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 108,
    iou: 0.0766230147673446,
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
    iou: 0.393612235717499,
    type: "symbol",
    rectangles: [{ left: 475.0, top: 346.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 111,
    iou: 0.0817391304347833,
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
    iou: 0.308641975308641,
    type: "symbol",
    rectangles: [{ left: 461.0, top: 346.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 113,
    iou: 0.0474465148378191,
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
    iou: 0.150966183574879,
    type: "symbol",
    rectangles: [{ left: 434.0, top: 346.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 115,
    iou: 0.0422405876951328,
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
    iou: 0.146118721461186,
    type: "symbol",
    rectangles: [{ left: 465.0, top: 361.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 117,
    iou: 0.0803120697567689,
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
    iou: 0.374592833876222,
    type: "symbol",
    rectangles: [{ left: 452.0, top: 361.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 119,
    iou: 0.045687134502924,
    type: "symbol",
    rectangles: [{ left: 443.0, top: 359.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 120,
    iou: 0.034265350877193,
    type: "symbol",
    rectangles: [{ left: 438.0, top: 357.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 121,
    iou: 0.045687134502924,
    type: "symbol",
    rectangles: [{ left: 434.0, top: 359.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 122,
    iou: 0.127923976608187,
    type: "symbol",
    rectangles: [{ left: 426.0, top: 363.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 123,
    iou: 0.127923976608187,
    type: "symbol",
    rectangles: [{ left: 419.0, top: 363.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 124,
    iou: 0.146198830409357,
    type: "symbol",
    rectangles: [{ left: 411.0, top: 363.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 125,
    iou: 0.0535300925925929,
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
    iou: 0.171293561724749,
    type: "symbol",
    rectangles: [{ left: 389.0, top: 361.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 127,
    iou: 0.0454695767195767,
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
    iou: 0.144675925925926,
    type: "symbol",
    rectangles: [{ left: 465.0, top: 375.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 129,
    iou: 0.077433628318584,
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
    iou: 0.373303167420815,
    type: "symbol",
    rectangles: [{ left: 452.0, top: 375.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 131,
    iou: 0.0532141336739037,
    type: "symbol",
    rectangles: [{ left: 443.0, top: 374.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 132,
    iou: 0.0478927203065133,
    type: "symbol",
    rectangles: [{ left: 437.0, top: 372.0, width: 6.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 133,
    iou: 0.0654284508231319,
    type: "symbol",
    rectangles: [{ left: 433.0, top: 374.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 134,
    iou: 0.14899957428693,
    type: "symbol",
    rectangles: [{ left: 425.0, top: 377.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 135,
    iou: 0.14899957428693,
    type: "symbol",
    rectangles: [{ left: 418.0, top: 377.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 136,
    iou: 0.0956556396970906,
    type: "symbol",
    rectangles: [{ left: 409.0, top: 377.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 137,
    iou: 0.0766230147673446,
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
    iou: 0.139225181598063,
    type: "symbol",
    rectangles: [{ left: 375.0, top: 307.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 139,
    iou: 0.357434640522875,
    type: "symbol",
    rectangles: [{ left: 370.0, top: 304.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 140,
    iou: 0.315656565656566,
    type: "symbol",
    rectangles: [{ left: 514.0, top: 286.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 141,
    iou: 0.1505376344086,
    type: "symbol",
    rectangles: [{ left: 498.0, top: 286.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 142,
    iou: 0.219849246231156,
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
    iou: 0.0489461358313817,
    type: "symbol",
    rectangles: [{ left: 479.0, top: 288.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 145,
    iou: 0.213206627680312,
    type: "symbol",
    rectangles: [{ left: 474.0, top: 284.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 146,
    iou: 0.0618533513270354,
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
    iou: 0.196806117858749,
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
    iou: 0.0790229885057468,
    type: "symbol",
    rectangles: [{ left: 428.0, top: 288.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 150,
    iou: 0.151295085935609,
    type: "symbol",
    rectangles: [{ left: 424.0, top: 284.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 151,
    iou: 0.0641923436041082,
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
    iou: 0.204248366013071,
    type: "symbol",
    rectangles: [{ left: 409.0, top: 284.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 153,
    iou: 0.0603566529492447,
    type: "symbol",
    rectangles: [{ left: 399.0, top: 288.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 154,
    iou: 0.352687140115163,
    type: "symbol",
    rectangles: [{ left: 394.0, top: 284.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 155,
    iou: 0.0538898687046835,
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
    iou: 0.171467764060356,
    type: "symbol",
    rectangles: [{ left: 380.0, top: 284.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 157,
    iou: 0.0781472009093492,
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
    iou: 0.14208581983518,
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
    iou: 0.113471314451706,
    type: "symbol",
    rectangles: [{ left: 342.0, top: 263.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 161,
    iou: 0.0781249999999998,
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
    iou: 0.291783380018674,
    type: "symbol",
    rectangles: [{ left: 494.0, top: 252.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 164,
    iou: 0.202429149797571,
    type: "symbol",
    rectangles: [{ left: 560.0, top: 253.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 165,
    iou: 0.169648365206661,
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
    iou: 0.0828970331588122,
    type: "symbol",
    rectangles: [{ left: 475.0, top: 177.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 167,
    iou: 0.0898692810457516,
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
    iou: 0.271405492730211,
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
    iou: 0.10678391959799,
    type: "symbol",
    rectangles: [{ left: 434.0, top: 181.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 171,
    iou: 0.220458553791886,
    type: "symbol",
    rectangles: [{ left: 430.0, top: 177.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 172,
    iou: 0.0771604938271603,
    type: "symbol",
    rectangles: [{ left: 475.0, top: 189.0, width: 3.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 173,
    iou: 0.214334705075445,
    type: "symbol",
    rectangles: [{ left: 469.0, top: 193.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 174,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 462.0, top: 195.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 175,
    iou: 0.0895833333333348,
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
    iou: 0.267094017094016,
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
    iou: 0.0691244239631328,
    type: "symbol",
    rectangles: [{ left: 423.0, top: 190.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 181,
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 467.0, top: 203.0, width: 3.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 182,
    iou: 0.304580896686159,
    type: "symbol",
    rectangles: [{ left: 461.0, top: 206.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 183,
    iou: 0.0137481910274956,
    type: "symbol",
    rectangles: [{ left: 454.0, top: 210.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 184,
    iou: 0.0592173017507741,
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
    iou: 0.350729517396183,
    type: "symbol",
    rectangles: [{ left: 443.0, top: 206.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 186,
    iou: 0.213821416353062,
    type: "symbol",
    rectangles: [{ left: 431.0, top: 206.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 187,
    iou: 0.233819678264123,
    type: "symbol",
    rectangles: [{ left: 426.0, top: 206.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 188,
    iou: 0.187055742611298,
    type: "symbol",
    rectangles: [{ left: 421.0, top: 206.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 189,
    iou: 0.052163833075735,
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
    iou: 0.357434640522875,
    type: "symbol",
    rectangles: [{ left: 390.0, top: 199.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 191,
    iou: 0.0397219463753729,
    type: "symbol",
    rectangles: [{ left: 476.0, top: 217.0, width: 3.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 192,
    iou: 0.240054869684498,
    type: "symbol",
    rectangles: [{ left: 471.0, top: 223.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 193,
    iou: 0.121252204585537,
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
    iou: 0.169648365206661,
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
    iou: 0.115420129270544,
    type: "symbol",
    rectangles: [{ left: 337.0, top: 120.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 196,
    iou: 0.396174863387979,
    type: "symbol",
    rectangles: [{ left: 331.0, top: 119.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 197,
    iou: 0.0508750508750509,
    type: "symbol",
    rectangles: [{ left: 484.0, top: 120.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 198,
    iou: 0.213675213675213,
    type: "symbol",
    rectangles: [{ left: 475.0, top: 119.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 199,
    iou: 0.000835421888053467,
    type: "symbol",
    rectangles: [{ left: 473.0, top: 81.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 200,
    iou: 0.012531328320802,
    type: "symbol",
    rectangles: [{ left: 466.0, top: 89.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 201,
    iou: 0.0451127819548872,
    type: "symbol",
    rectangles: [{ left: 460.0, top: 87.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 202,
    iou: 0.0167084377610693,
    type: "symbol",
    rectangles: [{ left: 449.0, top: 82.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 203,
    iou: 0.012531328320802,
    type: "symbol",
    rectangles: [{ left: 442.0, top: 89.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 204,
    iou: 0.0526315789473684,
    type: "symbol",
    rectangles: [{ left: 432.0, top: 87.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 205,
    iou: 0.012531328320802,
    type: "symbol",
    rectangles: [{ left: 412.0, top: 89.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 206,
    iou: 0.0416666666666665,
    type: "symbol",
    rectangles: [{ left: 402.0, top: 87.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 207,
    iou: 0.0720876585928489,
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
    iou: 0.128998968008256,
    type: "symbol",
    rectangles: [{ left: 228.0, top: 726.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 210,
    iou: 0.449438202247188,
    type: "symbol",
    rectangles: [{ left: 222.0, top: 724.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 211,
    iou: 0.258620689655172,
    type: "symbol",
    rectangles: [{ left: 296.0, top: 723.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 212,
    iou: 0.305410122164048,
    type: "symbol",
    rectangles: [{ left: 115.0, top: 712.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 213,
    iou: 0.552398989898989,
    type: "symbol",
    rectangles: [{ left: 82.0, top: 712.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 214,
    iou: 0.0793650793650793,
    type: "symbol",
    rectangles: [{ left: 141.0, top: 688.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 215,
    iou: 0.285714285714285,
    type: "symbol",
    rectangles: [{ left: 135.0, top: 687.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 216,
    iou: 0.136165577342048,
    type: "symbol",
    rectangles: [{ left: 239.0, top: 688.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 217,
    iou: 0.377643504531723,
    type: "symbol",
    rectangles: [{ left: 233.0, top: 687.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 218,
    iou: 0.603224128965149,
    type: "symbol",
    rectangles: [{ left: 68.0, top: 672.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 219,
    iou: 0.0593542260208925,
    type: "symbol",
    rectangles: [{ left: 206.0, top: 674.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 220,
    iou: 0.213675213675213,
    type: "symbol",
    rectangles: [{ left: 200.0, top: 672.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 221,
    iou: 0.258917396745931,
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
    iou: 0.0256016385048643,
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
    iou: 0.0480584390618993,
    type: "symbol",
    rectangles: [{ left: 211.0, top: 616.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 224,
    iou: 0.129757785467128,
    type: "symbol",
    rectangles: [{ left: 205.0, top: 621.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 225,
    iou: 0.0165032063372313,
    type: "symbol",
    rectangles: [{ left: 197.0, top: 623.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 226,
    iou: 0.159461374911409,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 617.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 227,
    iou: 0.355029585798816,
    type: "symbol",
    rectangles: [{ left: 186.0, top: 621.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 228,
    iou: 0.0356125356125355,
    type: "symbol",
    rectangles: [{ left: 177.0, top: 617.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 229,
    iou: 0.0267094017094016,
    type: "symbol",
    rectangles: [{ left: 172.0, top: 615.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 230,
    iou: 0.0356125356125355,
    type: "symbol",
    rectangles: [{ left: 168.0, top: 617.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 231,
    iou: 0.0997150997150995,
    type: "symbol",
    rectangles: [{ left: 160.0, top: 621.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 232,
    iou: 0.0997150997150995,
    type: "symbol",
    rectangles: [{ left: 153.0, top: 621.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 233,
    iou: 0.0831024930747921,
    type: "symbol",
    rectangles: [{ left: 145.0, top: 621.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 234,
    iou: 0.0823045267489709,
    type: "symbol",
    rectangles: [{ left: 126.0, top: 617.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 235,
    iou: 0.0617283950617282,
    type: "symbol",
    rectangles: [{ left: 123.0, top: 623.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 236,
    iou: 0.040374677002584,
    type: "symbol",
    rectangles: [{ left: 211.0, top: 641.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 237,
    iou: 0.0403911564625845,
    type: "symbol",
    rectangles: [{ left: 211.0, top: 635.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 238,
    iou: 0.123574144486691,
    type: "symbol",
    rectangles: [{ left: 205.0, top: 639.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 239,
    iou: 0.0104569695702187,
    type: "symbol",
    rectangles: [{ left: 197.0, top: 641.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 240,
    iou: 0.162443144899285,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 636.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 241,
    iou: 0.438596491228071,
    type: "symbol",
    rectangles: [{ left: 186.0, top: 639.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 242,
    iou: 0.0336292709174066,
    type: "symbol",
    rectangles: [{ left: 177.0, top: 636.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 243,
    iou: 0.0302663438256659,
    type: "symbol",
    rectangles: [{ left: 171.0, top: 634.0, width: 6.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 244,
    iou: 0.0470809792843692,
    type: "symbol",
    rectangles: [{ left: 167.0, top: 636.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 245,
    iou: 0.0941619585687384,
    type: "symbol",
    rectangles: [{ left: 159.0, top: 639.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 246,
    iou: 0.0941619585687384,
    type: "symbol",
    rectangles: [{ left: 152.0, top: 639.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 247,
    iou: 0.0674099040705211,
    type: "symbol",
    rectangles: [{ left: 143.0, top: 639.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 248,
    iou: 0.0957854406130269,
    type: "symbol",
    rectangles: [{ left: 125.0, top: 636.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 249,
    iou: 0.0718390804597702,
    type: "symbol",
    rectangles: [{ left: 122.0, top: 641.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 250,
    iou: 0.0256016385048643,
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
    iou: 0,
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
    iou: 0.0227479526842581,
    type: "symbol",
    rectangles: [{ left: 195.0, top: 572.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 254,
    iou: 0.330578512396694,
    type: "symbol",
    rectangles: [{ left: 189.0, top: 570.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 255,
    iou: 0.0743266876530258,
    type: "symbol",
    rectangles: [{ left: 179.0, top: 566.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 256,
    iou: 0.066454013822435,
    type: "symbol",
    rectangles: [{ left: 176.0, top: 572.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 257,
    iou: 0.191717791411043,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 570.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 258,
    iou: 0.0801667468334137,
    type: "symbol",
    rectangles: [{ left: 149.0, top: 566.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 259,
    iou: 0.0400833734167068,
    type: "symbol",
    rectangles: [{ left: 146.0, top: 572.0, width: 2.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 260,
    iou: 0.0905797101449275,
    type: "symbol",
    rectangles: [{ left: 148.0, top: 482.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 261,
    iou: 0.18979833926453,
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
    iou: 0.168350168350168,
    type: "symbol",
    rectangles: [{ left: 217.0, top: 432.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 265,
    iou: 0.168350168350168,
    type: "symbol",
    rectangles: [{ left: 213.0, top: 435.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 266,
    iou: 0.0336222355050808,
    type: "symbol",
    rectangles: [{ left: 195.0, top: 432.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 267,
    iou: 0.0584385226741467,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 438.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 268,
    iou: 0.210378681626928,
    type: "symbol",
    rectangles: [{ left: 186.0, top: 435.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 269,
    iou: 0.0623381605447395,
    type: "symbol",
    rectangles: [{ left: 181.0, top: 432.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 270,
    iou: 0.364583333333333,
    type: "symbol",
    rectangles: [{ left: 171.0, top: 435.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 271,
    iou: 0.145979312645979,
    type: "symbol",
    rectangles: [{ left: 161.0, top: 435.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 272,
    iou: 0.10427093760427,
    type: "symbol",
    rectangles: [{ left: 155.0, top: 433.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 273,
    iou: 0.10427093760427,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 433.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 274,
    iou: 0.1001001001001,
    type: "symbol",
    rectangles: [{ left: 146.0, top: 434.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 275,
    iou: 0.123456790123456,
    type: "symbol",
    rectangles: [{ left: 128.0, top: 432.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 276,
    iou: 0.0805860805860801,
    type: "symbol",
    rectangles: [{ left: 125.0, top: 438.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 277,
    iou: 0,
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
    iou: 0.411764705882353,
    type: "symbol",
    rectangles: [{ left: 78.0, top: 417.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 280,
    iou: 0.131950989632421,
    type: "symbol",
    rectangles: [{ left: 118.0, top: 413.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 281,
    iou: 0.227420402858999,
    type: "symbol",
    rectangles: [{ left: 114.0, top: 417.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 282,
    iou: 0.0469728601252613,
    type: "symbol",
    rectangles: [{ left: 270.0, top: 407.0, width: 2.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 283,
    iou: 0.13290802764487,
    type: "symbol",
    rectangles: [{ left: 265.0, top: 402.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 284,
    iou: 0.0199362041467305,
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
    iou: 0.00778089013383131,
    type: "symbol",
    rectangles: [{ left: 130.0, top: 386.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 286,
    iou: 0.0962419798350135,
    type: "symbol",
    rectangles: [{ left: 126.0, top: 395.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 287,
    iou: 0.0622471210706505,
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
    iou: 0.204678362573099,
    type: "symbol",
    rectangles: [{ left: 292.0, top: 390.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 289,
    iou: 0.146198830409356,
    type: "symbol",
    rectangles: [{ left: 288.0, top: 392.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 290,
    iou: 0.102854743912677,
    type: "symbol",
    rectangles: [{ left: 215.0, top: 324.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 291,
    iou: 0.137241985068071,
    type: "symbol",
    rectangles: [{ left: 210.0, top: 325.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 292,
    iou: 0.115692048801009,
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
    iou: 0.172532781228433,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 324.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 295,
    iou: 0.146436706801171,
    type: "symbol",
    rectangles: [{ left: 187.0, top: 325.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 296,
    iou: 0.176446864287155,
    type: "symbol",
    rectangles: [{ left: 175.0, top: 325.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 297,
    iou: 0.126033474490825,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 325.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 298,
    iou: 0.10082677959266,
    type: "symbol",
    rectangles: [{ left: 165.0, top: 325.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 299,
    iou: 0.110229276895943,
    type: "symbol",
    rectangles: [{ left: 159.0, top: 322.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 300,
    iou: 0.0251506418653391,
    type: "symbol",
    rectangles: [{ left: 207.0, top: 337.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 301,
    iou: 0.194522253345782,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 339.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 302,
    iou: 0.128095644748078,
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
    iou: 0.162443144899285,
    type: "symbol",
    rectangles: [{ left: 184.0, top: 337.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 305,
    iou: 0.203053931124106,
    type: "symbol",
    rectangles: [{ left: 179.0, top: 339.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 306,
    iou: 0.176446864287155,
    type: "symbol",
    rectangles: [{ left: 167.0, top: 339.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 307,
    iou: 0.126033474490825,
    type: "symbol",
    rectangles: [{ left: 161.0, top: 339.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 308,
    iou: 0.10082677959266,
    type: "symbol",
    rectangles: [{ left: 157.0, top: 339.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 309,
    iou: 0.139838408949658,
    type: "symbol",
    rectangles: [{ left: 129.0, top: 330.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 310,
    iou: 0.118371212121212,
    type: "symbol",
    rectangles: [{ left: 126.0, top: 336.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 311,
    iou: 0.165719696969697,
    type: "symbol",
    rectangles: [{ left: 123.0, top: 334.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 312,
    iou: 0.0482858522452916,
    type: "symbol",
    rectangles: [{ left: 201.0, top: 285.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 313,
    iou: 0.0610948191593352,
    type: "symbol",
    rectangles: [{ left: 197.0, top: 290.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 314,
    iou: 0.219941348973606,
    type: "symbol",
    rectangles: [{ left: 191.0, top: 288.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 315,
    iou: 0.116959064327485,
    type: "symbol",
    rectangles: [{ left: 186.0, top: 285.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 316,
    iou: 0.0726643598615914,
    type: "symbol",
    rectangles: [{ left: 183.0, top: 290.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 317,
    iou: 0.0827966881324745,
    type: "symbol",
    rectangles: [{ left: 177.0, top: 288.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 318,
    iou: 0.0555555555555555,
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
    iou: 0.0704776820673457,
    type: "symbol",
    rectangles: [{ left: 144.0, top: 290.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 320,
    iou: 0.0805152979066021,
    type: "symbol",
    rectangles: [{ left: 143.0, top: 285.0, width: 2.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 321,
    iou: 0.041337842916197,
    type: "symbol",
    rectangles: [{ left: 201.0, top: 228.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 322,
    iou: 0.198412698412698,
    type: "symbol",
    rectangles: [{ left: 191.0, top: 226.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 323,
    iou: 0.0677506775067749,
    type: "symbol",
    rectangles: [{ left: 255.0, top: 225.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 324,
    iou: 0.504095778197855,
    type: "symbol",
    rectangles: [{ left: 49.0, top: 214.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 325,
    iou: 0.0747863247863247,
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
    iou: 0.373931623931623,
    type: "symbol",
    rectangles: [{ left: 139.0, top: 214.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 327,
    iou: 0.344311377245507,
    type: "symbol",
    rectangles: [{ left: 218.0, top: 214.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 328,
    iou: 0.388888888888888,
    type: "symbol",
    rectangles: [{ left: 184.0, top: 214.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 329,
    iou: 0.547826086956521,
    type: "symbol",
    rectangles: [{ left: 87.0, top: 203.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 330,
    iou: 0.258917396745931,
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
    iou: 0.0665698378116679,
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
    iou: 0.143967093235831,
    type: "symbol",
    rectangles: [{ left: 163.0, top: 201.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 333,
    iou: 0.21026282853567,
    type: "symbol",
    rectangles: [{ left: 184.0, top: 134.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 334,
    iou: 0.0365978626848192,
    type: "symbol",
    rectangles: [{ left: 175.0, top: 132.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 335,
    iou: 0.0329380764163373,
    type: "symbol",
    rectangles: [{ left: 169.0, top: 130.0, width: 6.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 336,
    iou: 0.0276199494949494,
    type: "symbol",
    rectangles: [{ left: 165.0, top: 132.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 337,
    iou: 0.102474015517493,
    type: "symbol",
    rectangles: [{ left: 157.0, top: 136.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 338,
    iou: 0.102474015517493,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 136.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 339,
    iou: 0.107386446089101,
    type: "symbol",
    rectangles: [{ left: 141.0, top: 136.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 340,
    iou: 0.0731957253696384,
    type: "symbol",
    rectangles: [{ left: 123.0, top: 132.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 341,
    iou: 0.0402576489533011,
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
    iou: 0.128092519396867,
    type: "symbol",
    rectangles: [{ left: 113.0, top: 134.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 343,
    iou: 0.126262626262625,
    type: "symbol",
    rectangles: [{ left: 381.0, top: 590.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 344,
    iou: 0.0096450617283951,
    type: "symbol",
    rectangles: [{ left: 483.0, top: 608.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 345,
    iou: 0.0225051440329219,
    type: "symbol",
    rectangles: [{ left: 479.0, top: 613.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 346,
    iou: 0.0160751028806585,
    type: "symbol",
    rectangles: [{ left: 462.0, top: 610.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 347,
    iou: 0.00884130658436217,
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
    iou: 0.0200938786008231,
    type: "symbol",
    rectangles: [{ left: 451.0, top: 611.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 349,
    iou: 0.0096450617283951,
    type: "symbol",
    rectangles: [{ left: 446.0, top: 608.0, width: 4.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 350,
    iou: 0.0506365740740742,
    type: "symbol",
    rectangles: [{ left: 436.0, top: 613.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 351,
    iou: 0.0281314300411523,
    type: "symbol",
    rectangles: [{ left: 426.0, top: 613.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 352,
    iou: 0.0200938786008231,
    type: "symbol",
    rectangles: [{ left: 420.0, top: 611.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 353,
    iou: 0.0200938786008231,
    type: "symbol",
    rectangles: [{ left: 415.0, top: 611.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 354,
    iou: 0.0192901234567902,
    type: "symbol",
    rectangles: [{ left: 411.0, top: 612.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 355,
    iou: 0.0160751028806585,
    type: "symbol",
    rectangles: [{ left: 393.0, top: 610.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 356,
    iou: 0.00884130658436217,
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
    iou: 0.0160751028806585,
    type: "symbol",
    rectangles: [{ left: 383.0, top: 611.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 358,
    iou: 0.245510662177328,
    type: "symbol",
    rectangles: [{ left: 387.0, top: 375.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 359,
    iou: 0.0248447204968942,
    type: "symbol",
    rectangles: [{ left: 447.0, top: 217.0, width: 3.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 360,
    iou: 0.470229007633588,
    type: "symbol",
    rectangles: [{ left: 436.0, top: 223.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 361,
    iou: 0.150498796009632,
    type: "symbol",
    rectangles: [{ left: 426.0, top: 223.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 362,
    iou: 0.10749914000688,
    type: "symbol",
    rectangles: [{ left: 420.0, top: 221.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 363,
    iou: 0.10749914000688,
    type: "symbol",
    rectangles: [{ left: 415.0, top: 221.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 364,
    iou: 0.103199174406604,
    type: "symbol",
    rectangles: [{ left: 411.0, top: 222.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 4,
    index: 365,
    iou: 0.128384687208216,
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
    iou: 0.219197046608215,
    type: "symbol",
    rectangles: [{ left: 391.0, top: 221.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 0,
    iou: 0.206611570247933,
    type: "symbol",
    rectangles: [{ left: 287.0, top: 446.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 1,
    iou: 0.270061728395061,
    type: "symbol",
    rectangles: [{ left: 341.0, top: 447.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 2,
    iou: 0.614035087719295,
    type: "symbol",
    rectangles: [{ left: 145.0, top: 435.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 3,
    iou: 0.396825396825397,
    type: "symbol",
    rectangles: [{ left: 515.0, top: 433.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 4,
    iou: 0.154471544715447,
    type: "symbol",
    rectangles: [{ left: 399.0, top: 402.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 5,
    iou: 0.356125356125355,
    type: "symbol",
    rectangles: [{ left: 394.0, top: 399.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 6,
    iou: 0.156249999999999,
    type: "symbol",
    rectangles: [{ left: 470.0, top: 400.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 7,
    iou: 0.0781472009093493,
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
    iou: 0.248650184711565,
    type: "symbol",
    rectangles: [{ left: 149.0, top: 387.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 9,
    iou: 0.440129449838188,
    type: "symbol",
    rectangles: [{ left: 227.0, top: 389.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 10,
    iou: 0.311942959001783,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 389.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 11,
    iou: 0.153374233128833,
    type: "symbol",
    rectangles: [{ left: 217.0, top: 274.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 12,
    iou: 0.360082304526748,
    type: "symbol",
    rectangles: [{ left: 213.0, top: 279.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 13,
    iou: 0.0822320117474298,
    type: "symbol",
    rectangles: [{ left: 197.0, top: 281.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 14,
    iou: 0.34041394335512,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 277.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 15,
    iou: 0.0477206891294408,
    type: "symbol",
    rectangles: [{ left: 188.0, top: 274.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 16,
    iou: 0.347222222222221,
    type: "symbol",
    rectangles: [{ left: 178.0, top: 279.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 17,
    iou: 0.0649819494584836,
    type: "symbol",
    rectangles: [{ left: 168.0, top: 277.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 18,
    iou: 0.0925925925925925,
    type: "symbol",
    rectangles: [{ left: 163.0, top: 277.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 19,
    iou: 0.148148148148148,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 277.0, width: 8.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 20,
    iou: 0.0888888888888888,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 278.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 21,
    iou: 0.0925925925925925,
    type: "symbol",
    rectangles: [{ left: 145.0, top: 277.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 22,
    iou: 0.0555555555555555,
    type: "symbol",
    rectangles: [{ left: 142.0, top: 277.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 23,
    iou: 0.093416370106761,
    type: "symbol",
    rectangles: [{ left: 125.0, top: 281.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 24,
    iou: 0.23619722468261,
    type: "symbol",
    rectangles: [{ left: 120.0, top: 277.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 25,
    iou: 0.747863247863247,
    type: "symbol",
    rectangles: [{ left: 161.0, top: 251.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 26,
    iou: 0.126865671641791,
    type: "symbol",
    rectangles: [{ left: 229.0, top: 241.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 27,
    iou: 0.33068783068783,
    type: "symbol",
    rectangles: [{ left: 224.0, top: 237.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 28,
    iou: 0.043344249662878,
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
    iou: 0.284275503573748,
    type: "symbol",
    rectangles: [{ left: 217.0, top: 159.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 30,
    iou: 0.0287521564117312,
    type: "symbol",
    rectangles: [{ left: 208.0, top: 155.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 31,
    iou: 0.24191014765944,
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
    iou: 0.122939368538697,
    type: "symbol",
    rectangles: [{ left: 177.0, top: 155.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 34,
    iou: 0.248650184711565,
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
    iou: 0.0881834215167547,
    type: "symbol",
    rectangles: [{ left: 208.0, top: 174.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 37,
    iou: 0.15432098765432,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 177.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 38,
    iou: 0.0358851674641147,
    type: "symbol",
    rectangles: [{ left: 194.0, top: 179.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 39,
    iou: 0.224921277552856,
    type: "symbol",
    rectangles: [{ left: 189.0, top: 174.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 40,
    iou: 0.113187208048868,
    type: "symbol",
    rectangles: [{ left: 184.0, top: 177.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 41,
    iou: 0.0474833808167141,
    type: "symbol",
    rectangles: [{ left: 175.0, top: 174.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 42,
    iou: 0.0356125356125355,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 172.0, width: 5.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 43,
    iou: 0.0474833808167141,
    type: "symbol",
    rectangles: [{ left: 166.0, top: 174.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 44,
    iou: 0.132953466286799,
    type: "symbol",
    rectangles: [{ left: 158.0, top: 177.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 45,
    iou: 0.132953466286799,
    type: "symbol",
    rectangles: [{ left: 151.0, top: 177.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 46,
    iou: 0.147587511825922,
    type: "symbol",
    rectangles: [{ left: 142.0, top: 177.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 47,
    iou: 0.0694444444444444,
    type: "symbol",
    rectangles: [{ left: 126.0, top: 179.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 48,
    iou: 0.0925925925925925,
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
    iou: 0.0870827285921623,
    type: "symbol",
    rectangles: [{ left: 208.0, top: 192.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 51,
    iou: 0.184482395108581,
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
    iou: 0.194250194250194,
    type: "symbol",
    rectangles: [{ left: 189.0, top: 192.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 54,
    iou: 0.179548563611491,
    type: "symbol",
    rectangles: [{ left: 184.0, top: 195.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 55,
    iou: 0.0505970451325642,
    type: "symbol",
    rectangles: [{ left: 175.0, top: 192.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 56,
    iou: 0.043344249662878,
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
    iou: 0.0165343915343915,
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
    iou: 0.206679894179894,
    type: "symbol",
    rectangles: [{ left: 106.0, top: 140.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 59,
    iou: 0.030389363722697,
    type: "symbol",
    rectangles: [{ left: 88.0, top: 143.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 60,
    iou: 0.243055555555555,
    type: "symbol",
    rectangles: [{ left: 78.0, top: 142.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 61,
    iou: 0.00625938908362508,
    type: "symbol",
    rectangles: [{ left: 217.0, top: 101.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 62,
    iou: 0.198920147769252,
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
    iou: 0.0778089013383131,
    type: "symbol",
    rectangles: [{ left: 192.0, top: 103.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 65,
    iou: 0.136165577342047,
    type: "symbol",
    rectangles: [{ left: 186.0, top: 107.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 66,
    iou: 0.0433688958279122,
    type: "symbol",
    rectangles: [{ left: 181.0, top: 101.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 67,
    iou: 0.308641975308641,
    type: "symbol",
    rectangles: [{ left: 172.0, top: 107.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 68,
    iou: 0.102124183006535,
    type: "symbol",
    rectangles: [{ left: 161.0, top: 105.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 69,
    iou: 0.0571895424836601,
    type: "symbol",
    rectangles: [{ left: 158.0, top: 107.0, width: 2.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 70,
    iou: 0.0816993464052287,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 105.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 71,
    iou: 0.205128205128205,
    type: "symbol",
    rectangles: [{ left: 147.0, top: 107.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 72,
    iou: 0.118708452041785,
    type: "symbol",
    rectangles: [{ left: 128.0, top: 103.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 73,
    iou: 0.089031339031339,
    type: "symbol",
    rectangles: [{ left: 125.0, top: 109.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 74,
    iou: 0.0830959164292498,
    type: "symbol",
    rectangles: [{ left: 123.0, top: 105.0, width: 2.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 75,
    iou: 0.580392156862741,
    type: "symbol",
    rectangles: [{ left: 312.0, top: 296.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 76,
    iou: 0.607638888888889,
    type: "symbol",
    rectangles: [{ left: 422.0, top: 296.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 77,
    iou: 0.167272727272725,
    type: "symbol",
    rectangles: [{ left: 515.0, top: 286.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 78,
    iou: 0.333867521367521,
    type: "symbol",
    rectangles: [{ left: 510.0, top: 282.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 79,
    iou: 0.694444444444441,
    type: "symbol",
    rectangles: [{ left: 524.0, top: 284.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 80,
    iou: 0.128998968008256,
    type: "symbol",
    rectangles: [{ left: 507.0, top: 274.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 81,
    iou: 0.300997592019264,
    type: "symbol",
    rectangles: [{ left: 502.0, top: 271.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 82,
    iou: 0.604938271604938,
    type: "symbol",
    rectangles: [{ left: 333.0, top: 261.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 83,
    iou: 0.157687253613666,
    type: "symbol",
    rectangles: [{ left: 452.0, top: 251.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 84,
    iou: 0.286532951289397,
    type: "symbol",
    rectangles: [{ left: 447.0, top: 248.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 85,
    iou: 0.120603015075377,
    type: "symbol",
    rectangles: [{ left: 558.0, top: 251.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 86,
    iou: 0.279534109816968,
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
    iou: 0.108043217286914,
    type: "symbol",
    rectangles: [{ left: 521.0, top: 173.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 89,
    iou: 0.261069340016708,
    type: "symbol",
    rectangles: [{ left: 516.0, top: 169.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 90,
    iou: 0.468058191018342,
    type: "symbol",
    rectangles: [{ left: 505.0, top: 171.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 91,
    iou: 0.399778924097271,
    type: "symbol",
    rectangles: [{ left: 493.0, top: 171.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 92,
    iou: 0.22151898734177,
    type: "symbol",
    rectangles: [{ left: 467.0, top: 169.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 93,
    iou: 0.175364758698091,
    type: "symbol",
    rectangles: [{ left: 462.0, top: 169.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 94,
    iou: 0.147306397306397,
    type: "symbol",
    rectangles: [{ left: 459.0, top: 171.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 95,
    iou: 0.333333333333333,
    type: "symbol",
    rectangles: [{ left: 449.0, top: 171.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 96,
    iou: 0.0682680151706704,
    type: "symbol",
    rectangles: [{ left: 423.0, top: 173.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 97,
    iou: 0.405092592592592,
    type: "symbol",
    rectangles: [{ left: 418.0, top: 169.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 98,
    iou: 0.466321243523318,
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
    iou: 0.553133514986377,
    type: "symbol",
    rectangles: [{ left: 382.0, top: 171.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 103,
    iou: 0.688705234159778,
    type: "symbol",
    rectangles: [{ left: 366.0, top: 163.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 104,
    iou: 0.135360470819029,
    type: "symbol",
    rectangles: [{ left: 372.0, top: 169.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 105,
    iou: 0.15605493133583,
    type: "symbol",
    rectangles: [{ left: 367.0, top: 169.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 106,
    iou: 0.143216080402009,
    type: "symbol",
    rectangles: [{ left: 358.0, top: 169.0, width: 8.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 107,
    iou: 0.555651423641071,
    type: "symbol",
    rectangles: [{ left: 344.0, top: 163.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 108,
    iou: 0.153574234092693,
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
    iou: 0.254230617866982,
    type: "symbol",
    rectangles: [{ left: 338.0, top: 169.0, width: 8.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 111,
    iou: 0.249287749287749,
    type: "symbol",
    rectangles: [{ left: 318.0, top: 171.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 112,
    iou: 0.325636753154009,
    type: "symbol",
    rectangles: [{ left: 457.0, top: 136.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 113,
    iou: 0.692883895131084,
    type: "symbol",
    rectangles: [{ left: 441.0, top: 89.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 114,
    iou: 0.0583333333333323,
    type: "symbol",
    rectangles: [{ left: 466.0, top: 80.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 115,
    iou: 0.363924050632913,
    type: "symbol",
    rectangles: [{ left: 461.0, top: 76.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 116,
    iou: 0.107142857142857,
    type: "symbol",
    rectangles: [{ left: 350.0, top: 68.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 117,
    iou: 0.217013888888888,
    type: "symbol",
    rectangles: [{ left: 345.0, top: 64.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 118,
    iou: 0.0556291390728466,
    type: "symbol",
    rectangles: [{ left: 421.0, top: 68.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 119,
    iou: 0.434027777777778,
    type: "symbol",
    rectangles: [{ left: 416.0, top: 64.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 120,
    iou: 0.088013411567477,
    type: "symbol",
    rectangles: [{ left: 487.0, top: 68.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 121,
    iou: 0.248650184711566,
    type: "symbol",
    rectangles: [{ left: 482.0, top: 64.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 122,
    iou: 0.0617384240454914,
    type: "symbol",
    rectangles: [{ left: 459.0, top: 68.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 123,
    iou: 0.293973542381186,
    type: "symbol",
    rectangles: [{ left: 454.0, top: 64.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 124,
    iou: 0.111066235864296,
    type: "symbol",
    rectangles: [{ left: 446.0, top: 68.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 125,
    iou: 0.263047138047138,
    type: "symbol",
    rectangles: [{ left: 441.0, top: 64.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 126,
    iou: 0.362781323480012,
    type: "symbol",
    rectangles: [{ left: 430.0, top: 66.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 127,
    iou: 0.667692307692314,
    type: "symbol",
    rectangles: [{ left: 355.0, top: 55.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 128,
    iou: 0.0601081947505509,
    type: "symbol",
    rectangles: [{ left: 169.0, top: 192.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 129,
    iou: 0.141671726371179,
    type: "symbol",
    rectangles: [{ left: 161.0, top: 195.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 130,
    iou: 0.141671726371179,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 195.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 131,
    iou: 0.161910544424205,
    type: "symbol",
    rectangles: [{ left: 145.0, top: 195.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 132,
    iou: 0.0913742690058478,
    type: "symbol",
    rectangles: [{ left: 128.0, top: 198.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 133,
    iou: 0.10038240917782,
    type: "symbol",
    rectangles: [{ left: 123.0, top: 192.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 134,
    iou: 0.127923976608187,
    type: "symbol",
    rectangles: [{ left: 120.0, top: 195.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 0,
    iou: 0.489361702127658,
    type: "citation",
    rectangles: [{ left: 375.0, top: 333.0, width: 126.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 5,
    index: 1,
    iou: 0.449010654490104,
    type: "citation",
    rectangles: [{ left: 392.0, top: 89.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 0,
    iou: 0.551835853131751,
    type: "citation",
    rectangles: [{ left: 379.0, top: 66.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 1,
    iou: 0.547752808988764,
    type: "citation",
    rectangles: [{ left: 548.0, top: 55.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 2,
    iou: 0.681818181818184,
    type: "citation",
    rectangles: [{ left: 412.0, top: 453.0, width: 13.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 3,
    iou: 0.628744239631334,
    type: "citation",
    rectangles: [{ left: 111.0, top: 713.0, width: 39.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 4,
    iou: 0.669472321139533,
    type: "citation",
    rectangles: [{ left: 59.0, top: 655.0, width: 10.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 5,
    iou: 0.479616306954437,
    type: "citation",
    rectangles: [{ left: 154.0, top: 655.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 6,
    iou: 0.513565891472867,
    type: "citation",
    rectangles: [{ left: 230.0, top: 655.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 7,
    iou: 0.416938110749185,
    type: "citation",
    rectangles: [{ left: 75.0, top: 643.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 8,
    iou: 0.545073375262054,
    type: "citation",
    rectangles: [{ left: 289.0, top: 643.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 9,
    iou: 0.634765624999999,
    type: "citation",
    rectangles: [{ left: 284.0, top: 207.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 10,
    iou: 0,
    type: "citation",
    rectangles: [{ left: 123.0, top: 118.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 11,
    iou: 0.33068783068783,
    type: "citation",
    rectangles: [{ left: 115.0, top: 107.0, width: 10.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 12,
    iou: 0.00551146384479717,
    type: "citation",
    rectangles: [{ left: 123.0, top: 101.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 13,
    iou: 0.0476190476190475,
    type: "citation",
    rectangles: [{ left: 107.0, top: 89.0, width: 1.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 14,
    iou: 0.552799433026222,
    type: "citation",
    rectangles: [{ left: 97.0, top: 81.0, width: 11.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 15,
    iou: 0.292397660818713,
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
    iou: 0.662219101123586,
    type: "citation",
    rectangles: [{ left: 522.0, top: 568.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 18,
    iou: 0.474606741573033,
    type: "citation",
    rectangles: [{ left: 402.0, top: 472.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 19,
    iou: 0.693048864418443,
    type: "citation",
    rectangles: [{ left: 401.0, top: 463.0, width: 12.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 20,
    iou: 0.681818181818184,
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
    iou: 0.363004172461753,
    type: "citation",
    rectangles: [{ left: 399.0, top: 435.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 23,
    iou: 0.409691629955946,
    type: "citation",
    rectangles: [{ left: 400.0, top: 425.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 24,
    iou: 0.342105263157894,
    type: "citation",
    rectangles: [{ left: 401.0, top: 416.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 25,
    iou: 0.636672325976231,
    type: "citation",
    rectangles: [{ left: 374.0, top: 361.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 26,
    iou: 0.641132389675268,
    type: "citation",
    rectangles: [{ left: 472.0, top: 193.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 27,
    iou: 0.521172638436485,
    type: "citation",
    rectangles: [{ left: 553.0, top: 170.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 28,
    iou: 0.568513119533527,
    type: "citation",
    rectangles: [{ left: 315.0, top: 147.0, width: 10.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 7,
    index: 29,
    iou: 0.537720706260033,
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
    iou: 0.280837858805274,
    type: "citation",
    rectangles: [{ left: 123.0, top: 355.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 1,
    iou: 0.722090261282664,
    type: "citation",
    rectangles: [{ left: 140.0, top: 346.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 2,
    iou: 0.0423626240619705,
    type: "citation",
    rectangles: [{ left: 129.0, top: 337.0, width: 1.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 3,
    iou: 0.124344968469668,
    type: "citation",
    rectangles: [{ left: 123.0, top: 328.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 4,
    iou: 0.321637426900585,
    type: "citation",
    rectangles: [{ left: 118.0, top: 327.0, width: 11.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 5,
    iou: 0.691823899371068,
    type: "citation",
    rectangles: [{ left: 102.0, top: 257.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 6,
    iou: 0.172774869109947,
    type: "citation",
    rectangles: [{ left: 116.0, top: 166.0, width: 7.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 7,
    iou: 0.0830959164292496,
    type: "citation",
    rectangles: [{ left: 125.0, top: 157.0, width: 7.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 8,
    iou: 0.0367454068241475,
    type: "citation",
    rectangles: [{ left: 123.0, top: 148.0, width: 7.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 9,
    iou: 0.00913742690058479,
    type: "citation",
    rectangles: [{ left: 131.0, top: 139.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 10,
    iou: 0.0721500721500721,
    type: "citation",
    rectangles: [{ left: 126.0, top: 130.0, width: 8.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 11,
    iou: 0.139275766016713,
    type: "citation",
    rectangles: [{ left: 131.0, top: 125.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 12,
    iou: 0.392817059483726,
    type: "citation",
    rectangles: [{ left: 124.0, top: 117.0, width: 7.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 13,
    iou: 0.575828590559088,
    type: "citation",
    rectangles: [{ left: 139.0, top: 108.0, width: 9.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 14,
    iou: 0.198412698412698,
    type: "citation",
    rectangles: [{ left: 122.0, top: 85.0, width: 8.0, height: 3.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 15,
    iou: 0.00431331953071083,
    type: "citation",
    rectangles: [{ left: 142.0, top: 74.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 16,
    iou: 0.181159420289855,
    type: "citation",
    rectangles: [{ left: 138.0, top: 81.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 17,
    iou: 0.344155844155842,
    type: "citation",
    rectangles: [{ left: 317.0, top: 736.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 18,
    iou: 0.391304347826086,
    type: "citation",
    rectangles: [{ left: 381.0, top: 736.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 19,
    iou: 0.508859609268516,
    type: "citation",
    rectangles: [{ left: 454.0, top: 736.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 20,
    iou: 0.564971751412431,
    type: "citation",
    rectangles: [{ left: 525.0, top: 736.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 21,
    iou: 0.625,
    type: "citation",
    rectangles: [{ left: 433.0, top: 724.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 22,
    iou: 0.477430555555556,
    type: "citation",
    rectangles: [{ left: 415.0, top: 713.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 23,
    iou: 0.612903225806438,
    type: "citation",
    rectangles: [{ left: 534.0, top: 643.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 24,
    iou: 0.49115913555992,
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
    iou: 0.280837858805274,
    type: "citation",
    rectangles: [{ left: 123.0, top: 355.0, width: 8.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 27,
    iou: 0.47692307692308,
    type: "citation",
    rectangles: [{ left: 83.0, top: 732.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 28,
    iou: 0.0771604938271605,
    type: "citation",
    rectangles: [{ left: 119.0, top: 641.0, width: 5.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 29,
    iou: 0.534441805225647,
    type: "citation",
    rectangles: [{ left: 127.0, top: 636.0, width: 10.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 30,
    iou: 0.865800865800867,
    type: "citation",
    rectangles: [{ left: 123.0, top: 628.0, width: 12.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 31,
    iou: 0.726923076923076,
    type: "citation",
    rectangles: [{ left: 126.0, top: 619.0, width: 13.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 32,
    iou: 0.555023923444984,
    type: "citation",
    rectangles: [{ left: 125.0, top: 610.0, width: 12.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 33,
    iou: 0.371938563719386,
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
    iou: 0.333004440059199,
    type: "citation",
    rectangles: [{ left: 119.0, top: 574.0, width: 10.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 36,
    iou: 0.258215962441314,
    type: "citation",
    rectangles: [{ left: 119.0, top: 564.0, width: 11.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 37,
    iou: 0.294117647058822,
    type: "citation",
    rectangles: [{ left: 133.0, top: 556.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 38,
    iou: 0.168067226890755,
    type: "citation",
    rectangles: [{ left: 139.0, top: 555.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 39,
    iou: 0.178997613365154,
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
    iou: 0.623219373219374,
    type: "citation",
    rectangles: [{ left: 125.0, top: 400.0, width: 10.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 42,
    iou: 0.442804428044282,
    type: "citation",
    rectangles: [{ left: 123.0, top: 391.0, width: 10.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 43,
    iou: 0.240787188886744,
    type: "citation",
    rectangles: [{ left: 129.0, top: 382.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 44,
    iou: 0.455801104972376,
    type: "citation",
    rectangles: [{ left: 125.0, top: 373.0, width: 11.0, height: 8.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 0,
    iou: 0.642361111111111,
    type: "citation",
    rectangles: [{ left: 284.0, top: 159.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 1,
    iou: 0.636363636363635,
    type: "citation",
    rectangles: [{ left: 203.0, top: 66.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 2,
    iou: 0.464912280701755,
    type: "citation",
    rectangles: [{ left: 254.0, top: 55.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 3,
    iou: 0.60949633902817,
    type: "citation",
    rectangles: [{ left: 328.0, top: 736.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 4,
    iou: 0.531496062992127,
    type: "citation",
    rectangles: [{ left: 393.0, top: 655.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 5,
    iou: 0.148148148148148,
    type: "citation",
    rectangles: [{ left: 465.0, top: 450.0, width: 8.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 6,
    iou: 0.00710429099175903,
    type: "citation",
    rectangles: [{ left: 442.0, top: 441.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 7,
    iou: 0.0540123456790124,
    type: "citation",
    rectangles: [{ left: 431.0, top: 436.0, width: 1.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 8,
    iou: 0.0112460638776428,
    type: "citation",
    rectangles: [{ left: 447.0, top: 251.0, width: 1.0, height: 1.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 9,
    iou: 0.173611111111111,
    type: "citation",
    rectangles: [{ left: 417.0, top: 245.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 10,
    iou: 0.664251207729468,
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
    iou: 0.158730158730159,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 687.0, width: 5.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 2,
    iou: 0.466200466200469,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 678.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 3,
    iou: 0.336700336700336,
    type: "symbol",
    rectangles: [{ left: 178.0, top: 669.0, width: 5.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 4,
    iou: 0.629151291512921,
    type: "symbol",
    rectangles: [{ left: 162.0, top: 671.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 5,
    iou: 0.302325581395347,
    type: "symbol",
    rectangles: [{ left: 178.0, top: 659.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 6,
    iou: 0.545977011494248,
    type: "symbol",
    rectangles: [{ left: 163.0, top: 661.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 7,
    iou: 0.401459854014598,
    type: "symbol",
    rectangles: [{ left: 178.0, top: 650.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 8,
    iou: 0.366972477064226,
    type: "symbol",
    rectangles: [{ left: 162.0, top: 650.0, width: 5.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 9,
    iou: 0.596330275229363,
    type: "symbol",
    rectangles: [{ left: 186.0, top: 640.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 10,
    iou: 0.569491525423729,
    type: "symbol",
    rectangles: [{ left: 171.0, top: 642.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 11,
    iou: 0.541176470588233,
    type: "symbol",
    rectangles: [{ left: 155.0, top: 640.0, width: 5.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 12,
    iou: 0.420353982300888,
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
    iou: 0.393612235717499,
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
    iou: 0.333835341365463,
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
    iou: 0.276199494949493,
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
    iou: 0.389016018306631,
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
    iou: 0.427927927927928,
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
    iou: 0.462962962962963,
    type: "symbol",
    rectangles: [{ left: 440.0, top: 387.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 86,
    iou: 0.552398989898987,
    type: "symbol",
    rectangles: [{ left: 424.0, top: 389.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 87,
    iou: 0.323232323232322,
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
    iou: 0.0197956577266912,
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
    iou: 0.203850509626275,
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
    iou: 0,
    type: "symbol",
    rectangles: [{ left: 405.0, top: 199.0, width: 6.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 114,
    iou: 0,
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
    iou: 0.591836734693874,
    type: "symbol",
    rectangles: [{ left: 415.0, top: 188.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 121,
    iou: 0.393612235717498,
    type: "symbol",
    rectangles: [{ left: 399.0, top: 190.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 9,
    index: 122,
    iou: 0.310218978102186,
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
    iou: 0.00800266755585222,
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
    iou: 0.496031746031748,
    type: "symbol",
    rectangles: [{ left: 417.0, top: 582.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 1,
    iou: 0.563909774436088,
    type: "symbol",
    rectangles: [{ left: 417.0, top: 571.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 2,
    iou: 0.543900543900547,
    type: "symbol",
    rectangles: [{ left: 313.0, top: 559.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 3,
    iou: 0.498381877022652,
    type: "symbol",
    rectangles: [{ left: 534.0, top: 546.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 4,
    iou: 0.37707390648567,
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
    iou: 0.284275503573749,
    type: "symbol",
    rectangles: [{ left: 423.0, top: 66.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 10,
    iou: 0.328308207705194,
    type: "symbol",
    rectangles: [{ left: 313.0, top: 55.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 11,
    iou: 0.441095890410957,
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
    iou: 0.074257425742574,
    type: "symbol",
    rectangles: [{ left: 89.0, top: 470.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 17,
    iou: 0.217013888888888,
    type: "symbol",
    rectangles: [{ left: 84.0, top: 466.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 18,
    iou: 0.408496732026141,
    type: "symbol",
    rectangles: [{ left: 183.0, top: 606.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 19,
    iou: 0.0408404853506951,
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
    iou: 0.467414529914528,
    type: "symbol",
    rectangles: [{ left: 112.0, top: 274.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 31,
    iou: 0.134125043660495,
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
    iou: 0.361990950226244,
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
    iou: 0.105882352941175,
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
    iou: 0.294612794612794,
    type: "symbol",
    rectangles: [{ left: 295.0, top: 87.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 48,
    iou: 0.112676056338029,
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
    iou: 0.467414529914528,
    type: "symbol",
    rectangles: [{ left: 433.0, top: 698.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 53,
    iou: 0.560997328584159,
    type: "symbol",
    rectangles: [{ left: 553.0, top: 698.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 54,
    iou: 0.463675213675212,
    type: "symbol",
    rectangles: [{ left: 397.0, top: 652.0, width: 8.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 0,
    iou: 0.732673267326734,
    type: "citation",
    rectangles: [{ left: 48.0, top: 457.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 1,
    iou: 0.495626822157434,
    type: "citation",
    rectangles: [{ left: 281.0, top: 585.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 2,
    iou: 0.5974025974026,
    type: "citation",
    rectangles: [{ left: 514.0, top: 663.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 3,
    iou: 0.400000000000003,
    type: "citation",
    rectangles: [{ left: 438.0, top: 444.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 4,
    iou: 0.702306079664567,
    type: "citation",
    rectangles: [{ left: 458.0, top: 240.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 5,
    iou: 0.692007797270957,
    type: "citation",
    rectangles: [{ left: 548.0, top: 240.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 10,
    index: 6,
    iou: 0.60046189376443,
    type: "citation",
    rectangles: [{ left: 531.0, top: 193.0, width: 11.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 0,
    iou: 0.36008230452675,
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
    iou: 0.263157894736843,
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
    iou: 0.25244299674267,
    type: "symbol",
    rectangles: [{ left: 237.0, top: 158.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 4,
    iou: 0.120988953182535,
    type: "symbol",
    rectangles: [{ left: 136.0, top: 148.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 5,
    iou: 0.0909810126582277,
    type: "symbol",
    rectangles: [{ left: 133.0, top: 148.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 6,
    iou: 0.139553429027113,
    type: "symbol",
    rectangles: [{ left: 130.0, top: 146.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 7,
    iou: 0.413223140495866,
    type: "symbol",
    rectangles: [{ left: 268.0, top: 145.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 8,
    iou: 0.0557710960232783,
    type: "symbol",
    rectangles: [{ left: 114.0, top: 136.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 9,
    iou: 0.0446718648473034,
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
    iou: 0.241728236427882,
    type: "symbol",
    rectangles: [{ left: 101.0, top: 134.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 11,
    iou: 0.0694444444444444,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 132.0, width: 3.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 12,
    iou: 0.0330441966129698,
    type: "symbol",
    rectangles: [{ left: 196.0, top: 99.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 13,
    iou: 0.0385802469135802,
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
    iou: 0.186017988552739,
    type: "symbol",
    rectangles: [{ left: 183.0, top: 96.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 15,
    iou: 0.0909391534391535,
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
    iou: 0.289351851851852,
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
    iou: 0.0805860805860806,
    type: "symbol",
    rectangles: [{ left: 141.0, top: 99.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 19,
    iou: 0.037037037037037,
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
    iou: 0.271084337349399,
    type: "symbol",
    rectangles: [{ left: 501.0, top: 426.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 24,
    iou: 0.0517598343685299,
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
    iou: 0.0534188034188034,
    type: "symbol",
    rectangles: [{ left: 477.0, top: 428.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 27,
    iou: 0.0391737891737892,
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
    iou: 0.224358974358974,
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
    iou: 0.0855897914721443,
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
    iou: 0.42016806722689,
    type: "symbol",
    rectangles: [{ left: 438.0, top: 426.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 32,
    iou: 0.0700280112044817,
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
    iou: 0.111925111925111,
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
    iou: 0.373376623376624,
    type: "symbol",
    rectangles: [{ left: 418.0, top: 426.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 36,
    iou: 0.0498405103668261,
    type: "symbol",
    rectangles: [{ left: 395.0, top: 428.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 37,
    iou: 0.0365497076023392,
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
    iou: 0.0699670743179675,
    type: "symbol",
    rectangles: [{ left: 382.0, top: 426.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 39,
    iou: 0.113224637681159,
    type: "symbol",
    rectangles: [{ left: 373.0, top: 428.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 40,
    iou: 0.121918542336549,
    type: "symbol",
    rectangles: [{ left: 369.0, top: 424.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 41,
    iou: 0.108506944444444,
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
    iou: 0.0201117318435762,
    type: "symbol",
    rectangles: [{ left: 328.0, top: 428.0, width: 2.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 45,
    iou: 0.0968241673121611,
    type: "symbol",
    rectangles: [{ left: 523.0, top: 370.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 46,
    iou: 0.284900284900285,
    type: "symbol",
    rectangles: [{ left: 519.0, top: 372.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 47,
    iou: 0.0759186152444579,
    type: "symbol",
    rectangles: [{ left: 514.0, top: 364.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 48,
    iou: 0.0868055555555555,
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
    iou: 0.142045454545454,
    type: "symbol",
    rectangles: [{ left: 508.0, top: 362.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 50,
    iou: 0.0617283950617283,
    type: "symbol",
    rectangles: [{ left: 427.0, top: 352.0, width: 2.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 51,
    iou: 0.0679012345679012,
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
    iou: 0.222222222222222,
    type: "symbol",
    rectangles: [{ left: 420.0, top: 350.0, width: 4.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 53,
    iou: 0.0664540138224349,
    type: "symbol",
    rectangles: [{ left: 491.0, top: 352.0, width: 2.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 54,
    iou: 0.199362041467305,
    type: "symbol",
    rectangles: [{ left: 487.0, top: 348.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 55,
    iou: 0.0901577761081894,
    type: "symbol",
    rectangles: [{ left: 460.0, top: 329.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 56,
    iou: 0.12569130216189,
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
    iou: 0.146198830409356,
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
    iou: 0.130678282513999,
    type: "symbol",
    rectangles: [{ left: 453.0, top: 302.0, width: 6.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 60,
    iou: 0.109126984126984,
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
    iou: 0.154761904761906,
    type: "symbol",
    rectangles: [{ left: 444.0, top: 302.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 62,
    iou: 0.0108932461873638,
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
    iou: 0.0548245614035086,
    type: "symbol",
    rectangles: [{ left: 409.0, top: 302.0, width: 3.0, height: 2.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 65,
    iou: 0.140243902439024,
    type: "symbol",
    rectangles: [{ left: 558.0, top: 211.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 66,
    iou: 0.193482688391035,
    type: "symbol",
    rectangles: [{ left: 553.0, top: 207.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 67,
    iou: 0.15271838729383,
    type: "symbol",
    rectangles: [{ left: 358.0, top: 199.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 68,
    iou: 0.413359788359788,
    type: "symbol",
    rectangles: [{ left: 353.0, top: 196.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 69,
    iou: 0.353497164461245,
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
    iou: 0.141420490257698,
    type: "symbol",
    rectangles: [{ left: 477.0, top: 119.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 72,
    iou: 0.102137020741672,
    type: "symbol",
    rectangles: [{ left: 473.0, top: 123.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 73,
    iou: 0.0466482377332419,
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
    iou: 0.317719680464778,
    type: "symbol",
    rectangles: [{ left: 464.0, top: 119.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 75,
    iou: 0.291828793774319,
    type: "symbol",
    rectangles: [{ left: 447.0, top: 121.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 76,
    iou: 0.0290360046457607,
    type: "symbol",
    rectangles: [{ left: 430.0, top: 123.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 77,
    iou: 0.0212930700735578,
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
    iou: 0.0866141732283467,
    type: "symbol",
    rectangles: [{ left: 417.0, top: 121.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 79,
    iou: 0.059185606060606,
    type: "symbol",
    rectangles: [{ left: 400.0, top: 122.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 80,
    iou: 0.0434027777777777,
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
    iou: 0.138099747474747,
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
    iou: 0.203634085213034,
    type: "symbol",
    rectangles: [{ left: 469.0, top: 89.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 84,
    iou: 0.022309711286089,
    type: "symbol",
    rectangles: [{ left: 465.0, top: 93.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 85,
    iou: 0.0893437296946068,
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
    iou: 0.284275503573748,
    type: "symbol",
    rectangles: [{ left: 456.0, top: 89.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 87,
    iou: 0.0347866419294992,
    type: "symbol",
    rectangles: [{ left: 441.0, top: 92.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 88,
    iou: 0.0435264324153212,
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
    iou: 0.249287749287749,
    type: "symbol",
    rectangles: [{ left: 428.0, top: 91.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 90,
    iou: 0.0547345374931582,
    type: "symbol",
    rectangles: [{ left: 410.0, top: 93.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 91,
    iou: 0.050173326035395,
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
    iou: 0.127713920817369,
    type: "symbol",
    rectangles: [{ left: 402.0, top: 91.0, width: 4.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 93,
    iou: 0.0978473581213307,
    type: "symbol",
    rectangles: [{ left: 487.0, top: 57.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 94,
    iou: 0.268714011516314,
    type: "symbol",
    rectangles: [{ left: 482.0, top: 53.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 95,
    iou: 0.0843454790823212,
    type: "symbol",
    rectangles: [{ left: 475.0, top: 57.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 96,
    iou: 0.140575798470535,
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
    iou: 0.254072237960339,
    type: "symbol",
    rectangles: [{ left: 442.0, top: 55.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 99,
    iou: 0.385771543086173,
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
    iou: 0.537428023032629,
    type: "symbol",
    rectangles: [{ left: 377.0, top: 55.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 106,
    iou: 0.263157894736843,
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
    iou: 0.30961791831357,
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
    iou: 0.665499124343258,
    type: "citation",
    rectangles: [{ left: 220.0, top: 66.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 4,
    iou: 0.220665499124344,
    type: "citation",
    rectangles: [{ left: 369.0, top: 385.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 12,
    index: 5,
    iou: 0.455223880597014,
    type: "citation",
    rectangles: [{ left: 415.0, top: 73.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 0,
    iou: 0.304347826086956,
    type: "symbol",
    rectangles: [{ left: 49.0, top: 735.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 1,
    iou: 0.0884433962264152,
    type: "symbol",
    rectangles: [{ left: 92.0, top: 518.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 2,
    iou: 0.248036378668871,
    type: "symbol",
    rectangles: [{ left: 88.0, top: 514.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 3,
    iou: 0.32051282051282,
    type: "symbol",
    rectangles: [{ left: 170.0, top: 515.0, width: 3.0, height: 6.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 4,
    iou: 0.0382614018977655,
    type: "symbol",
    rectangles: [{ left: 187.0, top: 494.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 5,
    iou: 0.113002641620193,
    type: "symbol",
    rectangles: [{ left: 177.0, top: 492.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 6,
    iou: 0.0822097994080895,
    type: "symbol",
    rectangles: [{ left: 172.0, top: 494.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 7,
    iou: 0.300068587105624,
    type: "symbol",
    rectangles: [{ left: 167.0, top: 490.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 8,
    iou: 0.082758620689654,
    type: "symbol",
    rectangles: [{ left: 150.0, top: 494.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 9,
    iou: 0.315656565656564,
    type: "symbol",
    rectangles: [{ left: 145.0, top: 490.0, width: 5.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 10,
    iou: 0.00190073917634653,
    type: "symbol",
    rectangles: [{ left: 160.0, top: 475.0, width: 2.0, height: 4.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 11,
    iou: 0.053832902670112,
    type: "symbol",
    rectangles: [{ left: 145.0, top: 473.0, width: 4.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 12,
    iou: 0.131890611541774,
    type: "symbol",
    rectangles: [{ left: 139.0, top: 471.0, width: 7.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 13,
    iou: 0.0490196078431373,
    type: "symbol",
    rectangles: [{ left: 104.0, top: 473.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 14,
    iou: 0.205882352941176,
    type: "symbol",
    rectangles: [{ left: 95.0, top: 471.0, width: 9.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 13,
    index: 15,
    iou: 0.466431095406355,
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
    iou: 0.0880829015544039,
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
    iou: 0.535714285714288,
    type: "symbol",
    rectangles: [{ left: 362.0, top: 235.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 1,
    iou: 0.396825396825396,
    type: "symbol",
    rectangles: [{ left: 476.0, top: 233.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 2,
    iou: 0.347222222222222,
    type: "symbol",
    rectangles: [{ left: 407.0, top: 221.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 3,
    iou: 0.262520193861068,
    type: "symbol",
    rectangles: [{ left: 538.0, top: 94.0, width: 6.0, height: 5.0 }]
  },
  {
    arxivId: "1911.07844",
    page: 8,
    index: 4,
    iou: 0.440982624325947,
    type: "symbol",
    rectangles: [{ left: 350.0, top: 82.0, width: 5.0, height: 7.0 }]
  },
  {
    arxivId: "1911.08624",
    page: 10,
    index: 0,
    iou: 0.871112631598048,
    type: "citation",
    rectangles: [{ left: 514.0, top: 406.0, width: 25.0, height: 11.0 }]
  },
  {
    arxivId: "1911.08624",
    page: 10,
    index: 1,
    iou: 0.763227313204584,
    type: "citation",
    rectangles: [{ left: 515.0, top: 306.0, width: 14.0, height: 11.0 }]
  },
  {
    arxivId: "1911.08624",
    page: 10,
    index: 2,
    iou: 0.769291217041102,
    type: "citation",
    rectangles: [{ left: 227.0, top: 181.0, width: 13.0, height: 11.0 }]
  },
  {
    arxivId: "1911.08836",
    page: 3,
    index: 0,
    iou: 0.568181818181816,
    type: "citation",
    rectangles: [{ left: 102.0, top: 635.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.08836",
    page: 3,
    index: 1,
    iou: 0.806451612903224,
    type: "citation",
    rectangles: [{ left: 454.0, top: 462.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.08836",
    page: 3,
    index: 2,
    iou: 0.714285714285714,
    type: "citation",
    rectangles: [{ left: 389.0, top: 438.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.08836",
    page: 3,
    index: 3,
    iou: 0.741444866920146,
    type: "citation",
    rectangles: [{ left: 542.0, top: 414.0, width: 10.0, height: 9.0 }]
  },
  {
    arxivId: "1911.08836",
    page: 3,
    index: 4,
    iou: 0.86683417085427,
    type: "citation",
    rectangles: [{ left: 437.0, top: 344.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.08836",
    page: 3,
    index: 5,
    iou: 0.831552999178307,
    type: "citation",
    rectangles: [{ left: 313.0, top: 115.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.08836",
    page: 3,
    index: 6,
    iou: 0.831234256926951,
    type: "citation",
    rectangles: [{ left: 439.0, top: 115.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.08885",
    page: 0,
    index: 0,
    iou: 0.689452681690252,
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
    iou: 0.675431389982799,
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
    iou: 0.712715923567334,
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
    iou: 0.59543640691431,
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
    iou: 0.654980047605741,
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
    iou: 0.554480463581575,
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
    iou: 0.598025260857415,
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
    iou: 0.766784015487445,
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
    iou: 0.714035747560705,
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
    iou: 0.653907495107123,
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
    iou: 0.69609508819656,
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
    iou: 0.689452681690255,
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
    iou: 0.518021921525522,
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
    iou: 0.493986143397932,
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
    iou: 0.528079347308619,
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
    iou: 0.598489926949768,
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
    iou: 0.438742615621071,
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
    iou: 0.508520852963856,
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
    iou: 0.38834150793269,
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
    iou: 0.519413793754246,
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
    iou: 0.34733790403335,
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
    iou: 0.381919414386025,
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
    iou: 0.586797099035573,
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
    iou: 0.405227554705574,
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
    iou: 0.380059650443592,
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
    iou: 0.663099634972751,
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
    iou: 0.427522560425692,
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
    iou: 0.491286307053941,
    type: "citation",
    rectangles: [{ left: 248.0, top: 266.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.09322",
    page: 4,
    index: 1,
    iou: 0.405063291139241,
    type: "citation",
    rectangles: [{ left: 387.0, top: 173.0, width: 10.0, height: 9.0 }]
  },
  {
    arxivId: "1911.09322",
    page: 4,
    index: 2,
    iou: 0.266211604095564,
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
    iou: 0.310655437799077,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 668.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 3,
    iou: 0.464207488775693,
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
    iou: 0.200296233981923,
    type: "symbol",
    rectangles: [{ left: 323.0, top: 535.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 6,
    iou: 0.157981497644727,
    type: "symbol",
    rectangles: [{ left: 319.0, top: 537.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 7,
    iou: 0.639373731539236,
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
    iou: 0.423210427446444,
    type: "symbol",
    rectangles: [{ left: 306.0, top: 542.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 10,
    iou: 0.375030299005841,
    type: "symbol",
    rectangles: [{ left: 245.0, top: 542.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 11,
    iou: 0.412402640078966,
    type: "symbol",
    rectangles: [{ left: 216.0, top: 542.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 12,
    iou: 0.611463613327023,
    type: "symbol",
    rectangles: [{ left: 244.0, top: 528.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 13,
    iou: 0.788187850071523,
    type: "symbol",
    rectangles: [{ left: 229.0, top: 528.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 14,
    iou: 0.620535344327504,
    type: "symbol",
    rectangles: [{ left: 288.0, top: 528.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 15,
    iou: 0.367894321228018,
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
    iou: 0.303407407407407,
    type: "symbol",
    rectangles: [{ left: 397.0, top: 521.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 18,
    iou: 0.152395750552994,
    type: "symbol",
    rectangles: [{ left: 393.0, top: 523.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 19,
    iou: 0.574376642773609,
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
    iou: 0.646736842105263,
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
    iou: 0.292571428571428,
    type: "symbol",
    rectangles: [{ left: 358.0, top: 521.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 24,
    iou: 0.168791950733849,
    type: "symbol",
    rectangles: [{ left: 354.0, top: 523.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 25,
    iou: 0.650123311084829,
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
    iou: 0.59076923076923,
    type: "symbol",
    rectangles: [{ left: 341.0, top: 528.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 28,
    iou: 0.284444444444444,
    type: "symbol",
    rectangles: [{ left: 240.0, top: 506.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 29,
    iou: 0.34481387310626,
    type: "symbol",
    rectangles: [{ left: 236.0, top: 508.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 30,
    iou: 0.562546074413223,
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
    iou: 0.82139037433155,
    type: "symbol",
    rectangles: [{ left: 223.0, top: 513.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 33,
    iou: 0.451085420910926,
    type: "symbol",
    rectangles: [{ left: 195.0, top: 513.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 34,
    iou: 0.406345766385046,
    type: "symbol",
    rectangles: [{ left: 185.0, top: 513.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 35,
    iou: 0.684057971014492,
    type: "symbol",
    rectangles: [{ left: 441.0, top: 511.0, width: 4.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 36,
    iou: 0.656410256410256,
    type: "symbol",
    rectangles: [{ left: 435.0, top: 513.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 37,
    iou: 0.48,
    type: "symbol",
    rectangles: [{ left: 426.0, top: 510.0, width: 3.0, height: 7.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 38,
    iou: 0.353083259588811,
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
    iou: 0.837818181818181,
    type: "symbol",
    rectangles: [{ left: 482.0, top: 516.0, width: 6.0, height: 9.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 41,
    iou: 0.668444444444444,
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
    iou: 0.160642570281124,
    type: "symbol",
    rectangles: [{ left: 455.0, top: 494.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 44,
    iou: 0.124538489360543,
    type: "symbol",
    rectangles: [{ left: 451.0, top: 496.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 45,
    iou: 0.295970118632034,
    type: "symbol",
    rectangles: [{ left: 445.0, top: 502.0, width: 5.0, height: 6.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 46,
    iou: 0.0197683397683397,
    type: "symbol",
    rectangles: [{ left: 106.0, top: 410.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 47,
    iou: 0.0707509104486576,
    type: "symbol",
    rectangles: [{ left: 102.0, top: 413.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 48,
    iou: 0.227555555555555,
    type: "symbol",
    rectangles: [{ left: 159.0, top: 410.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 49,
    iou: 0.0978873479948465,
    type: "symbol",
    rectangles: [{ left: 154.0, top: 413.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 50,
    iou: 0.0194862036156041,
    type: "symbol",
    rectangles: [{ left: 335.0, top: 396.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 51,
    iou: 0.0687561862662382,
    type: "symbol",
    rectangles: [{ left: 331.0, top: 398.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 52,
    iou: 0.0538947368421052,
    type: "symbol",
    rectangles: [{ left: 206.0, top: 381.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 53,
    iou: 0.0712090101444142,
    type: "symbol",
    rectangles: [{ left: 202.0, top: 384.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 54,
    iou: 0.185339366515837,
    type: "symbol",
    rectangles: [{ left: 257.0, top: 381.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 55,
    iou: 0.0959996158479372,
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
    iou: 0.0483952338003015,
    type: "symbol",
    rectangles: [{ left: 389.0, top: 222.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 58,
    iou: 0.076284194207243,
    type: "symbol",
    rectangles: [{ left: 385.0, top: 224.0, width: 3.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 59,
    iou: 0.436248807750135,
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
    iou: 0.0847611533439876,
    type: "symbol",
    rectangles: [{ left: 306.0, top: 226.0, width: 1.0, height: 4.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 63,
    iou: 0.120770625331375,
    type: "symbol",
    rectangles: [{ left: 302.0, top: 228.0, width: 3.0, height: 5.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 64,
    iou: 0.630515305683333,
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
    iou: 0.826500615179432,
    type: "citation",
    rectangles: [{ left: 120.0, top: 661.0, width: 88.0, height: 12.0 }]
  },
  {
    arxivId: "1911.09534",
    page: 15,
    index: 1,
    iou: 0.678788701562061,
    type: "citation",
    rectangles: [{ left: 455.0, top: 603.0, width: 10.0, height: 12.0 }]
  },
  {
    arxivId: "1911.09986",
    page: 6,
    index: 0,
    iou: 0.783736809100875,
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
    iou: 0.51332787311518,
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
    iou: 0.650145767944944,
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
    iou: 0.837019147681188,
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
    iou: 0.625936597419212,
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
    iou: 0.176070612011802,
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
    iou: 0.206039424000778,
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
    iou: 0.369642047702575,
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
    iou: 0.46413232119124,
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
    iou: 0.378865720021255,
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
    iou: 0.316933081070991,
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
    iou: 0.538335997340882,
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
    iou: 0.365875115295659,
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
    iou: 0.227422870936715,
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
    iou: 0.165434763772966,
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
    iou: 0.415477590264136,
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
    iou: 0.203453516639706,
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
    iou: 0.637364628087688,
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
    iou: 0.0813858880305139,
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
    iou: 0.323712563678551,
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
    iou: 0.153886422327807,
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
    iou: 0.167288394906613,
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
    iou: 0.509245465376219,
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
    iou: 0.351257374639125,
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
    iou: 0.207036258495428,
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
    iou: 0.165179705599882,
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
    iou: 0.573641143228634,
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
    iou: 0.350433592977911,
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
    iou: 0.258752544763541,
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
    iou: 0.102441687363282,
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
    iou: 0.422503409391497,
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
    iou: 0.281980369503858,
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
    iou: 0.159072262919196,
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
    iou: 0.384672960262146,
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
    iou: 0.353585461686164,
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
    iou: 0.292588916463639,
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
    iou: 0.555901634092653,
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
    iou: 0.424939509849745,
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
    iou: 0.149768589113943,
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
    iou: 0.640244660899821,
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
    iou: 0.683139839913501,
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
    iou: 0.627175326078172,
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
    iou: 0.722237080985375,
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
    iou: 0.704190984412311,
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
    iou: 0.764354114573663,
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
    iou: 0.454374117112619,
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
    iou: 0.568132961847356,
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
    iou: 0.520426130002767,
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
    iou: 0.530975152354026,
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
    iou: 0.497262909691256,
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
    iou: 0.434681062039893,
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
    iou: 0.217144164245834,
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
    iou: 0.463395228796363,
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
    iou: 0.448110014233674,
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
    iou: 0.251315831641757,
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
    iou: 0.335096519389477,
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
    iou: 0.117485202304901,
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
    iou: 0.20690687061161,
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
    iou: 0.584535276409676,
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
    iou: 0.490055092389552,
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
    iou: 0.39128699949006,
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
    iou: 0.480658117931242,
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
    iou: 0.635921973968106,
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
    iou: 0.307682786490492,
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
    iou: 0.736334381068247,
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
    iou: 0.704115007815833,
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
    iou: 0.652704433119833,
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
    iou: 0.695716794559918,
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
    iou: 0.152690798515016,
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
    iou: 0.48907998446873,
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
    iou: 0.169881971229891,
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
    iou: 0.491539734594821,
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
    iou: 0.465952537650207,
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
    iou: 0.641562910965278,
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
    iou: 0.102651636904075,
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
    iou: 0.520742152355733,
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
    iou: 0.176146871960212,
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
    iou: 0.476431720935044,
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
    iou: 0.468288990965303,
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
    iou: 0.456420092397238,
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
    iou: 0.374346946589222,
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
    iou: 0.61012632807097,
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
    iou: 0.565737215157514,
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
    iou: 0.576366133529035,
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
    iou: 0.75138421038712,
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
    iou: 0.771977359183059,
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
    iou: 0.790760093815545,
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
    iou: 0.804340064848226,
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
    iou: 0.833812492916543,
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
    iou: 0.802488910842856,
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
    iou: 0.758747187860462,
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
    iou: 0.86242798198644,
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
    iou: 0.801776513006476,
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
    iou: 0.173898178403282,
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
    iou: 0.232705137132873,
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
    iou: 0.813697466113573,
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
    iou: 0.764573903426935,
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
    iou: 0.604186489058038,
    type: "citation",
    rectangles: [{ left: 179.0, top: 426.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.10353",
    page: 3,
    index: 1,
    iou: 0.57201646090535,
    type: "citation",
    rectangles: [{ left: 149.0, top: 390.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.10353",
    page: 3,
    index: 2,
    iou: 0.670970614425651,
    type: "citation",
    rectangles: [{ left: 481.0, top: 733.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.10353",
    page: 3,
    index: 3,
    iou: 0.14890800794176,
    type: "citation",
    rectangles: [{ left: 393.0, top: 709.0, width: 15.0, height: 9.0 }]
  },
  {
    arxivId: "1911.10353",
    page: 3,
    index: 4,
    iou: 0.548615203299939,
    type: "citation",
    rectangles: [{ left: 386.0, top: 489.0, width: 16.0, height: 9.0 }]
  },
  {
    arxivId: "1911.11124",
    page: 2,
    index: 0,
    iou: 0.681215537448869,
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
    iou: 0.791520093933381,
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
    iou: 0.914020854877841,
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
    iou: 0.81484946980064,
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
    iou: 0.816680699674754,
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
    iou: 0.870050659332022,
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
    iou: 0.883291315952758,
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
    iou: 0.53163211057948,
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
    iou: 0.679012345679011,
    type: "citation",
    rectangles: [{ left: 148.0, top: 389.0, width: 8.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 1,
    iou: 0.807594936708859,
    type: "citation",
    rectangles: [{ left: 165.0, top: 377.0, width: 9.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 2,
    iou: 0.827922077922079,
    type: "citation",
    rectangles: [{ left: 155.0, top: 281.0, width: 9.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 3,
    iou: 0.900584795321636,
    type: "citation",
    rectangles: [{ left: 130.0, top: 257.0, width: 28.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 4,
    iou: 0.861111111111111,
    type: "citation",
    rectangles: [{ left: 181.0, top: 233.0, width: 31.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 5,
    iou: 0.848765432098765,
    type: "citation",
    rectangles: [{ left: 78.0, top: 197.0, width: 14.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 6,
    iou: 0.886548722269025,
    type: "citation",
    rectangles: [{ left: 55.0, top: 149.0, width: 29.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 7,
    iou: 0.911331269349845,
    type: "citation",
    rectangles: [{ left: 95.0, top: 101.0, width: 67.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 8,
    iou: 0.795454545454548,
    type: "citation",
    rectangles: [{ left: 515.0, top: 535.0, width: 28.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 9,
    iou: 0.9185828249648,
    type: "citation",
    rectangles: [{ left: 447.0, top: 524.0, width: 29.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 10,
    iou: 0.891203703703704,
    type: "citation",
    rectangles: [{ left: 480.0, top: 428.0, width: 14.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 11,
    iou: 0.961591642341374,
    type: "citation",
    rectangles: [{ left: 457.0, top: 332.0, width: 57.0, height: 11.0 }]
  },
  {
    arxivId: "1911.12165",
    page: 0,
    index: 12,
    iou: 0.820784154117486,
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
    iou: 0.679463077343809,
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
    iou: 0.7247417016559,
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
    iou: 0.643905635648754,
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
    iou: 0.820960698689956,
    type: "citation",
    rectangles: [{ left: 357.0, top: 339.0, width: 90.0, height: 10.0 }]
  },
  {
    arxivId: "1911.13254",
    page: 4,
    index: 4,
    iou: 0.7,
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
