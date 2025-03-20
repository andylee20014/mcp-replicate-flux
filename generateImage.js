const path = require('path')
const Replicate = require('replicate')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

const s3Client = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
  },
})

module.exports = async ({ prompt, filename }) => {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
  })

  try {
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

    if (!output || !output[0]) {
      throw new Error('No image generated')
    }

    const imageUrl = output[0]
    
    // 获取图片数据
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch generated image')
    }
    const imageBuffer = await response.arrayBuffer()

    // 上传到 R2
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET,
      Key: filename,
      Body: Buffer.from(imageBuffer),
      ContentType: 'image/jpeg'
    }))

    // 返回可访问的图片链接
    const r2ImageUrl = `https://${process.env.STORAGE_DOMAIN}/${filename}`
    return r2ImageUrl
  } catch (error) {
    console.error('Error in generateImage:', error)
    throw error
  }
}
