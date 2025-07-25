import { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import { BsThreeDots } from "react-icons/bs";
import { BsFillCameraVideoFill } from "react-icons/bs";
import { BiEdit } from "react-icons/bi";
import { SearchInput } from "../components/SearchInput";
import chatBg from "../../public/chat-bg.jpg";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../firebase";

interface Message {
  id: string;
  text: string;
  from: string;
  createdAt?: any;
}

export const ChatPage = ({ currentUser }: { currentUser: any }) => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState({
    name: "Ali Veli",
    desc: "Lorem ipsum, dolor sit amet consectetur adipisicing elit.",
  });
  console.log(currentUser);

  const [messages, setMessages] = useState<Message[]>([]);

  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, (snapshot) => {
      setUsersList(
        snapshot.docs
          .map((doc) => doc.data())
          .filter((user) => user.email !== currentUser.email)
      );
    });

    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Message, "id">;
          return {
            id: doc.id,
            ...data,
          };
        })
      );
    });

    return () => unsub();
  }, []);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    await addDoc(collection(db, "messages"), {
      text: inputMessage,
      from: auth.currentUser?.email ?? "unknown",
      createdAt: serverTimestamp(),
    });
    setInputMessage("");
  };

  return (
    <div
      className=" h-screen bg-cover bg-center p-16"
      style={{ backgroundImage: `url(${chatBg})` }}
    >
      <div className="grid grid-cols-12 h-full backdrop-blur-md bg-zinc-600/70 backdrop-saturate-150 rounded-lg">
        <div className="col-span-3 p-4 flex flex-col gap-6 border-r">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-4 items-center p-4">
              <Avatar
                alt={currentUser.displayName}
                sx={{ width: 60, height: 60 }}
                src={currentUser.photoURL}
              ></Avatar>
              <span className="font-bold text-xl text-white">
                {currentUser.displayName}
              </span>
            </div>
            <div className="flex flex-row gap-2">
              <BsThreeDots size={24} color="#ffffff" />
              <BsFillCameraVideoFill size={24} color="#ffffff" />
              <BiEdit size={24} color="#ffffff" />
            </div>
          </div>

          <div className="p-4">
            <SearchInput />
          </div>

          <div>
            {usersList.map((user) => (
              <div
                key={user.uid}
                className="p-4 border-b flex flex-row gap-4 items-center cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <Avatar
                  sx={{ width: 60, height: 60 }}
                  src={user.photoURL || ""}
                >
                  {user.displayName?.[0]}
                </Avatar>
                <span className="text-white">
                  {user.displayName || user.email}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-6 border-r flex flex-col">
          <div className="flex flex-row gap-6 items-center border-b p-6">
            <Avatar sx={{ width: 60, height: 60 }}>MA</Avatar>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">
                {selectedUser.name}
              </span>
              <span>{selectedUser.desc}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.from === currentUser.email
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`${
                    msg.from === currentUser.email
                      ? "bg-blue-900 text-white"
                      : "bg-zinc-300 text-zinc-900"
                  } px-4 py-2 rounded-lg max-w-xs`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <input
              onChange={(e) => setInputMessage(e.target.value)}
              value={inputMessage}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 h-12 px-4 w-full rounded-md bg-zinc-700 text-white focus:outline-none"
            ></input>
          </div>
        </div>
        <div className="col-span-3 p-4">Right</div>
      </div>
    </div>
  );
};
