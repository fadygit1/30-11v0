export interface Config {
  searchRange: {
    start: string;
    end: string;
  };
  options: {
    uncompressed: boolean;
    bothFormats: boolean;
    caseInsensitive: boolean;
    useGPU: boolean;
    stopWhenFound: boolean;
    inputFile: string;
    outputFile: string;
    gpuIds: number[];
    gpuGrid: number[];
    maxFound: number;
    seed: string;
    threadNumber: number;
    noSSE: boolean;
    rekeyInterval: number;
    startPubKey: string;
    baseKey: string;
    addressListFile: string;
    addressFormat: 'compressed' | 'uncompressed' | 'both';
    saveInterval: number;
  };
  maxConsecutiveRepeats: number;
  fixedPrefixLength: number;
  addressList: string[];
}

export const loadConfig = (): Config => {
  return {
    searchRange: {
      start: '',
      end: ''
    },
    options: {
      uncompressed: false,
      bothFormats: false,
      caseInsensitive: false,
      useGPU: false,
      stopWhenFound: false,
      inputFile: "",
      outputFile: "",
      gpuIds: [0],
      gpuGrid: [8, 128],
      maxFound: 1,
      seed: "",
      threadNumber: navigator.hardwareConcurrency || 4,
      noSSE: false,
      rekeyInterval: 0,
      startPubKey: "",
      baseKey: "",
      addressListFile: '',
      addressFormat: 'both',
      saveInterval: 180,
    },
    maxConsecutiveRepeats: 4,
    fixedPrefixLength: 0,
    addressList: [],
  };
};

