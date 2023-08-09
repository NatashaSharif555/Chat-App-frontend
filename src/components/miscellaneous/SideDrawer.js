// import { useState,useEffect } from "react";
import { useState } from "react";
import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import axios from "axios";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useHistory } from "react-router-dom";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../miscellaneous/ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../../config/ChatLogics";
import { ChatState } from "../../Context/ChatProvider";
import UserListItem from "../userAvatar/UserListItem";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    user,
    notification,
    setNotification,
    chats,
    setChats,
    setSelectedChat,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async (event) => {
    setSearch(event.target.value);
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 1000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      console.log(data);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);

      const user = JSON.parse(localStorage.getItem("user")); // getting data from localStorage
      const token = user.token;

      const headers = new Headers();
      headers.append("Content-type", "application/json");
      headers.append("Authorization", `Bearer ${token}`);

      const body = JSON.stringify({ userId });

      const response = await fetch(`/api/chat`, {
        method: "POST",
        headers,
        body,
      });

      if (response.ok) {
        const data = await response.json();
        if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
        setSelectedChat(data);
      } else {
        throw new Error("Failed to fetch the chat");
      }

      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        {/* Search User Input */}
        <Box d="flex" alignItems="center" flex="1">
          <Tooltip
            label="Search Users to chat"
            hasArrow
            placement="bottom-start"
          >
            <Box>
              <Button variant="ghost" onClick={onOpen}>
                <i className="fas fa-search"></i>
                <Text d={{ base: "none", md: "flex" }} px={4}>
                  Search User
                </Text>
              </Button>
            </Box>
          </Tooltip>
        </Box>

        {/* Centered Text */}
        <Text
          fontSize="2xl"
          fontFamily="Work sans"
          fontWeight="bold"
          textAlign="center"
          flex="1"
        >
          Talk-A-Tive
        </Text>

        {/* Profile Icon and Notification Bell */}
        <Box d="flex" alignItems="center">
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>

      {/* Rest of your code */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={handleSearch}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((users) => (
                <UserListItem
                  key={users._id}
                  user={users}
                  handleFunction={() => accessChat(users._id)}
                />
              ))
            )}
            <ChatLoading />
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
