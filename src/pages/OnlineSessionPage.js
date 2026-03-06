import React, { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { useParams, useSearchParams } from "react-router-dom";
import Layout from '../components/Layout';
import { AuthContext } from "../context/AuthContext";
import "../assets/OnlineVideoSession.css";
import config from '../config';

const VideoConference = () => {
  const { sessionCode } = useParams();
  const [searchParams] = useSearchParams();
  const isHost = searchParams.get("isHost") === "true";
  const localVideoRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const peerConnections = useRef({});
  const hubConnection = useRef(null);
  const candidatesQueue = useRef({});
  const localStream = useRef(null);
  const [activeStream, setActiveStream] = useState(null);

  const toggleActiveStream = (stream) => {
    setActiveStream(activeStream === stream ? null : stream);
  };

  const makeFullscreen = (videoElement) => {
    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    } else if (videoElement.webkitRequestFullscreen) {
      videoElement.webkitRequestFullscreen();
    } else if (videoElement.msRequestFullscreen) {
      videoElement.msRequestFullscreen();
    }
  };
  const createPeerConnection = useCallback(
    (connectionId) => {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          hubConnection.current
            ?.invoke(
              "SendSignalingData",
              sessionCode,
              JSON.stringify({ ice: event.candidate }),
              connectionId
            )
            .catch((err) => console.error("Error sending ICE candidate:", err));
        }
      };

      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        console.log("Track received:", remoteStream);
        setRemoteStreams((prev) => {
          if (!prev.some((stream) => stream.id === remoteStream.id)) {
            return [...prev, remoteStream];
          }
          return prev;
        });
      };

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStream.current);
        });
      }

      peerConnections.current[connectionId] = pc;
      return pc;
    },
    [sessionCode]
  );

  const handleUserJoined = useCallback(
    async (connectionId) => {
      try {
        const pc = createPeerConnection(connectionId);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        console.log("Sending offer to:", connectionId);
        await hubConnection.current?.invoke(
          "SendSignalingData",
          sessionCode,
          JSON.stringify({ sdp: offer }),
          connectionId
        );
      } catch (error) {
        console.error("Error in handleUserJoined:", error);
      }
    },
    [createPeerConnection, sessionCode]
  );

  const handleSignalingData = useCallback(
    async (connectionId, data) => {
      try {
        const pc = peerConnections.current[connectionId] || createPeerConnection(connectionId);

        if (data.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

          if (data.sdp.type === "offer") {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            console.log("Sending answer to:", connectionId);
            await hubConnection.current?.invoke(
              "SendSignalingData",
              sessionCode,
              JSON.stringify({ sdp: answer }),
              connectionId
            );
          }

          if (candidatesQueue.current[connectionId]) {
            candidatesQueue.current[connectionId].forEach((candidate) =>
              pc.addIceCandidate(new RTCIceCandidate(candidate))
            );
            delete candidatesQueue.current[connectionId];
          }
        }

        if (data.ice) {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(data.ice));
          } else {
            if (!candidatesQueue.current[connectionId]) {
              candidatesQueue.current[connectionId] = [];
            }
            candidatesQueue.current[connectionId].push(data.ice);
          }
        }
      } catch (error) {
        console.error("Error in handleSignalingData:", error);
      }
    },
    [createPeerConnection, sessionCode]
  );

  useEffect(() => {
    const initConnection = async () => {
      try {
        hubConnection.current = new signalR.HubConnectionBuilder()
          .withUrl(`${config.BaseUrl}/webrtc`, {
            transport: signalR.HttpTransportType.WebSockets,
          })
          .configureLogging(signalR.LogLevel.Information)
          .build();

        hubConnection.current.on("ReceiveSignalingData", (connectionId, data) =>
          handleSignalingData(connectionId, JSON.parse(data))
        );
        hubConnection.current.on("UserJoined", handleUserJoined);
        hubConnection.current.on("SessionCreated", (sessionCode) => {
          console.log("Session created successfully:", sessionCode);
        });
        hubConnection.current.on("SessionAlreadyExists", (sessionCode) => {
          console.error("Session already exists:", sessionCode);
        });
        hubConnection.current.on("SessionNotFound", () => {
          console.error("Session not found. Please check the session code.");
          alert("Session not found. Please check the session code.");
        });

        await hubConnection.current.start();
        console.log("SignalR connection started");

        if (isHost) {
         
          await hubConnection.current.invoke("CreateSession", sessionCode);
         // await hubConnection.current.invoke("JoinSession", sessionCode);
         await hubConnection.current.invoke("JoinSession", sessionCode);
        } else {
          await hubConnection.current.invoke("JoinSession", sessionCode);
        }
      } catch (err) {
        console.error("Error starting SignalR connection:", err);
      }
    };

    const getUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        console.log("Media devices started successfully");
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    initConnection();
    getUserMedia();

    return () => {
      if (hubConnection.current) {
        hubConnection.current.off("ReceiveSignalingData");
        hubConnection.current.off("UserJoined");
        hubConnection.current.stop();
      }

      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [sessionCode, isHost]);




  return ( <Layout>
     <div className="video-conference-container">
      <div
        className={`video-wrapper ${
          activeStream === localStream.current ? "active" : ""
        }`}
      >
        <h3 className="video-title">My Camera</h3>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="video-element"
          onClick={() => toggleActiveStream(localStream.current)}
        />
        <button
          className="fullscreen-button"
          onClick={() => makeFullscreen(localVideoRef.current)}
        >
          ⛶
        </button>
      </div>
      {remoteStreams.map((stream, index) => (
        <div
          key={index}
          className={`video-wrapper ${
            activeStream === stream ? "active" : ""
          }`}
        >
          <h3 className="video-title">Remote Camera {index + 1}</h3>
          <video
            autoPlay
            className="video-element"
            ref={(video) => {
              if (video) video.srcObject = stream;
            }}
            onClick={() => toggleActiveStream(stream)}
          />
          <button
            className="fullscreen-button"
            onClick={(e) => makeFullscreen(e.target.previousSibling)}
          >
            ⛶
          </button>
        </div>
      ))}
    </div>
    </Layout>
  );
};

export default VideoConference;