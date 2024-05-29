// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/
import fs from 'fs';

import { updateJSONCache, getJSONCache } from './jsoncache.js';
import { useJSONCache } from './batchProperty.js';

export async function useFileCache() {

    let args = arguments[0];
    let fileData = null;
    try 
    {
        fileData = fs.readFileSync(args.cache, 'utf8');
    } catch (err) {
    
        throw new Error(`Error using cache file: ${args.cache}. Verify the --cache parameter is correct and the file can be created.`);
    }   

    let jsonData = JSON.parse(fileData);

    //jsonData = await useJSONCache(...arguments);
    await useJSONCache(...arguments, jsonData);
    //return jsonData;
}


 export async function updateFileCache(args, result, file, format) {
    try 
    {
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, JSON.stringify({}), 'utf8');
        }
    } catch (err) {
    
        throw new Error(`Error creating cache file: ${file}. Verify the --cache parameter is correct and the file can be created.`);
    }   

    let fileData = fs.readFileSync(file, 'utf8');
    let jsonData = JSON.parse(fileData);

    if (jsonData.format) {
        if (format && jsonData.format !== format) {
           throw new Error(`Format mismatch: Cache format previously set to ${jsonData.format}`); 
        }
    } else if (!format) {
       format = jsonData.format;  
    } else
    {
        jsonData.format = format;
    }

    jsonData = await updateJSONCache(args, result, jsonData, format);
    fs.writeFileSync(file, JSON.stringify(jsonData), 'utf8');

}

export function getFileCache(args) {

    let file = args.cache;

    if (fs.existsSync(file)) {  
        const data = fs.readFileSync(file, 'utf8');
        return getJSONCache(args,JSON.parse(data));
    }
    
    throw new Error(`Error creating cache file: ${file}. Verify the --cache parameter is correct and the file exists.`);
}
