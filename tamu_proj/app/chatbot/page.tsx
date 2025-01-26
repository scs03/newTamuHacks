'use client';

import React, { useState, useRef, useEffect } from 'react';
import { OpenAI } from 'openai';
import Papa from 'papaparse';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

interface CSVChatbotProps {
  file1Path: string;
  file2Path: string;
}

export default function CSVChatbot({ file1Path, file2Path }: CSVChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contextDescription = `
    You are analyzing two CSV files related to energy consumption projections. The first CSV gives an ESG score for different products, whereas the second CSV looks at utilities across time and some other factors. You are a financial and environmental expert who is ready to answer questions about this product.
  `;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const fetchCSVData = async (filePath: string) => {
    try {
      const response = await fetch(filePath);
      const csvText = await response.text();
      const parsedData = Papa.parse(csvText, { header: true }).data;
      return parsedData;
    } catch (error) {
      console.error('Error fetching CSV:', error);
      return [];
    }
  };

  const selectRelevantData = (data: any[], maxRows: number = 10) => {
    // Select first few rows and only key columns
    const headers = Object.keys(data[0] || {});
    const selectedColumns = headers.slice(0, 3); // Select first 3 columns

    return data.slice(0, maxRows).map(row => {
      const selectedRow: any = {};
      selectedColumns.forEach(col => {
        selectedRow[col] = row[col];
      });
      return selectedRow;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const newUserMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
        dangerouslyAllowBrowser: process.env.NODE_ENV !== 'production'
      });

      file1Path = 'tamu_proj/public/chatbot/utilitiesFinal.csv';
      file2Path = '@public/chatbot/utilitiesFinal.csv';

      console.log('file1path', file1Path)

      const csvData1 = await fetchCSVData('/chatbot/utilitiesFinal.csv');
      const csvData2 = await fetchCSVData('chatbot/ESG.csv');

      console.log('csvData1', csvData1);
      console.log('csvData2', csvData2);

      const relevantData1 = selectRelevantData(csvData1);
      const relevantData2 = selectRelevantData(csvData2);

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: contextDescription 
          },
          { 
            role: "user", 
            content: `${input}\n\nData from first CSV:\n${JSON.stringify(relevantData1)}\n\nData from second CSV:\n${JSON.stringify(relevantData2)}`
          }
        ],
        max_tokens: 300, // Limit response length
        temperature: 0.7, // Add some randomness
        top_p: 0.9, // Control diversity
        frequency_penalty: 0.5, // Reduce repetition
        presence_penalty: 0.5 // Further reduce repetition
      });

      const botResponse: Message = {
        id: Date.now() + 1,
        text: response.choices[0].message.content || 'No detailed response available',
        sender: 'bot'
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Detailed error:', error);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: error instanceof Error 
          ? `Error: ${error.message}` 
          : 'An unexpected error occurred',
        sender: 'bot'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4 border rounded-lg shadow-lg bg-gray-100">
      {/* Chat Messages Section */}
      <div
        className="flex-grow overflow-y-hidden space-y-2 bg-white/70 rounded-lg p-3"
        style={{ maxHeight: "calc(100vh - 240px)" }} // Adjusting height for navbar and padding
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-2xl max-w-[80%] break-words ${
              msg.sender === "user"
                ? "bg-gray-300 text-gray-700 self-end ml-auto"
                : "bg-gradient-to-r from-blue-700 to-blue-900 text-white self-start mr-auto"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
  
      {/* Input Form Section */}
      <form
        onSubmit={handleSubmit}
        className="flex rounded-lg overflow-hidden mt-4 bg-[#004977]"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your CSV data..."
          className="flex-grow p-3 bg-white text-[#004977] placeholder-[#004977] focus:outline-none focus:ring-2 focus:ring-[#d03027]"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-3 hover:bg-[#004977] transition-colors duration-300"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Send"}
        </button>
      </form>
  
      {/* Navbar Placeholder */}
      <div className="h-16 bg-[#004977] w-full fixed bottom-0 left-0" />
    </div>
  );
  
}
