import { Recording, setupRecording } from '@jupiterone/integration-sdk-testing';
import path from 'path';
import crypto from 'crypto';

export function initRecording(name: string = 'default'): Recording {
  return setupRecording({
    name: name,
    directory: path.resolve(__dirname, '..'),
    redactedRequestHeaders: ['x-api-key'],
    mutateEntry: sanitizeRecordingEntry,
    options: {
      recordFailedRequests: true,
      matchRequestsBy: {
        url: true,
      },
      expiresIn: null,
      persisterOptions: {
        keepUnusedRequests: true,
      },
    },
  });
}

function sanitizeRecordingEntry(e: any) {
  let content = e && e.response && e.response.content;
  if (!content || !content.text || !content.mimeType) {
    return;
  }
  if (!content.mimeType.includes('application/json')) {
    return;
  }
  let obj: any;
  try {
    obj = JSON.parse(content.text);
  } catch {
    return;
  }
  sanitizedRecordingJson(obj);
  e.response.content.text = JSON.stringify(obj);
}

function sanitizedRecordingJson(obj: any): void {
  traverseObject(obj, (x) => {
    if (x.email) {
      x.email = `${getMd5(x.email).substr(0, 10)}@gmail.com`;
    }
  });
}

function traverseObject(obj: any, cb: (x: any) => void) {
  if (!obj || typeof obj !== 'object') {
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((x) => traverseObject(x, cb));
    return;
  }
  cb(obj);
  for (let val of Object.values(obj)) {
    traverseObject(val, cb);
  }
}

function getMd5(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex');
}
