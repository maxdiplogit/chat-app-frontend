// Hooks
import { useAppDispatch, useAppSelector } from "../../hooks/reduxActions";
import { AddFriend, DeleteFriend, GetFriendsList, GetUsersList } from "../../store/slices/actions/userActions";
import { v4 as uuid4 } from "uuid";
import { LogoutUser } from "../../store/slices/actions/authActions";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../store/SocketContext";
import { useEffect, useState } from "react";
import MessagePanel from "./MessagePanel/MessagePanel";
import Modal from '@mui/material/Modal';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import Diversity2Icon from '@mui/icons-material/Diversity2';
import AddCircleIcon from '@mui/icons-material/AddCircle';

// Styles
import './ChatDashboard.css';


const ChatDashboard = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { socket, disconnectSocket, registerUserAsOnline, registerUserAsOffline, friendAdded, friendDeleted } = useSocket();

    const userId = useAppSelector((state) => state.user._id);
    const friends = useAppSelector((state) => state.user.friends) || [];
    const allUsers = useAppSelector((state) => state.user.allUsers) || [];
    const accessToken: string = useAppSelector((state) => state.user.accessToken);

    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState({
        friendId: "",
        friendFirstName: ""
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentUsersList, setCurrentUsersList] = useState(allUsers);

    console.log(friends);

    socket?.on("serverFriendAdded", () => {
        dispatch(GetFriendsList(accessToken));
        // console.log(friends, allUsers);
        console.log("serverFriendAdded event");
    });

    socket?.on("serverFriendDeleted", () => {
        dispatch(GetFriendsList(accessToken));
        setSelectedUser({
            friendId: "",
            friendFirstName: ""
        });
        // console.log(friends, allUsers);
        console.log("serverFriendDeleted event");
    });

    useEffect(() => {
        socket?.on('updateOnlineStatus', (onlineUserIds: string[]) => {
            setOnlineUsers(onlineUserIds);
        });

        if (userId !== undefined) {
            registerUserAsOnline(userId);
        }

        return () => {
            socket?.off('updateOnlineStatus');
        };
    }, []);


    const handleAddFriend = (value: string) => {
        // console.log(value);
        dispatch(AddFriend({
            receiverUserId: value,
            accessToken: accessToken
        }));
        if (userId !== undefined) {
            friendAdded(userId, value)
        }
    };

    const handleDeleteFriend = (value: string, event: React.MouseEvent) => {
        event.stopPropagation();
        console.log(value);
        dispatch(DeleteFriend({
            receiverUserId: value,
            accessToken: accessToken
        }));
        if (userId !== undefined) {
            friendDeleted(userId, value);
        }
        setSelectedUser({
            friendId: "",
            friendFirstName: ""
        });
    };

    const handleLogout = () => {
        console.log(accessToken);
        if (userId !== undefined) {
            registerUserAsOffline(userId);
        }
        dispatch(LogoutUser(accessToken));
        disconnectSocket();
        navigate('/login');
    };

    const onUserClick = (friendId: string, friendFirstName: string) => {
        console.log(friendId, friendFirstName);
        setSelectedUser({
            friendId: friendId,
            friendFirstName: friendFirstName
        })
    };

    useEffect(() => {
        const filterUsers = () => {
            const filtered = allUsers.filter(user => `${user.firstName} ${user.lastName}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            );
            setCurrentUsersList(filtered)
        };
        if (modalOpen) {
            filterUsers();
        }
    }, [searchQuery, allUsers]);

    const handleSearchChange = (event: any) => {
        setSearchQuery(event.target.value)
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setCurrentUsersList(allUsers);
    };

    const isUserOnline = (userId: string) => onlineUsers.includes(userId);

    return (
        <div className="chat-dashboard">
            <Modal
                open={modalOpen}
                onClose={handleModalClose}
                className="chat-modal"
            >
                <div className="search-users-modal">
                    <div className="search-users-input-div">
                        <input type="text" placeholder="Search Users" onChange={handleSearchChange} />
                        <div onClick={() => setModalOpen(false)}>
                            <CloseIcon className="close-icon" />
                        </div>
                    </div>
                    <div className="users-list">
                        <ul>
                            {currentUsersList.map((user) => {
                                const friendIds = friends.map((friend: any) => friend._id);
                                const check = friendIds.includes(user._id);
                                if (!check && user._id !== userId) {
                                    return (
                                        <li key={ uuid4() }>
                                            <div>
                                                { user.firstName }
                                            </div>
                                            <div className="add-friend-button" onClick={() => handleAddFriend(user._id)}>
                                                <AddCircleIcon />
                                            </div>
                                        </li>
                                    );
                                }
                            })}
                        </ul>
                    </div>
                </div>
            </Modal>
            <div className="dashboard-header">
                <div className="chat-icon-div" onClick={ () => navigate("/") }>
                    <Diversity2Icon fontSize="large" className="chat-icon" />
                </div>
                <div>
                    <div className="chat-header-search-icon-div" onClick={() => setModalOpen(true)}>
                        <SearchIcon className="chat-header-search-icon" />
                    </div>
                    <div className="chat-header-logout-icon-div" onClick={handleLogout}>
                        <LogoutIcon className="chat-header-logout-icon" />
                    </div>
                </div>
            </div>
            <div className="dashboard-content">
                <div className="friends-panel">
                    <ul>
                        {friends.map((friend) => (
                            <li key={ uuid4() } onClick={ () => onUserClick(friend._id, friend.firstName) }>
                                <div className="friend-name-div">
                                    <div>
                                        {friend.firstName}
                                    </div>
                                    <div>
                                        { isUserOnline(friend._id) ? <FiberManualRecordIcon fontSize="small" className="user-online" /> : <FiberManualRecordIcon fontSize="small" className="user-offline" /> }
                                    </div>
                                </div>
                                <div className="delete-user-icon" key={ uuid4() } onClick={(event: React.MouseEvent) => handleDeleteFriend(friend._id, event)}>
                                    <DeleteIcon />
                                </div>
                            </li>
                        ))}
                    </ul>
                    {friends.length === 0 && <div className="no-friends"><div>No Friends</div></div>}
                </div>
                <MessagePanel selectedUser={ selectedUser } onlineUsers={onlineUsers} />
            </div>
        </div>
    );
};


export default ChatDashboard;