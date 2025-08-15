# Skincare Expert AI - Your Personal Skincare Assistant

A sophisticated AI-powered chat interface designed specifically for skincare expertise, providing personalized advice, product recommendations, and interactive skincare tools.

## ✨ Features

### 🤖 AI-Powered Skincare Expertise
- **Certified Skincare Expert AI**: Powered by OpenAI GPT-4o Mini with specialized skincare knowledge
- **Smart Component Generation**: Uses V0 AI to create interactive skincare tools and dashboards
- **Personalized Recommendations**: Tailored advice based on skin types, concerns, and preferences

### 💬 Interactive Chat Interface
- **Real-time Conversations**: Seamless chat experience with conversation history
- **Multiple AI Providers**: Choose between OpenAI, V0, or Smart AI (combination)
- **Component Generation**: Automatically creates interactive skincare tools and visualizations

### 🎨 Beautiful Skincare-Focused Design
- **Skincare Aesthetic**: Pink and purple gradient theme with beauty-focused styling
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

### 🛠️ Interactive Skincare Tools
The AI can generate various skincare-related components including:
- **Skin Type Analyzers**: Determine your skin type and get personalized recommendations
- **Ingredient Compatibility Checkers**: Check which ingredients work well together
- **Skincare Routine Planners**: Create morning and evening routines
- **Progress Trackers**: Monitor your skincare journey and results
- **Product Comparison Dashboards**: Compare different skincare products
- **Treatment Trackers**: Track acne treatments, anti-aging routines, etc.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- OpenAI API key
- V0 API key (optional, for component generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auto-frontend-chat-ls
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   API_KEY=your_openai_api_key_here
   V0_API_KEY=your_v0_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage Examples

### Example Conversations

**Skin Type Analysis:**
```
"Analyze my skin type and recommend a daily skincare routine"
```

**Ingredient Compatibility:**
```
"Create a skincare ingredient compatibility checker"
```

**Progress Tracking:**
```
"Show me a skincare progress tracker for my acne treatment"
```

**Product Comparison:**
```
"Build a skincare product comparison dashboard"
```

### AI Providers

1. **OpenAI**: Pure text-based skincare advice and recommendations
2. **V0**: Generates interactive skincare components and tools
3. **Smart**: Combines both for comprehensive skincare assistance

## 🏗️ Architecture

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Beautiful, accessible components
- **Lucide React**: Beautiful icons

### Backend APIs
- **OpenAI API**: For skincare expertise and advice
- **V0 API**: For component generation
- **Smart Chat**: Combines both APIs for enhanced functionality

### Key Components
- **Dynamic Component Loading**: Real-time component generation and rendering
- **Conversation Management**: Save, load, and manage chat history
- **Component Library**: Save generated components for reuse
- **Error Handling**: Robust error handling and fallbacks

## 🎨 Customization

### Styling
The app uses a skincare-focused color palette:
- **Primary**: Purple and pink gradients
- **Secondary**: Soft pastels and beauty tones
- **Accent**: Green for success states

### Adding New Components
1. Components are automatically generated based on user requests
2. Generated components are saved to the `components/generated/` directory
3. Components can be saved to the library for reuse

## 🔧 Configuration

### Environment Variables
- `API_KEY`: Your OpenAI API key
- `V0_API_KEY`: Your V0 API key (optional)
- `NEXT_PUBLIC_APP_URL`: Your app's URL (for production)

### API Endpoints
- `/api/chat`: OpenAI-only skincare advice
- `/api/v0-chat`: V0 component generation
- `/api/smart-chat`: Combined AI approach

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your API keys are correctly set
3. Ensure all dependencies are installed
4. Check the network tab for API request failures

## 🔮 Future Enhancements

- [ ] Voice input for hands-free skincare advice
- [ ] Image upload for skin condition analysis
- [ ] Integration with skincare product databases
- [ ] Personalized skincare routine scheduling
- [ ] Progress photo tracking
- [ ] Integration with dermatologist consultations
- [ ] Multi-language support
- [ ] Dark mode toggle

---

**Disclaimer**: This AI provides general skincare advice and recommendations. For serious skin concerns, always consult with a qualified dermatologist. The information provided is for educational purposes only and should not replace professional medical advice.