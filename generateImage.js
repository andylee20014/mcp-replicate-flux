const path = require('path')
const Replicate = require('replicate')
const fs = require('node:fs')
const { writeFile, unlink } = require('node:fs/promises')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { Readable } = require('stream')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

const s3Client = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
  },
})

// 将 ReadableStream 转换为 Buffer
async function streamToBuffer(stream) {
  const chunks = [];
  const reader = stream.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  return Buffer.concat(chunks);
}

module.exports = async ({ prompt, filename }) => {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
  })

  // 使用 Replicate 生成图片
  const output = await replicate.run('black-forest-labs/flux-schnell', {
    input: {
      prompt,
      go_fast: true,
      num_outputs: 1,
      megapixels: '1',
      output_quality: 80,
      aspect_ratio: '16:9',
      output_format: 'jpg',
      num_inference_steps: 4
    }
  })
  
  // 处理 ReadableStream
  const stream = output[0];
  const imageBuffer = await streamToBuffer(stream);
  
  // 上传到 R2
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.STORAGE_BUCKET,
    Key: filename,
    Body: imageBuffer,
    ContentType: 'image/jpeg'
  }))

  // 返回可访问的图片链接
  const r2ImageUrl = `https://${process.env.STORAGE_DOMAIN}/${filename}`;
  return r2ImageUrl;
}
