import React, { Fragment, useRef, useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import PropTypes, { resetWarningCache } from "prop-types";
import classNames from "classnames";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Drawer,
  List,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Hidden,
  Tooltip,
  Box,
  withStyles,
  isWidthUp,
  withWidth,
  Popover,
} from "@material-ui/core";
import DashboardIcon from "@material-ui/icons/Dashboard";
import ImageIcon from "@material-ui/icons/Image";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";
import MenuIcon from "@material-ui/icons/Menu";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import MessagePopperButton from "./MessagePopperButton";
import SideDrawer from "./SideDrawer";
import Balance from "./Balance";
import NavigationDrawer from "../../../shared/components/NavigationDrawer";
import Amplify, {API,graphqlOperation, Auth,Storage} from "aws-amplify";
import 'bootstrap/dist/css/bootstrap.css';
import MessageListItem from "./MessageListItem";
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import * as queries from '../../../graphql/queries';
import MessageIcon from "@material-ui/icons/Message";
const styles = (theme) => ({
  
  appBar: {
    boxShadow: theme.shadows[6],
    backgroundColor: theme.palette.common.white,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      marginLeft: 0,
    },
  },
  appBarToolbar: {
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    [theme.breakpoints.up("md")]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
    [theme.breakpoints.up("lg")]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
  },
  accountAvatar: {
    backgroundColor: theme.palette.secondary.main,
    height: 24,
    width: 24,
    cursor:"pointer",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      marginLeft: theme.spacing(1.5),
      marginRight: theme.spacing(1.5),
    },
  },
  messageIcon:{
    width:24,
    height:24,
    cursor:"pointer",
    marginLeft: 10,
    marginRight: 10,

  },
  drawerPaper: {
    height: "100%vh",
    whiteSpace: "nowrap",
    border: 0,
    width: theme.spacing(7),
    overflowX: "hidden",
    marginTop: theme.spacing(8),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
    backgroundColor: theme.palette.common.black,
  },
  smBordered: {
    [theme.breakpoints.down("xs")]: {
      borderRadius: "50% !important",
    },
  },
  menuLink: {
    textDecoration: "none",
    color: theme.palette.text.primary,
  },
  iconListItem: {
    width: "auto",
    borderRadius: theme.shape.borderRadius,
    paddingTop: 11,
    paddingBottom: 11,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  textPrimary: {
    color: theme.palette.primary.main,
  },
  mobileItemSelected: {
    backgroundColor: `${theme.palette.primary.main} !important`,
  },
  brandText: {
    fontFamily: "'Baloo Bhaijaan', cursive",
    fontWeight: 400,
    cursor:"pointer"
  },
  username: {
    paddingLeft: 0,
    paddingRight: theme.spacing(2),
  },
  justifyCenter: {
    justifyContent: "center",
  },
  permanentDrawerListItem: {
    justifyContent: "center",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  dropdown:{
    position: "relative",
    display: "inline-block",
    
  },
  dropbtn:{
    backgroundColor: "#4CAF50",
    color: 'white',
    padding: "16",
    fontSize: "16",
    border: "none"
  },
  dropdownContent:{
    display: "none",
    position: "absolute",
    backgroundColor: "#f1f1f1",
    minWidth: "160",
    boxShadow: "0 8 16 0 rgba(0,0,0,0.2)",
    zIndex: 1,
  },
  dropdown: {
    display: "block"
  },
  hideImage : {
    display:"none"
  },
  showImage:{
    display:"block",
    width:40,
    height:40,
  }

});
function NavBar(props) {
  const { selectedTab, messages, classes, width, openAddBalanceDialog } = props;
  // Will be use to make website more accessible by screen readers
  const links = useRef([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [rankingImage, setRankingImage] = useState("")
  const [showAndHide, setShowAndHide] = useState("classes.hideImage")
  const openMobileDrawer = useCallback(() => {
    setIsMobileOpen(true);
  }, [setIsMobileOpen]);

  async function logOut(){
    try {
        await Auth.signOut();
        window.location.href = "/"
    } catch (error) {
        console.log('error signing out: ', error);
    }
  }
 
  const history = useHistory();
  const goListPage = () => history.push('/c/dashboard')
  const goLandingPage = () => history.push("/");
  const viewList = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  useEffect(()=>{
    async function fetchUser() {
      const user = await Auth.currentUserInfo()
      if(!user){
        window.location.href = "/"
      }
      else {
        const id = user.attributes.email;
        fetchToken(id)
      }
    }
    async function fetchToken(id){
      const eventlist2 = await API
          .graphql(graphqlOperation(queries.listUserAs, { filter: {
            email: {eq:id} 
          }}));
      const rankingNum = eventlist2.data.listUserAs.items[0].token*1;
      if(rankingNum==0) setRankingImage("/ranking/grey.png");
      else if(0<rankingNum&&rankingNum<100)setRankingImage("/ranking/blue.png");
      else if(100<=rankingNum&&rankingNum<1000)setRankingImage("/ranking/orange.png");
      else if(1000<=rankingNum&&rankingNum<3000)setRankingImage("/ranking/silver.png");
      else if(3000<=rankingNum&&rankingNum<10000)setRankingImage("/ranking/gold.png");
      else if(10000<=rankingNum)setRankingImage("/ranking/purple.png");
      setShowAndHide("classes.showImage");
    }
    fetchUser();
  },[]);

  async function handleMessage(){
    history.push("/c/message");
  }
  return (
    <Fragment>
      <AppBar position="sticky" className={classes.appBar}>
        <Toolbar className={classes.appBarToolbar}>
          <Box display="flex" alignItems="center" onClick = {goLandingPage}>
            <Hidden smUp>
              <Box mr={1}>
                <IconButton
                  aria-label="Open Navigation"
                  onClick={openMobileDrawer}
                  color="primary"
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            </Hidden>
            <Hidden xsDown>
              
              <Typography
                variant="h4"
                className={classes.brandText}
                display="inline"
                color="primary"
              >
                Photobie
                {/* <Button
                  color="secondary"
                  size="large"
                  onClick={goListPage}
                >
                  View List
                </Button> */}
              </Typography>
            </Hidden>
          </Box>
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            width="100%"
            openAddBalanceDialog={openAddBalanceDialog}
          >
            {/* <img src = {rankingImage} className = {showAndHide} style = {{width:40,height:40}}/> */}


            <Button
              color="secondary"
              size="large"
              onClick={goListPage}
            >
              View List
            </Button>
            <MessageIcon onClick = {handleMessage} color=  "primary" style = {{marginRight:10,marginLeft:10}}/>
            {/* <MessagePopperButton messages={messages} /> */}
            <ListItem
              disableGutters
              className={classNames(classes.iconListItem, classes.smBordered)}
            >
              
              <Avatar
                alt="profile picture"
                src={`${process.env.PUBLIC_URL}/images/logged_in/profilePicture.jpg`}
                className={classNames(classes.accountAvatar)}
                onClick = {viewList}
              />
            </ListItem>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                style = {{marginTop:30,width:300}}
              >
                <MenuItem onClick={handleClose}>Setting</MenuItem>
                <MenuItem onClick={handleClose}>Profile<img src = {rankingImage} style = {{width:40, height:40}} /></MenuItem>
                <MenuItem onClick={logOut}>Logout</MenuItem>
              </Menu>
          </Box>
          
        </Toolbar>
      </AppBar>
    </Fragment>
  );
}

NavBar.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedTab: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  openAddBalanceDialog: PropTypes.func.isRequired,
};

export default withWidth()(withStyles(styles, { withTheme: true })(NavBar));
