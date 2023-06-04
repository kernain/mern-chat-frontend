import React from "react";
import Avatar from "./Avatar";
const Contact = ({userId, selected, username, onClick, online}) => {
  return (
    <div
      key={userId}
      onClick={() => onClick(userId)}
      className={
        "border-b border-gray-100 py-2 pl-4 flex items-center gap-2 cursor-pointer " +
        (selected ? "bg-blue-200" : "")
      }
      
    >
      <Avatar online={online} username={username} userId={userId} />
      <span className="text-gray-800">{username}</span>
    </div>
  );
};

export default Contact;
