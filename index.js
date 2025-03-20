const { z } = require('zod')
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js')
const {
  StdioServerTransport
} = require('@modelcontextprotocol/sdk/server/stdio.js')

const generateImage = require('./generateImage')

const server = new McpServer({
  version: '1.0.0',
  name: 'Replicate-Flux'
})

server.tool(
  'generate-image',
  { prompt: z.string(), filename: z.string() },
  async ({ prompt, filename }) => {
    try {
      const imageUrl = await generateImage({ prompt, filename })
      return {
        content: [
          { type: 'text', text: `Image successfully generated and uploaded to Cloudflare R2` },
          { type: 'image', url: imageUrl }
        ]
      }
    } catch (error) {
      console.error('Image generation failed:', error)
      return {
        content: [
          { type: 'text', text: `Image generation failed: ${error.message}` }
        ]
      }
    }
  }
)

const run = async () => {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

run()
