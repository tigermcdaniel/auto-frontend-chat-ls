# Setup Guide for Smart AI Chat Configuration

This application now supports three modes:
1. **OpenAI Only** - Traditional text-based responses
2. **V0 Only** - Component generation
3. **Smart AI** - OpenAI analyzes requests + V0 generates UI components (Recommended)

Here's how to set it up:

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# OpenAI API Key (for the original /api/chat endpoint)
API_KEY=your_openai_api_key_here

# V0 API Key (for the new /api/v0-chat endpoint)
V0_API_KEY=your_v0_api_key_here
```

## Getting API Keys

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

### V0 API Key
1. Go to [V0 Platform](https://v0.dev/)
2. Sign up or log in
3. Navigate to your account settings
4. Find your API key
5. Copy the key and add it to your `.env.local` file

## Usage

1. Start the development server: `npm run dev`
2. Open the application in your browser
3. Use the provider selector in the header to switch between modes:
   - **OpenAI**: Traditional text responses
   - **V0**: Direct component generation
   - **Smart**: AI analyzes request + generates appropriate UI components
4. The application will automatically use the selected mode for all chat requests

## Smart AI Mode (Recommended)

The Smart AI mode works in two steps:
1. **OpenAI Analysis**: Analyzes your request to understand intent and determine the best way to display information
2. **Component Generation**: Creates a custom React component to display the response in the most appropriate format
   - **Primary**: Uses V0 API for advanced component generation
   - **Fallback**: Uses built-in component generator if V0 is unavailable
   - **JSX Validation**: Automatically validates and fixes common JSX syntax errors
   - **Error Handling**: Graceful fallback to code preview if component generation fails

### Example Smart AI Requests:
- "Show me a weather dashboard for New York"
- "Create a todo list with 5 tasks"
- "Display a comparison chart of AI models"
- "Show me a progress tracker for my goals"

## API Endpoints

- `/api/chat` - Uses OpenAI API (text responses)
- `/api/v0-chat` - Uses V0 API (component generation)
- `/api/smart-chat` - Uses both APIs (analysis + component generation)

All endpoints accept the same request format but return different response structures. 