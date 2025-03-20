const { z } = require('zod')
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js')
const { SseServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js')
const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

const generateImage = require('./generateImage')

// 验证必要的环境变量
const requiredEnvVars = [
  'REPLICATE_API_TOKEN',
  'STORAGE_ENDPOINT',
  'STORAGE_ACCESS_KEY',
  'STORAGE_SECRET_KEY',
  'STORAGE_BUCKET',
  'STORAGE_DOMAIN'
]

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`)
    process.exit(1)
  }
})

const app = express()

// 中间件配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}))
app.use(express.json())

// 创建MCP服务器
const server = new McpServer({
  version: '1.0.0',
  name: 'Replicate-Flux'
})

// 配置工具
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
  try {
    // 设置SSE传输
    const transport = new SseServerTransport()
    
    // 基本路由
    app.get('/', (req, res) => {
      res.json({ 
        name: 'MCP Replicate FLUX',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          sse: '/sse'
        }
      })
    })

    // 健康检查
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        server: 'MCP Replicate FLUX', 
        version: '1.0.0',
        env: {
          hasReplicateToken: !!process.env.REPLICATE_API_TOKEN,
          hasStorageConfig: !!process.env.STORAGE_ENDPOINT
        }
      })
    })

    // SSE端点
    app.get('/sse', (req, res) => {
      console.log('New SSE connection request')
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      res.setHeader('Access-Control-Allow-Origin', '*')
      transport.handler(req, res)
    })

    // 错误处理中间件
    app.use((err, req, res, next) => {
      console.error('Server error:', err)
      res.status(500).json({
        error: 'Internal server error',
        message: err.message
      })
    })

    // 连接MCP服务器
    await server.connect(transport)

    // 启动服务器
    const port = process.env.PORT || 3000
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server environment: ${process.env.NODE_ENV}`)
      console.log(`MCP Server running on port ${port}`)
      console.log(`SSE endpoint: /sse`)
      console.log(`Health check: /health`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// 启动服务器
run().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
