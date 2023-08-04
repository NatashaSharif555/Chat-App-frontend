import { Box } from "@chakra-ui/layout";
// import { ChatState } from "../Context/ChatProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import MyChats from "../components/miscellaneous/MyChats";
import ChatBox from "../components/miscellaneous/ChatBox";
// import ChatProvider from "../Context/ChatProvider";
import ChatProvider from "../Context/ChatProvider";

const ChatPage = () => {
  //const { user } = ChatState();

  return (
    <div style={{ width: "100%" }}>
      <ChatProvider>
        <SideDrawer />
      </ChatProvider>

      <Box d="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
      <ChatProvider> <MyChats /></ChatProvider>
        <ChatBox />
      </Box>
    </div>
  );
};

export default ChatPage;
