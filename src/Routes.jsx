
import {useContext} from "react";
import {UserContext} from "./UserContext.jsx";
import RegisterAndLoginForm from "./screens/RegisterAndLoginForm.jsx";
import Chat from "./screens/Chat.jsx";

export default function Routes() {
  const {loggedInUsername, id} = useContext(UserContext);
  if (loggedInUsername) {
    return <Chat/>
  }
  return(
      <RegisterAndLoginForm/>

  )
  
}