const allCitations: Citations = {};

interface Citations {
  /**
   * Currently keyed by URL; may want to move to Semantic Scholar ID eventually.
   */
  [url: string]: Citation[];
}

export interface Citation {
  referenceTitle?: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function citations(url: string | undefined, page: number) {
  if (url === undefined || !allCitations[url]) {
    return [];
  }
  return allCitations[url].filter(annotation => {
    return annotation.page === page;
  });
}

/*
 * Automatically generated with Grobid. This information should be queried from an API eventually.
 * Contact Andrew Head<andrewhead@berkeley.edu> for how to generate for another paper.
 */
allCitations["https://arxiv.org/pdf/1907.07355.pdf"] = [
  {
    referenceTitle: "Argumentation mining",
    page: 1,
    x: 131.531,
    y: 504.938,
    width: 131.09490000000005,
    height: 9.45819
  },
  {
    referenceTitle: "Argumentation mining: State of the art and emerging trends",
    page: 1,
    x: 266.629,
    y: 504.938,
    width: 23.64,
    height: 9.45819
  },
  {
    referenceTitle: "Argumentation mining: State of the art and emerging trends",
    page: 1,
    x: 72,
    y: 518.487,
    width: 80.66783333333336,
    height: 9.45819
  },
  {
    referenceTitle: "Argumentation mining on the web from information seeking perspective",
    page: 1,
    x: 178.156,
    y: 572.684,
    width: 96.48583333333335,
    height: 9.45819
  },
  {
    referenceTitle: "The Uses of Argument",
    page: 1,
    x: 117.868,
    y: 600.499,
    width: 43.06910000000002,
    height: 9.45819
  },
  {
    referenceTitle: "The Uses of Argument",
    page: 1,
    x: 167.57,
    y: 600.499,
    width: 20.36072,
    height: 9.45819
  },
  {
    referenceTitle: "Informal logic: a handbook of critical argumentation",
    page: 1,
    x: 192.611,
    y: 708.893,
    width: 64.11783333333335,
    height: 9.45819
  },
  {
    referenceTitle:
      "A relevance-theoretic framework for constructing and deconstructing enthymemes",
    page: 1,
    x: 188.608,
    y: 757.129,
    width: 89.39439999999996,
    height: 7.77387
  },
  {
    referenceTitle:
      "The argument reasoning comprehension task: Identification and reconstruction of implicit warrants",
    page: 1,
    x: 346.941,
    y: 361.582,
    width: 105.05560000000003,
    height: 9.45819
  },
  {
    referenceTitle: "Semeval-2018 task 12: The argument reasoning comprehension task",
    page: 1,
    x: 481.931,
    y: 511.301,
    width: 43.61460000000005,
    height: 9.45819
  },
  {
    referenceTitle: "Semeval-2018 task 12: The argument reasoning comprehension task",
    page: 1,
    x: 307.276,
    y: 524.85,
    width: 61.37450000000001,
    height: 9.45819
  },
  {
    referenceTitle:
      "BERT: pre-training of deep bidirectional transformers for language understanding",
    page: 1,
    x: 492.491,
    y: 661.019,
    width: 33.05459999999994,
    height: 9.45819
  },
  {
    referenceTitle:
      "BERT: pre-training of deep bidirectional transformers for language understanding",
    page: 1,
    x: 307.276,
    y: 674.569,
    width: 53.96689999999995,
    height: 9.45819
  },
  {
    referenceTitle:
      "BERT: pre-training of deep bidirectional transformers for language understanding",
    page: 2,
    x: 108.732,
    y: 204.367,
    width: 76.31777142857143,
    height: 8.63757
  },
  {
    referenceTitle: "Semeval-2018 task 12: The argument reasoning comprehension task",
    page: 2,
    x: 137.706,
    y: 484.191,
    width: 103.9742,
    height: 9.45819
  },
  {
    referenceTitle: "Long short-term memory",
    page: 2,
    x: 401.574,
    y: 546.088,
    width: 118.65100000000001,
    height: 9.45819
  },
  {
    referenceTitle: "Long short-term memory",
    page: 2,
    x: 307.276,
    y: 559.637,
    width: 40.31371999999999,
    height: 9.45819
  },
  {
    referenceTitle:
      "Gist at semeval-2018 task 12: A network transferring inference knowledge to argument reasoning comprehension task",
    page: 2,
    x: 307.276,
    y: 573.187,
    width: 91.60883333333334,
    height: 9.45819
  },
  {
    referenceTitle: "Frame-and entity-based knowledge for common-sense argumentative reasoning",
    page: 2,
    x: 484.942,
    y: 573.187,
    width: 40.6037,
    height: 9.45819
  },
  {
    referenceTitle: "Frame-and entity-based knowledge for common-sense argumentative reasoning",
    page: 2,
    x: 307.276,
    y: 586.736,
    width: 22.10160000000002,
    height: 9.45819
  },
  {
    referenceTitle: "Frame-and entity-based knowledge for common-sense argumentative reasoning",
    page: 2,
    x: 335.432,
    y: 586.736,
    width: 27.26648571428575,
    height: 9.45819
  },
  {
    referenceTitle: "Dropout: A simple way to prevent neural networks from overfitting",
    page: 2,
    x: 505.549,
    y: 613.834,
    width: 15.997119999999995,
    height: 9.45819
  },
  {
    referenceTitle: "Dropout: A simple way to prevent neural networks from overfitting",
    page: 2,
    x: 307.276,
    y: 627.383,
    width: 86.0238333333333,
    height: 9.45819
  },
  {
    referenceTitle: "Glove: Global vectors for word representation",
    page: 2,
    x: 413.256,
    y: 708.679,
    width: 107.59083333333342,
    height: 9.45819
  },
  {
    referenceTitle:
      "Gist at semeval-2018 task 12: A network transferring inference knowledge to argument reasoning comprehension task",
    page: 5,
    x: 72,
    y: 240.909,
    width: 92.2909,
    height: 9.45819
  },
  {
    referenceTitle:
      "Blcu nlp at semeval-2018 task 12: An ensemble model for argument reasoning based on hierarchical attention",
    page: 5,
    x: 166.876,
    y: 240.909,
    width: 76.2439,
    height: 9.45819
  },
  {
    referenceTitle:
      "NLITrans at SemEval-2018 task 12: Transfer of semantic knowledge for argument comprehension",
    page: 5,
    x: 245.706,
    y: 240.909,
    width: 44.56370000000001,
    height: 9.45819
  },
  {
    referenceTitle:
      "NLITrans at SemEval-2018 task 12: Transfer of semantic knowledge for argument comprehension",
    page: 5,
    x: 72,
    y: 254.458,
    width: 49.59270000000001,
    height: 9.45819
  },
  {
    referenceTitle: "A large annotated corpus for learning natural language inference",
    page: 5,
    x: 247.517,
    y: 268.007,
    width: 42.75279999999998,
    height: 9.45819
  },
  {
    referenceTitle: "A large annotated corpus for learning natural language inference",
    page: 5,
    x: 72,
    y: 281.557,
    width: 54.6549,
    height: 9.45819
  },
  {
    referenceTitle:
      "Enhancing and combining sequential and tree LSTM for natural language inference",
    page: 5,
    x: 235.375,
    y: 295.106,
    width: 54.893899999999974,
    height: 9.45819
  },
  {
    referenceTitle:
      "Enhancing and combining sequential and tree LSTM for natural language inference",
    page: 5,
    x: 72,
    y: 308.655,
    width: 25.450900000000004,
    height: 9.45819
  },
  {
    referenceTitle:
      "Supervised learning of universal sentence representations from natural language inference data",
    page: 5,
    x: 162.415,
    y: 308.655,
    width: 95.71083333333334,
    height: 9.45819
  },
  {
    referenceTitle: "Frame-and entity-based knowledge for common-sense argumentative reasoning",
    page: 5,
    x: 112.833,
    y: 322.204,
    width: 100.7887,
    height: 9.45819
  },
  {
    referenceTitle: "Measuring the tendency of cnns to learn surface statistical regularities",
    page: 5,
    x: 217.298,
    y: 417.091,
    width: 72.9717,
    height: 9.45819
  },
  {
    referenceTitle: "Measuring the tendency of cnns to learn surface statistical regularities",
    page: 5,
    x: 72,
    y: 430.64,
    width: 25.450900000000004,
    height: 9.45819
  },
  {
    referenceTitle:
      "Behavior analysis of NLI models: Uncovering the influence of three factors on robustness",
    page: 5,
    x: 150.011,
    y: 430.64,
    width: 102.2399,
    height: 9.45819
  },
  {
    referenceTitle:
      "Right for the wrong reasons: Diagnosing syntactic heuristics in natural language inference",
    page: 5,
    x: 257.651,
    y: 430.64,
    width: 32.6182,
    height: 9.45819
  },
  {
    referenceTitle:
      "Right for the wrong reasons: Diagnosing syntactic heuristics in natural language inference",
    page: 5,
    x: 72,
    y: 444.19,
    width: 55.63589999999999,
    height: 9.45819
  },
  {
    referenceTitle: "Annotation artifacts in natural language inference data",
    page: 5,
    x: 132.426,
    y: 444.19,
    width: 112.46090000000001,
    height: 9.45819
  },
  {
    referenceTitle: "Breaking NLI systems with sentences that require simple lexical inferences",
    page: 5,
    x: 249.677,
    y: 444.19,
    width: 40.5928,
    height: 9.45819
  },
  {
    referenceTitle: "Breaking NLI systems with sentences that require simple lexical inferences",
    page: 5,
    x: 72,
    y: 457.739,
    width: 53.48689999999999,
    height: 9.45819
  },
  {
    referenceTitle: "Hypothesis only baselines in natural language inference",
    page: 5,
    x: 129.207,
    y: 457.739,
    width: 85.07990000000001,
    height: 9.45819
  },
  {
    referenceTitle: "Know what you don't know: Unanswerable questions for squad",
    page: 5,
    x: 218.007,
    y: 457.739,
    width: 72.26189999999997,
    height: 9.45819
  },
  {
    referenceTitle: "Know what you don't know: Unanswerable questions for squad",
    page: 5,
    x: 72,
    y: 471.288,
    width: 24.850899999999996,
    height: 9.45819
  },
  {
    referenceTitle: "Adversarial examples for evaluating reading comprehension systems",
    page: 5,
    x: 99.9818,
    y: 471.288,
    width: 88.94703333333332,
    height: 9.45819
  },
  {
    referenceTitle: "Hypothesis only baselines in natural language inference",
    page: 5,
    x: 168.393,
    y: 484.837,
    width: 54.15260000000001,
    height: 9.45819
  },
  {
    referenceTitle: "Hypothesis only baselines in natural language inference",
    page: 5,
    x: 229.418,
    y: 484.837,
    width: 29.083699999999965,
    height: 9.45819
  },
  {
    referenceTitle:
      "NLITrans at SemEval-2018 task 12: Transfer of semantic knowledge for argument comprehension",
    page: 5,
    x: 122.182,
    y: 525.485,
    width: 99.08048571428573,
    height: 9.45819
  },
  {
    referenceTitle:
      "NLITrans at SemEval-2018 task 12: Transfer of semantic knowledge for argument comprehension",
    page: 5,
    x: 94.8873,
    y: 579.682,
    width: 100.47853333333335,
    height: 9.45819
  },
  {
    referenceTitle:
      "The argument reasoning comprehension task: Identification and reconstruction of implicit warrants",
    page: 5,
    x: 110.836,
    y: 647.47,
    width: 105.27329999999999,
    height: 9.45819
  }
];
