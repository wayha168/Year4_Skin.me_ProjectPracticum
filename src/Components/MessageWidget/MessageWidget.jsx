// import React, { useState } from "react";
// import { FaSmile, FaPaperPlane } from "react-icons/fa";
// import EmojiPicker from "emoji-picker-react"; // install: npm i emoji-picker-react
// import "./MessageInput.css"; // Assuming this CSS is for MessageInput
// import "./MessageButton.css"; // Assuming this CSS is for MessageButton
// import MessageButton from "../MessageButton/MessageButton";
// import MessageInput from "../MessageInput/MessageInput";

// const MessageWidget = () => {
//   const [showInput, setShowInput] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [showEmoji, setShowEmoji] = useState(false);

//   const handleSend = () => {
//     if (!input.trim()) return;
//     setMessages([...messages, { text: input, time: new Date().toLocaleTimeString() }]);
//     setInput("");
//   };

//   const handleEmojiClick = (emojiData) => {
//     setInput((prev) => prev + emojiData.emoji);
//     setShowEmoji(false);
//   };

//   if (!showInput) {
//     return (
//       <div className="message-button-wrapper" onClick={() => setShowInput(true)}>
//         <i className="fa-solid fa-message" />
//       </div>
//     );
//   }

//   return (
//     <div className="message-box">
//       <div className="message-list">
//         {messages.length === 0 ? (
//           <p className="empty-text">No messages yet...</p>
//         ) : (
//           messages.map((msg, i) => (
//             <div key={i} className="message-item">
//               <p className="message-text">{msg.text}</p>
//               <small className="message-time">{msg.time}</small>
//             </div>
//           ))
//         )}
//       </div>

//       <div className="message-input-area">
//         <button
//           onClick={() => setShowEmoji(!showEmoji)}
//           className="emoji-button"
//         >
//           <FaSmile />
//         </button>

//         {showEmoji && (
//           <div className="emoji-picker">
//             <EmojiPicker onEmojiClick={handleEmojiClick} height={350} width={300} />
//           </div>
//         )}

//         <input
//           type="text"
//           className="message-input"
//           placeholder="Type a message..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSend()}
//         />

//         <button
//           onClick={handleSend}
//           className="send-button"
//         >
//           <FaPaperPlane />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MessageWidget;
import React, { useState } from "react";
import { FaSmile, FaPaperPlane, FaTimes } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react"; // install: npm i emoji-picker-react
import "./MessageInput.css"; // Assuming this CSS is for MessageInput
import "./MessageButton.css"; // Assuming this CSS is for MessageButton

const MessageWidget = () => {
  const [showInput, setShowInput] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, time: new Date().toLocaleTimeString() }]);
    setInput("");
  };

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  if (!showInput) {
    return (
      <div className="message-button-wrapper" onClick={() => setShowInput(true)}>
        <i className="fa-solid fa-message" />
      </div>
    );
  }

  return (
    <div className="message-box">
      <div className="message-header">
        <button
          onClick={() => setShowInput(false)}
          className="close-button"
        >
          <FaTimes />
        </button>
      </div>

      <div className="message-list">
        {messages.length === 0 ? (
          <p className="empty-text">No messages yet...</p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="message-item">
              <p className="message-text">{msg.text}</p>
              <small className="message-time">{msg.time}</small>
            </div>
          ))
        )}
      </div>

      <div className="message-input-area">
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="emoji-button"
        >
          <FaSmile />
        </button>

        {showEmoji && (
          <div className="emoji-picker">
            <EmojiPicker onEmojiClick={handleEmojiClick} height={350} width={300} />
          </div>
        )}

        <input
          type="text"
          className="message-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          onClick={handleSend}
          className="send-button"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default MessageWidget;