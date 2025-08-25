"use client";

import React, { useState, useRef, useEffect } from "react";
interface QA {
  question: string;
  answer: string;
}

interface Message {
  id: number;
  type: "user" | "system";
  text: string;
}

const preConfiguredQA: QA[] = [
  {
    question: "What are your dealership's opening hours?",
    answer:
      "We are open Monday to Friday from 9 AM to 6 PM, and Saturdays from 10 AM to 4 PM.",
  },
  {
    question: "Do you offer financing or leasing options?",
    answer:
      "Yes, we provide flexible financing and leasing options tailored to your budget and needs.",
  },
  {
    question: "Can I book a test drive online?",
    answer:
      "Absolutely! You can schedule a test drive directly through our website's test drive page.",
  },
  {
    question: "What is your policy on vehicle returns or exchanges?",
    answer:
      "We offer a 7-day return or exchange policy on most vehicles, subject to terms and conditions.",
  },
  {
    question: "Do you provide warranty on your vehicles?",
    answer:
      "Yes, all our vehicles come with a manufacturer or dealership warranty for your peace of mind.",
  },
  {
    question: "How do I apply for vehicle financing?",
    answer:
      "You can apply for financing by filling out the financing application form on our website or visiting our dealership.",
  },
  {
    question: "Are there any ongoing promotions or discounts?",
    answer:
      "We regularly offer promotions and discounts. Please check our promotions page or contact us for the latest offers.",
  },
  {
    question: "Can I trade in my old vehicle?",
    answer:
      "Yes, we accept trade-ins. Our team will evaluate your vehicle and provide a competitive offer.",
  },
  {
    question: "What documents do I need to bring for a test drive?",
    answer:
      "Please bring a valid driver's license and proof of insurance for the test drive.",
  },
  {
    question: "Do you offer extended warranties?",
    answer:
      "Yes, extended warranty options are available for purchase. Contact our sales team for details.",
  },
];

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messageIdRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setMessages([]);
      messageIdRef.current = 0;
    }
  };

  const addMessage = (type: "user" | "system", text: string) => {
    messageIdRef.current += 1;
    setMessages((prev) => [...prev, { id: messageIdRef.current, type, text }]);
  };

  const [isTyping, setIsTyping] = React.useState(false);

  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (chatWindowRef.current) {
      const rect = chatWindowRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
  }, [isOpen]);

  const handleQuestionClick = (qa: QA) => {
    // Count how many times this question has been asked in the current messages
    const count = messages.filter(
      (msg) => msg.type === "user" && msg.text === qa.question
    ).length;

    if (count >= 3) {
      // Do not add the message if it has been asked 3 or more times
      return;
    }

    addMessage("user", qa.question);
    setIsTyping(true);
    setTimeout(() => {
      addMessage("system", qa.answer);
      setIsTyping(false);
      // Removed confetti display as per user request
      // setShowConfetti(true);
      // setTimeout(() => setShowConfetti(false), 3000);
    }, 3000);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        aria-label="Toggle Live Chat"
        className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-4 shadow-xl transform transition-transform duration-700 ease-in-out hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.888L3 20l1.888-4.255A9.863 9.863 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="fixed bottom-20 right-6 z-50 w-80 max-w-full bg-white rounded-xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden ring-2 ring-blue-500"
        >
          <div className="p-5 border-b border-blue-500 font-semibold text-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
            <span>Live Chat</span>
            <button
              onClick={toggleChat}
              aria-label="Close Live Chat"
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="p-4 flex-1 flex flex-col space-y-4 overflow-y-auto max-h-96 bg-gradient-to-b from-white to-blue-50 relative">
            {messages.length === 0 && (
              <p className="text-gray-900 font-semibold mb-3">
                How can we help you today? Select a question:
              </p>
            )}
            <div className="flex flex-col space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-md ${
                    msg.type === "user"
                      ? "self-end bg-blue-600 text-white"
                      : "self-start bg-white text-gray-900 border border-gray-300"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div className="max-w-[75%] px-5 py-3 rounded-2xl self-start bg-white text-gray-900 border border-gray-300 flex items-center space-x-2 shadow-md">
                  <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce animation-delay-0"></div>
                  <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce animation-delay-200"></div>
                  <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce animation-delay-400"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="mt-auto pt-4 border-t border-blue-500">
              <p className="text-gray-900 font-semibold mb-3">
                Choose a question:
              </p>
              <ul className="space-y-3 max-h-44 overflow-y-auto">
                {preConfiguredQA.map((qa, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleQuestionClick(qa)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-white hover:bg-blue-100 focus:outline-none focus:bg-blue-100 text-black shadow"
                    >
                      {qa.question}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Visual effect: subtle animated background */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 animate-gradient-x opacity-20 rounded-xl"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
