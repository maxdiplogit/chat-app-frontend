// Hooks
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";


interface ISocketContext {
    socket: Socket | null;
    connectSocket: (accessToken: string) => void;
    disconnectSocket: () => void;
    registerUserAsOnline: (userId: string) => void;
    registerUserAsOffline: (userId: string) => void;
    friendAdded: (senderUserId: string, receiverUserId: string) => void;
    friendDeleted: (senderUserId: string, receiverUserId: string) => void;
}


const SocketContext = createContext<ISocketContext | null>(null);


export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === null) {
        throw new Error('useSocket() must be used within a SocketProvider');
    }
    return context;
};


export const SocketProvider = ({ children  }: any) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    const connectSocket = (accessToken: string) => {
        const socketInstance = io("http://localhost:8080", {
            withCredentials: true,
            extraHeaders: {
                authorization: `Bearer ${ accessToken }`
            }
        });
        setSocket(socketInstance);
    };

    const disconnectSocket = () => {
        if (socket !== null) {
            socket.disconnect();
            setSocket(null);
        }
    };

    const registerUserAsOnline = (userId: string) => {
        if (socket !== null) {
            socket?.emit("registerUser", {
                userId: userId
            });
        }
    };

    const registerUserAsOffline = (userId: string) => {
        if (socket !== null) {
            socket?.emit("unRegisterUser", {
                userId: userId
            });
            socket.disconnect();
        }
    };

    const friendAdded = (senderUserId: string, receiverUserId: string) => {
        console.log("emitting friendAdded");
        if (socket !== null) {
            socket.emit("friendAdded", {
                senderUserId,
                receiverUserId
            });
        }
    };

    const friendDeleted = (senderUserId: string, receiverUserId: string) => {
        console.log("emitting friendDeleted");
        if (socket !== null) {
            socket.emit("friendDeleted", {
                senderUserId,
                receiverUserId
            });
        }
    };

    return (
        <SocketContext.Provider value={{
            socket,
            connectSocket,
            disconnectSocket,
            registerUserAsOnline,
            registerUserAsOffline,
            friendAdded,
            friendDeleted
        }}>
            { children }
        </SocketContext.Provider>
    )
};