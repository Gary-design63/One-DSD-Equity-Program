import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: number;
  role: "assistant" | "user";
  content: string;
}

const suggestedPrompts = [
  "Analyze a policy for equity",
  "Draft an equity review",
  "Show KPI trends",
  "Search knowledge base",
];

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I'm your equity operations assistant. I can help with policy analysis, equity reviews, KPI tracking, and more. What would you like to work on?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulated assistant response
    setTimeout(() => {
      const reply: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Thank you for your question. In this demo environment, I'm not connected to an AI model, but in production I would analyze your request using the equity knowledge base and program data to provide a detailed response.",
      };
      setMessages(prev => [...prev, reply]);
    }, 800);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-3.5rem)] max-w-[900px] mx-auto">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <Card className={`max-w-[75%] ${msg.role === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}>
              <CardContent className="p-3">
                <p className="text-sm leading-relaxed" data-testid={`msg-${msg.id}`}>{msg.content}</p>
              </CardContent>
            </Card>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* Suggested prompts */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {suggestedPrompts.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handlePromptClick(prompt)}
                data-testid={`chip-${prompt.slice(0, 15).replace(/\s/g, "-").toLowerCase()}`}
              >
                {prompt}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2 max-w-[900px] mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about equity operations..."
            className="flex-1"
            data-testid="input-assistant-message"
          />
          <Button onClick={handleSend} disabled={!input.trim()} data-testid="button-send-message">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
