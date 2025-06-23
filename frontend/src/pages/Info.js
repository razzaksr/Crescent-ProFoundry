// InstructionsPage.js
import React from "react";
import { Typography, Card, CardContent, Box, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Timer, List as ListIcon, ArrowUpCircle, Flag, CircleDot, ArrowLeftCircle, ArrowRightCircle, Columns } from "lucide-react";

const InstructionsPage = () => {
  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3, bgcolor: "#ffffff" }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: "#0c83c8", fontWeight: "bold" }}
      >
        Test Instructions
      </Typography>
      <Card sx={{ mb: 3, p: 2, bgcolor: "#0c83c8" }}>
        <CardContent>
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            Please follow the instructions carefully to ensure a smooth testing experience:
          </Typography>
        </CardContent>
      </Card>
      <List>
        <ListItem>
          <ListItemIcon>
            <Timer style={{ color: "#fc7a46" }} />
          </ListItemIcon>
          <ListItemText primary="This is a timed test; the running time is displayed on the top left corner of the screen." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <ListIcon style={{ color: "#fc7a46" }} />
          </ListItemIcon>
          <ListItemText primary="The bar above the question text displays the question numbers in the current section of the test. You can move to any question by clicking on the respective number." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <ArrowUpCircle style={{ color: "#fc7a46" }} />
          </ListItemIcon>
          <ListItemText primary="The question screen displays the question number along with the question and respective options." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Flag style={{ color: "#fc7a46" }} />
          </ListItemIcon>
          <ListItemText primary="The top right of the section above the question has an option to mark the question for review. You can later view the marked questions." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CircleDot style={{ color: "#fc7a46" }} />
          </ListItemIcon>
          <ListItemText primary="You can mark or unmark any option you have chosen by tapping on the respective option." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <ArrowLeftCircle style={{ color: "#fc7a46" }} />
          </ListItemIcon>
          <ListItemText primary="The bottom left corner contains the option to move to the previous question." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <ArrowRightCircle style={{ color: "#fc7a46" }} />
          </ListItemIcon>
          <ListItemText primary="The bottom right corner contains the option to move to the next question." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Columns style={{ color: "#fc7a46" }} />
          </ListItemIcon>
          <ListItemText primary="You can jump between sections (if allowed by the tutor) by choosing the section in the bottom center dropdown." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <ArrowUpCircle style={{ color: "#fc7a46" }} />
          </ListItemIcon>
          <ListItemText primary="You can submit the test at any point by clicking the 'Submit' button on the top right corner of the screen." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Flag style={{ color: "#fc7a46" }} />
          </ListItemIcon>
          <ListItemText primary="Before submission, the screen shows a confirmation pop-up with the total number of questions in the test, questions answered, and questions marked for review." />
        </ListItem>
      </List>
    </Box>
  );
};

export default InstructionsPage;