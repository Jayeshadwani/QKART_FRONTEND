import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import {useHistory} from "react-router-dom"

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory()
  const handleClick = () => history.push("/")
  const username = localStorage.getItem("username")

  const routeToLogin = () => history.push("/login")
  const routeToRegister = () => history.push("/register")

  console.log(username)

  const handleLogOut = () =>
  {
    localStorage.setItem("username","");
    localStorage.setItem("password","");
    localStorage.setItem("token","");

    window.location.reload()
  }
    
    if(hasHiddenAuthButtons)
    {
      return (
        <Box className="header">
          <Box className="header-title">
              <img src="logo_light.svg" alt="QKart-icon"></img>
          </Box>
          <Button
            className="explore-button"
            startIcon={<ArrowBackIcon />}
            variant="text"
            onClick={handleClick}
          >
            Back to explore
          </Button>
        </Box>
      );
    }
    else
    {
      return(
        <Box className="header">
          <Box className="header-title">
              <img src="logo_light.svg" alt="QKart-icon" />
          </Box>
          <Stack direction="row" spacing={1} alignItems="center"> 
          { username ? 
          <>
              <Avatar src="avatar.png" alt={localStorage.getItem("username") || "profile" } / > 
              <p className="username-text">{username}</p>
              <Button
              variant="text"
              onClick={handleLogOut}
              >LOGOUT
              </Button>
          </>
          : <>
              <Button
              type="text"
              onClick={routeToLogin}
              >LOGIN
              </Button>
              <Button
              type="primary"
              variant="contained"
              onClick={routeToRegister}
              >REGISTER
              </Button>
            </> }
          </Stack> 
        </Box>
      )
      
    }
};

export default Header;
