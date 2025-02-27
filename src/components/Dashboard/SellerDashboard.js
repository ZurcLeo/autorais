import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, Container, Paper, Button, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Store, Inventory, LocalShipping, AttachMoney, Person } from '@mui/icons-material';
import StoreOverview from '../Seller/StoreOverview';
import ProductManager from '../Seller/ProductManager';
import OrderManagement from '../Seller/OrderManagement';
import FinancialOverview from '../Seller/FinancialOverview';
import SellerProfileManagement from '../Profiles/SellerProfileManagement';

const SellerDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [pendingCommissions, setPendingCommissions] = useState(0);

//   useEffect(() => {
//     // Check profile completion status
//     checkProfileStatus();
//     // Check pending commissions
//     checkPendingCommissions();
//   }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const TabPanel = ({ children, value, index }) => (
    <Box role="tabpanel" hidden={value !== index} className="p-4">
      {value === index && children}
    </Box>
  );

  return (
    <Container maxWidth="xl">
      {!isProfileComplete && (
        <Alert 
          severity="warning" 
          className="mb-4"
          action={
            <Button color="inherit" size="small" onClick={() => setActiveTab(4)}>
              Complete Profile
            </Button>
          }
        >
          Please complete your seller profile to activate your store
        </Alert>
      )}

      {pendingCommissions > 0 && (
        <Alert 
          severity="error" 
          className="mb-4"
          action={
            <Button color="inherit" size="small" onClick={() => setActiveTab(3)}>
              View Details
            </Button>
          }
        >
          You have pending commission payments. Your account will be suspended if not paid within 15 days.
        </Alert>
      )}

      <Paper elevation={2}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          className="border-b border-gray-200"
        >
          <Tab icon={<Store />} label="Overview" />
          <Tab icon={<Inventory />} label="Products" />
          <Tab icon={<LocalShipping />} label="Orders" />
          <Tab icon={<AttachMoney />} label="Financial" />
          <Tab icon={<Person />} label="Profile" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <StoreOverview />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ProductManager />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <OrderManagement />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <FinancialOverview />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <SellerProfileManagement 
            onProfileUpdate={(status) => setIsProfileComplete(status)} 
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default SellerDashboard;