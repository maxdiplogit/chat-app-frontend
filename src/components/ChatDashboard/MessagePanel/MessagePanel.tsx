// Hooks
import { useEffect, useState } from "react";
import { useSocket } from "../../../store/SocketContext";
import { useAppSelector } from "../../../hooks/reduxActions";
import { Modal } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// Utils
import axios from '../../../utils/axios';

// Styles
import "./MessagePanel.css";


const MessagePanel = (props: any) => {
    const { selectedUser: friend, onlineUsers: onlineUsersList } = props;
    const friendId = friend.friendId;

    const { socket } = useSocket();

    const userId = useAppSelector((state) => state.user._id);
    const accessToken = useAppSelector((state) => state.user.accessToken);

    const [messages, setMessages] = useState<any>([]);
    const [message, setMessage] = useState("");
    const [file, setFile] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [friendTyping, setFriendTyping] = useState(false);
    const [selectedPreviewFile, setSelectedPreviewFile] = useState("");
    const [selectedPreviewFileType, setSelectedPreviewFileType] = useState("");
    const [previewModalOpen, setPreviewModalOpen] = useState(false);

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
            setMessages((prevMessages: any) => [...prevMessages, newMessage])
        });

        return () => {
            socket?.off('conversations');
            socket?.off('receiveMessage');
            socket?.off('typing');
            socket?.off('stopTyping');
        };
    }, [friend]);

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

            try {
                const res = await axios.post('/upload', formData, {
                    headers: {
                        "content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${ accessToken }`
                    }
                });

                const { fileUrl, fileType } = res.data;

                socket?.emit('sendMessage', {
                    senderUserId: userId,
                    receiverUserId: friend.friendId,
                    content: message,
                    fileType,
                    fileUrl
                });
                setMessage('');
                setFile(null);
            } catch (err) {
                console.log('Error uploading file: ', err);
            }
        } else {
            socket?.emit('sendMessage', {
                senderUserId: userId,
                receiverUserId: friend.friendId,
                content: message,
            });
            setMessage('');
            handleStopTyping();
        }
    };

    const handleFileChange = (event: any) => {
        setFile(event.target.files[0]);
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
            const daysAgo = Math.floor(timeDifference / millisecondsInADay);
            return `${daysAgo} days ago`;
        } else if (timeDifference < 3 * millisecondsInAWeek) {
            const weeksAgo = Math.floor(timeDifference / millisecondsInAWeek);
            return `${weeksAgo} weeks ago`;
        } else {
            const monthsAgo = Math.floor(timeDifference / millisecondsInAMonth);
            return `${monthsAgo} months ago`;
        }
    };

    const extractLinks = (text: string) => {
        const urlRegex = /https?:\/\/[^\s]+/g;
        return text.match(urlRegex) || [];
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
                        <div>
                            { friend.friendFirstName }
                        </div>
                        <div>
                            { isUserOnline ? <FiberManualRecordIcon fontSize="small" className="user-online" /> : <FiberManualRecordIcon fontSize="small" className="user-offline" /> }
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
                                        <video src={selectedPreviewFile} controls style={{ maxWidth: '600px' }}>
                                            Your browser does not support the video tag.
                                        </video>
                                    )}
                                    {selectedPreviewFileType === 'document' && (
                                        <iframe
                                        src={selectedPreviewFile}
                                        title="document preview"
                                        style={{ width: '100%', height: '500px' }}
                                        ></iframe>
                                    )}
                                </div>
                                <div onClick={() => setPreviewModalOpen(false)}>
                                    <CloseIcon className="close-icon" />
                                </div>
                            </div>
                        </Modal>
                        { messages.length === 0 && <div>Start conversation</div> }
                        {messages.map((msg: any) => {
                            const links = extractLinks(msg.content);
                            const isFile = msg.fileType && ['application', 'document', 'text'].includes(msg.fileType);

                            return <div className={msg.senderUserId === userId ? "message-right" : "message-left"}>
                                <div className="message">
                                    <div className="message-header">
                                        {msg.senderUserId === userId ? "You" : `${friend.friendFirstName}`}
                                    </div>
                                    {links.length !== 0 && links.map((link) => (
                                        <div>
                                            <a href={link} target="_blank">{link}</a>
                                        </div>
                                    ))}
                                    {msg.fileUrl && (
                                        <div className="message-document" onClick={() => handleFileSelected(msg.fileUrl, msg.fileType)}>
                                            {msg.fileType === 'image' && <img src={msg.fileUrl} alt="file" style={{ maxWidth: '200px' }} />}
                                            {msg.fileType === 'video' && (
                                                <video src={msg.fileUrl} controls style={{ maxWidth: '200px' }}>
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
                                            {/* {msg.fileType === 'document' && (
                                                <iframe
                                                src={msg.fileUrl}
                                                title="document preview"
                                                style={{ width: '100%', height: '500px' }}
                                                ></iframe>
                                            )} */}
                                        </div>
                                    )}
                                    <div className="message-content">
                                        <div>
                                            {msg.content}
                                        </div>
                                        <div style={{ color: '#656565' }}>
                                            {formatTimestamp(msg.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        })}
                        {friendTyping && <div className="is-typing">
                            Typing...
                        </div>}
                    </div>
                    <div className="message-panel-form">
                        <input type="text" placeholder="Message..." value={ message } onChange={ (e) => setMessage(e.target.value) } onKeyDown={handleTyping} onKeyUp={handleStopTyping} onBlur={handleStopTyping}/>
                        <div className="action-buttons">
                            <input type="file" onChange={handleFileChange} name="file" />
                            <div className="send-message-icon-div" onClick={ sendMessage }>
                                <SendIcon className="send-message-icon" />
                            </div>
                        </div>
                    </div>
                </>
            : 
                <div>
                    No Conversation Selected
                </div>
            }
        </div>
    );
};


export default MessagePanel;