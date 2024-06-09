import { Chat } from '@/components/Chat/Chat';
import { Footer } from '@/components/Layout/Footer';
import { Navbar } from '@/components/Layout/Navbar';
import { Message } from '@/types';
import { OpenAIStream } from '@/utils';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (message: Message) => {
    const updatedMessages = [...messages, message];

    setMessages(updatedMessages);
    setLoading(true);

    // let response;
    // const stream = false;
    // if (stream) {
    //   // response = new Response(await OpenAIStream(updatedMessages));
    // } else {
    //   // response = await fetch('https://api.openai.com/v1/chat/completions', {
    const response = await fetch('https://cloud-fgksoy3vwq-uc.a.run.app/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://cloud-fgksoy3vwq-uc.a.run.app',
      },
      // mode: 'no-cors',
      body: JSON.stringify({
        // model: 'gpt-3.5-turbo',
        // messages: updatedMessages,
        question: message.content,
        // max_tokens: 800,
        // temperature: 0.0,
        // stream: false,
      }),
    });
    // }

    // debugger;
    // if (!response.ok) {
    //   setLoading(false);
    //   throw new Error(response.statusText);
    // }

    // let data;
    // if (stream) data = response.body;
    // else data = await response.json();
    // data.choices[0].message.content;
    const data = await response.json();

    if (!data) {
      return;
    }

    setLoading(false);
    // console.log(data.choices[0].message.content);
    // if (!stream) {
    setMessages((messages) => {
      // const lastMessage = messages[messages.length - 1];
      // const updatedMessage = {
      //   ...lastMessage,
      //   content: data.choices[0].message.content,
      // };
      // return [...messages.slice(0, -1), updatedMessage];
      return [
        ...messages,
        {
          role: 'assistant',
          // content: data.choices[0].message.content,
          content: data.answer,
        },
      ];
    });
    return;
    // }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let isFirst = true;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      console.log('start', chunkValue);

      if (isFirst) {
        isFirst = false;
        setMessages((messages) => [
          ...messages,
          {
            role: 'assistant',
            content: chunkValue,
          },
        ]);
      } else {
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          const updatedMessage = {
            ...lastMessage,
            content: lastMessage.content + chunkValue,
          };
          return [...messages.slice(0, -1), updatedMessage];
        });
      }
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: `I am a movie trailer chatbot. What questions do you have?`,
      },
    ]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `I am a movie trailer chatbot. What questions do you have?`,
      },
    ]);
  }, []);

  return (
    <>
      <Head>
        <title>Chatbot UI</title>
        <meta
          name="description"
          content="A simple chatbot starter kit for OpenAI's chat model using Next.js, TypeScript, and Tailwind CSS."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col h-screen">
        <Navbar />

        <div className="flex-1 overflow-auto sm:px-10 pb-4 sm:pb-10">
          <div className="max-w-[800px] mx-auto mt-4 sm:mt-12">
            <Chat
              messages={messages}
              loading={loading}
              onSend={handleSend}
              onReset={handleReset}
            />
            <div ref={messagesEndRef} />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
