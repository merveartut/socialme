import { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import { BsThreeDots } from "react-icons/bs";
import { BsFillCameraVideoFill } from "react-icons/bs";
import { BiEdit } from "react-icons/bi";
import { SearchInput } from "../components/SearchInput";
import chatBg from "../../public/chat-bg.jpg";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase"; // make sure you export storage from firebase.ts

import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { getConversationId } from "../hooks/GetConversationId";

interface Message {
  id: string;
  text: string;
  from: string;
  createdAt?: any;
  fileUrl?: any;
  fileType?: any;
  fileName?: any;
}

interface User {
  uid: string;
  displayName: string;
  desc: string;
  photoURL: string;
}

export const ChatPage = ({ currentUser }: { currentUser: any }) => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<{
    uid: string;
    displayName: string;
    desc: string;
    photoURL: string;
  } | null>(usersList[0]);

  const [messages, setMessages] = useState<Message[]>([]);

  const [inputMessage, setInputMessage] = useState("");

  const [searchUser, setSearchUser] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, (snapshot) => {
      setUsersList(
        snapshot.docs
          .map((doc) => doc.data())
          .filter((user, idx) => {
            if (idx === 0) setSelectedUser(user as User);
            return (
              user.email !== currentUser.email &&
              user.displayName.toLowerCase().includes(searchUser.toLowerCase())
            );
          })
      );
    });
    return () => unsub();
  }, [currentUser, searchUser]);

  useEffect(() => {
    if (!selectedUser) return;

    const conversationId = getConversationId(currentUser.uid, selectedUser.uid);
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Message, "id">),
        }))
      );
    });

    return () => unsub();
  }, [selectedUser, currentUser]);

  const handleSend = async () => {
    if (!inputMessage.trim() || !selectedUser) return;

    const conversationId = getConversationId(currentUser.uid, selectedUser.uid);

    await addDoc(collection(db, "conversations", conversationId, "messages"), {
      text: inputMessage,
      from: currentUser.email,
      createdAt: serverTimestamp(),
    });

    setInputMessage("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser) return;

    const conversationId = getConversationId(currentUser.uid, selectedUser.uid);
    const storageRef = ref(
      storage,
      `conversations/${conversationId}/${file.name}`
    );

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await addDoc(collection(db, "conversations", conversationId, "messages"), {
      from: currentUser.email,
      fileUrl: downloadURL,
      fileName: file.name,
      fileType: file.type,
      createdAt: serverTimestamp(),
    });
  };

  return (
    <div
      className="w-full h-screen bg-cover bg-center p-4 md:p-16"
      style={{ backgroundImage: `url(${chatBg})` }}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 h-full backdrop-blur-md bg-zinc-600/70 backdrop-saturate-150 rounded-lg overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block md:col-span-3 p-4 flex flex-col gap-6 border-r overflow-y-auto">
          {/* Current user info */}
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-4 items-center">
              <Avatar
                alt={currentUser.displayName}
                sx={{ width: 50, height: 50 }}
                src={currentUser.photoURL}
              />
              <span className="font-bold text-white text-base">
                {currentUser.displayName}
              </span>
            </div>
            <div className="flex flex-row gap-2">
              <BsThreeDots size={20} color="#ffffff" />
              <BsFillCameraVideoFill size={20} color="#ffffff" />
              <BiEdit size={20} color="#ffffff" />
            </div>
          </div>

          {/* Search */}
          <div className="py-2">
            <SearchInput value={searchUser} onChange={setSearchUser} />
          </div>

          {/* Users list */}
          <div className="overflow-y-auto flex-1">
            {usersList.map((user) => (
              <div
                key={user.uid}
                className="p-2 flex items-center gap-3 cursor-pointer hover:bg-zinc-500 rounded transition-all"
                onClick={() => setSelectedUser(user)}
              >
                <Avatar
                  sx={{ width: 40, height: 40 }}
                  src={user.photoURL || ""}
                >
                  {user.displayName?.[0]}
                </Avatar>
                <span className="text-white text-sm truncate">
                  {user.displayName || user.email}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="col-span-1 md:col-span-6 flex flex-col h-full bg-black/10">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4 md:p-6">
            <div className="flex gap-4 items-center">
              <Avatar
                sx={{ width: 50, height: 50 }}
                src={selectedUser?.photoURL || ""}
              >
                {selectedUser?.displayName?.[0]}
              </Avatar>
              <div>
                <p className="text-white font-semibold text-sm md:text-base">
                  {selectedUser?.displayName}
                </p>
                <p className="text-white text-xs md:text-sm">
                  {selectedUser?.desc}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <BsFillCameraVideoFill size={20} color="#ffffff" />
              <BsThreeDots size={20} color="#ffffff" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                  } px-3 py-2 rounded-lg max-w-xs text-sm`}
                >
                  {msg.text && <div>{msg.text}</div>}
                  {msg.fileUrl && (
                    <div className="mt-2">
                      {msg.fileType?.startsWith("image/") ? (
                        <img
                          src={msg.fileUrl}
                          alt="uploaded"
                          className="max-w-full h-auto rounded-md"
                        />
                      ) : (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-xs"
                        >
                          📎 {msg.fileName}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-2 md:p-4 border-t flex items-center gap-2 relative">
            <input
              type="file"
              accept="image/*,application/pdf"
              hidden
              id="fileUpload"
              onChange={handleFileUpload}
            />
            <label htmlFor="fileUpload" className="cursor-pointer text-white">
              📎
            </label>
            <button
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="text-white"
            >
              😊
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-16 left-0 z-50">
                <Picker
                  data={data}
                  onEmojiSelect={(emoji: any) =>
                    setInputMessage((prev) => prev + emoji.native)
                  }
                  theme="dark"
                />
              </div>
            )}

            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 h-10 px-3 rounded-md bg-zinc-700 text-white text-sm focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="bg-white text-sm px-4 py-2 rounded-md"
            >
              Send
            </button>
          </div>
        </div>

        {/* Right panel (optional or additional info) */}
        <div className="hidden md:block md:col-span-3 p-4 text-white">
          Right Panel
        </div>
      </div>
    </div>
  );
};
