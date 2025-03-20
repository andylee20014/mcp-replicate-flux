const { z } = require('zod')
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js')
const { SseServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js')
const express = require('express')
const cors = require('cors')

const generateImage = require('./generateImage')

const app = express()
app.use(cors())

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
          { type: 'text', text: `Image successfully generated and uploaded to Cloudflare R2: ${imageUrl}` }
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
  // 设置SSE传输
  const transport = new SseServerTransport()
  await server.connect(transport)

  // 设置Express路由
  app.get('/sse', transport.handler)
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  // 获取端口号（Railway会自动设置PORT环境变量）
  const port = process.env.PORT || 3000
  
  // 启动服务器
  app.listen(port, () => {
    console.log(`MCP Server running on port ${port}`)
  })
}

run().catch(console.error)
