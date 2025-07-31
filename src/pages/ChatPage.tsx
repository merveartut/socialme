import { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import { Menu, MenuItem } from "@mui/material";
import { IconButton } from "@mui/material";
import { BsThreeDots } from "react-icons/bs";
import { BsFillCameraVideoFill } from "react-icons/bs";
import { BiEdit } from "react-icons/bi";
import { SearchInput } from "../components/SearchInput";
import chatBg from "../../public/chat-bg.jpg";
import { IoChevronBackCircleOutline } from "react-icons/io5";

import {
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { Chat } from "../components/Chat";
import { getConversationId } from "../hooks/getConversationId";

interface User {
  uid: string;
  email: string;
  displayName: string;
  desc: string;
  photoURL: string;
}

export const ChatPage = ({ currentUser }: { currentUser: any }) => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [searchUser, setSearchUser] = useState("");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    // Optionally redirect or refresh after logout
    window.location.reload(); // Or use your router: router.push('/login');
  };

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, async (snapshot) => {
      const users = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const user = doc.data();
          if (user.email === currentUser.email) return null;

          const conversationId = getConversationId(currentUser.uid, user.uid);

          const messagesRef = collection(
            db,
            "conversations",
            conversationId,
            "messages"
          );
          const lastMessageQuery = query(
            messagesRef,
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const lastMessageSnap = await getDocs(lastMessageQuery);

          const lastMessage = lastMessageSnap.docs[0]?.data()?.text || "";

          return { ...user, lastMessage };
        })
      );

      setUsersList(users.filter(Boolean));
    });

    return () => unsub();
  }, [currentUser, searchUser]);

  return (
    <div
      className="w-full h-screen bg-cover bg-center p-4 md:p-16 pt-16"
      style={{ backgroundImage: `url(${chatBg})` }}
    >
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 px-4 backdrop-blur-md bg-zinc-600/70 backdrop-saturate-150 flex items-center z-50 shadow-md">
        {selectedUser && (
          <IconButton
            onClick={() => {
              setSelectedUser(null);
            }}
          >
            <IoChevronBackCircleOutline className="text-white" size={24} />
          </IconButton>
        )}
        <Avatar
          src={currentUser.photoURL}
          sx={{ width: 32, height: 32 }}
          onClick={handleMenuClick}
        />
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <MenuItem onClick={handleLogout} className="h-8">
            Logout
          </MenuItem>
        </Menu>
      </div>

      <div className="grid h-full grid-cols-1 md:grid-cols-12 backdrop-blur-md bg-zinc-600/70 backdrop-saturate-150 rounded-lg overflow-hidden">
        {/* Sidebar */}
        {window.innerWidth >= 768 && (
          <div className="block md:col-span-3 p-4 flex flex-col gap-6 border-r overflow-y-auto">
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
                <button onClick={handleMenuClick}>
                  <BsThreeDots size={20} color="#ffffff" />
                </button>
                <BsFillCameraVideoFill size={20} color="#ffffff" />
                <BiEdit size={20} color="#ffffff" />

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                >
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
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
        )}

        {/* Chat Area */}
        {selectedUser || window.innerWidth >= 768 ? (
          <div className="col-span-1 md:col-span-9">
            <Chat
              currentUser={currentUser}
              selectedUser={selectedUser || usersList[0]}
            />
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-6 border-r overflow-y-auto">
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
                  <div className="flex flex-col">
                    <span className="text-white text-sm truncate">
                      {user.displayName || user.email}
                    </span>
                    <div>
                      <p className="text-white text-xs truncate opacity-70">
                        {user.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
