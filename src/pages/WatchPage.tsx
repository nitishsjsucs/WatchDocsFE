import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, ExternalLink, MessageSquare, Bot, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getWatches } from '@/lib/storage';
import { WatchItem } from '@/types';
import { GeminiChat } from '@/lib/gemini';
// import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Helper function to format inline markdown
const formatInlineMarkdown = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '$1') // Remove asterisks entirely
    .replace(/`(.*?)`/g, '<code class="bg-black/10 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
};

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [watch, setWatch] = useState<WatchItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [geminiChat, setGeminiChat] = useState<GeminiChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load watch data and initialize Gemini chat
  useEffect(() => {
    if (id) {
      const watches = getWatches();
      const foundWatch = watches.find((w: WatchItem) => w.id === id);
      if (foundWatch) {
        setWatch(foundWatch);
        
        // Initialize Gemini chat
        try {
          console.log('API Key available:', !!import.meta.env.VITE_GEMINI_API_KEY);
          const chat = new GeminiChat(foundWatch.url);
          setGeminiChat(chat);
          
          // Add welcome message from Gemini
          setMessages([{
            id: '1',
            role: 'assistant',
            content: `Hello! I'm here to help you monitor and track changes on ${new URL(foundWatch.url).hostname}. 

I can help you set up monitoring for various aspects of this website. To get started, could you tell me what specific content or changes you're most interested in tracking? For example:
- Are you looking to monitor specific text content?
- Do you want to track when new pages or posts are added?
- Are you interested in changes to product information or pricing?
- Or something else entirely?

What would be most valuable for you to know about when it changes on this site?`,
            timestamp: new Date()
          }]);
        } catch (error) {
          console.error('Failed to initialize Gemini chat:', error);
          // Fallback welcome message
          setMessages([{
            id: '1',
            role: 'assistant',
            content: `Hello! I'm here to help you monitor and analyze ${new URL(foundWatch.url).hostname}. What would you like to know about this website?`,
            timestamp: new Date()
          }]);
        }
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !watch) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let response: string;
      
      if (geminiChat) {
        // Send message to Gemini
        response = await geminiChat.sendMessage(inputMessage.trim());
      } else {
        // Fallback response if Gemini is not available
        response = `I understand you want to track "${inputMessage.trim()}" on ${new URL(watch.url).hostname}. However, I'm currently running in demo mode. To enable full AI assistance, please add your Gemini API key to the .env file.`;
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting to the AI service right now. Please try again in a moment.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!watch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative animate-slide-in-left">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: 'url(https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.05&cAzimuthAngle=180&cDistance=2.9&cPolarAngle=120&cameraZoom=1&color1=%23dbf8ff&color2=%23ffffff&color3=%23dbf8ff&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1&positionX=0&positionY=1.8&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=-90&shader=defaults&type=waterPlane&uDensity=1&uFrequency=5.5&uSpeed=0.1&uStrength=3&uTime=0.2&wireframe=false)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Blur and Noise Overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px',
          opacity: 0.1,
        }}
      />

      {/* Header */}
      <div className="relative z-10 p-4 sm:p-6 border-b border-border/50 bg-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/20 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              </div>
              <span className="font-mono text-sm text-muted-foreground">{new URL(watch.url).hostname}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(watch.url, '_blank')}
            className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Site
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-[calc(100vh-80px)]">
        {/* Left Side - Chat */}
        <div className="w-1/2 border-r border-border/50 bg-white/5 backdrop-blur-sm">
          <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-4 sm:p-6 border-b border-border/50 bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">AI Assistant</h2>
                  <p className="text-sm text-muted-foreground">Ask me anything about this website</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 sm:p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-white/90 backdrop-blur-sm text-foreground'
                      }`}
                    >
                      <div className="text-sm leading-relaxed">
                        {message.role === 'assistant' ? (
                          <div className="space-y-2">
                            {message.content.split('\n\n').map((paragraph, index) => {
                              if (paragraph.trim() === '') return null;
                              
                              // Handle lists
                              if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
                                const lines = paragraph.split('\n');
                                const listItems = lines
                                  .filter(line => line.trim().startsWith('- '))
                                  .map(line => line.replace(/^- /, '').trim());
                                
                                if (listItems.length > 0) {
                                  return (
                                    <ul key={index} className="list-disc list-inside space-y-1 ml-4">
                                      {listItems.map((item, itemIndex) => (
                                        <li key={itemIndex} className="text-sm">
                                          <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
                                        </li>
                                      ))}
                                    </ul>
                                  );
                                }
                              }
                              
                              
                              // Handle blockquotes
                              if (paragraph.startsWith('> ')) {
                                return (
                                  <blockquote key={index} className="border-l-2 border-primary/30 pl-3 italic text-sm">
                                    <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(paragraph.replace(/^> /, '')) }} />
                                  </blockquote>
                                );
                              }
                              
                              // Handle headings
                              if (paragraph.startsWith('### ')) {
                                return (
                                  <h3 key={index} className="text-sm font-semibold mb-1">
                                    <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(paragraph.replace(/^### /, '')) }} />
                                  </h3>
                                );
                              }
                              
                              if (paragraph.startsWith('## ')) {
                                return (
                                  <h2 key={index} className="text-sm font-bold mb-2">
                                    <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(paragraph.replace(/^## /, '')) }} />
                                  </h2>
                                );
                              }
                              
                              if (paragraph.startsWith('# ')) {
                                return (
                                  <h1 key={index} className="text-base font-bold mb-2">
                                    <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(paragraph.replace(/^# /, '')) }} />
                                  </h1>
                                );
                              }
                              
                              // Regular paragraphs
                              return (
                                <p key={index} className="text-sm leading-relaxed whitespace-pre-wrap">
                                  <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(paragraph) }} />
                                </p>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        )}
                      </div>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 sm:p-6 border-t border-border/50 bg-white/10 backdrop-blur-sm">
              <div className="flex gap-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about this website..."
                  className="flex-1 bg-white/90 backdrop-blur-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Preview */}
        <div className="w-1/2 bg-white/5 backdrop-blur-sm">
          <div className="h-full flex flex-col">
            {/* Preview Header */}
            <div className="p-4 sm:p-6 border-b border-border/50 bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ExternalLink className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Live Preview</h2>
                  <p className="text-sm text-muted-foreground">Real-time website monitoring</p>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 p-4 sm:p-6">
              <Card className="h-full bg-white/90 backdrop-blur-sm border border-border">
                <CardContent className="h-full p-0">
                  <div className="h-full">
                    <iframe
                      src={watch.url}
                      className="w-full h-full rounded-lg"
                      sandbox="allow-same-origin allow-scripts"
                      title="Website preview"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
