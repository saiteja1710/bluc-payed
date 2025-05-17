import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [matchDetails, setMatchDetails] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: 'turn:relay1.expressturn.com:3480',
        username: '174672462322246224',
        credential: 'wPWy5/Q8xaF3LVOKZOdExrhnZ+4='
      }
    ],
  };

  const callStartedRef = useRef(false);
  const pendingCandidates = useRef([]);

  const initializeSocket = (gender, interest, name, mode) => {
    if (socketRef.current) return socketRef.current;

    // ✅ Environment-safe socket initialization
    const socketInstance = window.socket || io(
      process.env.NODE_ENV === 'production'
        ? 'https://buzzy-server-nu.vercel.app'  // 🔄 Your production socket URL
        : 'http://localhost:3000',
      {
        transports: ['websocket'],
        withCredentials: true,
      }
    );

    if (!window.socket) {
      window.socket = socketInstance;
    }

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      socketInstance.emit('user-details', { gender, interest,name,mode });
      setIsConnecting(true);
    });

    socketInstance.on('find other', () => {
      if (user) {
        socketInstance.emit('user-details', {
          gender: user.gender,
          interest: user.interest,
          mode:mode
        });
        setIsConnecting(true);  
        cleanupMatch();
        console.log(isConnecting); 
        console.log('hello');
      }
    });

    socketInstance.on('match-found', (data) => {
      if (data.matched) {
        setIsMatched(true);
        setIsConnecting(false);
        setMatchDetails({ partnerId: data.socketId }); 
        console.log("Matched with:", data.socketId);
      }
    });

   

    return socketInstance;
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      window.socket = null;
    }
    cleanupMatch();
  };

  const cleanupMatch = () => {
    setIsMatched(false);
    setMatchDetails(null);
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    callStartedRef.current = false;
    pendingCandidates.current = [];
  };

  const disconnectFromMatch = (mode) => {
    const socket = socketRef.current;
    if (socket && matchDetails) { 
      console.log(mode);
      socket.emit('disconnect-chat', matchDetails.partnerId,mode);
      cleanupMatch();
    }
  }; 
  const next =(mode)=>{ 
   const socket = socketRef.current;
    if (socket && matchDetails) {
      socket.emit('next', matchDetails.partnerId,mode);
    
    }
  };

  const sendMessage = (message, partnerId) => {
    const socket = socketRef.current;
    if (socket && partnerId) {
      socket.emit('send-message', message, partnerId); 
      console.log(message);
    }
  };

  const startVideoCall = async (partnerId, localStream, remoteVideoElement) => {
    if (callStartedRef.current || !partnerId || !localStream) return;

    callStartedRef.current = true;

    const socket = socketRef.current;
    try {
      console.log("Starting video call...");
      const pc = new RTCPeerConnection(iceServers);
      setPeerConnection(pc);

      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", event.candidate, partnerId);
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoElement && event.streams && event.streams[0]) {
          remoteVideoElement.srcObject = event.streams[0];
        }
      };

      // ✅ Handle offer
      socket.on("video-offer", async (offer, fromSocketId) => {
        if (partnerId === fromSocketId) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("video-answer", answer, fromSocketId);
          } catch (error) {
            console.error("Error handling offer:", error);
          }
        }
      });

      // ✅ Handle answer with state check
      socket.on("video-answer", async (answer) => {
        try {
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            for (const c of pendingCandidates.current) {
              await pc.addIceCandidate(c);
            }
            pendingCandidates.current = [];
          } else {
            console.warn("Ignored answer: invalid signaling state", pc.signalingState);
          }
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      });

      socket.on("ice-candidate", async (candidate) => {
        const ice = new RTCIceCandidate(candidate);
        if (pc.remoteDescription && pc.remoteDescription.type) {
          try {
            await pc.addIceCandidate(ice);
          } catch (error) {
            console.error("ICE candidate error:", error);
          }
        } else {
          pendingCandidates.current.push(ice);
        }
      });

      socket.on("end-video", () => {
        pc.close();
        setPeerConnection(null);
        callStartedRef.current = false;
        pendingCandidates.current = [];
      });

      socket.emit("start-call", partnerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("video-offer", offer, partnerId);

      return pc;
    } catch (error) {
      console.error('Error starting video call:', error);
    }
  };

  const endVideoCall = () => {
    const socket = socketRef.current;
    if (socket && matchDetails) {
      socket.emit("end-call", matchDetails.partnerId);
    }
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    callStartedRef.current = false;
    pendingCandidates.current = [];
  };

  const value = {
    socket: socketRef.current,
    isConnecting,
    isMatched,
    matchDetails,
    initializeSocket,
    disconnectSocket,
    disconnectFromMatch, 
    next,
    setIsConnecting,
    sendMessage,
    startVideoCall,
    endVideoCall
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
