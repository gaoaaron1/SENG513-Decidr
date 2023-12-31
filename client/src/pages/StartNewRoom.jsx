import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import LoadingBackdrop from "../components/global/LoadingBackdrop";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import "./StartNewRoom.css";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { SocketContext } from "../contexts/SocketContext";
import { createRoom } from "../api/createRoom";

const StartNewRoom = () => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [duration, setDuration] = useState(5);
  const [votes, setVotes] = useState(1);
  const [roomID, setroomID] = useState(Math.random().toString(36).substring(7)); // TODO: Generate room code
  const [copySuccess, setCopySuccess] = useState(false); // Notifies user that room code has been copied by changing button text

  const { userDetails, updateUserDetails } = useContext(UserContext);
  const navigate = useNavigate();

  // Access the socket instance from SocketContext
  const socket = useContext(SocketContext);

  useEffect(() => {
    // if user details are not present, redirect to home page
    if (!userDetails?.userID && !userDetails?.nickname) {
      navigate("/");
      alert("User not found");
    }
    // setSessionCode(generateSessionCode());
  }, []);

  const handleCreate = async () => {
    if (!question) {
      setError("Please enter a question.");
      return;
    }
    setPending(true);
    console.log("SOCKET: ", socket);

    const userID = await createRoom({
      roomID: roomID,
      socketID: socket.id,
      username: userDetails.nickname,
      profilePicture: userDetails.profilePicture,
      question: question,
      endTime: new Date(Date.now() + duration * 60000),
      numberOfVotesPerUser: votes,
    });

    updateUserDetails({
      roomID: roomID,
      userID: userID,
    });

    socket.emit("join_room", roomID);

    navigate("/room");
  };

  const handleBack = () => {
    navigate("/nickname");
  };

  const handleDurationChange = (event) => {
    setDuration(event.target.value);
  };
  const handleVotesChange = (event) => {
    setVotes(event.target.value);
  };

  // Function to handle copying room code to clipboard
  const handleCopy = () => {
    navigator.clipboard
      .writeText(roomID)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <>
      <Box>
        <Grid className="container alignInitial">
          <Box className="contentBox widthConstraint">
            <Box className="headerBox">
              <IconButton className="menuIcon" onClick={handleBack}>
                <ArrowBackOutlinedIcon />
              </IconButton>
              <Typography variant="h6">
                {userDetails?.nickname}'s new room
              </Typography>
            </Box>
            <Box className="flexGrowBox">
              <Box width={"100%"}>
                <Grid margin={1}>
                  <Typography variant="h6">Your room code is:</Typography>
                  <Box className="room">
                    <Typography
                      variant="h4"
                      textAlign={"center"}
                      fontStyle={"italic"}
                      marginTop={1.5}
                      textTransform={"uppercase"}
                    >
                      {roomID}
                    </Typography>
                    <Tooltip title={copySuccess ? "Copied" : "Click to copy"}>
                      <IconButton onClick={handleCopy}>
                        <ContentCopyOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
                <Grid margin={1}>
                  <Typography variant="h6">Enter your question:</Typography>
                  <TextField
                    fullWidth
                    label="Enter your Question "
                    variant="outlined"
                    value={question}
                    onChange={(e) => {
                      setQuestion(e.target.value);
                      setError("");
                    }}
                    error={error ? true : false}
                    helperText={error}
                  />
                </Grid>
                <Grid margin={1}>
                  <Typography variant="h6">Enter room duration:</Typography>
                  <FormControl fullWidth>
                    <InputLabel>Duration</InputLabel>
                    <Select
                      value={duration}
                      label="Duration"
                      onChange={handleDurationChange}
                    >
                      {[...Array(10).keys()].map((num) => (
                        <MenuItem key={num} value={num + 1}>
                          {num + 1} min
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid margin={1} marginBottom={2}>
                  <Typography variant="h6">Votes per person:</Typography>
                  <FormControl fullWidth>
                    <InputLabel>Votes</InputLabel>
                    <Select
                      value={votes}
                      label="Votes"
                      onChange={handleVotesChange}
                    >
                      {[...Array(5).keys()].map((num) => (
                        <MenuItem key={num} value={num + 1}>
                          {num + 1}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleCreate}
                  fullWidth
                  className="sessionButton"
                >
                  Start Room
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>

        <LoadingBackdrop open={pending} />
      </Box>
    </>
  );
};

export default StartNewRoom;
