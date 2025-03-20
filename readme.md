# MCP Replicate FLUX

A Model Context Protocol (MCP) server that generates images using Replicate's FLUX model and stores them in Cloudflare R2.

使用 Replicate 的 FLUX 模型生成图片并存储到 Cloudflare R2 的模型上下文协议（MCP）服务器。

## Features 功能特点

- Generate images using Replicate's black-forest-labs/flux-schnell model
- Store generated images in Cloudflare R2
- Return accessible image URLs
- Support for custom prompts and filenames

- 使用 Replicate 的 black-forest-labs/flux-schnell 模型生成图片
- 将生成的图片存储到 Cloudflare R2
- 返回可访问的图片链接
- 支持自定义提示词和文件名

## Prerequisites 前置要求

- Node.js (v16 or higher)
- Replicate API token
- Cloudflare R2 bucket and credentials
- npm or yarn

- Node.js（v16 或更高版本）
- Replicate API 令牌
- Cloudflare R2 存储桶和凭证
- npm 或 yarn

## Environment Variables 环境变量

Required environment variables in `.env` file:

`.env` 文件中需要的环境变量：

```env
REPLICATE_API_TOKEN=your_replicate_token
STORAGE_ENDPOINT=your_r2_endpoint
STORAGE_ACCESS_KEY=your_r2_access_key
STORAGE_SECRET_KEY=your_r2_secret_key
STORAGE_BUCKET=your_bucket_name
STORAGE_DOMAIN=your_domain
```

## Local Installation 本地安装

Follow these steps to set up the project locally:

按照以下步骤在本地设置项目：

```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-replicate-flux.git
cd mcp-replicate-flux

# Install dependencies
npm install

# Create .env file and add your credentials
cp .env.example .env
# Edit .env with your actual credentials
```

Make sure your Cloudflare R2 bucket has appropriate CORS settings for public access to the uploaded images.

确保您的 Cloudflare R2 存储桶具有适当的 CORS 设置，以允许公共访问上传的图片。

## Running Locally 本地运行

To start the MCP server locally:

在本地启动 MCP 服务器：

```bash
node index.js
```

The server will start and listen for MCP protocol messages on standard input/output.

服务器将启动并通过标准输入/输出监听 MCP 协议消息。

## Usage 使用方法

The server provides a `generate-image` tool that accepts two parameters:
- `prompt`: The text prompt for image generation
- `filename`: The desired filename for the generated image

服务器提供了一个 `generate-image` 工具，接受两个参数：
- `prompt`：用于生成图片的文本提示词
- `filename`：生成的图片所需的文件名

### Integration Example 集成示例

Here's an example of how to integrate with this MCP server using the MCP client library:

以下是使用 MCP 客户端库与此 MCP 服务器集成的示例：

```javascript
const { McpClient } = require('@modelcontextprotocol/sdk/client/mcp.js')

async function generateImage(prompt, filename) {
  const client = new McpClient()
  // Connect to your running MCP server
  await client.connect(yourTransport)
  
  const result = await client.tools.call('generate-image', {
    prompt,
    filename
  })
  
  return result
}
```

Example response 示例响应：
```json
{
  "content": [
    { "type": "text", "text": "Image successfully generated and uploaded to Cloudflare R2" },
    { "type": "image", "url": "https://your-domain.com/filename.jpg" }
  ]
}
```

## Testing 测试

A test script is provided to verify the image generation and upload functionality.

提供了一个测试脚本，用于验证图片生成和上传功能。

### Running the test 运行测试

```bash
node test.js
```

The test script will:
1. Generate an image with a sample prompt
2. Upload the image to Cloudflare R2
3. Return the accessible URL

测试脚本将：
1. 使用示例提示词生成图片
2. 将图片上传到 Cloudflare R2
3. 返回可访问的 URL

Example test output 测试输出示例：
```
Generating image with prompt: "a beautiful girl"
Filename: test-1234567890.jpg
Image generated and uploaded successfully!
Image URL: https://your-domain.com/test-1234567890.jpg
```

You can modify the prompt in `test.js` to test different image generation scenarios.

您可以在 `test.js` 中修改提示词来测试不同的图片生成场景。

## Deployment 部署

This MCP server can be deployed to various cloud platforms. Here are some recommended deployment options:

这个 MCP 服务器可以部署到各种云平台。以下是一些推荐的部署选项：

### Option 1: Railway.app

1. Fork this repository to your GitHub account
2. Create a new project on Railway.app
3. Connect your GitHub repository
4. Add the required environment variables in Railway.app's dashboard
5. Deploy the project

Railway.app will automatically detect this as a Node.js project and set up the appropriate build configuration.

Railway.app 会自动检测到这是一个 Node.js 项目并设置适当的构建配置。

### Option 2: Render.com

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Configure the service:
   - Build Command: `npm install`
   - Start Command: `node index.js`
4. Add the required environment variables in Render.com's dashboard
5. Deploy the service

### Option 3: DigitalOcean App Platform

1. Create a new app on DigitalOcean App Platform
2. Connect your GitHub repository
3. Configure the app:
   - Environment: Node.js
   - Build Command: `npm install`
   - Run Command: `node index.js`
4. Add the required environment variables
5. Deploy the app

### Deployment with Docker 使用 Docker 部署

You can also deploy the MCP server using Docker:

您也可以使用 Docker 部署 MCP 服务器：

```bash
# Build the Docker image
docker build -t mcp-replicate-flux .

# Run the container with environment variables
docker run -p 3000:3000 \
  -e REPLICATE_API_TOKEN=your_token \
  -e STORAGE_ENDPOINT=your_endpoint \
  -e STORAGE_ACCESS_KEY=your_access_key \
  -e STORAGE_SECRET_KEY=your_secret_key \
  -e STORAGE_BUCKET=your_bucket \
  -e STORAGE_DOMAIN=your_domain \
  mcp-replicate-flux
```

### Important Notes 重要说明

- Make sure to set all required environment variables in your cloud platform's dashboard
- The server uses stdio transport, which is compatible with most cloud platforms
- Consider setting up monitoring and logging for production deployment
- For production use, consider using PM2 or similar process manager

- 确保在云平台的控制面板中设置所有必需的环境变量
- 服务器使用 stdio 传输，与大多数云平台兼容
- 考虑为生产环境部署设置监控和日志记录
- 对于生产环境，考虑使用 PM2 或类似的进程管理器

## Project Structure 项目结构

```
mcp-replicate-flux/
├── .env                  # Environment variables
├── index.js              # MCP server entry point
├── generateImage.js      # Image generation and R2 upload logic
├── test.js               # Test script
└── README.md             # Project documentation
```

## Troubleshooting 故障排除

### Common Issues 常见问题

1. **Image generation fails**: Check your Replicate API token and quota
2. **R2 upload fails**: Verify your R2 credentials and bucket permissions
3. **Cannot access generated images**: Ensure your R2 bucket has proper CORS configuration

1. **图片生成失败**：检查您的 Replicate API 令牌和配额
2. **R2 上传失败**：验证您的 R2 凭证和存储桶权限
3. **无法访问生成的图片**：确保您的 R2 存储桶具有正确的 CORS 配置

## MCP Protocol 协议说明

The Model Context Protocol (MCP) is a standard for AI model interaction that enables interoperability between different AI systems. This server implements an MCP tool that can be used with any MCP-compatible client.

模型上下文协议（MCP）是一种 AI 模型交互标准，可实现不同 AI 系统之间的互操作性。此服务器实现了一个 MCP 工具，可与任何兼容 MCP 的客户端一起使用。

For more information about MCP, visit: [https://mcp.freeaigen.com/](https://mcp.freeaigen.com/)

## References 参考链接

- [Model Context Protocol Documentation](https://mcp.freeaigen.com/)
- [Replicate API Documentation](https://replicate.com/docs)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Flux AI Model](https://replicate.com/black-forest-labs/flux-schnell)

## License 许可证

MIT