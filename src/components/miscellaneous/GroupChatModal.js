import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const { user, chats, setChats } = ChatState();

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]); // Clear search results if query is empty

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
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
    // try {
    //     setLoading(true);

    //     const user = JSON.parse(localStorage.getItem("user")); // getting data from localStorage
    //     const token = user.token;

    //     const headers = new Headers();
    //     headers.append("Authorization", `Bearer ${token}`);

    //     const response = await fetch(`/api/user?search=${search}`, {
    //       method: "GET",
    //       headers,
    //     });

    //     if (response.ok) {
    //       const data = await response.json();
    //       console.log(data);
    //       setLoading(false);
    //       setSearchResult(data);
    //     } else {
    //       throw new Error("Failed to load the search results");
    //     }
    //   } catch (error) {
    //     toast({
    //       title: "Error Occurred!",
    //       description: "Failed to Load the Search Results",
    //       status: "error",
    //       duration: 5000,
    //       isClosable: true,
    //       position: "bottom-left",
    //     });
    //   }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please fill all the feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]);
      onClose();
      toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Failed to Create the Chat!",
        description: error.response.data,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
    // try {
    //     const user = JSON.parse(localStorage.getItem("user")); // getting data from localStorage
    //     const token = user.token;

    //     const headers = new Headers();
    //     headers.append("Content-type", "application/json");
    //     headers.append("Authorization", `Bearer ${token}`);

    //     const requestBody = JSON.stringify({
    //       name: groupChatName,
    //       users: JSON.stringify(selectedUsers.map((u) => u._id)),
    //     });

    //     const response = await fetch(`/api/chat/group`, {
    //       method: "POST",
    //       headers,
    //       body: requestBody,
    //     });

    //     if (response.ok) {
    //       const data = await response.json();
    //       setChats([data, ...chats]);
    //       onClose();
    //       toast({
    //         title: "New Group Chat Created!",
    //         status: "success",
    //         duration: 5000,
    //         isClosable: true,
    //         position: "bottom",
    //       });
    //     } else {
    //       const errorData = await response.json();
    //       throw new Error(errorData);
    //     }
    //   } catch (error) {
    //     toast({
    //       title: "Failed to Create the Chat!",
    //       description: error.message,
    //       status: "error",
    //       duration: 5000,
    //       isClosable: true,
    //       position: "bottom",
    //     });
    //   }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users eg: Natasha, Mona, Arslan"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {
              <Box w="100%" d="flex" flexWrap="wrap">
                {selectedUsers.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleDelete(u)}
                  />
                ))}
              </Box>
            }
            {loading ? (
              // <ChatLoading />
              <div>Loading...</div>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="blue">
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
