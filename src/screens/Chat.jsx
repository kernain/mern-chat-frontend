import React, { useEffect, useState, useContext, useRef } from "react";
import Avatar from "../components/Avatar";
import Logo from "../components/Logo";
import { UserContext } from "../UserContext";
import { uniqBy } from "lodash";
import axios from "axios";
import "../index.css";
import Contact from "../components/Contact";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { loggedInUsername, id, setLoggedInUsername, setId } =
    useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const divUnderMessages = useRef();
  const [offlinePeople, setOfflinePeople] = useState();
  useEffect(() => {
    connectToWs();
  }, []);

  function connectToWs() {
    const ws = new WebSocket("wss://mern-chat-backend-nine.vercel.app");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Reconnecting");
        connectToWs();
      }, 1000);
    });
  }

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      if (username !== loggedInUsername) {
        people[userId] = username;
      }
    });
    setOnlinePeople(people);
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else {
      if (messageData.sender === selectedUserId) {
        setMessages((prev) => [...prev, { ...messageData }]);
      }
    }
  }

  async function logout() {
    await axios.post("/auth/logout");
    setWs(null);
    setId(null);
    setLoggedInUsername(null);
  }

  function sendMessage(ev) {
    if (ev) {
      ev.preventDefault();
    }
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      })
    );
    setNewMessageText("");
    setMessages((prev) => [
      ...prev,
      { text: newMessageText, sender: id, recipient: selectedUserId },
    ]);
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await axios.get("/people/users");
      const offlinePeopleData = data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeople = {};
      offlinePeopleData.forEach((p) => {
        offlinePeople[p._id] = p.username;
      });
      console.log(offlinePeople);
      setOfflinePeople(offlinePeople);
    }
    fetchUsers();
  }, [onlinePeople]);

  useEffect(() => {
    async function fetchMessages() {
      if (selectedUserId) {
        const response = await axios.get("/messages/" + selectedUserId);
        const { data } = response;
        setMessages(data);
      }
    }
    fetchMessages();
  }, [selectedUserId]);

  const messagesWithOutDupes = uniqBy(messages, "_id");

  return (
    <div className="flex h-screen">
      <div className="bg-blue-40 w-1/4 flex flex-col">
        <div className="flex-grow">
          <Logo />
          {Object.keys(onlinePeople).map((userId) => (
            <Contact
              userId={userId}
              online={true}
              username={onlinePeople[userId]}
              selected={userId === selectedUserId}
              onClick={() => setSelectedUserId(userId)}
            />
          ))}
          {console.log(offlinePeople)}
          {/* {console.log(onlinePeople)} */}
          {offlinePeople &&
            Object.keys(offlinePeople).map((userId) => (
              <Contact
                userId={userId}
                online={false}
                username={offlinePeople[userId]}
                selected={userId === selectedUserId}
                onClick={() => setSelectedUserId(userId)}
              />
            ))}
        </div>
        <div className="p-2 text-center flex items-center">
          <span className="mr-2 text-sm text-gray-500 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
              class="w-6 h-6"
            >
              <path
                fill-rule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                clip-rule="evenodd"
              />
            </svg>
            {loggedInUsername}
          </span>
          <button
            onClick={logout}
            className="text-sm text-gray-500 bg-blue-100 py-1 px-2 border rounded-sm "
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-blue-200 w-3/4 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-gray-500">
                &larr; Select a person from the sidebar
              </div>
            </div>
          )}
          {selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-auto absolute inset-0">
                {messagesWithOutDupes.map((message, i) => {
                  return (
                    <div
                      key={message._id}
                      className={
                        message.sender === id ? "text-right" : "text-left"
                      }
                    >
                      <div
                        className={
                          "text-left max-w-md p-2 my-2 me-2 rounded-md inline-block " +
                          (message.sender === id
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-500")
                        }
                      >
                        {message.text}
                        {/* {message.text} */}
                      </div>
                    </div>
                  );
                })}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {selectedUserId && (
          <form className="flex gap-2 pt-2" onSubmit={sendMessage}>
            <input
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              type="text"
              className="bg-white flex-grow border p-2 rounded-md"
              placeholder="Type Your Message Here"
            />

            <button
              type="submit"
              className="bg-blue-400 p-2 text-white rounded-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
