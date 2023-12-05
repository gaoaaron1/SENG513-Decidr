import React, { useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { UserContext } from '../contexts/UserContext';
import { SocketContext } from '../contexts/SocketContext';

export const broadcastingEventTypes = {
  ADD_VOTE: 'ADD_VOTE',
  REMOVE_VOTE: 'REMOVE_VOTE',
  ADD_OPTION: 'ADD_OPTION',
  USER_CONNECTED: 'USER_CONNECTED',
  USER_DISCONNECTED: 'USER_DISCONNECTED',
};

const useBroadcast = (
  processIncomingVote,
  processIncomingVoteRemoval,
  setUsers,
  addNewOption,
  setEventLog
) => {
  const socket = useContext(SocketContext);
  const { userDetails } = useContext(UserContext);
  const userID = userDetails.userID;

  const [avatarStates, setAvatarStates] = useState({}); // State to store avatar for each user

  // ====== BROADCASTING EVENTS ====== //
  const sendBroadcast = async (eventType, eventData, eventMessage) => {
    const broadcastData = {
      room: userDetails.roomID,
      author: userID,
      eventType: eventType,
      eventData: eventData,
      eventMessage: eventMessage,
      timeStamp: dayjs().format('HH:mm:ss'),
    };
    if (socket) {
      await socket.emit('send_message', broadcastData);
    } else {
      console.error('SOCKET NOT FOUND in RoomPage');
    }

    // Update the event log with the new event
    setEventLog((prevLogs) => [...prevLogs, broadcastData]);
  };

  // LISTEN FOR BROADCASTS
  useEffect(() => {
    const messageHandler = (data) => {
      if (data) {
        const { eventType, eventData } = data;
        if (eventType === broadcastingEventTypes.ADD_VOTE) {
          const { userID, optionID } = eventData;
          processIncomingVote(userID, optionID);
        }
        if (eventType === broadcastingEventTypes.REMOVE_VOTE) {
          const { userID, optionID } = eventData;
          processIncomingVoteRemoval(userID, optionID);
        }
        if (eventType === broadcastingEventTypes.USER_CONNECTED) {
          
          const { userID, username, userProfilePicture } = eventData;
          setUsers((prevUsers) => [...prevUsers, { userID, username }]);
          setAvatarStates((prevStates) => ({
            ...prevStates,
            [userID]: userProfilePicture,
          }));
        }
        if (eventType === broadcastingEventTypes.ADD_OPTION) {
          const { optionText, optionID, userProfilePicture } = eventData;
          addNewOption(optionText, optionID);
          setAvatarStates((prevStates) => ({
            ...prevStates,
            [data.author]: userProfilePicture,
          }));
        }
        setEventLog((list) => [...list, data]);
      } else {
        console.log('No data received but socket is connected');
      }
    };

    if (socket) {
      socket.on('receive_message', messageHandler);
    } else {
      console.error('SOCKET NOT FOUND in RoomPage');
    }

    // Cleanup function
    return () => {
      if (socket) socket.off('receive_message', messageHandler);
    };
  }, [socket]);
  // ====== END OF BROADCASTING EVENTS ====== //
  return {
    sendBroadcast,
  };
};

export default useBroadcast;
