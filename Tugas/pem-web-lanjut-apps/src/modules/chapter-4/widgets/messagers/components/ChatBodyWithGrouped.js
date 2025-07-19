import React from "react";
import moment from "moment";
import { GroupByKey } from "../../../../../apps/helpers/GeneralHelper";
import ChatBody from "./ChatBody";

export default function ChatBodyWithGrouped({ data, profile, HandleRemove }) {
  const itsMe = profile.id;
  const today = moment().format("YYYY-MM-DD");
  const groupedData = GroupByKey(data, "date_fmt");

  const styles = {
    container: {
      padding: '5px',
      backgroundColor: '#f7f9fc',
    },
    dateGroup: {
      marginBottom: '40px',
    },
    dateLabelContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '16px',
    },
    dateLabel: {
      background: 'white',
      color: '#4a4a4a',
      fontSize: '14px',
      fontStyle: 'italic',
      padding: '8px 20px',
      borderRadius: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    }
  };

  return (
    <div style={styles.container}>
      {Object.entries(groupedData).map(([dateKey, messages], index) => {
        const isToday = dateKey === today;
        const displayDate = isToday ? "Today" : moment(dateKey).format("DD MMM YYYY");

        return (
          <div key={index} style={styles.dateGroup}>
            <div style={styles.dateLabelContainer}>
              <span style={styles.dateLabel}>{displayDate}</span>
            </div>
            <ChatBody
              data={messages}
              profile={itsMe}
              HandleRemove={HandleRemove}
            />
          </div>
        );
      })}
    </div>
  );
}
