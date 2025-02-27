// src/components/Layout/Sidebar.js
import React, {useState} from 'react';
import { IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Collapse, Toolbar, Divider } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { GiHouse, GiPartyFlags, GiThreeFriends, GiTakeMyMoney, GiNewspaper, GiConversation, GiPiggyBank, GiPresent, GiLockedChest } from "react-icons/gi";
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';  // Importação do uuid

const Sidebar = () => {
  const [openSocial, setOpenSocial] = useState(false);
  const [openFinanceiro, setOpenFinanceiro] = useState(false);
  const navigate = useNavigate();

  const handleSocialClick = () => {
    setOpenSocial(!openSocial);
  };

  const handleFinanceiroClick = () => {
    setOpenFinanceiro(!openFinanceiro);
  };

  return (
    <Drawer variant="permanent" sx={{ width: 300 }}>
      <Toolbar />
      <Box sx={{ width: 300, paddingTop: 5 }}>
        <List>
          <ListItem key={uuidv4()} onClick={() => navigate('/dashboard')}>
            <IconButton size="medium">
              <GiHouse />
            </IconButton>
            <ListItemText primary="Home" />
          </ListItem>
          <Divider />
          <ListItem key={uuidv4()} onClick={handleSocialClick}>
            <IconButton size="medium">
              <GiPartyFlags />
            </IconButton>
            <ListItemText primary="Social" />
            {openSocial ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openSocial} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem key={uuidv4()} onClick={() => navigate('/posts')}>
                <IconButton size="medium">
                  <GiNewspaper />
                </IconButton>
                <ListItemText inset primary="Postagens" />
              </ListItem>
              <ListItem key={uuidv4()} onClick={() => navigate('/connections')}>
                <IconButton size="medium">
                  <GiThreeFriends />
                </IconButton>
                <ListItemText inset primary="Amigos" />
              </ListItem>
              <ListItem key={uuidv4()} onClick={() => navigate('/messages')}>
                <IconButton size="medium">
                  <GiConversation />
                </IconButton>
                <ListItemText inset primary="Conversas" />
              </ListItem>
              <ListItem key={uuidv4()} onClick={() => navigate('/gift')}>
                <IconButton size="medium">
                  <GiPresent />
                </IconButton>
                <ListItemText inset primary="Presentes" />
              </ListItem>
            </List>
          </Collapse>
          <Divider />
          <ListItem key={uuidv4()} onClick={handleFinanceiroClick}>
            <ListItemIcon>
              <IconButton size="medium">
                <GiTakeMyMoney />
              </IconButton>
            </ListItemIcon>
            <ListItemText primary="Financeiro" />
            {openFinanceiro ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openFinanceiro} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem key={uuidv4()} onClick={() => navigate('/caixinha')}>
                <IconButton size="medium">
                  <GiLockedChest />
                </IconButton>
                <ListItemText inset primary="Caixinha" />
              </ListItem>
              <ListItem key={uuidv4()} onClick={() => navigate('/contribuir')}>
                <IconButton size="medium">
                  <GiLockedChest />
                </IconButton>
                <ListItemText inset primary="Contribuir" />
              </ListItem>
              <ListItem key={uuidv4()} onClick={() => navigate('/caixinha/create')}>
                <IconButton size="medium">
                  <GiPiggyBank />
                </IconButton>
                <ListItemText inset primary="Criar nova caixinha" />
              </ListItem>
            </List>
          </Collapse>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;