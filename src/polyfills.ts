// Polyfills for WebRTC libraries that require Node.js globals
import { Buffer } from 'buffer';
import process from 'process';

// Make them globally available for simple-peer and other WebRTC libraries
(window as any).Buffer = Buffer;
(window as any).process = process;
