// src/config/sidebarMenu.js
import React from "react";
import { 
  GiHouse, 
  GiPartyFlags, 
  GiThreeFriends, 
  GiTakeMyMoney, 
  GiNewspaper, 
  GiConversation, 
  GiPiggyBank, 
  GiPresent, 
  GiLockedChest 
} from "react-icons/gi";
import { MdSupportAgent } from "react-icons/md";

export const sidebarMenu = [
  {
    id: 'home',
    path: '/dashboard',
    icon: <GiHouse size={24} />,
    textKey: 'sidebar.home',
  },
  
  {
    id: 'social',
    textKey: 'sidebar.social',
    icon: <GiPartyFlags size={24} />,
    items: [
      {
        path: '/posts', 
        textKey: 'sidebar.posts', 
        icon: <GiNewspaper size={20} />,
      },
      {
        path: '/connections', 
        textKey: 'sidebar.friends', 
        icon: <GiThreeFriends size={20} />,
      },
      {
        path: '/messages', 
        textKey: 'sidebar.conversations', 
        icon: <GiConversation size={20} />,
      },
      {
        path: '/gift', 
        textKey: 'sidebar.gifts', 
        icon: <GiPresent size={20} />,
      },
    ],
  },
  
  {
    id: 'financial',
    textKey: 'sidebar.financial',
    icon: <GiTakeMyMoney size={24} />,
    items: [
      {
        path: '/caixinha', 
        textKey: 'sidebar.box', 
        icon: <GiLockedChest size={20} />,
      },
      {
        path: '/contribuir', 
        textKey: 'sidebar.contribute', 
        icon: <GiLockedChest size={20} />,
      },
      {
        path: '/caixinha/create', 
        textKey: 'sidebar.createBox', 
        icon: <GiPiggyBank size={20} />,
      },
    ],
  },
  
  {
    id: 'support',
    path: '/support',
    icon: <MdSupportAgent size={24} />,
    textKey: 'sidebar.support',
  },
];