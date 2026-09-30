'use strict';
const fs=require('node:fs/promises'),sharp=require('sharp');
const root='C:/Users/USER/.codex/generated_images/01a0f23d-9131-79f3-9038-759784dd3636/';
const files={signal:'exec-d014af11-f666-4d85-b579-ef1849f3ac25.png',stone:'exec-e29ba965-7319-4be7-bf84-9bb6f6f54108.png',return:'exec-0683609d-baf3-4fcc-b031-813635095d18.png',report:'exec-e27ea220-2f30-4fc9-bc34-e6e9ca8bc797.png',compare:'exec-5aed1e20-af0f-4b43-bcaf-c489cd456f31.png'};
(async()=>{await fs.mkdir('assets/art/intro',{recursive:true});for(const [id,file]of Object.entries(files))await sharp(root+file).resize({width:1280,withoutEnlargement:true}).webp({quality:88}).toFile('assets/art/intro/'+id+'.webp');})();
