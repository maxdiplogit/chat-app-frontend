// Hooks
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../../store/SocketContext";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxActions";
import { LinearProgress, Modal } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { LogoutUser } from "../../../store/slices/actions/authActions";

// Utils
import axios from '../../../utils/axios';

// Styles
import "./MessagePanel.css";


const MessagePanel = (props: any) => {
    const { selectedUser: friend, onlineUsers: onlineUsersList } = props;
    const { friendId } = friend;

    const dispatch = useAppDispatch();

    const { socket, registerUserAsOffline } = useSocket();

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const userId = useAppSelector((state) => state.user._id);
    const accessToken = useAppSelector((state) => state.user.accessToken);

    const [messages, setMessages] = useState<any>([]);
    const [message, setMessage] = useState("");
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [friendTyping, setFriendTyping] = useState(false);
    const [selectedPreviewFile, setSelectedPreviewFile] = useState("");
    const [selectedPreviewFileType, setSelectedPreviewFileType] = useState("");
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [fileSelectedError, setFileSelectedError] = useState(false);

    useEffect(() => {
        socket?.on('typing', ({ userId: typingUserId }) => {
            if (typingUserId === friendId) {
                setFriendTyping(true);
            }
        });

        socket?.on('stopTyping', ({ userId: typingUserId }) => {
            if (typingUserId === friendId) {
                setFriendTyping(false);
            }
        });

        socket?.emit('loadConversations', {
            userId,
            friendId: friend.friendId
        });

        socket?.on('conversations', (conversations) => {
            console.log("Conversations: ", conversations);
            setMessages(conversations);
        });

        socket?.on('receiveMessage', (newMessage) => {
            console.log("New Message: ", newMessage);
            if (newMessage.senderUserId === userId || newMessage.senderUserId === friendId) {
                setMessages((prevMessages: any) => [...prevMessages, newMessage])
            }
        });

        return () => {
            socket?.off('conversations');
            socket?.off('receiveMessage');
            socket?.off('typing');
            socket?.off('stopTyping');
        };
    }, [friend]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleTyping = () => {
        if (!isTyping) {
            socket?.emit('typing', { userId, friendId });
            setIsTyping(true);
        }
    };

    const handleStopTyping = () => {
        if (isTyping) {
            socket?.emit('stopTyping', { userId, friendId });
            setIsTyping(false);
        }
    };

    const sendMessage = async () => {
        if (file) {
            const formData = new FormData();
            formData.append("userFile", file);
            console.log(file);

            try {
                if (file["type"] === "image/heic") {
                    setFile(null);
                    setFileName("");
                } else {
                    setSending(true);
                    const res = await axios.post('/upload', formData, {
                        headers: {
                            "content-Type": "multipart/form-data",
                            "Authorization": `Bearer ${ accessToken }`
                        }
                    });
    
                    console.log(res);
    
                    const { fileUrl, fileType } = res.data;
    
                    socket?.emit('sendMessage', {
                        senderUserId: userId,
                        receiverUserId: friend.friendId,
                        content: message,
                        fileType,
                        fileUrl
                    });
                    setSending(false);
                    setMessage("");
                    setFile(null);
                    setFileName("");
                }
            } catch (err: any) {
                console.log('Error uploading file: ', err);
                if (err.response.status === 403 || err.response.status === 401) {
                    if (userId !== undefined) {
                        registerUserAsOffline(userId);
                    }
                    dispatch(LogoutUser(accessToken));
                }
            }
        } else {
            if (message.length !== 0) {
                try {
                    const res = await axios.get("/auth/verifyToken", {
                        headers: {
                            "Authorization": `Bearer ${ accessToken }`
                        }
                    });
                    console.log(res);
                    setSending(true);
                    socket?.emit('sendMessage', {
                        senderUserId: userId,
                        receiverUserId: friend.friendId,
                        content: message,
                    });
                    setSending(false);
                } catch (err: any) {
                    console.log("Error sending message: ", err);
                    if (err.response.status === 403 || err.response.status === 401) {
                        if (userId !== undefined) {
                            registerUserAsOffline(userId);
                        }
                        dispatch(LogoutUser(accessToken));
                    }
                } 
            }
            setMessage('');
            handleStopTyping();
        }
    };

    const handleFileChange = (event: any) => {
        console.log(event.target.files);
        if (event.target.files.length === 0) {
            setFileSelectedError(false);
            setFileName("");
            setFile(null);
        } else {
            if (event.target.files[0].type === "image/heic") {
                setFileSelectedError(true);
                setFileName("");
                setFile(null);
            } else {
                setFileSelectedError(false);
                setFileName(event.target.files[0].name);
                setFile(event.target.files[0]);
            }
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const messageDate: any = new Date(timestamp);
        const currentDate: any = new Date();
        
        const timeDifference = currentDate - messageDate;
        const millisecondsInADay = 24 * 60 * 60 * 1000;
        const millisecondsInAWeek = 7 * millisecondsInADay;
        const millisecondsInAMonth = 30 * millisecondsInADay;

        const hours = messageDate.getHours().toString().padStart(2, '0');
        const minutes = messageDate.getMinutes().toString().padStart(2, '0');
        
        if (timeDifference < millisecondsInADay && currentDate.getDate() === messageDate.getDate()) {
            return `${hours}:${minutes} Today`;
        } else if (timeDifference < millisecondsInAWeek) {
            const daysAgo = Math.floor(timeDifference / millisecondsInADay) + 1;
            if (daysAgo === 1) {
                return `1 day ago`;
            }
            return `${daysAgo} days ago`;
        } else if (timeDifference < 3 * millisecondsInAWeek) {
            const weeksAgo = Math.floor(timeDifference / millisecondsInAWeek) + 1;
            return `${weeksAgo} weeks ago`;
        } else {
            const monthsAgo = Math.floor(timeDifference / millisecondsInAMonth) + 1;
            return `${monthsAgo} months ago`;
        }
    };

    const extractLinks = (text: string) => {
        const urlRegex = /https?:\/\/[^\s,;'"()<>[\]{}]+/g;
        const matches = text.match(urlRegex) || [];
        return Array.from(new Set(matches));
    };

    const handleFileSelected = (url: string, fileType: string) => {
        setSelectedPreviewFileType(fileType);
        setSelectedPreviewFile(url);
        if (fileType === "image" || fileType === "video") {
            setPreviewModalOpen(true);
        }
    };

    const handleDownload = (url: string) => {
        window.open(url, '_blank');
    };

    const isUserOnline = onlineUsersList.includes(friend.friendId);

    return (
        <div className="message-panel">
            {(friend.friendId !== "" && friend.firstName !== "") ?    
                <>
                    <div className="message-panel-header">
                        <div className="friend-name">
                            { friend.friendFirstName }
                        </div>
                        <div className="friend-status">
                            { isUserOnline ? <FiberManualRecordIcon className="user-online" /> : <FiberManualRecordIcon fontSize="small" className="user-offline" /> }
                        </div>
                    </div>
                    <div className="message-panel-conversation">
                        <Modal
                            open={previewModalOpen}
                            onClose={() => setPreviewModalOpen(false)}
                            className="preview-modal"
                        >
                            <div className="preview-modal-div">
                                <div className="message-document">
                                    {selectedPreviewFileType === 'image' && <img src={selectedPreviewFile} alt="file" style={{ maxWidth: '600px' }} />}
                                    {selectedPreviewFileType === 'video' && (
                                        <video src={selectedPreviewFile} controls style={{ maxWidth: '600px', maxHeight: '500px' }}>
                                            Your browser does not support the video tag.
                                        </video>
                                    )}
                                </div>
                                <div onClick={() => setPreviewModalOpen(false)}>
                                    <CloseIcon className="close-icon" />
                                </div>
                            </div>
                        </Modal>
                        { messages.length === 0 && <div className="start-conversation">Start conversation</div> }
                        {messages.map((msg: any) => {
                            const links = extractLinks(msg.content);
                            const isFile = msg.fileType && ['application', 'document', 'text'].includes(msg.fileType);

                            return <div className={msg.senderUserId === userId ? "message-right" : "message-left"}>
                                <div className={msg.senderUserId === userId ? `message-div-right` : `message-div-left`}>
                                    {/* <div className="message-header">
                                        <div>
                                            {msg.senderUserId === userId ? "you" : `${friend.friendFirstName}`}
                                        </div>
                                    </div> */}
                                    {links.length !== 0 && links.map((link) => (
                                        <div className="link">
                                            <a href={link} target="_blank">{link}</a>
                                        </div>
                                    ))}
                                    {msg.fileUrl && (
                                        <div className="message-document" onClick={() => handleFileSelected(msg.fileUrl, msg.fileType)}>
                                            {msg.fileType === 'image' && <img src={msg.fileUrl} alt="file" className="image-message" />}
                                            {msg.fileType === 'video' && (
                                                <video src={msg.fileUrl} className="video-message">
                                                    Your browser does not support the video tag.
                                                </video>
                                            )}
                                            {isFile && <div className="default-file-div" onClick={() => handleDownload(msg.fileUrl)}>
                                                <div className="default-file-div-icon">
                                                    <InsertDriveFileIcon className="default-file-icon" />
                                                </div>
                                                <div>
                                                    Click to download
                                                </div>
                                            </div>}
                                        </div>
                                    )}
                                    <div className="message-content">
                                        <div>
                                            {msg.content}
                                        </div>
                                        <div style={{ color: 'rgb(113, 113, 113)', fontSize: '10px', marginTop: '10px' }}>
                                            {formatTimestamp(msg.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        })}
                    <div ref={messagesEndRef} />
                    </div>
                    {friendTyping && <div className="is-typing">
                        Typing...
                    </div>}
                    {sending && <div>
                        <LinearProgress />
                    </div>}
                    <div className="message-panel-form">
                        <div className="message-box">
                            <input type="text" placeholder="Message..." value={ message } onChange={ (e) => setMessage(e.target.value) } onKeyDown={handleTyping} onKeyUp={handleStopTyping} onBlur={handleStopTyping}/>
                        </div>
                        <div className="action-buttons">
                            <div className="upload-button-div">
                                <label htmlFor="upload-button">
                                    <FileUploadIcon fontSize="medium" />
                                </label>
                                <input id="upload-button" type="file" onChange={handleFileChange} name="file" />
                            </div>
                            <div className="send-message-icon-div" onClick={ sendMessage }>
                                <SendIcon className="send-message-icon" fontSize="inherit" />
                            </div>
                        </div>
                    </div>
                    {fileName.length !== 0 && <div className="file-selected">
                        File Selected: {fileName}
                    </div>}
                    {fileSelectedError && <div className="file-selected-error">
                        HEIC files are not supported
                    </div>}
                </>
            : 
                <div className="no-conversation">
                    No Conversation Selected
                </div>
            }
        </div>
    );
};


export default MessagePanel;