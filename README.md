# Finance Chatbot API 🤖💰

A finance-focused chatbot API built with NestJS framework and Google Gemini LLM integration. This application provides intelligent responses to finance-related questions while politely declining off-topic queries.

## 🚀 Features

- 🤖 **Google Gemini Integration**: Powered by Google's GenAI (@google/genai) for intelligent responses
- 💰 **Finance Domain Focus**: Specialized in answering questions about finance, investing, banking, and economics
- ⚡ **Real-time Streaming**: Live streaming responses with Server-Sent Events for instant feedback
- 🛡️ **Rate Limiting**: Built-in throttling to protect API quotas (5 requests per minute per IP, 3 for streaming)
- ✅ **Input Validation**: Comprehensive request validation and sanitization
- 🔒 **Environment-based Configuration**: Secure API key management through environment variables
- 📝 **Comprehensive Logging**: Detailed error tracking and request logging

## 🏗️ System Architecture

```
┌─────────────────┐    HTTP/SSE    ┌─────────────────┐    API Calls    ┌─────────────────┐
│                 │   Requests     │                 │                 │                 │
│   Frontend      │◄──────────────►│   Backend       │◄──────────────► │  Google Gemini  │
│   (Next.js)     │                │   (NestJS)      │                 │     AI API      │
│   Port: 3000    │                │   Port: 3001    │                 │                 │
└─────────────────┘                └─────────────────┘                 └─────────────────┘
        │                                    │
        │                                    │
        ▼                                    ▼
┌─────────────────┐                ┌─────────────────┐
│                 │                │                 │
│   Chat UI       │                │  Finance        │
│   - Streaming   │                │  Expert API     │
│   - Markdown    │                │  - Validation   │
│   - Responsive  │                │  - Rate Limiting│
│                 │                │  - Error Handle │
└─────────────────┘                └─────────────────┘
```

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) - A progressive Node.js framework
- **Language**: TypeScript
- **LLM**: Google Gemini AI via [@google/genai](https://www.npmjs.com/package/@google/genai)
- **Validation**: class-validator, class-transformer
- **Rate Limiting**: @nestjs/throttler
- **Configuration**: @nestjs/config

## 📋 Prerequisites

- **Node.js**: Version 20 or later
- **npm**: Version 8 or later
- **Google AI API Key**: From [Google AI Studio](https://aistudio.google.com/app/apikey)

## 🔧 Installation & Setup

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
# Google Gemini API Configuration (REQUIRED)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-001

# Server Configuration (OPTIONAL)
PORT=3001
```

### 3. Get Your Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file as `GEMINI_API_KEY`

**Note**: The API key is free with generous usage limits.

## 🚀 Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

## 📡 API Endpoints

### Standard Chat Endpoint

**POST** `/chat`

Send a finance question and receive a complete response.

**Request Body:**

```json
{
  "message": "What is compound interest?"
}
```

**Response:**

```json
{
  "reply": "Compound interest is the interest calculated on the initial principal and also on the accumulated interest from previous periods..."
}
```

**Rate Limit**: 5 requests per minute per IP

### Streaming Chat Endpoint

**POST** `/chat/stream`

For real-time streaming responses with immediate feedback.

**Request Body:**

```json
{
  "message": "How does diversification reduce investment risk?"
}
```

**Response Format** (Server-Sent Events):

```
data: {"type": "chunk", "content": "Diversification is a fundamental"}

data: {"type": "chunk", "content": " investment strategy that helps"}

data: {"type": "chunk", "content": " reduce risk by spreading investments..."}

data: {"type": "done"}
```

**Rate Limit**: 5 requests per minute per IP

## 💡 Sample Finance Questions

Test the API with these sample questions:

### 1. Personal Finance

```bash
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How should I start investing as a beginner?"}'
```

**Expected**: Guidance on investment basics, diversification, risk assessment, and starting steps.

### 2. Market Analysis

```bash
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What factors affect stock market volatility?"}'
```

**Expected**: Explanation of economic indicators, market psychology, and volatility factors.

### 3. Financial Planning

```bash
curl -X POST http://localhost:3001/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the difference between a 401k and an IRA?"}'
```

**Expected**: Detailed comparison with streaming response showing live generation.

### 4. Off-Topic Handling

```bash
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the best pizza recipe?"}'
```

**Expected**: Polite redirection to finance topics.

## 🔒 Domain Focus

The chatbot specializes in these finance areas:

- **Personal Finance**: Budgeting, savings, expense tracking
- **Investing**: Stocks, bonds, ETFs, portfolio management
- **Banking**: Loans, credit, mortgages, accounts
- **Economics**: Markets, inflation, economic indicators
- **Cryptocurrency**: Bitcoin, blockchain basics
- **Financial Planning**: Retirement, insurance, taxes

## 🐳 Docker Support

### Using Docker Compose

```bash
docker-compose up --build
```

## 📊 Project Structure

```
src/
├── app.module.ts          # Main application module
├── chat/                  # Chat-related components
│   ├── chat.controller.ts # HTTP endpoints
│   ├── chat.service.ts    # Business logic
│   └── chat.module.ts     # Chat module
├── llm/                   # LLM integration
│   ├── llm.service.ts     # Gemini API service
│   └── llm.module.ts      # LLM module
├── dto/                   # Data transfer objects
│   └── chat.dto.ts        # Request/response schemas
└── main.ts                # Application entry point
```

## 🛡️ Error Handling

The API provides robust error handling:

- **Invalid API Key**: Returns configuration error message
- **Rate Limiting**: Returns 429 status with retry information
- **Validation Errors**: Returns 400 with detailed field errors
- **Server Errors**: Returns generic error message with logging

## 📝 Logging

All requests and errors are logged with:

- Request timestamps and IDs
- User input (sanitized)
- Response times
- Error stack traces
- Rate limiting violations

## 🔧 Development

### Code Quality

- **ESLint**: Configured for TypeScript
- **Prettier**: Automatic code formatting

### Environment Variables

- `GEMINI_API_KEY`: Required - Your Google AI API key
- `GEMINI_MODEL`: Optional - Model version (default: gemini-2.0-flash-001)
- `PORT`: Optional - Server port (default: 3001)

## Related Project

This chatbot specializes in finance because I have extensive experience building AI-powered financial applications. The finance domain was chosen to leverage existing expertise in financial analysis, investment strategies, and personal finance education.

For a more comprehensive financial AI experience, check out the [**AI Finance Agent**](https://github.com/alexarevalo9/ai-finance-agent) - a complete financial advisor application featuring:

- 📊 **Comprehensive Financial Health Analysis** with AI-powered metrics
- 💼 **Personal Financial Profile Management** with detailed data collection
- 📈 **Advanced Investment Analysis** and portfolio recommendations
- 🔒 **Secure User Authentication** with Supabase integration
- 📱 **Full-featured Web Application** with modern UI/UX

This chat API serves as a focused, streamlined version optimized for quick financial Q&A interactions.
