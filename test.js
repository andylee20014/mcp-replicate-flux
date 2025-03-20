const generateImage = require('./generateImage')

async function test() {
  try {
    const prompt = 'a beautiful girl'
    const filename = `test-${Date.now()}.jpg`
    
    console.log(`Generating image with prompt: "${prompt}"`)
    console.log(`Filename: ${filename}`)
    
    const imageUrl = await generateImage({ prompt, filename })
    
    console.log('Image generated and uploaded successfully!')
    console.log(`Image URL: ${imageUrl}`)
  } catch (error) {
    console.error('Test failed:', error)
  }
}

test() 