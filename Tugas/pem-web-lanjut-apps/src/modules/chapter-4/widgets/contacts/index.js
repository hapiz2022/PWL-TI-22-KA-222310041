import React, { useMemo, useState } from "react";
import { AccountLong } from "../components/AccountUI";
import { ButtonIcon, ButtonSearch } from "../components/ButtonUI";
import { Link } from "react-router-dom";

export function ContactUI({ my_account, friends, selectedUser, HandlerSelectedChat }) {
  const [search, setSearch] = useState([]);
  const [sorting, setSorting] = useState({ field: "", order: "" });

  const toggleSorting = (field) => {
    if (sorting.field === field) {
      setSorting({ ...sorting, order: sorting.order === 'asc' ? 'desc' : 'asc' });
    } else {
      setSorting({ field: field, order: 'asc' });
    }
  };

  const ResultData = useMemo(() => {
    let computedData = friends;
    computedData = computedData.filter(item => item.id !== my_account.id);

    if (search) {
      computedData = computedData.filter(
        listData => {
          return Object.keys(listData).some(key =>
            listData[key].toString().toLowerCase().includes(search)
          );
        }
      );
    }

    if (sorting.field) {
      const reversed = sorting.order === "asc" ? 1 : -1;
      computedData = computedData.sort(
        (a, b) =>
          reversed * a[sorting.field].localeCompare(b[sorting.field])
      );
    }

    return computedData;
  }, [friends, search, sorting])



  return (
    <div className="contact-ui d-flex flex-column h-100 bg-white shadow-sm rounded-3 overflow-hidden">

      <div className="contact-header d-flex justify-content-between align-items-center p-4 border-bottom bg-light">
        <div className="user-info">
          <AccountLong data={my_account} color="danger" />
        </div>
        <Link to="/sign-out" className="btn btn-icon btn-outline-danger" title="Sign out">
          <i className="bi bi-box-arrow-right fs-3"></i>
        </Link>
      </div>

      <div className="contact-toolbar d-flex gap-3 align-items-center px-4 py-3 border-bottom bg-white">
        <ButtonSearch setSearch={setSearch}>
          <span className="svg-icon svg-icon-1 svg-icon-gray-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect
                opacity="0.5"
                x="17.0365"
                y="15.1223"
                width="8.15546"
                height="2"
                rx="1"
                transform="rotate(45 17.0365 15.1223)"
                fill="currentColor"
              />
              <path
                d="M11 19C6.56 19 3 15.44 3 11S6.56 3 11 3s8 3.56 8 8-3.56 8-8 8zm0-14C7.53 5 5 7.53 5 11s2.53 6 6 6 6-2.53 6-6-2.53-6-6-6z"
                fill="currentColor"
              />
            </svg>
          </span>
        </ButtonSearch>

        <ButtonIcon
          title={`Sort by Name (${sorting.order || "none"})`}
          onAction={() => toggleSorting("fullname")}
        >
          <i className={`bi fs-4 ${sorting.order === "desc" ? "bi-sort-down" : sorting.order === "asc" ? "bi-sort-up" : "bi-filter"}`}></i>
        </ButtonIcon>
      </div>

      <div className="contact-list flex-grow-1 overflow-auto px-2">
        {ResultData.length > 0 ? (
          ResultData.map((v) => (
            <div
              key={v.id}
              onClick={() => HandlerSelectedChat(v)}
              className={`contact-item d-flex align-items-center gap-3 p-3 rounded-2 mb-2 cursor-pointer transition ${selectedUser.id === v.id
                  ? "bg-primary text-white"
                  : "bg-light hover:bg-primary-subtle"
                }`}
            >
              <AccountLong data={v} color="info" />
            </div>
          ))
        ) : (
          <div className="text-center text-muted py-5 fs-6">No contacts found 😕</div>
        )}
      </div>

      <footer className="contact-footer text-center text-muted py-3 border-top bg-light small">
        <i className="bi bi-shield-lock-fill me-1"></i>
        Your messages are <strong className="text-info">end-to-end encrypted</strong>
      </footer>
    </div>
  );



}
