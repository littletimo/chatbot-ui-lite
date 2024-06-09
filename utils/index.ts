import { Message, OpenAIModel } from '@/types';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';

export const OpenAIStream = async (messages: Message[]) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const lastMessage = messages[messages.length - 1];
  const body = { question: lastMessage.content };

  return null;

  // if (res.status !== 200) {
  //   throw new Error('OpenAI API returned an error');
  // }

  // const stream = true
  // let data
  // if (stream) data = res.body;
  // // else data = await response.json();
  // // data.choices[0].message.content;

  // if (!data) {
  //   return;
  // }

  // console.log(data.choices[0].message.content);
  if (!stream) {
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
          content: data.choices[0].message.content,
        },
      ];
    });
    return;
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          if (data === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};
