// src/config/sidebarMenu.js
import { GiHouse, GiPartyFlags, GiThreeFriends, GiTakeMyMoney, GiNewspaper, 
  GiConversation, GiPiggyBank, GiPresent, GiLockedChest } from "react-icons/gi";

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
        { path: '/posts', textKey: 'sidebar.posts', icon: <GiNewspaper /> },
        { path: '/connections', textKey: 'sidebar.friends', icon: <GiThreeFriends /> },
        { path: '/messages', textKey: 'sidebar.conversations', icon: <GiConversation /> },
        { path: '/gift', textKey: 'sidebar.gifts', icon: <GiPresent /> },
      ],
    },
    {
      id: 'financial',
      textKey: 'sidebar.financial',
      icon: <GiTakeMyMoney size={24} />,
      items: [
        { path: '/caixinha', textKey: 'sidebar.box', icon: <GiLockedChest /> },
        { path: '/contribuir', textKey: 'sidebar.contribute', icon: <GiLockedChest /> },
        { path: '/caixinha/create', textKey: 'sidebar.createBox', icon: <GiPiggyBank /> },
      ],
    },
  ];