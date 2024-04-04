import type { Curl, HeaderInfo } from 'node-libcurl';
import { Curl as CURL } from 'node-libcurl';
import path from 'path';
import fs from 'fs';

interface CurlResponse {
    status: number;
    data: Buffer | string;
    headers: Buffer | HeaderInfo[];
    curlInstance: Curl;
    body: string;
}

type RequestOptions = {
    readCookies: boolean;
    headers?: string[];
    post?: boolean;
    postFields?: ConstructorParameters<typeof URLSearchParams>[0];
};

fs.mkdirSync(path.resolve('./../../', 'storage'), { recursive: true });
const cookieJar = path.resolve('./../../', 'storage', 'cookies.txt');

export const curlRequest = (
    path: string,
    options: RequestOptions = {
        readCookies: true,
        headers: [],
        post: false,
        postFields: {},
    }
): Promise<CurlResponse> => {
    const curl = new CURL();
    curl.setOpt(CURL.option.URL, path);
    curl.setOpt(CURL.option.HEADER, true);
    curl.setOpt(CURL.option.FOLLOWLOCATION, true);
    curl.setOpt(CURL.option.SSL_VERIFYPEER, false); // no (pear-)pressure (i know it's peer but @jxn-30 doesn't)

    if (options.headers?.length) {
        curl.setOpt(CURL.option.HTTPHEADER, options.headers);
    }

    if (options.readCookies) curl.setOpt(CURL.option.COOKIEFILE, cookieJar);
    curl.setOpt(CURL.option.COOKIEJAR, cookieJar);

    if (options.post) {
        curl.setOpt(CURL.option.POST, true);
        curl.setOpt(
            CURL.option.POSTFIELDS,
            new URLSearchParams(options.postFields).toString()
        );
    }

    return new Promise((resolve, reject) => {
        //console.log(`sending a curl to ${path}`);
        const logId = `curl [${Date.now()}]: ${path}`;
        console.time(logId);
        curl.on('end', (status, data, headers, curlInstance) => {
            curl.close();
            const body = data
                .toString()
                .split('\r\n\r\n')
                .slice(1)
                .join('\r\n\r\n');
            // updateAuthToken(body);
            const result = { status, data, headers, curlInstance, body };
            console.timeEnd(logId);
            resolve(result);
        });
        curl.on('error', (...args) => {
            curl.close();
            reject(args);
        });
        curl.perform();
    });
};
