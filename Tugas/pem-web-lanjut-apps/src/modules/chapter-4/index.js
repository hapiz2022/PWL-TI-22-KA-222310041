import React, { useEffect, useState } from "react";
import { ContactUI, MessegersUI } from "./widgets";
import { FETCH_CONTACT_CHAT } from "./widgets/api/APIs";
import { MySkeleton } from "./widgets/components/SkeletonUI";
import { AlertNotif } from "./widgets/components/AlertUI";
import ModalPopUp from "./widgets/components/ModalPopUp";

export function ChapterFour() {
  const accountArr = localStorage.getItem("user_account");
  const myprofile = JSON.parse(accountArr);
  const [selectedUser, setSelectedUser] = useState({});

  const HandlerSelectedChat = (data) => {
    setSelectedUser(data);
  };

  const [myFriends, setMyFriends] = useState({
    loading: false,
    data: [],
    messages: "",
  });

  useEffect(() => {
    FETCH_CONTACT_CHAT(setMyFriends);
  }, []);

  const emptyStateStyle = {
    minHeight: "75vh",
    background: "#f7f9fc",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "3rem",
    transition: "all 0.3s ease-in-out",
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <main className="container py-4 px-3 px-md-4">
        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="bg-white rounded-4 shadow-sm p-3 h-100">
              {myFriends.loading ? (
                <MySkeleton />
              ) : myFriends.messages ? (
                <AlertNotif color={"danger"} message={myFriends.messages} />
              ) : myFriends.data.length > 0 ? (
                <ContactUI
                  my_account={myprofile}
                  friends={myFriends.data}
                  selectedUser={selectedUser}
                  HandlerSelectedChat={HandlerSelectedChat}
                />
              ) : (
                <div className="text-muted fst-italic text-center">
                  No contacts available.
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div className="bg-white rounded-4 shadow-sm p-3 h-100">
              {Object.keys(selectedUser).length > 0 ? (
                <MessegersUI profile={myprofile} selectedUser={selectedUser} />
              ) : (
                <div style={emptyStateStyle}>
                  <div>
                    <div className="mb-3 fs-1">💬</div>
                    <h3 className="text-primary mb-2">
                      No Conversation Selected
                    </h3>
                    <p className="text-muted mb-3">
                      Select a contact from the list to start chatting.
                    </p>
                    <span className="badge bg-primary fs-6 py-2 px-4 shadow-sm">
                      Start Chatting
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ModalPopUp />
    </div>
  );
}
