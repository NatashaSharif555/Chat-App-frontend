import React, { useEffect, useState } from "react";
import axios from "axios";

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const fetchChats = async () => {
    fetch("/api/chat")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setChats(data);
      });
    // const data = await axios.get("http://localhost:5000/api/chat");
    // console.log(data);
    // setChats(data);
  };
  // try {
  //     const res = axios.get("http://localhost:5000/api/chat");
  //     console.log(res);
  //   } catch (err) {}
  useEffect(() => {
    fetchChats();
  }, []);
  return (
    <div>
      {chats.map((chat) => (
        <div key={chat._id}>{chat.chatName}</div>
      ))}
    </div>
  );
};

export default ChatPage;
