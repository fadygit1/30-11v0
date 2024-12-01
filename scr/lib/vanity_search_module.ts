import { Worker } from 'worker_threads';
import { RangeValidator } from './range-validator';
import { CryptoUtils } from './crypto';

export class Searcher {
  config: any;
  results: string[] = [];
  workers: Worker[] = [];
  keysChecked: number = 0;
  isRunning: boolean = false;
  startTime: number;

  constructor(config: any) {
    this.config = config;
  }

  async search(
    progressCallback: (progress: number) => void,
    speedCallback: (speed: { cpu: number; gpu: number; total: number }) => void,
    timeCallback: (time: string) => void,
    coresCallback: (cores: number) => void,
    addressesCallback: (addresses: number) => void,
    resultsCallback: (newResults: string[]) => void
  ): Promise<string[]> {
    this.isRunning = true;
    this.startTime = Date.now();
    
    if (!this.config.searchRange.start || !this.config.searchRange.end) {
      throw new Error("Search range not properly defined");
    }

    const rangeValidator = new RangeValidator(this.config.maxConsecutiveRepeats);
    const validRanges = rangeValidator.generateValidSubranges(
      this.config.searchRange.start,
      this.config.searchRange.end,
      this.config.fixedPrefixLength
    );

    const workerCount = this.config.options.threadNumber;
    coresCallback(workerCount);

    const rangesPerWorker = Math.ceil(validRanges.length / workerCount);
    const workerPromises = [];

    for (let i = 0; i < workerCount; i++) {
      const workerRanges = validRanges.slice(
        i * rangesPerWorker,
        (i + 1) * rangesPerWorker
      );

      const worker = new Worker(`
        const { parentPort } = require('worker_threads');
        const { CryptoUtils } = require('./crypto');
        
        parentPort.on('message', ({ ranges, addressList, addressFormat }) => {
          for (const [start, end] of ranges) {
            let current = BigInt('0x' + start);
            const endBig = BigInt('0x' + end);
            
            while (current <= endBig) {
              const privateKey = Buffer.from(current.toString(16).padStart(64, '0'), 'hex');
              const publicKey = CryptoUtils.privateKeyToPublicKey(privateKey, addressFormat !== 'uncompressed');
              const address = CryptoUtils.publicKeyToAddress(publicKey);
              
              if (addressList.includes(address)) {
                parentPort.postMessage({
                  type: 'found',
                  address,
                  privateKey: privateKey.toString('hex')
                });
              }
              
              parentPort.postMessage({ type: 'progress', keysChecked: 1 });
              current += BigInt(1);
            }
          }
          
          parentPort.postMessage({ type: 'done' });
        });
      `);

      worker.on('message', (message: any) => {
        if (message.type === 'found') {
          this.results.push(`${message.address} ${message.privateKey}`);
          resultsCallback([`${message.address} ${message.privateKey}`]);
          addressesCallback(this.results.length);
        } else if (message.type === 'progress') {
          this.keysChecked += message.keysChecked;
          const totalKeys = BigInt('0x' + this.config.searchRange.end) - BigInt('0x' + this.config.searchRange.start);
          const progress = (this.keysChecked / Number(totalKeys)) * 100;
          progressCallback(progress);
          
          const elapsedSeconds = (Date.now() - this.startTime) / 1000;
          const keysPerSecond = this.keysChecked / elapsedSeconds;
          
          speedCallback({
            cpu: keysPerSecond / 1e6,
            gpu: 0, // GPU implementation pending
            total: keysPerSecond / 1e6
          });
          
          const remainingKeys = Number(totalKeys) - this.keysChecked;
          const estimatedSeconds = remainingKeys / keysPerSecond;
          const hours = Math.floor(estimatedSeconds / 3600);
          const minutes = Math.floor((estimatedSeconds % 3600) / 60);
          const seconds = Math.floor(estimatedSeconds % 60);
          
          timeCallback(`${hours}h ${minutes}m ${seconds}s`);
        }
      });

      worker.postMessage({
        ranges: workerRanges,
        addressList: this.config.addressList,
        addressFormat: this.config.options.addressFormat
      });

      this.workers.push(worker);
      workerPromises.push(new Promise(resolve => worker.on('message', message => {
        if (message.type === 'done') resolve(null);
      })));
    }

    await Promise.all(workerPromises);
    this.isRunning = false;
    return this.results;
  }
}

