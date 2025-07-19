import React, { useEffect, useMemo, useRef, useState } from "react";
import { ButtonIcon, ButtonPrimary, ButtonSearch } from "../components/ButtonUI";
import moment from "moment";
import Sentiment from 'sentiment'; // Import Sentiment
import ChatBodyWithGrouped from "./components/ChatBodyWithGrouped";
import { FilterWords } from "../constantas/SentimentWords";
import { PlayTheAllChat } from "../constantas/PlayChat";
import { GET_SELECTED_CHAT, REMOVE_CHAT, SEND_CHAT } from "../api/APIs";
import { AlertNotif } from "../components/AlertUI";

export function MessegersUI({ profile, selectedUser }) {
  const [selectedChat, setSelectedChat] = useState({
    loading: false,
    data: [],
    message: "",
  });
  const [myChat, setMyChat] = useState([]);

  const ReloadData = (user_id) => {
    const param = { from_id: profile.id, to_user_id: user_id };
    GET_SELECTED_CHAT(param, setSelectedChat, setMyChat);
  }

  // Inisialisasi instance Sentiment.js untuk analisis sentimen
  const sentiment = new Sentiment();

  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const [search, setSearch] = useState([]);
  const ResultMessageData = useMemo(() => {
    let computedData = [];
    if (Object.values(myChat).length > 0) {
      computedData = myChat.map((msg) => {

        const result = sentiment.analyze(msg.messages);             // Analisis sentimen dari teks pesan
        let sentimentLabel = 'Netral';                              // Menentukan label sentimen berdasarkan skor Netral
        if (result.score > 0) sentimentLabel = 'Positif';           // Menentukan label sentimen berdasarkan skor Positif
        else if (result.score < 0) sentimentLabel = 'Negatif';      // Menentukan label sentimen berdasarkan skor Negatif

        return {
          ...msg,
          sentiment: sentimentLabel,
          date_fmt: moment(msg.createdAt).format("YYYY-MM-DD"),
          isOutgoing: msg.from_id === profile.id
        }
      });

    }

    computedData.sort((a, b) => (a.id > b.id ? 1 : -1));

    if (search) {
      computedData = computedData.filter(
        listData => {
          return Object.keys(listData).some(key =>
            listData[key].toString().toLowerCase().includes(search)
          );
        }
      );
    }


    return computedData;
  }, [myChat, profile.id, search]);

  useEffect(() => {
    // const interval = setInterval(() => {
    ReloadData(selectedUser.id)
    // }, 3000);
    // return () => clearInterval(interval);
  }, [selectedUser.id]);

  const [writeChat, setWriteChat] = useState("");
  const [chatMsg, setChatMsg] = useState("");

  const [sendChat, setSendChat] = useState({ loading: false, data: [], message: "" });

  const HandlerSendChat = (e) => {
    e.preventDefault();
    if (writeChat.trim()) {

      // filter word
      // Setiap pesan yang ditulis (writechat) akan disaring menggunakan (FilterWords) 
      const msg = writeChat.toLowerCase();
      const theMessage = FilterWords(msg);
      //end filter

      const paramPost = {
        from_id: profile.id,
        messages: theMessage,
        to_user_id: selectedUser.id,
      }
      SEND_CHAT(paramPost, setSendChat);
      setWriteChat("");
      setChatMsg("");
      scrollToBottom();
      setTimeout(() => {
        ReloadData(selectedUser.id)
      }, 1000);

    } else {
      setChatMsg("Please fill up the field");
    }
  };


  const HandleRemove = (data) => {
    REMOVE_CHAT({ id: data.id })
    setTimeout(() => {
      ReloadData(selectedUser.id)
    }, 1000);
  }


  return (
    <div className="chat-ui-wrapper d-flex flex-column h-100 rounded-4 shadow bg-white border overflow-hidden">

      {/* Header */}
      {selectedUser && (
        <div className="chat-header d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white sticky-top shadow-sm z-1">
          <div className="d-flex align-items-center gap-3">
            <div className="avatar bg-primary text-white rounded-circle d-flex justify-content-center align-items-center" style={{ width: 40, height: 40 }}>
              {selectedUser.fullname.charAt(0)}
            </div>
            <div>
              <h5 className="mb-0 fw-semibold">{selectedUser.fullname}</h5>
            </div>
          </div>

          {selectedChat.data.length > 0 && (
            <div className="d-flex align-items-center gap-3">
              <ButtonSearch setSearch={setSearch}>
                <span className="svg-icon svg-icon-1 svg-icon-muted">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect opacity="0.5" x="17.0365" y="15.1223" width="8.15546" height="2" rx="1" transform="rotate(45 17.0365 15.1223)" fill="currentColor" />
                    <path d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z" fill="currentColor" />
                  </svg>
                </span>
              </ButtonSearch>

              <ButtonIcon
                title="Play All"
                onAction={() => PlayTheAllChat(ResultMessageData, selectedUser, profile.id)}
                className="text-success fs-4"
              >
                <i className="bi bi-play-circle"></i>
              </ButtonIcon>
            </div>
          )}
        </div>
      )}

      {/* Chat Body */}
      <div className="chat-body d-flex flex-column flex-grow-1 position-relative bg-light">
        <div className="messages-area flex-grow-1 px-4 py-3 overflow-auto" style={StylesMessager.chatBox}>
          {selectedChat.data.length > 0 ? (
            <>
              <ChatBodyWithGrouped data={ResultMessageData} profile={profile} HandleRemove={HandleRemove} />
              <div ref={endOfMessagesRef} />
              {sendChat.message && <AlertNotif color="danger" message={sendChat.message} />}
            </>
          ) : (
            <EmptyChat />
          )}
        </div>

        {/* Footer */}
        <div className="chat-footer border-top p-4 bg-gradient-light">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small text-muted">Sentiment tags:</span>
            <div className="d-flex gap-2">
              <span className="badge rounded-pill bg-primary">Positive</span>
              <span className="badge rounded-pill bg-secondary">Neutral</span>
              <span className="badge rounded-pill bg-danger">Negative</span>
            </div>
          </div>

          <form onSubmit={HandlerSendChat} autoComplete="off">
            <div className="d-flex gap-3 align-items-center">
              <input
                type="text"
                className="form-control form-control-lg rounded-pill shadow-sm"
                placeholder="Type your message..."
                value={writeChat}
                onChange={(e) => setWriteChat(e.target.value)}
                autoFocus
              />
              <ButtonPrimary
                items={{
                  title: "Send",
                  btn_class: "btn btn-icon btn-success rounded-circle shadow-sm",
                  type: "submit",
                }}
              >
                <i className="bi bi-send fs-4"></i>
              </ButtonPrimary>
            </div>
            {chatMsg && <small className="text-danger mt-1 d-block">{chatMsg}</small>}
          </form>
        </div>
      </div>
    </div>
  );


}

const StylesMessager = {
  chatBox: {
    flexGrow: 1,
    overflowY: 'auto',
    maxHeight: "calc(100vh - 150px)"
  },
};

const EmptyChat = () => {
  return (
    <div className="h-100 d-flex justify-content-center align-items-center">
      <div className="info text-center">
        <h1>No Conversations</h1>
        <p>You didn't made any conversation yet, please select username</p>
        <span className="badge badge-primary">Start a chat</span>
      </div>
    </div>
  );
};
