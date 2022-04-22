import { getActiveElement } from '@testing-library/user-event/dist/utils';
import React, { useEffect, useState, useRef, useContext } from 'react';
import {
  GetChannelDetails,
  GetChannelMembers,
  GetUsers,
  RetrieveMessage,
  SendMessage,
} from '../../api/Fetch';
import UseContext from '../../context/UseContext';
import MemberList from './MemberList';
import Modal from '../Modal';
import axios from 'axios';

function Main({ name, id, data }) {
  const { message, setMessage, body, setBody, showMembers, setShowMembers } =
    useContext(UseContext);
  const messageEndRef = useRef(null);
  const receiverClass = data.email ? true : false;
  const [channelMembers, setChannelMembers] = useState([]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView();
  }, [message]);

  useEffect(() => {
    setMessage([]);
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      getMessage();
    }, 1000);
    return () => clearInterval(interval);
  }, [id]);

  const getMessage = async () => {
    const data = {
      id: id,
      class: receiverClass ? 'User' : 'Channel',
    };
    const messages = await RetrieveMessage(data);

    setMessage(messages);
  };

  const sendMessage = async () => {
    const data = {
      receiver_id: id,
      receiver_class: receiverClass ? 'User' : 'Channel',
      body: body,
    };

    const send = await SendMessage(data);
    getMessage();
    setBody('');
  };

  const handleSubmit = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMembers = async () => {
    const users = await GetUsers();
    const get = await GetChannelMembers(id);
    const members = get.map((member) =>
      users.find((user) => user.id == member.user_id)
    );
    setChannelMembers(members);
    setShowMembers(true)
  };

  return (
    <div className='slack-page'>
      <div className='main'>
        <div className='channel-user'>
          <div className='user-channel'>{name}</div>
          <div
            onClick={getMembers}
            className='members'
          >
            {receiverClass ? '' : 'Members'}
          </div>
        </div>
        <div className='body'>
          {message.map((prop) => {
            return (
              <div key={prop.id} className='message'>
                <div className='flex'>
                  <div className='sender'>{prop.sender.email}</div>
                  <div className='messages'>{prop.body}</div>
                </div>
                <div className='date'>
                  <div>{prop.sender.created_at.substr(0, 10)}</div>
                  <div>{prop.sender.created_at.substr(11, 8)}</div>
                </div>
              </div>
            );
          })}
          <div ref={messageEndRef}></div>
        </div>
        <div className='text-area'>
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
            }}
            onKeyPress={handleSubmit}
            placeholder={`Message ${name}`}
          ></textarea>
          <button onClick={sendMessage} className='send' type='submit'>
            Send Message
          </button>
        </div>
      </div>
      <Modal open={showMembers} >
        <MemberList channelMembers={channelMembers} />
      </Modal>
    </div>
  );
}

export default Main;
