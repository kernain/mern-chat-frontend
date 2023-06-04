import React from "react";

const Avatar = ({ userId, username, online }) => {
  const colors = [
    "bg-teal-200",
    "bg-red-200",
    "bg-green-200",
    "bg-purple-200",
    "bg-blue-200",
    "bg-yellow-200",
    "bg-orange-200",
    "bg-pink-200",
    "bg-fuchsia-200",
    "bg-rose-200",
  ];
  const userIdBase10 = parseInt(userId.substring(10), 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];
  return (
    <div className={"relative w-8 h-8 rounded-full flex items-center "+ color}>
      <div className="w-full text-center font-bold opacity-60">{username[0]}</div>
      <div className={"absolute w-3 h-3  bottom-0 right-0 rounded-full border border-white "+ (online ? "bg-green-600" : "bg-gray-400")} ></div>
    </div>
  );
};

export default Avatar;
