import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastOptions } from "react-toastify";

export default function Chat() {
  const navigate = useNavigate();
  const socket: any = useRef();
  const [contacts, setContacts]: [any, Function] = useState([]);
  const [currentChat, setCurrentChat]: [any, Function] = useState(undefined);
  const [currentUser, setCurrentUser]: [any, Function] = useState(undefined);
  //在线用户
  const [onlineUser, setonlineUser]: [any, Function] = useState(undefined);

  const toastOptions: ToastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    async function a() {
      if (!localStorage.getItem(String(process.env.REACT_APP_LOCALHOST_KEY))) {
        navigate("/login");
      } else {
        setCurrentUser(
          await JSON.parse(
            String(
              localStorage.getItem(String(process.env.REACT_APP_LOCALHOST_KEY))
            )
          )
        );
      }
    }
    a();
  }, []);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    if (socket.current) {
      const data = { abc: 1 };
      socket.current.emit("online", data);
      socket.current.on("users", (onlineUsers: any) => {
        console.log(onlineUsers, "onlineUsers---");
        setonlineUser({ ...onlineUsers });
      });
    }
    const c = () => {
      socket.current.emit("offline", currentUser._id);
      console.log("close");
    };
    window.addEventListener("beforeunload", c);

    return () => {
      if (socket.current) {
        c();
      }
    };
  }, [currentUser]);

  useEffect(() => {
    console.log(onlineUser, "1212");
  }, [onlineUser]);

  useEffect(() => {
    async function b() {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
          setContacts(data.data);
        } else {
          navigate("/setAvatar");
        }
      }
    }
    b();
  }, [currentUser]);

  const handleChatChange = (chat: any) => {
    setCurrentChat(chat);
  };

  return (
    <>
      <Container>
        <div className="container">
          <Contacts
            contacts={contacts}
            changeChat={handleChatChange}
            onlineUser={onlineUser}
          />
          {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer currentChat={currentChat} socket={socket} />
          )}
        </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
